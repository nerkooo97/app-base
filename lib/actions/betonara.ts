'use server';

import { createClient } from '@/lib/supabase/server';
import { BetonaraProductionRecord, RecipeMapping, BetonaraMaterial, BetonaraImportHistory } from '@/types/betonara';
import { revalidatePath } from 'next/cache';

export async function saveProductionRecords(records: BetonaraProductionRecord[]) {
    const supabase = await createClient();
    const CHUNK_SIZE = 500; 
    const existingIds = new Set<string>();

    // 1. Identifikujemo postojeće rekorde da bismo znali šta je NOVO a šta AŽURIRANO
    const CHECK_CHUNK_SIZE = 200;
    for (let i = 0; i < records.length; i += CHECK_CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHECK_CHUNK_SIZE);
        const chunkIds = chunk.map(r => r.id).filter(Boolean);

        if (chunkIds.length === 0) continue;

        const { data: existingRecords, error: fetchError } = await supabase
            .from('betonara_production')
            .select('id')
            .in('id', chunkIds);

        if (fetchError) {
            console.error('Error checking existing records chunk:', fetchError);
            throw new Error(`Greška pri provjeri postojanja: ${fetchError.message}`);
        }

        existingRecords?.forEach(r => existingIds.add(r.id));
    }

    // 2. Koristimo UPSERT da bismo dodali nove ili ažurirali postojeće (npr. ako se recept promijenio)
    let totalProcessed = 0;
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
        const chunk = records.slice(i, i + CHUNK_SIZE);
        const formattedRecords = chunk.map(r => ({
            ...r,
            date: r.date instanceof Date ? r.date.toISOString() : r.date,
        }));

        const { error: upsertError } = await supabase
            .from('betonara_production')
            .upsert(formattedRecords, { onConflict: 'id' });

        if (upsertError) {
            console.error('Error upserting production records chunk:', upsertError);
            throw new Error(`Neuspješno spašavanje podataka (procesirano ${totalProcessed}): ${upsertError.message}`);
        }
        totalProcessed += chunk.length;
    }

    const updated = existingIds.size;
    const added = totalProcessed - updated;

    revalidatePath('/betonara/dashboard');
    revalidatePath('/betonara/reports');

    return {
        success: true,
        added,
        updated,
        message: `Obrada završena: ${added} novih zapisa je dodano, a ${updated} postojećih je ažurirano (uključujući nova mapiranja recepata).`
    };
}

export async function getActiveMaterials(): Promise<BetonaraMaterial[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('betonara_materials')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

    if (error) {
        console.error('Error getting active materials:', error);
        return [];
    }

    return data as BetonaraMaterial[];
}

export async function getRecipeMappings(): Promise<RecipeMapping[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('betonara_recipe_mappings')
        .select('*')
        .order('original_name');

    if (error) {
        console.error('Error getting recipe mappings:', error);
        return [];
    }

    return data as RecipeMapping[];
}

export async function upsertRecipeMapping(mapping: Omit<RecipeMapping, 'id'> & { id?: string }) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('betonara_recipe_mappings')
        .upsert(mapping);

    if (error) {
        console.error('Error upserting recipe mapping:', error);
        throw new Error('Failed to save mapping');
    }

    revalidatePath('/betonara/import');
    return { success: true };
}

export async function deleteRecipeMapping(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('betonara_recipe_mappings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting recipe mapping:', error);
        throw new Error('Failed to delete mapping');
    }

    revalidatePath('/betonara/import');
    return { success: true };
}

export async function getProductionRecords(filters: {
    from?: string,
    to?: string,
    plant?: string,
    recipe?: string
}) {
    const supabase = await createClient();

    let query = supabase
        .from('betonara_production')
        .select('*')
        .order('date', { ascending: false });

    if (filters.from) query = query.gte('date', filters.from);
    if (filters.to) query = query.lte('date', filters.to);
    if (filters.plant && filters.plant !== 'all') query = query.eq('plant', filters.plant);
    if (filters.recipe && filters.recipe !== 'all') query = query.eq('recipe_number', filters.recipe);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching production records:', error);
        return [];
    }

    return data as BetonaraProductionRecord[];
}

export async function getProductionStats(filters: { from?: string, to?: string, plant?: string }) {
    const supabase = await createClient();

    let query = supabase
        .from('betonara_production')
        .select('total_quantity, plant, recipe_number, date, materials, water, target_materials, target_water');

    if (filters.from) query = query.gte('date', filters.from);
    if (filters.to) query = query.lte('date', filters.to);
    if (filters.plant && filters.plant !== 'all') query = query.eq('plant', filters.plant);

    const { data, error } = await query.order('date', { ascending: true });

    if (error) {
        console.error('Error fetching production stats:', error);
        return { 
            total_m3: 0, 
            record_count: 0, 
            by_plant: {}, 
            by_recipe: {},
            daily_production: [],
            material_consumption: {},
            material_targets: {}
        };
    }

    const dailyMap: Record<string, number> = {};
    
    // Koristimo Map za brojanje koliko puta se svaki materijal pojavljuje
    const materialCounts: Record<string, number> = {};
    const targetCounts: Record<string, number> = {};
    
    const stats = {
        total_m3: 0,
        record_count: data.length,
        by_plant: {} as Record<string, number>,
        by_recipe: {} as Record<string, number>,
        daily_production: [] as Array<{ date: string, value: number }>,
        material_consumption: {} as Record<string, number>,
        material_targets: {} as Record<string, number>,
    };

    data.forEach(r => {
        const qty = Number(r.total_quantity) || 0;
        const water = Number(r.water) || 0;
        const targetWater = Number(r.target_water) || 0;
        
        stats.total_m3 += qty;
        stats.by_plant[r.plant] = (stats.by_plant[r.plant] || 0) + qty;
        stats.by_recipe[r.recipe_number] = (stats.by_recipe[r.recipe_number] || 0) + qty;
        
        // Actual Consumption (sabiranje za kasnije prosjek)
        if (water > 0) {
            stats.material_consumption['VODA'] = (stats.material_consumption['VODA'] || 0) + water;
            materialCounts['VODA'] = (materialCounts['VODA'] || 0) + 1;
        }
        
        // Target Consumption (sabiranje za kasnije prosjek)
        if (targetWater > 0) {
            stats.material_targets['VODA'] = (stats.material_targets['VODA'] || 0) + targetWater;
            targetCounts['VODA'] = (targetCounts['VODA'] || 0) + 1;
        }

        // Daily grouping
        try {
            const day = new Date(r.date).toISOString().split('T')[0];
            dailyMap[day] = (dailyMap[day] || 0) + qty;
        } catch (e) {}

        // Actual Material aggregation (sabiranje za kasnije prosjek)
        if (r.materials && typeof r.materials === 'object') {
            Object.entries(r.materials).forEach(([code, amount]) => {
                const val = Number(amount) || 0;
                if (val > 0) {
                    stats.material_consumption[code] = (stats.material_consumption[code] || 0) + val;
                    materialCounts[code] = (materialCounts[code] || 0) + 1;
                }
            });
        }

        // Target Material aggregation (sabiranje za kasnije prosjek)
        if (r.target_materials && typeof r.target_materials === 'object') {
            Object.entries(r.target_materials).forEach(([code, amount]) => {
                const val = Number(amount) || 0;
                if (val > 0) {
                    stats.material_targets[code] = (stats.material_targets[code] || 0) + val;
                    targetCounts[code] = (targetCounts[code] || 0) + 1;
                }
            });
        }
    });

    // Izračunavanje prosjeka za stvarnu potrošnju
    Object.keys(stats.material_consumption).forEach(code => {
        const count = materialCounts[code] || 1;
        stats.material_consumption[code] = stats.material_consumption[code] / count;
    });

    // Izračunavanje prosjeka za teoretsku potrošnju
    Object.keys(stats.material_targets).forEach(code => {
        const count = targetCounts[code] || 1;
        stats.material_targets[code] = stats.material_targets[code] / count;
    });

    stats.daily_production = Object.entries(dailyMap).map(([date, value]) => ({ date, value }));

    return stats;
}

export async function getImportHistory(filters?: {
    from?: string,
    to?: string,
    page?: number,
    limit?: number
}): Promise<{ data: BetonaraImportHistory[], count: number }> {
    const supabase = await createClient();
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('betonara_import_history')
        .select(`
            *,
            profiles(full_name)
        `, { count: 'exact' });

    if (filters?.from && filters?.to) {
        query = query.or(`import_date.gte.${filters.from},and(start_date.lte.${filters.to},end_date.gte.${filters.from})`);
    } else {
        if (filters?.from) query = query.gte('import_date', filters.from);
        if (filters?.to) query = query.lte('import_date', filters.to);
    }

    const { data, error, count } = await query
        .order('import_date', { ascending: false })
        .range(from, to);

    if (error) {
        console.error('Error fetching import history:', error);
        return { data: [], count: 0 };
    }
    
    return { 
        data: (data || []) as any[], 
        count: count || 0 
    };
}

export async function logImport(log: {
    filename: string,
    plant: string,
    added_count: number,
    skipped_count: number,
    start_date?: string,
    end_date?: string
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('betonara_import_history')
        .insert({
            ...log,
            imported_by: user.id
        });

    if (error) {
        console.error('Error logging import:', error);
        throw new Error('Failed to log import history');
    }

    revalidatePath('/betonara/import');
    return { success: true };
}
