import { createClient } from '@supabase/supabase-js';

/**
 * Creates a Supabase client with the Service Role Key.
 * This client bypasses RLS and can perform administrative actions (auth.admin).
 * WARNING: Use this ONLY in Server Actions or Server Components.
 */
export async function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');
    }

    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}
