import { PERMISSIONS, Permission } from './permissions';

export interface NavItem {
    label: string;
    href: string;
    icon: string; // This will map directly to Lucide icon names
    requiredPermissions?: Permission[];
}

export interface NavGroup {
    groupLabel: string;
    items: NavItem[];
}

export const navigationConfig: NavGroup[] = [
    {
        groupLabel: 'Glavni meni',
        items: [
            {
                label: 'Kontrolna tabla',
                href: '/',
                icon: 'LayoutDashboard',
                requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
            }/* ,
            {
                label: 'Moj profil',
                href: '/profile',
                icon: 'UserCircle',
            }, */
        ],
    },
    {
        groupLabel: 'CRM',
        items: [
            {
                label: 'Firme',
                href: '/companies',
                icon: 'Building2',
                requiredPermissions: [PERMISSIONS.COMPANIES_VIEW],
            },
        ],
    },
    {
        groupLabel: 'Upravljanje timom',
        items: [
            {
                label: 'Korisnici',
                href: '/users',
                icon: 'Users',
                requiredPermissions: [PERMISSIONS.USERS_MANAGE],
            },
            {
                label: 'Uloge i dozvole',
                href: '/roles',
                icon: 'ShieldCheck',
                requiredPermissions: [PERMISSIONS.ROLES_MANAGE],
            },
        ],
    },
    {
        groupLabel: 'Sistem',
        items: [
            {
                label: 'Postavke',
                href: '/settings',
                icon: 'Settings',
                requiredPermissions: [PERMISSIONS.SETTINGS_VIEW],
            },
        ],
    },
];

export function getNavLabel(href: string): string | null {
    for (const group of navigationConfig) {
        const item = group.items.find(i => i.href === href);
        if (item) return item.label;
    }
    return null;
}

/**
 * Finds the required permissions for a given pathname by matching it against 
 * the navigation configuration.
 */
export function getRequiredPermissions(pathname: string): Permission[] | null {
    // Exact match first
    for (const group of navigationConfig) {
        const item = group.items.find(i => i.href === pathname);
        if (item) return item.requiredPermissions ?? [];
    }

    // Prefix match for dynamic routes (e.g. /companies/123 matches /companies)
    // We sort by length descending to match the most specific route first
    const allItems = navigationConfig.flatMap(g => g.items)
        .sort((a, b) => b.href.length - a.href.length);

    for (const item of allItems) {
        if (item.href !== '/' && pathname.startsWith(item.href)) {
            return item.requiredPermissions ?? [];
        }
    }

    return null;
}

