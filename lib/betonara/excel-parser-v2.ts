import * as XLSX from 'xlsx';
import { ProizvodnjaBetona } from '@/types/betonara';

// Tri formata koje podrzavamo:
// 1. "B1_SCADA"  — Betonara 1, engleski SCADA export (Production Record No, Agg1, Cem1...)
// 2. "B2_SCADA"  — Betonara 2, bosanski SCADA export (Proizvodni zapis br, Rijecna 0-4, CEM I...)
// 3. "B2_LEGACY" — Betonara 2, stari rucni export (Naziv recepture, Agregat 0-4, 42,5...)

type FormatType = 'B1_SCADA' | 'B2_SCADA' | 'B2_LEGACY';

export async function parseBetonaraExcelV2(
    file: File,
    recipeMappings: Record<string, string> = {}
): Promise<ProizvodnjaBetona[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });

                const norm = (s: any) => String(s || '').toLowerCase().trim()
                    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/č/g, "c").replace(/ć/g, "c").replace(/š/g, "s").replace(/ž/g, "z");

                // SCADA format: brojevi su americki (1234.56)
                // LEGACY format: brojevi su evropski/bosanski (1.234,56)
                const parseNum = (val: any, format: FormatType) => {
                    if (typeof val === 'number') return val;
                    if (!val) return 0;
                    let s = String(val).trim().replace(/\s/g, '');
                    if (format === 'B2_LEGACY') {
                        // Bosanski: 1.122.153,49 (tacka je hiljada, zarez je decimala)
                        s = s.replace(/\./g, '').replace(',', '.');
                    } else {
                        // SCADA (B1 i B2): 1234.56
                        s = s.replace(/,/g, '');
                    }
                    return parseFloat(s) || 0;
                };

                const parseDate = (val: any) => {
                    if (val instanceof Date) return val.toISOString();
                    if (!val) return null;
                    const s = String(val).trim();
                    const m = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})/);
                    if (m) return new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}T12:00:00`).toISOString();
                    const d = new Date(s);
                    return isNaN(d.getTime()) ? null : d.toISOString();
                };

                let hIdx = -1;
                let plant: 'Betonara 1' | 'Betonara 2' = 'Betonara 1';
                let format: FormatType | null = null;
                let jsonData: any[][] = [];

                // PRETRAŽI SVE LISTOVE (SHEETS)
                console.log('[ExcelParser] Sheet names:', workbook.SheetNames);
                for (const sheetName of workbook.SheetNames) {
                    const ws = workbook.Sheets[sheetName];
                    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) as any[][];
                    console.log(`[ExcelParser] Sheet "${sheetName}" has ${rows.length} rows`);
                    // Log first 5 rows for debugging
                    for (let dbg = 0; dbg < Math.min(rows.length, 5); dbg++) {
                        console.log(`[ExcelParser]   Row ${dbg} (norm):`, rows[dbg].map((v: any) => norm(v)).join(' | '));
                    }
                    for (let i = 0; i < Math.min(rows.length, 500); i++) {
                        const rowTxt = rows[i].map((v: any) => norm(v)).join(' ');

                        // 1) B1 SCADA: engleski headeri
                        if (rowTxt.includes('production record no') && rowTxt.includes('quantity')) {
                            console.log(`[ExcelParser] ✅ B1_SCADA detected at row ${i}`);
                            format = 'B1_SCADA'; plant = 'Betonara 1'; jsonData = rows; hIdx = i; break;
                        }

                        // 2) B2 SCADA: bosanski headeri iz istog SCADA sistema
                        if (rowTxt.includes('proizvodni zapis br')) {
                            console.log(`[ExcelParser] ✅ B2_SCADA detected at row ${i}`);
                            format = 'B2_SCADA'; plant = 'Betonara 2'; jsonData = rows; hIdx = i; break;
                        }

                        // 3) B2 LEGACY: stari rucni format
                        const b2LegacyWords = ['naziv recepture', 'kolicina proizvedenog', 'agregat'];
                        if (b2LegacyWords.filter(w => rowTxt.includes(w)).length >= 2) {
                            console.log(`[ExcelParser] ✅ B2_LEGACY detected at row ${i}`);
                            format = 'B2_LEGACY'; plant = 'Betonara 2'; jsonData = rows; hIdx = i; break;
                        }

                        // 4) Fallback: generic SCADA keywords
                        if (rowTxt.includes('recete') && (rowTxt.includes('kolicina') || rowTxt.includes('quantity'))) {
                            // Try to determine plant from sheet name or other clues
                            if (sheetName.toLowerCase().includes('rezultat') || rowTxt.includes('datum pocetka') || rowTxt.includes('vozilo')) {
                                console.log(`[ExcelParser] ✅ B2_SCADA (fallback) detected at row ${i}`);
                                format = 'B2_SCADA'; plant = 'Betonara 2'; jsonData = rows; hIdx = i; break;
                            } else {
                                console.log(`[ExcelParser] ✅ B1_SCADA (fallback) detected at row ${i}`);
                                format = 'B1_SCADA'; plant = 'Betonara 1'; jsonData = rows; hIdx = i; break;
                            }
                        }
                    }
                    if (format) break;
                }

                if (!format) {
                    console.error('[ExcelParser] ❌ Format NIJE prepoznat!');
                    throw new Error('Format nije prepoznat. Provjerite da li fajl ima zaglavlje.');
                }
                console.log(`[ExcelParser] Plant: ${plant}, Format: ${format}, Header index: ${hIdx}`);

                // Sinonimi za svaki format - mapiranje na kolone u bazi (ProizvodnjaBetona)
                const synonymsByFormat: Record<FormatType, Record<string, string[]>> = {
                    'B1_SCADA': {
                        proizvodni_zapis_br: ['production record no'],
                        datum_pocetka: ['start date'],
                        recept_naziv: ['recete'],
                        kolicina_m3: ['quantity'],
                        kupac: ['customer', 'company'],
                        gradiliste: ['jobsite'],
                        vozac: ['driver'],
                        vozilo: ['vehicle'],
                        agg1_kg: ['agg1'],
                        agg2_kg: ['agg2'],
                        agg3_kg: ['agg3'],
                        agg4_kg: ['agg4'],
                        cem1_kg: ['cem2'],
                        cem2_kg: ['cem1'],
                        add1_kg: ['add2'],
                        add2_kg: ['add1'],
                        wat1_kg: ['wat1']
                    },
                    'B2_SCADA': {
                        proizvodni_zapis_br: ['proizvodni zapis br'],
                        datum_pocetka: ['datum pocetka', 'datum'],
                        recept_br: ['recept br'],
                        recept_naziv: ['recete', 'reçete', 'recept'],
                        kolicina_m3: ['kolicina', 'quantity'],
                        kupac: ['kupac'],
                        gradiliste: ['gradiliste'],
                        vozac: ['vozac'],
                        vozilo: ['vozilo'],
                        // Agregati (B2: Rijecna 0-4->agg2, Drobljena 0-4->agg3, 4-8->agg4, 8-16->agg1)
                        agg2_kg: ['rijecna 0-4'],
                        agg3_kg: ['drobljena 0-4', 'agg3'],
                        agg4_kg: ['4-8', 'agg4'],
                        agg1_kg: ['8-16', 'agg1'],
                        // Cementi
                        cem1_kg: ['cem i', 'cem1'],
                        cem2_kg: ['cem2'],
                        // Aditivi
                        add1_kg: ['sf 16', 'sika'],
                        add2_kg: [],
                        wat1_kg: ['voda 1', 'wat1', 'voda']
                    },
                    'B2_LEGACY': {
                        proizvodni_zapis_br: ['datum'],
                        datum_pocetka: ['datum'],
                        recept_naziv: ['naziv recepture'],
                        kolicina_m3: ['kolicina proizvedenog'],
                        agg1_kg: ['agregat 8-16'],
                        agg2_kg: ['agregat 0-4', 'geokop'],
                        agg3_kg: ['kameni drobljeni', 'drobljeni agregat'],
                        agg4_kg: ['agregat 4-8', 'geokop2'],
                        cem1_kg: ['42,5'],
                        cem2_kg: ['52,5'],
                        add1_kg: ['sika v'],
                        add2_kg: ['fm 500'],
                        wat1_kg: ['voda 1']
                    }
                };

                const synonyms = synonymsByFormat[format];
                const hRowNorm = jsonData[hIdx].map((s: any) => norm(s));
                console.log('[ExcelParser] Header row (normalized):', hRowNorm);

                // Mapa: ključ u bazi -> lista indeksa kolona u Excelu
                const ci: Record<string, number[]> = {};

                Object.entries(synonyms).forEach(([dbK, words]) => {
                    const indices: number[] = [];
                    // Za ove kolone koristimo strogo poklapanje da ne bismo sabrali "Add 1 Qty" u "Total Qty"
                    const strictKeys = ['kolicina_m3', 'recept_naziv', 'datum_pocetka', 'proizvodni_zapis_br'];
                    const isStrict = strictKeys.includes(dbK);

                    hRowNorm.forEach((h, colIdx) => {
                        if (h === '') return;

                        const skip = [
                            'target', 'zadano', 'ciljna', 'planirana', 'hesaplanan',
                            'fark', 'hata', 'koja ce se proizvesti', 'kolicina koja',
                            'error', 'difference', 'deviation', 'zadato',
                            'hedef', 'ayar', 'setpoint', 'set', 'deger', 'miktari'
                        ];

                        const normalizedWords = words.map(w => norm(w));
                        const isMatch = isStrict
                            ? normalizedWords.some(w => h === w || h.startsWith(w + ' ('))
                            : normalizedWords.some(w => h.includes(w));

                        if (isMatch && !skip.some(s => h.includes(s))) {
                            indices.push(colIdx);
                        }
                    });
                    ci[dbK] = indices;
                });

                const mandatory = ['recept_naziv', 'kolicina_m3', 'datum_pocetka'];
                const missing = mandatory.filter(k => !ci[k] || ci[k].length === 0);
                if (missing.length > 0) {
                    throw new Error(`Ne mogu pronaci kolone: ${missing.join(', ')}`);
                }

                const result: ProizvodnjaBetona[] = [];
                let lastDate: string | null = null;

                for (let i = hIdx + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length < 5) continue;

                    const rowS = row.join(' ').toLowerCase();
                    const getRaw = (key: string) => {
                        const idxs = ci[key] || [];
                        return idxs.length > 0 ? row[idxs[0]] : null;
                    };

                    const recipeName = String(getRaw('recept_naziv') || '');
                    if (rowS.includes('ukupno') || rowS.includes('total') || recipeName === '') continue;

                    const dVal = parseDate(getRaw('datum_pocetka'));
                    const qVal = parseNum(getRaw('kolicina_m3'), format);
                    if (dVal) lastDate = dVal;
                    if (!lastDate || qVal <= 0) continue;

                    const record: any = {
                        betonara_id: plant,
                        proizvodni_zapis_br: parseInt(String(getRaw('proizvodni_zapis_br') || '')) || i,
                        datum_pocetka: lastDate,
                        recept_naziv: recipeName
                    };

                    Object.keys(ci).forEach(key => {
                        const indices = ci[key];
                        if (key.endsWith('_kg') || key.endsWith('_m3')) {
                            record[key] = indices.reduce((sum: number, idx: number) => sum + parseNum(row[idx], format), 0);
                        } else if (key === 'datum_pocetka') {
                            // already handled
                        } else {
                            const val = indices.length > 0 ? row[indices[0]] : '';
                            record[key] = String(val || '').trim();
                        }
                    });

                    result.push(record as ProizvodnjaBetona);
                }

                console.log(`[ExcelParser] ✅ Parsed ${result.length} records for ${plant}`);

                resolve(result.map(r => {
                    if (r.recept_naziv && recipeMappings[r.recept_naziv]) {
                        r.recept_naziv = recipeMappings[r.recept_naziv];
                    }
                    return r as ProizvodnjaBetona;
                }));
            } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
    });
}

