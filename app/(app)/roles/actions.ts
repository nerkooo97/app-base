'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Toggles a specific permission for a role.
 */
export async function toggleRolePermission(roleId: number, permissionName: string, enabled: boolean) {
    const supabase = await createClient();

    if (enabled) {
        // Add permission
        const { error } = await supabase
            .from('role_permissions')
            .insert({ role_id: roleId, permission_name: permissionName });

        if (error) return { error: error.message };
    } else {
        // Remove permission
        const { error } = await supabase
            .from('role_permissions')
            .delete()
            .eq('role_id', roleId)
            .eq('permission_name', permissionName);

        if (error) return { error: error.message };
    }

    revalidatePath('/roles');
    return { success: true };
}

/**
 * Creates a new role.
 */
export async function createRole(name: string, description: string, hierarchyLevel: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('roles')
        .insert({ name, description, hierarchy_level: hierarchyLevel });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/roles');
    return { success: true };
}

/**
 * Creates a new permission.
 */
export async function createPermission(name: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('permissions')
        .insert({ name });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/roles');
    return { success: true };
}
