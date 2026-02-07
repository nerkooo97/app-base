'use server';

import { createClient } from '@/lib/supabase/server';
import { BetonaraProductionRecord, RecipeMapping, BetonaraMaterial, BetonaraImportHistory } from '@/types/betonara';
import { revalidatePath } from 'next/cache';

export async function saveProductionRecords(records: BetonaraProductionRecord[]) {
    const supabase = await createClient();
    const CHUNK_SIZE = 500; // Smaller chunks for reliability
    const existingIds = new Set<string>();

    // 1. Check existing records in chunks
    // Smanjujemo chunk size za provjeru jer su ID-ovi dugi, da ne opteretimo query string
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
            throw new Error(`Baza podataka je javila grešku pri provjeri (chunk ${i}): ${fetchError.message}`);
        }

        existingRecords?.forEach(r => existingIds.add(r.id));
    }

    // 2. Filter records to only those that DON'T exist
    const newRecords = records.filter(r => !existingIds.has(r.id));

    if (newRecords.length === 0) {
        return { success: true, added: 0, skipped: records.length, message: 'Svi zapisi već postoje u bazi.' };
    }

    // 3. Insert new records in chunks
    let totalAdded = 0;
    for (let i = 0; i < newRecords.length; i += CHUNK_SIZE) {
        const chunk = newRecords.slice(i, i + CHUNK_SIZE);
        const formattedRecords = chunk.map(r => ({
            ...r,
            date: r.date.toISOString(),
        }));

        const { error: insertError } = await supabase
            .from('betonara_production')
            .insert(formattedRecords);

        if (insertError) {
            console.error('Error saving production records chunk:', insertError);
            throw new Error(`Failed to save records after adding ${totalAdded}`);
        }
        totalAdded += chunk.length;
    }

    revalidatePath('/betonara/dashboard');
    revalidatePath('/betonara/reports');

    return {
        success: true,
        added: totalAdded,
        skipped: existingIds.size,
        message: `Uspješno dodano ${totalAdded} novih zapisa. ${existingIds.size} zapisa je preskočeno jer već postoje.`
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
        .select('total_quantity, plant, recipe_number, date, materials, water');

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
            material_consumption: {}
        };
    }

    const dailyMap: Record<string, number> = {};
    const stats = {
        total_m3: 0,
        record_count: data.length,
        by_plant: {} as Record<string, number>,
        by_recipe: {} as Record<string, number>,
        daily_production: [] as Array<{ date: string, value: number }>,
        material_consumption: {} as Record<string, number>,
    };

    data.forEach(r => {
        const qty = Number(r.total_quantity) || 0;
        const water = Number(r.water) || 0;
        stats.total_m3 += qty;
        stats.by_plant[r.plant] = (stats.by_plant[r.plant] || 0) + qty;
        stats.by_recipe[r.recipe_number] = (stats.by_recipe[r.recipe_number] || 0) + qty;
        
        // Add water to material consumption
        if (water > 0) {
            stats.material_consumption['VODA'] = (stats.material_consumption['VODA'] || 0) + water;
        }

        // Daily grouping
        try {
            const day = new Date(r.date).toISOString().split('T')[0];
            dailyMap[day] = (dailyMap[day] || 0) + qty;
        } catch (e) {}

        // Material aggregation
        if (r.materials && typeof r.materials === 'object') {
            Object.entries(r.materials).forEach(([code, amount]) => {
                const val = Number(amount) || 0;
                stats.material_consumption[code] = (stats.material_consumption[code] || 0) + val;
            });
        }
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

    if (filters?.from) {
        query = query.gte('import_date', filters.from);
    }
    if (filters?.to) {
        query = query.lte('import_date', filters.to);
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
