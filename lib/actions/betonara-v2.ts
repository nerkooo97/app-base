'use server';

import { createClient } from '@/lib/supabase/server';
import { ProizvodnjaBetona, BetonaraRecipe } from '@/types/betonara';
import { logImport } from '@/lib/actions/betonara';
import { revalidatePath } from 'next/cache';

export async function getBetonaraRecipes(): Promise<BetonaraRecipe[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('betonara_recepture')
        .select('*')
        .order('naziv', { ascending: true });

    if (error) {
        console.error('Error fetching recipes:', error);
        return [];
    }

    return (data || []).map(r => ({
        ...r,
        agg1_kg: Number(r.agg1_kg), agg2_kg: Number(r.agg2_kg), agg3_kg: Number(r.agg3_kg), agg4_kg: Number(r.agg4_kg), agg5_kg: Number(r.agg5_kg), agg6_kg: Number(r.agg6_kg),
        cem1_kg: Number(r.cem1_kg), cem2_kg: Number(r.cem2_kg), cem3_kg: Number(r.cem3_kg), cem4_kg: Number(r.cem4_kg),
        add1_kg: Number(r.add1_kg), add2_kg: Number(r.add2_kg), add3_kg: Number(r.add3_kg), add4_kg: Number(r.add4_kg), add5_kg: Number(r.add5_kg),
        wat1_kg: Number(r.wat1_kg), wat2_kg: Number(r.wat2_kg)
    }));
}

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
        material_targets: {} as Record<string, number>,
        last_import_date: undefined as string | undefined
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

    const { data: latestRecord } = await supabase
        .from('proizvodnja_betona')
        .select('datum_pocetka')
        .order('datum_pocetka', { ascending: false })
        .limit(1)
        .single();

    stats.daily_production = Object.entries(daily).sort().map(([date, value]) => ({ date, value }));
    stats.last_import_date = latestRecord?.datum_pocetka;

    return stats;
}

export async function upsertManualProizvodnjaBetona(record: any) {
    try {
        console.log('STARTING UPSERT with record:', JSON.stringify(record));
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Unauthorized');

        const dateObj = record.date instanceof Date ? record.date : new Date(record.date);
        if (isNaN(dateObj.getTime())) {
            throw new Error('Neispravan datum');
        }

        const workOrderInt = parseInt(record.work_order_number);
        // Use negative timestamp + random suffix to ensure uniqueness for non-numeric IDs and avoid collision with real records
        const recordNum = !isNaN(workOrderInt)
            ? workOrderInt
            : -1 * (Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000));

        console.log('Generated ID:', recordNum);

        const dbRecord: any = {
            ...(record.id ? { id: record.id } : {}),
            betonara_id: record.plant || 'Betonara 1',
            proizvodni_zapis_br: recordNum,
            proizvodnja_br: record.work_order_number || '',
            sifra_porudzbe: record.work_order_number || '',
            datum_pocetka: dateObj.toISOString(),
            recept_naziv: record.recipe_number,
            kolicina_m3: Number(record.total_quantity || 0),
            kupac: record.customer,
            gradiliste: record.jobsite,
            vozac: record.driver,
            vozilo: record.vehicle,
            agg1_kg: Number(record.agg1_actual || 0),
            agg2_kg: Number(record.agg2_actual || 0),
            agg3_kg: Number(record.agg3_actual || 0),
            agg4_kg: Number(record.agg4_actual || 0),
            agg5_kg: Number(record.agg5_actual || 0),
            agg6_kg: Number(record.agg6_actual || 0),
            cem1_kg: Number(record.cem1_actual || 0),
            cem2_kg: Number(record.cem2_actual || 0),
            cem3_kg: Number(record.cem3_actual || 0),
            cem4_kg: Number(record.cem4_actual || 0),
            add1_kg: Number(record.add1_actual || 0),
            add2_kg: Number(record.add2_actual || 0),
            add3_kg: Number(record.add3_actual || 0),
            add4_kg: Number(record.add4_actual || 0),
            add5_kg: Number(record.add5_actual || 0),
            wat1_kg: Number(record.water1_actual || 0),
            wat2_kg: Number(record.water2_actual || 0),
            created_at: record.created_at || new Date().toISOString()
        };

        console.log('PRE-SAVE DB RECORD:', dbRecord);

        const { data: savedRecord, error } = await supabase
            .from('proizvodnja_betona')
            .upsert(dbRecord)
            .select()
            .single();

        if (error) {
            console.error('FULL SUPABASE ERROR:', error);
            throw new Error(`Greška pri spašavanju: ${error.message || error.details || JSON.stringify(error)}`);
        }

        // Log to history so it appears in the Import History UI
        try {
            const actionType = record.id ? 'MANUAL_EDIT' : 'MANUAL_ADD';
            const dateStr = dateObj.toISOString().split('T')[0];

            await logImport({
                filename: `Ručni unos - ${record.plant || 'Betonara 1'} (${dateStr})`,
                plant: record.plant || 'Betonara 1',
                added_count: 1,
                skipped_count: 0,
                start_date: dateObj.toISOString(),
                end_date: dateObj.toISOString(),
                active_days: [dateStr],
                action_type: actionType,
                record_id: savedRecord?.id
            });
            console.log('History logged successfully via logImport');
        } catch (logError) {
            console.error('Exception logging history:', logError);
        }

        revalidatePath('/betonara/dashboard');
        revalidatePath('/betonara/reports');
        revalidatePath('/betonara/import');
        return { success: true };
    } catch (e: any) {
        console.error('CRITICAL ERROR IN UPSERT:', e);
        throw new Error(e.message || 'Critical server error');
    }
}

export async function deleteProizvodnjaBetonaRecord(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('proizvodnja_betona')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting record:', error);
        throw new Error('Failed to delete record');
    }

    revalidatePath('/betonara/dashboard');
    revalidatePath('/betonara/reports');
    return { success: true };
}
