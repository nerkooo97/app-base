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
