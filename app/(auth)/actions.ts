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

export async function verify2FA(formData: FormData) {
    const code = formData.get('code') as string;
    const supabase = await createClient();

    // 1. Get factors
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const activeFactor = factors?.all.find(f => f.status === 'verified');

    if (!activeFactor) {
        return redirect('/sign-in');
    }

    // 2. Challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: activeFactor.id
    });

    if (challengeError) {
        return redirect(`/verify-2fa?error=${encodeURIComponent(challengeError.message)}`);
    }

    // 3. Verify
    const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: activeFactor.id,
        challengeId: challengeData.id,
        code
    });

    if (verifyError) {
        return redirect(`/verify-2fa?error=${encodeURIComponent('Neispravan kod. Pokušajte ponovo.')}`);
    }

    return redirect('/');
}

