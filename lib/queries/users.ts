import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches all users with their profiles and roles.
 */
export async function getAllUsers(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('profiles')
        .select(`
            user_id,
            full_name,
            avatar_url,
            user_roles (
                role_id,
                roles (
                    name
                )
            )
        `)
        .order('full_name', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Fetches a single profile by user ID.
 */
export async function getProfileById(supabase: SupabaseClient, userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (error) throw error;
    return data;
}
