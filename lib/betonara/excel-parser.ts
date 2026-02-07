import * as XLSX from 'xlsx';
import { BetonaraProductionRecord } from '@/types/betonara';

// Mapiranje naziva kolona iz Excela u jedinstvene šifre artikala (bazirano na User Report specifikaciji)
const MATERIAL_MAP: Record<string, string> = {
    // BETONARA 2 (Bosanski/Hrvatski/Turski)
    'rijecna 0-4': '01030073',
    'drobljena 0-4': '01030063',
    '4-8': '01030074',
    '8-16': '01030075',
    'cem i': '01110045',
    'sika v': '01044077',
    'sika': '01044077',
    
    // BETONARA 1 (Engleski/Turski - SCADA)
    'agg1': '01030073',
    'agg2': '01030063',
    'agg3': '01030074',
    'agg4': '01030075',
    'agg5': '01030075',
    'agg6': '01030075',
    'cem1': '01110045',
    'cem2': '01110045',
    'cem3': '01110045',
    'cem4': '01110045',
    'add1': '01044076', // SF 16
    'add2': '01044077', // Sika/FM 500
    'add3': '01044077',
    'add4': '01044077',
    'add5': '01044077',
    // Generički prefiksi za SCADA sisteme
    'agg': '01030073',
    'cem': '01110045',
    'add': '01044077',
};

export async function parseBetonaraExcel(
    file: File,
    plant: 'Betonara 1' | 'Betonara 2',
    recipeMappings: Record<string, string> = {}
): Promise<BetonaraProductionRecord[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

                const records: BetonaraProductionRecord[] = [];

                // Tražimo red sa zaglavljem
                let headerRowIndex = -1;
                for (let i = 0; i < Math.min(20, jsonData.length); i++) {
                    const row = jsonData[i];
                    if (row && row.some(cell => {
                        const c = String(cell).toLowerCase();
                        return c.includes('datum pocetka') || c.includes('start date');
                    })) {
                        headerRowIndex = i;
                        break;
                    }
                }

                if (headerRowIndex === -1) {
                    throw new Error('Ne mogu pronaći zaglavlje (Datum pocetka / Start Date) u fajlu.');
                }

                const headers = (jsonData[headerRowIndex] as any[]).map(h => String(h || '').toLowerCase().trim());

                // Automatska detekcija betonare - robusnija provjera
                let detectedPlant: 'Betonara 1' | 'Betonara 2' = plant;
                const hasB1Markers = headers.some(h => h.includes('sf 16') || h.includes('agg1'));
                const hasB2Markers = headers.some(h => h.includes('sika v') || h.includes('agg5'));

                if (hasB2Markers) detectedPlant = 'Betonara 2';
                else if (hasB1Markers) detectedPlant = 'Betonara 1';

                // Mapiranje kolona
                const colMap: Record<string, number> = {};
                const materialColGroups: Record<string, number[]> = {};
                const targetMaterialColGroups: Record<string, number[]> = {};
                const deviationColMap: Record<string, number[]> = {}; // Mapiranje koda materijala na njegovu kolonu postotka greške
                
                const waterCols: number[] = [];
                const targetWaterCols: number[] = [];
                const waterDevCols: number[] = []; // Procenti za vodu

                headers.forEach((header, index) => {
                    const h = header.toLowerCase().trim();
                    if (!h) return;

                    // Standardna polja
                    if (h.includes('datum pocetka') || h.includes('start date')) {
                        colMap['date'] = index;
                    } else if (h.includes('proizvodni zapis') || h === 'id' || h.includes('record no')) {
                        colMap['id'] = index;
                    } else if (h.includes('proizvodnja br') || h.includes('production no')) {
                        colMap['work_order'] = index;
                    } else if (h.includes('re recept') || h.includes('recipe') || h.includes('recept br') || h === 'reçete' || h === 'recept no') {
                        colMap['recipe'] = index;
                    } else if (h === 'kolicina' || h === 'quantity' || h === 'm3' || h.includes('izdana kol') || h.includes('kolicina proizvedenog')) {
                        colMap['quantity'] = index;
                    } else if (h.includes('prijemnica') || h.includes('receipt') || h.includes('izdatnica') || h.includes('prijem br')) {
                        colMap['issuance'] = index;
                    } 
                    
                    // Detekcija vode (Stvarno vs Cilj vs Procenat)
                    if (h.includes('voda') || h.includes('wat') || h.startsWith('su') || h.includes('water')) {
                        if (h.includes('yuzdefark') || h.includes('%') || h.includes('deviation')) {
                            waterDevCols.push(index);
                        } else if (h.includes('hesaplanan') || h.includes('target') || h.includes('plan') || h.includes('set') || h.includes('cilj')) {
                            targetWaterCols.push(index);
                        } else if (!h.includes('hata') && !h.includes('error') && !h.includes('fark')) {
                            waterCols.push(index);
                        }
                    }

                    // Detekcija materijala (Stvarno vs Cilj vs Procenat)
                    const isExtraInfo = h.includes('hata') || h.includes('error') || h.includes('fark') || h.includes('yuzdefark') || h.includes('%') || h.includes('diff') || h.includes('devia');
                    
                    const sortedKeys = Object.keys(MATERIAL_MAP).sort((a, b) => b.length - a.length);
                    for (const mapKey of sortedKeys) {
                        const code = MATERIAL_MAP[mapKey];
                        
                        // Provjera za postotak greške (YuzdeFark)
                        // Turski sistem koristi: Ag1YuzdeFark, Cim1YuzdeFark, Kat1YuzdeFark
                        // Trebamo provjeriti i "ag1", "cim1", "kat1" varijante
                        const turkishVariants = [
                            mapKey.replace('agg', 'ag'),
                            mapKey.replace('cem', 'cim'),
                            mapKey.replace('add', 'kat')
                        ];
                        
                        const matchesPercentage = (h.includes('yuzdefark') || h.includes('%')) && 
                            (h.includes(mapKey) || turkishVariants.some(v => h.includes(v)));
                        
                        if (matchesPercentage) {
                            if (!deviationColMap[code]) deviationColMap[code] = [];
                            deviationColMap[code].push(index);
                            break;
                        }

                        // Provjera za masu (Stvarno ili Cilj)
                        if (h.includes(mapKey)) {
                            if (h.includes('hesaplanan') || h.includes('target') || h.includes('plan') || h.includes('set') || h.includes('cilj')) {
                                if (!targetMaterialColGroups[code]) targetMaterialColGroups[code] = [];
                                targetMaterialColGroups[code].push(index);
                            } else if (!isExtraInfo) {
                                if (!materialColGroups[code]) materialColGroups[code] = [];
                                materialColGroups[code].push(index);
                            }
                            break;
                        }
                    }
                });

                // Čitanje redova sa podacima
                for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0 || !row[colMap['date']] || String(row[1]).includes('TOTAL')) continue;

                    const dateValue = row[colMap['date']];
                    let date: Date;

                    if (typeof dateValue === 'number') {
                        date = new Date((dateValue - 25569) * 86400 * 1000);
                    } else {
                        const [dPart, tPart] = String(dateValue).split(/\s+/);
                        const [day, month, year] = dPart.split('/');
                        date = new Date(`${year}-${month}-${day}T${tPart || '00:00'}`);
                    }

                    if (isNaN(date.getTime())) continue;

                    const recipeOriginal = String(row[colMap['recipe']] || '').trim();
                    const recipeMapped = recipeMappings[recipeOriginal] || recipeOriginal;

                    const workOrder = String(row[colMap['work_order']] || '');
                    const recordId = colMap['id'] !== undefined ? String(row[colMap['id']] || '') : workOrder;
                    const id = `${recordId}_${date.getTime()}_${detectedPlant === 'Betonara 1' ? 'b1' : 'b2'}`;

                    // Skupljanje materijala (Actual)
                    const materials: Record<string, number> = {};
                    Object.entries(materialColGroups).forEach(([code, indices]) => {
                        let sum = 0;
                        indices.forEach(idx => {
                            const val = parseFloat(String(row[idx] || 0));
                            if (!isNaN(val)) sum += val;
                        });
                        if (sum > 0) materials[code] = sum;
                    });

                    // Skupljanje materijala (Target ili Proračun iz %)
                    const targetMaterials: Record<string, number> = {};
                    
                    // Prvo provjeravamo da li imamo direktne kolone za Target
                    const hasDirectTargets = Object.keys(targetMaterialColGroups).length > 0;

                    Object.keys(materialColGroups).forEach(code => {
                        let targetSum = 0;
                        
                        // 1. Pokušaj naći u direktnim target kolonama
                        if (targetMaterialColGroups[code]) {
                            targetMaterialColGroups[code].forEach(idx => {
                                const val = parseFloat(String(row[idx] || 0));
                                if (!isNaN(val)) targetSum += val;
                            });
                        }
                        
                        // 2. Ako nismo našli (kao u vašem slučaju), izračunaj iz % greške (YuzdeFark)
                        if (targetSum === 0 && deviationColMap[code] && materials[code]) {
                            const actual = materials[code];
                            // Uzimamo prvi procenat koji nađemo za taj kod
                            const pctValue = parseFloat(String(row[deviationColMap[code][0]] || 0));
                            if (!isNaN(pctValue)) {
                                // Formula: Target = Actual / (1 + (Pct / 100))
                                // npr. 166 / (1 + 0.0375) = 160
                                targetSum = actual / (1 + (pctValue / 100));
                            }
                        }

                        if (targetSum > 0) targetMaterials[code] = targetSum;
                    });

                    // Voda (Actual)
                    let waterSum = 0;
                    waterCols.forEach(idx => {
                        const val = parseFloat(String(row[idx] || 0));
                        if (!isNaN(val)) waterSum += val;
                    });

                    // Voda (Target ili Proračun)
                    let targetWaterSum = 0;
                    targetWaterCols.forEach(idx => {
                        const val = parseFloat(String(row[idx] || 0));
                        if (!isNaN(val)) targetWaterSum += val;
                    });

                    if (targetWaterSum === 0 && waterDevCols.length > 0 && waterSum > 0) {
                        const pctValue = parseFloat(String(row[waterDevCols[0]] || 0));
                        if (!isNaN(pctValue)) {
                            targetWaterSum = waterSum / (1 + (pctValue / 100));
                        }
                    }

                    records.push({
                        id,
                        plant: detectedPlant,
                        work_order_number: workOrder,
                        date,
                        recipe_number: recipeMapped,
                        total_quantity: parseFloat(String(row[colMap['quantity']] || 0)) || 0,
                        water: waterSum,
                        target_water: targetWaterSum,
                        issuance_number: String(row[colMap['issuance']] || ''),
                        materials,
                        target_materials: targetMaterials
                    });
                }

                resolve(records);
            } catch (error) {
                reject(error);
            }
        };

        reader.onerror = () => reject(new Error('Neuspješno čitanje fajla.'));
        reader.readAsArrayBuffer(file);
    });
}
