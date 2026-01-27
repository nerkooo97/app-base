import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches all roles with their associated permissions.
 */
export async function getAllRoles(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('roles')
        .select(`
            id,
            name,
            description,
            hierarchy_level,
            role_permissions (
                permission_name
            )
        `)
        .order('hierarchy_level', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Fetches all official permissions from the permissions table.
 */
export async function getAllPermissions(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('permissions')
        .select('name')
        .order('name', { ascending: true });

    if (error) throw error;
    return data?.map(p => p.name) || [];
}
