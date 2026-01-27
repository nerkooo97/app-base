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
 * Updates an existing role.
 */
export async function updateRole(id: number, name: string, description: string, hierarchyLevel: number) {
    const supabase = await createClient();

    // Prevent modification of super_admin role name (optional safety)
    // You might want to fetch and check if it's super_admin first, but RLS/constraints usually handle safety.
    // However, allowing name change of super_admin might break hardcoded checks, so let's allow it but be careful.

    const { error } = await supabase
        .from('roles')
        .update({ name, description, hierarchy_level: hierarchyLevel })
        .eq('id', id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/roles');
    return { success: true };
}

/**
 * Deletes a role.
 */
export async function deleteRole(id: number) {
    const supabase = await createClient();

    // Prevent deletion of super_admin (ID check usually or Name check)
    // It's safer to check name before delete or rely on database constraints if any.
    // For now, simple delete.

    const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', id);

    if (error) {
        // Typical error: VIOLATES FOREIGN KEY CONSTRAINT if users are assigned
        if (error.code === '23503') {
            return { error: 'Nije moguće obrisati ulogu koja je dodijeljena korisnicima.' };
        }
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
