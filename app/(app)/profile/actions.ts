'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updatePersonalInfo(fullName: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath('/profile');
    revalidatePath('/');
}

export async function updateEmail(email: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ email });
    if (error) throw error;

    revalidatePath('/profile');
}

export async function updatePassword(password: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
}

export async function getMfaFactors() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) throw error;
    return data;
}

export async function enrollMfa() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'EdVision ERP',
    });
    if (error) throw error;
    return data;
}

export async function verifyMfa(factorId: string, code: string) {
    const supabase = await createClient();

    // 1. Create a challenge
    const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId
    });
    if (challengeError) throw challengeError;

    // 2. Verify the challenge
    const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challengeData.id,
        code
    });
    if (verifyError) throw verifyError;

    revalidatePath('/profile');
    return verifyData;
}

export async function unenrollMfa(factorId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.unenroll({
        factorId
    });
    if (error) throw error;

    revalidatePath('/profile');
    return data;
}
