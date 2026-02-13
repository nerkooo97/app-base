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
                onConflict: 'betonara_id, proizvodni_zapis_br, datum_pocetka'
            });

        if (error) {
            console.error('Upsert error:', error);
            throw new Error(`Greška: ${error.message}`);
        }
        totalProcessed += chunk.length;
    }

    revalidatePath('/betonara/reports');
    revalidatePath('/betonara/dashboard');
    return { success: true, count: totalProcessed };
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
        agg1_actual: Number(r.agg1_kg || 0),
        agg2_actual: Number(r.agg2_kg || 0),
        agg3_actual: Number(r.agg3_kg || 0),
        agg4_actual: Number(r.agg4_kg || 0),
        cem1_actual: Number(r.cem1_kg || 0),
        cem2_actual: Number(r.cem2_kg || 0),
        add1_actual: Number(r.add1_kg || 0),
        add2_actual: Number(r.add2_kg || 0),
        water1_actual: Number(r.wat1_kg || 0) + Number(r.wat2_kg || 0)
    }));
}

export async function getUnifiedProductionStats(filters: { from?: string, to?: string, plant?: string }) {
    const supabase = await createClient();
    let query = supabase.from('proizvodnja_betona').select('*');
    if (filters.from) query = query.gte('datum_pocetka', filters.from);
    if (filters.to) query = query.lte('datum_pocetka', filters.to);
    if (filters.plant && filters.plant !== 'all') query = query.eq('betonara_id', filters.plant);

    const { data, error } = await query;
    if (error) return { total_m3: 0, record_count: 0, by_plant: {}, daily_production: [], material_consumption: {} };

    const stats = {
        total_m3: 0, record_count: data?.length || 0, by_plant: {} as any, daily_production: [] as any[], material_consumption: {} as any
    };

    const daily: Record<string, number> = {};
    data?.forEach(r => {
        const qty = Number(r.kolicina_m3 || 0);
        stats.total_m3 += qty;
        stats.by_plant[r.betonara_id] = (stats.by_plant[r.betonara_id] || 0) + qty;
        const d = r.datum_pocetka.split('T')[0];
        daily[d] = (daily[d] || 0) + qty;
    });

    stats.daily_production = Object.entries(daily).sort().map(([date, value]) => ({ date, value }));
    return stats;
}
