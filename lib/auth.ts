import { createClient } from './supabase/server';
import { UserWithProfileAndRoles } from './auth-utils';

export type { UserWithProfileAndRoles };

/**
 * Fetches the current user from auth, then joins with profiles, roles, and permissions.
 * Optimized with a single complex join query.
 */
export async function getUserWithProfileAndRoles(): Promise<UserWithProfileAndRoles | null> {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return null;
    }

    // Fetch profile and roles with permissions in a single optimized request
    const [profileRes, rolesRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', user.id)
            .single(),
        supabase
            .from('user_roles')
            .select(`
                roles (
                    id,
                    name,
                    hierarchy_level,
                    role_permissions (
                        permission_name
                    )
                )
            `)
            .eq('user_id', user.id)
    ]);

    if (profileRes.error && (profileRes.error as any).code !== 'PGRST116') {
        console.error('Error fetching profile:', profileRes.error);
    }

    if (rolesRes.error) {
        console.error('Error fetching user roles:', rolesRes.error);
    }

    const roles = rolesRes.data?.map((ur: any) => ur.roles) || [];

    // Flatten permissions from all roles
    const permissionsSet = new Set<string>();
    roles.forEach((role: any) => {
        role.role_permissions?.forEach((rp: any) => {
            permissionsSet.add(rp.permission_name);
        });
    });

    return {
        id: user.id,
        email: user.email ?? null,
        profile: profileRes.data || null,
        roles: roles.map((r: any) => ({
            id: r.id,
            name: r.name,
            hierarchy_level: r.hierarchy_level
        })),
        permissions: Array.from(permissionsSet),
    };
}
