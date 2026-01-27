export const PERMISSIONS = {
    ROLES_MANAGE: 'roles.manage',
    USERS_MANAGE: 'users.manage',
    SETTINGS_VIEW: 'settings.view',
    DASHBOARD_VIEW: 'dashboard.view',
    PROFILE_EDIT: 'profile.edit',
    COMPANIES_VIEW: 'companies.view',
    COMPANIES_MANAGE: 'companies.manage',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
