'use server';

import { createClient } from '@/lib/supabase/server';
import { ProizvodnjaBetona } from '@/types/betonara';
import { revalidatePath } from 'next/cache';

export async function saveProizvodnjaBetonaRecords(records: ProizvodnjaBetona[]) {
    const supabase = await createClient();
    const CHUNK_SIZE = 500;
    let totalProcessed = 0;

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        const { error } = await supabase
            .from('proizvodnja_betona')
            .upsert(chunk, {
                onConflict: 'betonara_id,proizvodni_zapis_br,datum_pocetka'
            });

        if (error) {
            console.error('Error saving chunk:', error);
            throw error;
        }
    }

    revalidatePath('/betonara/dashboard');
    revalidatePath('/betonara/reports');

    return { success: true, count: records.length };
}

export async function getUnifiedProductionRecords(filters: { from?: string, to?: string, plant?: string }) {
    const supabase = await createClient();
    let query = supabase.from('proizvodnja_betona').select('*').order('datum_pocetka', { ascending: false });

    if (filters.from) query = query.gte('datum_pocetka', filters.from);
    if (filters.to) query = query.lte('datum_pocetka', filters.to);
    if (filters.plant && filters.plant !== 'all') query = query.eq('betonara_id', filters.plant);

    const { data, error } = await query;
    if (error) return [];

    return (data || []).map(r => ({
        ...r,
        date: new Date(r.datum_pocetka),
        recipe_number: r.recept_naziv || r.recept_oznaka || 'Nepoznato',
        total_quantity: Number(r.kolicina_m3 || 0),
        work_order_number: r.proizvodni_zapis_br?.toString(),
        // Logistička polja za IMEL
        customer: r.kupac,
        jobsite: r.gradiliste,
        driver: r.vozac,
        vehicle: r.vozilo,
        recipe_no: r.recept_br,
        issuance_number: r.prijemnica,
        production_no: r.proizvodnja_br,
        company: r.kompanija || 'Baupartner',
        // Materijali
        agg1_actual: Number(r.agg1_kg || 0),
        agg2_actual: Number(r.agg2_kg || 0),
        agg3_actual: Number(r.agg3_kg || 0),
        agg4_actual: Number(r.agg4_kg || 0),
        agg5_actual: Number(r.agg5_kg || 0),
        agg6_actual: Number(r.agg6_kg || 0),
        cem1_actual: Number(r.cem1_kg || 0),
        cem2_actual: Number(r.cem2_kg || 0),
        cem3_actual: Number(r.cem3_kg || 0),
        cem4_actual: Number(r.cem4_kg || 0),
        add1_actual: Number(r.add1_kg || 0),
        add2_actual: Number(r.add2_kg || 0),
        add3_actual: Number(r.add3_kg || 0),
        add4_actual: Number(r.add4_kg || 0),
        add5_actual: Number(r.add5_kg || 0),
        water1_actual: Number(r.wat1_kg || 0),
        water2_actual: Number(r.wat2_kg || 0),
        // Odstupanja (procenti) za IMEL
        agg1_pct: r.agg1_yuzde_fark,
        agg2_pct: r.agg2_yuzde_fark,
        agg3_pct: r.agg3_yuzde_fark,
        agg4_pct: r.agg4_yuzde_fark,
        agg5_pct: r.agg5_yuzde_fark,
        agg6_pct: r.agg6_yuzde_fark,
        cem1_pct: r.cem1_yuzde_fark,
        cem2_pct: r.cem2_yuzde_fark,
        cem3_pct: r.cem3_yuzde_fark,
        cem4_pct: r.cem4_yuzde_fark,
        add1_pct: r.add1_yuzde_fark,
        add2_pct: r.add2_yuzde_fark,
        add3_pct: r.add3_yuzde_fark,
        add4_pct: r.add4_yuzde_fark,
        water1_pct: r.wat1_yuzde_fark,
        water2_pct: r.wat2_yuzde_fark
    }));
}

export async function getUnifiedProductionStats(filters: { from?: string, to?: string, plant?: string }) {
    const supabase = await createClient();
    let query = supabase.from('proizvodnja_betona').select('*');
    if (filters.from) query = query.gte('datum_pocetka', filters.from);
    if (filters.to) query = query.lte('datum_pocetka', filters.to);
    if (filters.plant && filters.plant !== 'all') query = query.eq('betonara_id', filters.plant);

    const { data, error } = await query;
    if (error) return {
        total_m3: 0,
        record_count: 0,
        by_plant: {},
        by_recipe: {},
        daily_production: [],
        material_consumption: {},
        material_targets: {}
    };

    const stats = {
        total_m3: 0,
        record_count: data?.length || 0,
        by_plant: {} as Record<string, number>,
        by_recipe: {} as Record<string, number>,
        daily_production: [] as Array<{ date: string, value: number }>,
        material_consumption: {} as Record<string, number>,
        material_targets: {} as Record<string, number>
    };

    const daily: Record<string, number> = {};
    data?.forEach(r => {
        const qty = Number(r.kolicina_m3 || 0);
        stats.total_m3 += qty;
        stats.by_plant[r.betonara_id] = (stats.by_plant[r.betonara_id] || 0) + qty;

        const recipeName = r.recept_naziv || 'Nepoznato';
        stats.by_recipe[recipeName] = (stats.by_recipe[recipeName] || 0) + qty;

        const d = r.datum_pocetka.split('T')[0];
        daily[d] = (daily[d] || 0) + qty;

        // Materijali - Mapiranje na šifre artikala iz izvještaja
        const mat = stats.material_consumption;
        mat['01030073'] = (mat['01030073'] || 0) + Number(r.agg2_kg || 0);
        mat['01030063'] = (mat['01030063'] || 0) + Number(r.agg3_kg || 0);
        mat['01030074'] = (mat['01030074'] || 0) + Number(r.agg4_kg || 0);
        mat['01030075'] = (mat['01030075'] || 0) + Number(r.agg1_kg || 0);
        mat['01110045'] = (mat['01110045'] || 0) + Number(r.cem1_kg || 0) + Number(r.cem2_kg || 0);
        mat['01044076'] = (mat['01044076'] || 0) + Number(r.add1_kg || 0);
        mat['01044077'] = (mat['01044077'] || 0) + Number(r.add2_kg || 0);
    });

    stats.daily_production = Object.entries(daily).sort().map(([date, value]) => ({ date, value }));
    return stats;
}
