import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches the system name from the settings table.
 */
export async function getSystemName(supabase: SupabaseClient): Promise<string> {
    const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'system_name')
        .single();

    return data?.value ? String(data.value).replace(/^"|"$/g, '') : 'ERP System';
}

/**
 * Fetches all system settings.
 */
export async function getAllSettings(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key');

    if (error) throw error;

    return data || [];
}
