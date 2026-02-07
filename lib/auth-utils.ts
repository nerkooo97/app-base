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

import { navigationConfig } from "@/config/navigation";

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

/**
 * Finds the first route the user has access to based on navigation config.
 */
export function getFirstAuthorizedRoute(user: UserWithProfileAndRoles): string {
    for (const group of navigationConfig) {
        for (const item of group.items) {
            if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
                return item.href;
            }
            if (item.requiredPermissions.some(p => hasPermission(user, p))) {
                return item.href;
            }
        }
    }
    return '/'; // Fallback to safe landing
}
