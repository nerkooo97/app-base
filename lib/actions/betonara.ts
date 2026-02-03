'use server';

import { createClient } from '@/lib/supabase/server';
import { BetonaraProductionRecord, RecipeMapping, BetonaraMaterial } from '@/types/betonara';
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
        .select('total_quantity, plant, recipe_number');

    if (filters.from) query = query.gte('date', filters.from);
    if (filters.to) query = query.lte('date', filters.to);
    if (filters.plant && filters.plant !== 'all') query = query.eq('plant', filters.plant);

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching production stats:', error);
        return { total_m3: 0, record_count: 0, by_plant: {}, by_recipe: {} };
    }

    const stats = {
        total_m3: 0,
        record_count: data.length,
        by_plant: {} as Record<string, number>,
        by_recipe: {} as Record<string, number>,
    };

    data.forEach(r => {
        stats.total_m3 += r.total_quantity;
        stats.by_plant[r.plant] = (stats.by_plant[r.plant] || 0) + r.total_quantity;
        stats.by_recipe[r.recipe_number] = (stats.by_recipe[r.recipe_number] || 0) + r.total_quantity;
    });

    return stats;
}
