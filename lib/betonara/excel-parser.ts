import * as XLSX from 'xlsx';
import { BetonaraProductionRecord } from '@/types/betonara';

// Mapiranje naziva kolona iz Excela u jedinstvene šifre artikala (bazirano na User Report specifikaciji)
const MATERIAL_MAP: Record<string, string> = {
    // BETONARA 1 (Bosanski/Hrvatski/Turski)
    'rijecna 0-4': '01030073',
    'drobljena 0-4': '01030063',
    '4-8': '01030074',
    '8-16': '01030075',
    'cem i': '01110045',
    'sika v': '01044076',
    'sika': '01044076',
    
    // BETONARA 2 (Engleski/Turski - SCADA)
    'agg1': '01030075', // 8-16
    'agg2': '01030073', // Rijecna 0-4
    'agg3': '01030063', // Drobljena 0-4
    'agg4': '01030074', // 4-8
    'agg5': '01030075',
    'agg6': '01030075',
    'cem1': '01110045',
    'cem2': '01110045',
    'cem3': '01110045',
    'cem4': '01110045',
    'add1': '01044076', // SIKA V
    'add2': '01044077', // FM 500
    'add3': '01044077',
    'add4': '01044077',
    'add5': '01044077',
    // Generički prefiksi za SCADA sisteme
    'agg': '01030075',
    'cem': '01110045',
    'add': '01044076',
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

                if (hasB2Markers) detectedPlant = 'Betonara 1';
                else if (hasB1Markers) detectedPlant = 'Betonara 2';

                // Mapiranje kolona
                const colMap: Record<string, number> = {};
                const materialColGroups: Record<string, number[]> = {};
                const targetMaterialColGroups: Record<string, number[]> = {};
                const deviationColMap: Record<string, number[]> = {}; 
                const flattenedColMap: Record<string, number> = {}; // Za Ag1, Cem1 itd.
                
                const waterCols: number[] = [];
                const targetWaterCols: number[] = [];
                const waterDevCols: number[] = []; 

                headers.forEach((header, index) => {
                    const h = header.toLowerCase().trim();
                    if (!h) return;

                    // 1. Standardna polja (postojeća i nova)
                    if (h.includes('datum pocetka') || h.includes('start date')) colMap['date'] = index;
                    else if (h.includes('datum zavrsetka') || h.includes('end date')) colMap['end_date'] = index;
                    else if (h.includes('proizvodni zapis') || h === 'id' || h.includes('record no')) colMap['id'] = index;
                    else if (h.includes('proizvodnja br') || h.includes('production no')) {
                        colMap['work_order'] = index;
                        colMap['production_no'] = index;
                    } else if (h.includes('kompanija') || h === 'company') colMap['company'] = index;
                    else if (h.includes('kupac') || h === 'customer') colMap['customer'] = index;
                    else if (h.includes('re recept') || h.includes('recipe') || h.includes('recept br') || h === 'reçete' || h === 'recept no') {
                        colMap['recipe'] = index;
                        if (h.includes('recipe no') || h === 'recept br' || h === 'recept no') colMap['recipe_no'] = index;
                    } else if (h === 'kolicina' || h === 'quantity' || h === 'm3' || h.includes('izdana kol') || h.includes('kolicina proizvedenog')) {
                        colMap['quantity'] = index;
                    } else if (h.includes('be produced') || h.includes('planirana kol') || h.includes('ciljna kol')) {
                        colMap['target_quantity'] = index;
                    } else if (h.includes('prijemnica') || h.includes('receipt') || h.includes('izdatnica') || h.includes('prijem br')) {
                        colMap['issuance'] = index;
                        colMap['receipt'] = index;
                    } else if (h.includes('return concrete') || h.includes('povrat')) {
                        if (h.includes('note') || h.includes('napomena')) colMap['return_concrete_note'] = index;
                        else colMap['return_concrete'] = index;
                    } else if (h.includes('order code') || h.includes('kod narudzbe')) colMap['order_code'] = index;
                    else if (h.includes('jobsite') || h.includes('gradiliste')) colMap['jobsite'] = index;
                    else if (h.includes('driver') || h.includes('vozac')) colMap['driver'] = index;
                    else if (h.includes('vehicle') || h.includes('vozilo')) colMap['vehicle'] = index;
                    else if (h.includes('nakliyat') || h.includes('zona dostave') || h.includes('shipping zone')) colMap['shipping_zone'] = index;
                    else if (h.includes('statu') || h === 'status') colMap['status'] = index;

                    // 2. Ekstra materijali i voda
                    if (h === 'ek madde' || h === 'extra material') colMap['extra_material_1'] = index;
                    if (h.includes('ek maddenin miktarı') || h.includes('extra material qty')) colMap['extra_material_1_qty'] = index;
                    if (h === 'ek madde 2' || h === 'extra material 2') colMap['extra_material_2'] = index;
                    if (h.includes('ek maddenin miktarı 2') || h.includes('extra material 2 qty')) colMap['extra_material_2_qty'] = index;

                    if (h.includes('extra water 1')) colMap['extra_water_1'] = index;
                    else if (h.includes('extra water 2')) colMap['extra_water_2'] = index;

                    // 3. Flattened Material Mapping - supports both Betonara 1 & 2 formats
                    
                    // BETONARA 2: Exact column name mapping (descriptive names)
                    const betonara2ColumnMap: Record<string, string> = {
                        '8-16': 'agg1_actual',
                        'rijecna 0-4': 'agg2_actual',
                        'drobljena 0-4': 'agg3_actual',
                        '4-8': 'agg4_actual',
                        'cem i': 'cem1_actual',
                        'sf 16': 'add1_actual',
                        'sika': 'add2_actual',
                        'su1': 'water1_actual',
                        'voda 1': 'water1_actual',
                        'voda 2': 'water2_actual'
                    };

                    // Check for Betonara 2 exact matches first
                    if (betonara2ColumnMap[h]) {
                        flattenedColMap[betonara2ColumnMap[h]] = index;
                    }

                    // BETONARA 1: Prefix-based detection (Agg1, Agg2, Cem1, Add1, etc.)
                    const prefixes = [
                        { key: 'agg', markers: ['agg', 'ag'] },
                        { key: 'cem', markers: ['cem', 'cim'] },
                        { key: 'add', markers: ['add', 'kat'] },
                        { key: 'water', markers: ['wat', 'water'] }
                    ];

                    const suffixes = [
                        { key: 'error', markers: ['hata', 'error'] },
                        { key: 'target', markers: ['hesaplanan', 'target', 'plan', 'set'] },
                        { key: 'pct', markers: ['yuzdefark', 'deviation', 'percentage', '%'] },
                        { key: 'moisture', markers: ['nem', 'moisture'] },
                        { key: 'actual', markers: ['girilen', 'actual', 'real'] }
                    ];

                    for (const p of prefixes) {
                        for (let i = 1; i <= 6; i++) {
                            for (const marker of p.markers) {
                                // Check if header starts with this marker + number
                                if (h.startsWith(marker + i)) {
                                    const afterPrefix = h.slice((marker + i).length);
                                    
                                    // PRIORITY 1: Exact match (e.g., "agg1" with nothing after)
                                    if (afterPrefix === '' || afterPrefix.match(/^\s*$/)) {
                                        flattenedColMap[`${p.key}${i}_actual`] = index;
                                        break;
                                    }
                                    
                                    // PRIORITY 2: Match with suffix (e.g., "agg1girilen hata")
                                    for (const s of suffixes) {
                                        if (s.markers.some(sm => afterPrefix.toLowerCase().includes(sm))) {
                                            flattenedColMap[`${p.key}${i}_${s.key}`] = index;
                                            break;
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    // 4. Mapiranje vodo (postojeća logika za Dashboard)
                    if (h.includes('voda') || h.includes('wat') || h.startsWith('su') || h.includes('water')) {
                        if (h.includes('yuzdefark') || h.includes('%') || h.includes('deviation')) waterDevCols.push(index);
                        else if (h.includes('hesaplanan') || h.includes('target') || h.includes('plan') || h.includes('set') || h.includes('cilj')) targetWaterCols.push(index);
                        else if (!h.includes('hata') && !h.includes('error') && !h.includes('fark')) waterCols.push(index);
                    }

                    // 5. Mapiranje materijala u šifre (za Dashboard statuse)
                    const isExtraInfo = h.includes('hata') || h.includes('error') || h.includes('fark') || h.includes('yuzdefark') || h.includes('%') || h.includes('diff') || h.includes('devia');
                    const sortedKeys = Object.keys(MATERIAL_MAP).sort((a, b) => b.length - a.length);
                    for (const mapKey of sortedKeys) {
                        const code = MATERIAL_MAP[mapKey];
                        const turkishVariants = [mapKey.replace('agg', 'ag'), mapKey.replace('cem', 'cim'), mapKey.replace('add', 'kat')];
                        const matchesPercentage = (h.includes('yuzdefark') || h.includes('%')) && (h.includes(mapKey) || turkishVariants.some(v => h.includes(v)));
                        
                        if (matchesPercentage) {
                            if (!deviationColMap[code]) deviationColMap[code] = [];
                            deviationColMap[code].push(index);
                            break;
                        }
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

                // DEBUG: Log detected columns
                console.log('=== EXCEL PARSER DEBUG ===');
                console.log('Detected Plant:', detectedPlant);
                console.log('Headers:', headers);
                console.log('Flattened Column Map:', flattenedColMap);
                console.log('Standard Column Map:', colMap);
                console.log('========================');

                // Čitanje redova sa podacima
                for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length === 0 || !row[colMap['date']] || String(row[1]).includes('TOTAL')) continue;

                    const dateValue = row[colMap['date']];
                    const endDateValue = colMap['end_date'] !== undefined ? row[colMap['end_date']] : null;
                    
                    const parseExcelDate = (val: any) => {
                        if (typeof val === 'number') {
                            // Excel stores dates as days since 1900-01-01 (with leap year bug)
                            // We need to convert to local date without timezone shifts
                            const excelEpoch = new Date(1899, 11, 30); // Dec 30, 1899 in local time
                            const date = new Date(excelEpoch.getTime() + val * 86400 * 1000);
                            // Return date at noon to avoid timezone issues
                            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
                        }
                        const [dPart, tPart] = String(val).split(/\s+/);
                        if (!dPart) return new Date(NaN);
                        const [day, month, year] = dPart.split('/');
                        return new Date(`${year}-${month}-${day}T${tPart || '12:00'}`);
                    };

                    const date = parseExcelDate(dateValue);
                    let endDate = endDateValue ? parseExcelDate(endDateValue) : undefined;
                    if (isNaN(date.getTime())) continue;

                    const recipeOriginal = String(row[colMap['recipe']] || '').trim();
                    const recipeMapped = recipeMappings[recipeOriginal] || recipeOriginal;
                    const workOrder = String(row[colMap['work_order']] || '');
                    const recordId = colMap['id'] !== undefined ? String(row[colMap['id']] || '') : workOrder;
                    const id = `${recordId}_${date.getTime()}_${detectedPlant === 'Betonara 1' ? 'b1' : 'b2'}`;

                    // Dashboard Aggregations (JSON stats)
                    const materials: Record<string, number> = {};
                    Object.entries(materialColGroups).forEach(([code, indices]) => {
                        let sum = 0;
                        indices.forEach(idx => {
                            const val = parseFloat(String(row[idx] || 0));
                            if (!isNaN(val)) sum += val;
                        });
                        if (sum > 0) materials[code] = sum;
                    });

                    const targetMaterials: Record<string, number> = {};
                    Object.keys(materialColGroups).forEach(code => {
                        let targetSum = 0;
                        if (targetMaterialColGroups[code]) {
                            targetMaterialColGroups[code].forEach(idx => {
                                const val = parseFloat(String(row[idx] || 0));
                                if (!isNaN(val)) targetSum += val;
                            });
                        }
                        if (targetSum === 0 && deviationColMap[code] && materials[code]) {
                            const actual = materials[code];
                            const pctValue = parseFloat(String(row[deviationColMap[code][0]] || 0));
                            if (!isNaN(pctValue)) targetSum = actual / (1 + (pctValue / 100));
                        }
                        if (targetSum > 0) targetMaterials[code] = targetSum;
                    });

                    let waterSum = 0;
                    waterCols.forEach(idx => {
                        const val = parseFloat(String(row[idx] || 0));
                        if (!isNaN(val)) waterSum += val;
                    });

                    let targetWaterSum = 0;
                    targetWaterCols.forEach(idx => {
                        const val = parseFloat(String(row[idx] || 0));
                        if (!isNaN(val)) targetWaterSum += val;
                    });

                    // Flattened values mapping
                    const flattenedValues: any = {};
                    Object.entries(flattenedColMap).forEach(([key, idx]) => {
                        const val = row[idx];
                        flattenedValues[key] = typeof val === 'number' ? val : parseFloat(String(val || 0)) || 0;
                    });

                    // DEBUG: Log first record's flattened values
                    if (records.length === 0) {
                        console.log('=== FIRST RECORD DEBUG ===');
                        console.log('Work Order:', workOrder);
                        console.log('Recipe:', recipeMapped);
                        console.log('Flattened Values:', flattenedValues);
                        console.log('Raw Row Sample (first 30 cells):', row.slice(0, 30));
                        console.log('========================');
                    }

                    records.push({
                        id,
                        plant: detectedPlant,
                        work_order_number: workOrder,
                        date,
                        end_date: endDate,
                        recipe_number: recipeMapped,
                        total_quantity: parseFloat(String(row[colMap['quantity']] || 0)) || 0,
                        water: waterSum,
                        target_water: targetWaterSum,
                        issuance_number: String(row[colMap['issuance']] || ''),
                        materials,
                        target_materials: targetMaterials,

                        // Expanded general fields
                        company: colMap['company'] !== undefined ? String(row[colMap['company']] || '') : undefined,
                        customer: colMap['customer'] !== undefined ? String(row[colMap['customer']] || '') : undefined,
                        production_no: colMap['production_no'] !== undefined ? String(row[colMap['production_no']] || '') : undefined,
                        recipe_no: colMap['recipe_no'] !== undefined ? String(row[colMap['recipe_no']] || '') : undefined,
                        receipt: colMap['receipt'] !== undefined ? String(row[colMap['receipt']] || '') : undefined,
                        target_quantity: colMap['target_quantity'] !== undefined ? parseFloat(String(row[colMap['target_quantity']] || 0)) : undefined,
                        return_concrete: colMap['return_concrete'] !== undefined ? parseFloat(String(row[colMap['return_concrete']] || 0)) : undefined,
                        return_concrete_note: colMap['return_concrete_note'] !== undefined ? String(row[colMap['return_concrete_note']] || '') : undefined,
                        order_code: colMap['order_code'] !== undefined ? String(row[colMap['order_code']] || '') : undefined,
                        jobsite: colMap['jobsite'] !== undefined ? String(row[colMap['jobsite']] || '') : undefined,
                        driver: colMap['driver'] !== undefined ? String(row[colMap['driver']] || '') : undefined,
                        vehicle: colMap['vehicle'] !== undefined ? String(row[colMap['vehicle']] || '') : undefined,
                        shipping_zone: colMap['shipping_zone'] !== undefined ? String(row[colMap['shipping_zone']] || '') : undefined,
                        status: colMap['status'] !== undefined ? String(row[colMap['status']] || '') : undefined,
                        extra_material_1: colMap['extra_material_1'] !== undefined ? String(row[colMap['extra_material_1']] || '') : undefined,
                        extra_material_1_qty: colMap['extra_material_1_qty'] !== undefined ? parseFloat(String(row[colMap['extra_material_1_qty']] || 0)) : undefined,
                        extra_material_2: colMap['extra_material_2'] !== undefined ? String(row[colMap['extra_material_2']] || '') : undefined,
                        extra_material_2_qty: colMap['extra_material_2_qty'] !== undefined ? parseFloat(String(row[colMap['extra_material_2_qty']] || 0)) : undefined,
                        extra_water_1: colMap['extra_water_1'] !== undefined ? parseFloat(String(row[colMap['extra_water_1']] || 0)) : undefined,
                        extra_water_2: colMap['extra_water_2'] !== undefined ? parseFloat(String(row[colMap['extra_water_2']] || 0)) : undefined,
                        
                        // Flattened material values
                        ...flattenedValues
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
