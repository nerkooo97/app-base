export interface UserWithProfileAndRoles {
    id: string;
    email: string | null;
    profile: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
    roles: { id: number; name: string; hierarchy_level: number }[];
    permissions: string[];
}

/**
 * Check if the user has a specific permission.
 * This is a pure function safe for both server and client.
 */
export function hasPermission(user: UserWithProfileAndRoles, permissionName: string): boolean {
    // Super Admin bypass or exact match
    if (user.roles.some(r => r.name === 'super_admin')) {
        return true;
    }
    return user.permissions.includes(permissionName);
}
