'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

/**
 * Updates a user's role in the RBAC system.
 */
export async function updateUserRole(userId: string, roleId: number) {
    const supabase = await createClient();

    // 1. Delete existing roles
    const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

    if (deleteError) {
        console.error('Error removing old roles:', deleteError);
        return { error: deleteError.message };
    }

    // 2. Insert new role
    const { error: insertError } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role_id: roleId });

    if (insertError) {
        console.error('Error assigning new role:', insertError);
        return { error: insertError.message };
    }

    revalidatePath('/users');
    return { success: true };
}

/**
 * Updates user profile information.
 */
export async function updateProfile(userId: string, fullName: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/users');
    return { success: true };
}

/**
 * Creates a new user (Admin action).
 */
export async function createNewUser(email: string, fullName: string, roleId: number) {
    console.log('--- CREATE NEW USER START ---');
    console.log('Target Email:', email);
    console.log('Target Name:', fullName);
    console.log('Target Role ID:', roleId);

    try {
        const adminClient = await createAdminClient();
        console.log('Admin client initialized');

        // 1. Create user in auth.users
        console.log('Attempting admin.createUser...');
        const { data: userData, error: authError } = await adminClient.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { full_name: fullName },
            password: 'TemporaryPassword123!'
        });

        if (authError) {
            console.error('AUTH ERROR:', authError.message, authError.status);
            return { error: authError.message };
        }

        const userId = userData.user.id;
        console.log('Auth user created successfully, ID:', userId);

        // 2. Assign role
        if (roleId > 0) {
            console.log('Attempting role assignment...');
            const { error: roleError } = await adminClient
                .from('user_roles')
                .insert({ user_id: userId, role_id: roleId });

            if (roleError) {
                console.error('ROLE ERROR:', roleError.message);
                return { error: 'User created, but role assignment failed: ' + roleError.message };
            }
            console.log('Role assigned successfully');
        }

        console.log('--- CREATE NEW USER SUCCESS ---');
        revalidatePath('/users');
        return { success: true };
    } catch (err: any) {
        console.error('UNEXPECTED CRASH:', err);
        return { error: err.message || 'An unexpected error occurred' };
    }
}

/**
 * Resets a user's password (Super Admin action).
 */
export async function resetUserPassword(userId: string, newPassword: string) {
    try {
        const adminClient = await createAdminClient();

        const { error } = await adminClient.auth.admin.updateUserById(userId, {
            password: newPassword
        });

        if (error) {
            console.error('Password reset error:', error);
            return { error: error.message };
        }

        revalidatePath('/users');
        return { success: true };
    } catch (err: any) {
        console.error('Unexpected error resetting password:', err);
        return { error: err.message || 'An unexpected error occurred' };
    }
}
