import { format } from 'date-fns';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BetonaraProductionRecord } from '@/types/betonara';

interface GroupedRecord {
    date: Date;
    recipe_number: string;
    count: number;
    total_quantity: number;
    agg1_actual?: number;
    agg2_actual?: number;
    agg3_actual?: number;
    agg4_actual?: number;
    cem1_actual?: number;
    cem2_actual?: number;
    add1_actual?: number;
    add2_actual?: number;
    water1_actual?: number;
    records: BetonaraProductionRecord[];
}

interface Totals {
    agg1?: number;
    agg2?: number;
    agg3?: number;
    agg4?: number;
    cem1?: number;
    cem2?: number;
    add1?: number;
    add2?: number;
    water?: number;
    total?: number;
}

export function exportToExcel(
    groupedRecordsArray: GroupedRecord[],
    totals: Totals,
    month: string,
    year: string
) {
    const headers = [
        ["ŠIFRA ARTIKLA:", "", "01030073", "01030063", "01030074", "01030075", "01110045", "01110045", "01044076", "01044077", "", "", ""],
        [
            "Datum", 
            "Naziv recepture", 
            "Riječni agregat 0-4 (GEOKOP)", 
            "Kameni drobljeni agregat 0-4", 
            "Riječni agregat 4-8 (GEOKOP2)", 
            "Riječni agregat 8-16 (GEOKOP)", 
            "CEM I 42,5 N", 
            "CEM I 52,5 N (FILER)", 
            "SIKA V", 
            "Aditiv FM 500(ŠUPLJE)", 
            "Voda 1", 
            "Količina proizvedenog betona", 
            "Br. mješanja"
        ]
    ];

    const data = groupedRecordsArray.map(g => [
        format(g.date, 'dd.MM.yyyy'),
        g.recipe_number,
        (g.agg2_actual || 0).toFixed(2),
        (g.agg3_actual || 0).toFixed(2),
        (g.agg4_actual || 0).toFixed(2),
        (g.agg1_actual || 0).toFixed(2),
        (g.cem1_actual || 0).toFixed(2),
        (g.cem2_actual || 0).toFixed(2),
        (g.add1_actual || 0).toFixed(2),
        (g.add2_actual || 0).toFixed(2),
        (g.water1_actual || 0).toFixed(2),
        g.total_quantity.toFixed(2),
        g.count.toString()
    ]);

    data.push([
        'UKUPNO', '',
        (totals.agg2 || 0).toFixed(2),
        (totals.agg3 || 0).toFixed(2),
        (totals.agg4 || 0).toFixed(2),
        (totals.agg1 || 0).toFixed(2),
        (totals.cem1 || 0).toFixed(2),
        (totals.cem2 || 0).toFixed(2),
        (totals.add1 || 0).toFixed(2),
        (totals.add2 || 0).toFixed(2),
        (totals.water || 0).toFixed(2),
        (totals.total || 0).toFixed(2),
        ''
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);

    // Apply styles to headers
    const headerStyle = {
        fill: { fgColor: { rgb: "10B981" } }, // Emerald 500
        font: { color: { rgb: "FFFFFF" }, bold: true, sz: 10 },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
            top: { style: "thin", color: { rgb: "FFFFFF" } },
            bottom: { style: "thin", color: { rgb: "FFFFFF" } },
            left: { style: "thin", color: { rgb: "FFFFFF" } },
            right: { style: "thin", color: { rgb: "FFFFFF" } }
        }
    };

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:M1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
        // First row
        const cell1 = XLSX.utils.encode_cell({ r: 0, c: C });
        if (ws[cell1]) ws[cell1].s = headerStyle;
        
        // Second row
        const cell2 = XLSX.utils.encode_cell({ r: 1, c: C });
        if (ws[cell2]) ws[cell2].s = headerStyle;
    }

    // Adjust column widths
    ws['!cols'] = [
        { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, 
        { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, 
        { wch: 10 }, { wch: 15 }, { wch: 10 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Izvjestaj');
    XLSX.writeFile(wb, `Betonara_Izvjestaj_${month}_${year}.xlsx`);
}

export function exportToPDF(
    groupedRecordsArray: GroupedRecord[],
    totals: Totals,
    month: string,
    year: string,
    months: Array<{ value: string; label: string }>
) {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    doc.setFontSize(16);
    doc.text('Izvještaj proizvodnje betona', 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${months.find(m => m.value === month)?.label} ${year}`, 14, 22);

    const headers = [
        ["", "ŠIFRA ARTIKLA:", "01030073", "01030063", "01030074", "01030075", "01110045", "01110045", "01044076", "01044077", "", "", ""],
        [
            'Datum', 
            'Receptura',
            'Rijecna 0-4', 
            'Drob. 0-4', 
            'Frak. 4-8', 
            'Frak. 8-16',
            'CEM I 42,5', 
            'FILER 52,5',
            'SIKA V', 
            'Aditiv FM',
            'Voda', 
            'm³', 
            'Br.'
        ]
    ];

    const data: any[][] = groupedRecordsArray.map(g => [
        format(g.date, 'dd.MM.yyyy'),
        g.recipe_number,
        (g.agg2_actual || 0).toFixed(2),
        (g.agg3_actual || 0).toFixed(2),
        (g.agg4_actual || 0).toFixed(2),
        (g.agg1_actual || 0).toFixed(2),
        (g.cem1_actual || 0).toFixed(2),
        (g.cem2_actual || 0).toFixed(2),
        (g.add1_actual || 0).toFixed(2),
        (g.add2_actual || 0).toFixed(2),
        (g.water1_actual || 0).toFixed(2),
        g.total_quantity.toFixed(2),
        g.count
    ]);

    data.push([
        { content: 'UKUPNO', colSpan: 2, styles: { halign: 'left', fontStyle: 'bold' } },
        (totals.agg2 || 0).toFixed(2),
        (totals.agg3 || 0).toFixed(2),
        (totals.agg4 || 0).toFixed(2),
        (totals.agg1 || 0).toFixed(2),
        (totals.cem1 || 0).toFixed(2),
        (totals.cem2 || 0).toFixed(2),
        (totals.add1 || 0).toFixed(2),
        (totals.add2 || 0).toFixed(2),
        (totals.water || 0).toFixed(2),
        (totals.total || 0).toFixed(2),
        ''
    ]);

    autoTable(doc, {
        startY: 28,
        head: headers,
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontSize: 8 },
        styles: { fontSize: 7, cellPadding: 2 },
        columnStyles: {
            0: { cellWidth: 20 },
            1: { cellWidth: 40 },
        }
    });

    doc.save(`Betonara_Izvjestaj_${month}_${year}.pdf`);
}

export function exportImelToExcel(
    records: BetonaraProductionRecord[],
    plant: string,
    month: string,
    year: string
) {
    const filename = plant === 'all' 
        ? `${format(new Date(parseInt(year), parseInt(month) - 1), 'dd.MM.yyyy')}_Sve_betonare.xlsx`
        : `${format(new Date(parseInt(year), parseInt(month) - 1), 'dd.MM.yyyy')}_${plant.replace(' ', '_')}.xlsx`;

    const headers = [[
        "Proizvodni zapis br", "Kompanija", "Kupac", "Datum pocetka", "Datum zavrsetka",
        "Proizvodnja br", "Recept br", "Prijemnica", "Reçete", "Kolicina",
        "Kolicina koja ce se proizvesti", "Povratni beton", "Povratni beleske",
        "Sifra porudzbe", "Gradiliste", "Vozac", "Ek Madde", "Ek Maddenin Miktarı",
        "Ek Madde 2", "Ek Maddenin Miktarı 2", "Nakliyat Bölgesi", "Vozilo",
        "Rijecna 0-4", "Drobljena 0-4", "4-8", "8-16", "", "", "CEM I", "FILER",
        "", "", "SIKA V", "SIKA Š", "Su1", "Su1", "VODA 1", "VODA 2",
        "Dodatna voda1", "Dodatna voda2", "Statu",
        "Ag1YuzdeFark", "Ag2YuzdeFark", "Ag3YuzdeFark", "Ag4YuzdeFark",
        "Cim1YuzdeFark", "Cim2YuzdeFark", "Cim3YuzdeFark", "Cim4YuzdeFark",
        "Kat1YuzdeFark", "Kat2YuzdeFark", "Kat3YuzdeFark", "Kat4YuzdeFark",
        "Su1YuzdeFark", "Su2YuzdeFark"
    ]];

    // Group records by date and recipe number before exporting
    const groupedMap = records.reduce((acc, r) => {
        const dateKey = format(r.date || new Date(), 'yyyy-MM-dd');
        const recipeKey = r.recipe_number || r.recipe_no || 'Unknown';
        const key = `${dateKey}_${recipeKey}`;

        if (!acc[key]) {
            acc[key] = {
                ...r,
                total_quantity: 0,
                agg1_actual: 0, agg2_actual: 0, agg3_actual: 0, agg4_actual: 0, agg5_actual: 0, agg6_actual: 0,
                cem1_actual: 0, cem2_actual: 0, cem3_actual: 0, cem4_actual: 0,
                add1_actual: 0, add2_actual: 0, add3_actual: 0, add4_actual: 0,
                water1_actual: 0, water1_target: 0, water2_actual: 0,
                extra_water_1: 0, extra_water_2: 0,
                count: 0
            };
        }
        acc[key].total_quantity += (r.total_quantity || 0);
        acc[key].agg1_actual += ((r as any).agg1_actual || 0);
        acc[key].agg2_actual += ((r as any).agg2_actual || 0);
        acc[key].agg3_actual += ((r as any).agg3_actual || 0);
        acc[key].agg4_actual += ((r as any).agg4_actual || 0);
        acc[key].agg5_actual += ((r as any).agg5_actual || 0);
        acc[key].agg6_actual += ((r as any).agg6_actual || 0);
        acc[key].cem1_actual += ((r as any).cem1_actual || 0);
        acc[key].cem2_actual += ((r as any).cem2_actual || 0);
        acc[key].cem3_actual += ((r as any).cem3_actual || 0);
        acc[key].cem4_actual += ((r as any).cem4_actual || 0);
        acc[key].add1_actual += ((r as any).add1_actual || 0);
        acc[key].add2_actual += ((r as any).add2_actual || 0);
        acc[key].add3_actual += ((r as any).add3_actual || 0);
        acc[key].add4_actual += ((r as any).add4_actual || 0);
        acc[key].water1_actual += ((r as any).water1_actual || 0);
        acc[key].water2_actual += ((r as any).water2_actual || 0);
        acc[key].extra_water_1 += ((r as any).extra_water_1 || 0);
        acc[key].extra_water_2 += ((r as any).extra_water_2 || 0);
        acc[key].count += 1;
        return acc;
    }, {} as Record<string, any>);

    const data = Object.values(groupedMap).map(r => {
        const productionRecordNo = r.id ? r.id.split('_')[0] : '';
        const isSpecialRecipe = (r.recipe_number || r.recipe_no) === 'SIKA SUPLJA PLOCA' || (r.recipe_number || r.recipe_no) === 'MB 60 ŠP';
        
        // Logical routing based on user requirements
        // For special: Cem2 -> CEM I, Cem1 -> FILER, add1 -> SIKA Š
        // For normal: Cem1 -> CEM I, cem2 -> FILER, add1 -> SIKA V
        const cemIVal = isSpecialRecipe ? ((r as any).cem2_actual || 0) : ((r as any).cem1_actual || 0);
        const filerVal = isSpecialRecipe ? ((r as any).cem1_actual || 0) : ((r as any).cem2_actual || 0);
        const sikaVVal = isSpecialRecipe ? 0 : ((r as any).add1_actual || 0);
        const sikaSVal = isSpecialRecipe ? ((r as any).add1_actual || 0) : ((r as any).add2_actual || 0);

        return [
            productionRecordNo,
            r.company || 'Baupartner',
            r.customer || 'Baupartner',
            r.date ? format(r.date, 'dd/MM/yyyy  HH:mm') : '',
            r.end_date ? format(r.end_date, 'dd/MM/yyyy  HH:mm') : format(r.date || new Date(), 'dd/MM/yyyy  HH:mm'),
            r.production_no || '',
            r.recipe_no || r.recipe_number || '',
            r.issuance_number || '',
            r.recipe_number || '',
            r.total_quantity || 0,
            r.target_quantity || r.total_quantity || 0,
            r.return_concrete || 0,
            r.return_concrete_note || '',
            r.order_code || '',
            r.jobsite || '',
            r.driver || '',
            r.extra_material_1 || '',
            r.extra_material_1_qty || 0,
            r.extra_material_2 || '',
            r.extra_material_2_qty || 0,
            r.shipping_zone || '',
            r.vehicle || '',
            (r as any).agg1_actual || 0,
            (r as any).agg2_actual || 0,
            (r as any).agg3_actual || 0,
            (r as any).agg4_actual || 0,
            (r as any).agg5_actual || 0,
            (r as any).agg6_actual || 0,
            cemIVal,
            filerVal,
            (r as any).cem3_actual || 0,
            (r as any).cem4_actual || 0,
            sikaVVal,
            sikaSVal,
            (r as any).water1_actual || 0,
            (r as any).water1_target || 0,
            (r as any).water1_actual || 0,
            (r as any).water2_actual || 0,
            (r as any).extra_water_1 || 0,
            (r as any).extra_water_2 || 0,
            r.status || 2,
            (r as any).agg1_pct || 0,
            (r as any).agg2_pct || 0,
            (r as any).agg3_pct || 0,
            (r as any).agg4_pct || 0,
            (r as any).cem1_pct || 0,
            (r as any).cem2_pct || 0,
            (r as any).cem3_pct || 0,
            (r as any).cem4_pct || 0,
            (r as any).add1_pct || 0,
            (r as any).add2_pct || 0,
            (r as any).add3_pct || 0,
            (r as any).add4_pct || 0,
            (r as any).water1_pct || 0,
            (r as any).water2_pct || 0
        ];
    });

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'IMEL Izvjestaj');
    XLSX.writeFile(wb, filename);
}

export function exportImelToPDF(
    records: BetonaraProductionRecord[],
    plant: string,
    month: string,
    year: string,
    months: Array<{ value: string; label: string }>
) {
    const filename = plant === 'all' 
        ? `${format(new Date(parseInt(year), parseInt(month) - 1), 'dd.MM.yyyy')}_Sve_betonare.pdf`
        : `${format(new Date(parseInt(year), parseInt(month) - 1), 'dd.MM.yyyy')}_${plant.replace(' ', '_')}.pdf`;

    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    doc.setFontSize(16);
    doc.text('IMEL Izvještaj', 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${months.find(m => m.value === month)?.label} ${year}`, 14, 22);
    if (plant !== 'all') {
        doc.text(`Betonara: ${plant}`, 14, 27);
    }

    const headers = [[
        'Datum', 'Recept', 'Količina', 'Br. mješ.',
        'Agg1', 'Agg2', 'Agg3', 'Agg4', 'Cem1', 'Add1', 'Voda'
    ]];

    // Group records by date and recipe number before exporting
    const groupedMap = records.reduce((acc, r) => {
        const dateKey = format(r.date || new Date(), 'yyyy-MM-dd');
        const recipeKey = r.recipe_number || r.recipe_no || 'Unknown';
        const key = `${dateKey}_${recipeKey}`;

        if (!acc[key]) {
            acc[key] = {
                ...r,
                total_quantity: 0,
                agg1_actual: 0, agg2_actual: 0, agg3_actual: 0, agg4_actual: 0,
                cem1_actual: 0, add1_actual: 0, water1_actual: 0,
                count: 0
            };
        }
        acc[key].total_quantity += (r.total_quantity || 0);
        acc[key].agg1_actual += ((r as any).agg1_actual || 0);
        acc[key].agg2_actual += ((r as any).agg2_actual || 0);
        acc[key].agg3_actual += ((r as any).agg3_actual || 0);
        acc[key].agg4_actual += ((r as any).agg4_actual || 0);
        acc[key].cem1_actual += ((r as any).cem1_actual || 0);
        acc[key].add1_actual += ((r as any).add1_actual || 0);
        acc[key].water1_actual += ((r as any).water1_actual || 0);
        acc[key].count += 1;
        return acc;
    }, {} as Record<string, any>);

    const data = Object.values(groupedMap).map(r => [
        r.date ? format(r.date, 'dd.MM.yyyy') : '',
        r.recipe_number || '',
        r.total_quantity?.toFixed(2) || '0',
        r.count.toString(),
        (r.agg1_actual || 0).toFixed(0),
        (r.agg2_actual || 0).toFixed(0),
        (r.agg3_actual || 0).toFixed(0),
        (r.agg4_actual || 0).toFixed(0),
        (r.cem1_actual || 0).toFixed(0),
        (r.add1_actual || 0).toFixed(2),
        (r.water1_actual || 0).toFixed(0)
    ]);

    autoTable(doc, {
        startY: plant !== 'all' ? 32 : 28,
        head: headers,
        body: data,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255 },
        styles: { fontSize: 8, cellPadding: 2 },
    });

    doc.save(filename);
}
