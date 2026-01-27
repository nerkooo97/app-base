import { redirect } from 'next/navigation';
import { getUserWithProfileAndRoles } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { getSystemName } from '@/lib/queries/settings';
import AppShell from '@/components/app-shell';
import { ThemeProvider } from '@/components/theme-provider';

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getUserWithProfileAndRoles();
    const supabase = await createClient();

    if (!user) {
        return redirect('/sign-in');
    }

    // MFA Enforcement
    const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaData?.nextLevel === 'aal2' && mfaData?.currentLevel !== 'aal2') {
        return redirect('/verify-2fa');
    }

    const appName = await getSystemName(supabase);

    return (
        <ThemeProvider>
            <AppShell user={user} appName={appName}>
                {children}
            </AppShell>
        </ThemeProvider>
    );
}
