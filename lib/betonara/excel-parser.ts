import * as XLSX from 'xlsx';
import { BetonaraProductionRecord } from '@/types/betonara';

// Mapiranje naziva kolona iz Excela u jedinstvene šifre artikala
const MATERIAL_MAP: Record<string, string> = {
    'rijecna 0-4': '01030073',
    'drobljena 0-4': '01030063',
    '4-8': '01030074',
    '8-16': '01030075',
    'cem i': '01110045_425',
    'sf 16': '01044076',
    'sika v': '01044077',
    'sika': '01044077',
    // Tehnički nazivi (SCADA raw export)
    'agg1': '01030073',
    'agg2': '01030063',
    'agg3': '01030074',
    'agg4': '01030075',
    'agg5': '01030075', // B2 variant
    'agg6': '01030075',
    'cem1': '01110045_425',
    'cem2': '01110045_425',
    'cem3': '01110045_425',
    'cem4': '01110045_425',
    'add1': '01044076', // SF 16
    'add2': '01044077', // Sika
    'add3': '01044077',
    'add4': '01044077',
    'add5': '01044077',
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
                const materialCols: Record<string, number> = {};
                const waterCols: number[] = [];

                headers.forEach((header, index) => {
                    const h = header.toLowerCase().trim();
                    if (!h) return;

                    if (h.includes('datum pocetka') || h.includes('start date')) {
                        colMap['date'] = index;
                    } else if (h.includes('proizvodni zapis') || h === 'id' || h.includes('record no')) {
                        colMap['id'] = index;
                    } else if (h.includes('proizvodnja br') || h.includes('production no')) {
                        colMap['work_order'] = index;
                    } else if (h.includes('re recept') || h.includes('recipe') || h.includes('recept br') || h === 'reçete') {
                        colMap['recipe'] = index;
                    } else if (h === 'kolicina' || h === 'quantity' || h === 'm3' || h.includes('izdana kol')) {
                        colMap['quantity'] = index;
                    } else if (h.includes('prijemnica') || h.includes('receipt') || h.includes('izdatnica')) {
                        colMap['issuance'] = index;
                    } else if (h.includes('voda') || h.includes('wat') || h.includes('su') || h.includes('_water')) {
                        // Sabirat ćemo sve kolone koje sadrže ove ključne riječi, ali izbjegavamo procente ili razlike
                        if (!h.includes('yuzde') && !h.includes('fark') && !h.includes('%') && !h.includes('diff')) {
                            waterCols.push(index);
                        }
                    }

                    // Provjera materijala preko mape
                    if (MATERIAL_MAP[h]) {
                        materialCols[MATERIAL_MAP[h]] = index;
                    }
                });

                // Čitanje redova sa podacima
                for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    // Preskačemo prazne redove i TOTAL red
                    if (!row || row.length === 0 || !row[colMap['date']] || String(row[1]).includes('TOTAL')) continue;

                    const dateValue = row[colMap['date']];
                    let date: Date;

                    if (typeof dateValue === 'number') {
                        date = new Date((dateValue - 25569) * 86400 * 1000);
                    } else {
                        // Format u fajlu je "30/01/2026 19:57"
                        const [dPart, tPart] = String(dateValue).split(/\s+/);
                        const [day, month, year] = dPart.split('/');
                        date = new Date(`${year}-${month}-${day}T${tPart || '00:00'}`);
                    }

                    if (isNaN(date.getTime())) continue;

                    const recipeOriginal = String(row[colMap['recipe']] || '').trim();
                    const recipeMapped = recipeMappings[recipeOriginal] || recipeOriginal;

                    const workOrder = String(row[colMap['work_order']] || '');
                    const recordId = colMap['id'] !== undefined ? String(row[colMap['id']] || '') : workOrder;

                    // Koristimo kombinaciju ID + Vrijeme + Betonara za 100% unikatan ključ
                    // Ovo rješava problem kada isti 'Proizvodni zapis' ima više stavki u različito vrijeme
                    const id = `${recordId}_${date.getTime()}_${detectedPlant === 'Betonara 1' ? 'b1' : 'b2'}`;

                    // Skupljanje materijala
                    const materials: Record<string, number> = {};
                    Object.entries(materialCols).forEach(([code, index]) => {
                        const val = parseFloat(String(row[index] || 0));
                        if (!isNaN(val) && val > 0) {
                            materials[code] = (materials[code] || 0) + val;
                        }
                    });

                    // Voda - sabiramo sve kolone vode
                    let waterSum = 0;
                    waterCols.forEach(index => {
                        const val = parseFloat(String(row[index] || 0));
                        if (!isNaN(val)) waterSum += val;
                    });

                    records.push({
                        id,
                        plant: detectedPlant,
                        work_order_number: workOrder,
                        date,
                        recipe_number: recipeMapped,
                        total_quantity: parseFloat(String(row[colMap['quantity']] || 0)) || 0,
                        water: waterSum,
                        issuance_number: String(row[colMap['issuance']] || ''),
                        materials,
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
