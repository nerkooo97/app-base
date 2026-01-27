'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signIn(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
    }

    // Check if MFA is required
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (!factorsError && factors.all.some(f => f.status === 'verified')) {
        return redirect('/verify-2fa');
    }

    return redirect('/');
}
