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

                // Sinonimi za svaki format
                const synonymsByFormat: Record<FormatType, Record<string, string[]>> = {
                    'B1_SCADA': {
                        id: ['production record no'],
                        date: ['start date'],
                        recipe: ['recete'],
                        qty: ['quantity'],
                        // VAŽNO: TAČNO MAPIRANJE prema stvarnim Excel podacima!
                        // Excel → DB (prema MB 60 ŠP analizi):
                        // Agg1 (pos 22) = 9.040 → agg1 (01030075 - 8-16)
                        // Agg2 (pos 23) = 13.490 → agg2 (01030073 - Riječni 0-4)
                        // Agg3 (pos 24) = 4.871 → agg3 (01030063 - Drobljeni 0-4)
                        // Agg4 (pos 25) = 6.466 → agg4 (01030074 - 4-8)
                        agg1: ['agg1'],                          // 01030075 (8-16)
                        agg2: ['agg2'],                           // 01030073 (Riječni 0-4)
                        agg3: ['agg3'],                          // 01030063 (Drobljeni 0-4)
                        agg4: ['agg4'],                          // 01030074 (4-8)
                        // Cem1 (Excel) = 52.5 N (FILER) → cem2
                        // Cem2 (Excel) = 42.5 N → cem1
                        cem2: ['cem1'],                          // 01110045 (52.5 FILER)
                        cem1: ['cem2'],                          // 01110045 (42.5)
                        // Add1 (Excel) = Aditiv FM 500 (ŠUPLJE) → add2
                        // Add2 (Excel) = SIKA V → add1
                        add2: ['add1'],                          // 01044077 (FM 500)
                        add1: ['add2'],                          // 01044076 (SIKA V)
                        wat1: ['wat1']
                    },
                    'B2_SCADA': {
                        id: ['proizvodni zapis br'],
                        date: ['datum pocetka'],
                        recipe: ['recete', 'prijemnica'],
                        qty: ['kolicina'],
                        // VAŽNO: Mapiranje prema šiframa artikala iz izvještaja!
                        // 01030073 = Riječni agregat 0-4 (GEOKOP) → Riječna 0-4
                        // 01030063 = Kameni drobljeni agregat 0-4 → Drobljena 0-4
                        // 01030074 = 4-8
                        // 01030075 = Riječni agregat 8-16 (GEOKOP) → 8-16
                        agg2: ['rijecna 0-4', 'agg1'],           // 01030073 (Riječna 0-4)
                        agg3: ['drobljena 0-4', 'agg2'],         // 01030063 (Drobljena 0-4)
                        agg4: ['4-8', 'agg3'],                   // 01030074 (4-8)
                        agg1: ['8-16', 'agg4'],                  // 01030075 (8-16)
                        cem1: ['cem i', 'cem1'],                 // 01110045
                        cem2: ['cem2'],                          // 01110045 (52.5)
                        add1: ['sf 16', 'add1'],                 // 01044076 (SF 16 / SIKA V)
                        add2: ['sika', 'sika s', 'add2'],        // 01044077 (SIKA / SIKA Š)
                        wat1: ['voda 1', 'wat1']
                    },
                    'B2_LEGACY': {
                        id: ['datum'],
                        date: ['datum'],
                        recipe: ['naziv recepture'],
                        qty: ['kolicina proizvedenog'],
                        agg1: ['agregat 0-4', 'geokop'],
                        agg2: ['kameni drobljeni', 'drobljeni agregat'],
                        agg3: ['agregat 4-8', 'geokop2'],
                        agg4: ['agregat 8-16'],
                        cem1: ['42,5'],
                        cem2: ['52,5'],
                        add1: ['sika v'],
                        add2: ['fm 500'],
                        wat1: ['voda 1']
                    }
                };

                const synonyms = synonymsByFormat[format];
                const hRowNorm = jsonData[hIdx].map((s: any) => norm(s));
                console.log('[ExcelParser] Header row (normalized):', hRowNorm);
                const ci: Record<string, number> = {};

                Object.entries(synonyms).forEach(([dbK, words]) => {
                    ci[dbK] = hRowNorm.findIndex(h => {
                        const skip = ['target', 'zadano', 'ciljna', 'planirana', 'hesaplanan', 'fark', 'hata',
                            'koja ce se proizvesti', 'kolicina koja'];
                        return words.some(w => h.includes(norm(w))) && !skip.some(s => h.includes(s));
                    });
                });
                console.log('[ExcelParser] Column indices:', JSON.stringify(ci));

                // Provjera: da li su kriticne kolone pronadjene
                const missing = ['recipe', 'qty', 'date'].filter(k => ci[k] === -1);
                if (missing.length > 0) {
                    console.error(`[ExcelParser] ❌ Nedostaju kriticne kolone: ${missing.join(', ')}`);
                    console.error('[ExcelParser] Dostupne kolone:', hRowNorm.filter(h => h !== ''));
                    throw new Error(`Ne mogu pronaci kolone: ${missing.join(', ')}. Format: ${format}`);
                }

                const result: any[] = [];
                let lastDate: string | null = null;

                for (let i = hIdx + 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length < 5) continue;

                    const rowS = row.join(' ').toLowerCase();
                    const recipe = String(row[ci.recipe] || '');

                    // FILTRIRANJE
                    if (rowS.includes('ukupno') || rowS.includes('total')) continue;
                    if (recipe.includes('Nepoznato(') || recipe === '') continue;

                    const dVal = parseDate(row[ci.date]);
                    const qVal = parseNum(row[ci.qty], format);
                    const idVal = String(row[ci.id] || '').trim();

                    if (dVal) lastDate = dVal;
                    if (!lastDate || qVal <= 0) continue;

                    result.push({
                        betonara_id: plant,
                        proizvodni_zapis_br: parseInt(idVal) || i,
                        datum_pocetka: lastDate,
                        recept_naziv: recipe,
                        kolicina_m3: qVal,
                        agg1_kg: parseNum(row[ci.agg1], format),
                        agg2_kg: parseNum(row[ci.agg2], format),
                        agg3_kg: parseNum(row[ci.agg3], format),
                        agg4_kg: parseNum(row[ci.agg4], format),
                        cem1_kg: parseNum(row[ci.cem1], format),
                        cem2_kg: parseNum(row[ci.cem2], format),
                        add1_kg: parseNum(row[ci.add1], format),
                        add2_kg: parseNum(row[ci.add2], format),
                        wat1_kg: parseNum(row[ci.wat1], format)
                    });

                    // Debug: log first 3 records
                    if (result.length <= 3) {
                        console.log(`[ExcelParser] Record #${result.length}:`, {
                            recept: recipe,
                            qty: qVal,
                            agg1: parseNum(row[ci.agg1], format),
                            agg2: parseNum(row[ci.agg2], format),
                            agg3: parseNum(row[ci.agg3], format),
                            agg4: parseNum(row[ci.agg4], format),
                            cem1: parseNum(row[ci.cem1], format),
                            cem2: parseNum(row[ci.cem2], format),
                            wat1: parseNum(row[ci.wat1], format)
                        });
                    }
                }

                console.log(`[ExcelParser] ✅ Parsed ${result.length} records for ${plant} (${format})`);

                resolve(result.map(r => {
                    if (recipeMappings[r.recept_naziv]) r.recept_naziv = recipeMappings[r.recept_naziv];
                    return r as ProizvodnjaBetona;
                }));
            } catch (err) { reject(err); }
        };
        reader.readAsArrayBuffer(file);
    });
}

