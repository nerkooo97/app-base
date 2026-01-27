import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fetches all companies with basic information.
 */
export async function getAllCompanies(supabase: SupabaseClient) {
    const { data, error } = await supabase
        .from('companies')
        .select(`
            id,
            name,
            registration_number,
            tax_number,
            city,
            phone,
            email,
            status,
            created_at
        `)
        .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
}

/**
 * Fetches a single company by ID with all details and contacts.
 */
export async function getCompanyById(supabase: SupabaseClient, id: string) {
    const { data, error } = await supabase
        .from('companies')
        .select(`
            *,
            contacts (*)
        `)
        .eq('id', id)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Fetches all contacts for a specific company.
 */
export async function getContactsByCompanyId(supabase: SupabaseClient, companyId: string) {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('company_id', companyId)
        .order('is_primary', { ascending: false })
        .order('first_name', { ascending: true });

    if (error) throw error;
    return data || [];
}
