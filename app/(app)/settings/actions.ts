'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Updates a system setting.
 */
export async function updateSetting(key: string, value: any) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('settings')
        .update({
            value: JSON.stringify(value),
            updated_at: new Date().toISOString()
        })
        .eq('key', key);

    if (error) {
        console.error(`Error updating setting ${key}:`, error);
        return { error: error.message };
    }

    revalidatePath('/settings');
    revalidatePath('/');
    return { success: true };
}
