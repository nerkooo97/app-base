import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches basic stats for the dashboard.
 */
export async function getDashboardStats(supabase: SupabaseClient) {
    const [usersCount, rolesCount, settingsCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('roles').select('*', { count: 'exact', head: true }),
        supabase.from('settings').select('*', { count: 'exact', head: true })
    ]);

    return [
        { label: 'Ukupno korisnika', value: usersCount.count || 0, href: '/users' },
        { label: 'Sistemske uloge', value: rolesCount.count || 0, href: '/roles' },
        { label: 'Konfig. ključevi', value: settingsCount.count || 0, href: '/settings' }
    ];
}
