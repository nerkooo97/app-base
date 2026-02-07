export const PERMISSIONS = {
    ROLES_MANAGE: 'roles.manage',
    USERS_MANAGE: 'users.manage',
    SETTINGS_VIEW: 'settings.view',
    DASHBOARD_VIEW: 'dashboard.view',
    PROFILE_EDIT: 'profile.edit',
    COMPANIES_VIEW: 'companies.view',
    COMPANIES_MANAGE: 'companies.manage',
    BETONARA_VIEW: 'betonara.view',
    BETONARA_MANAGE: 'betonara.manage',
    BETONARA_IMPORT: 'betonara.import',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
