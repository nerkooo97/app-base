'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCompany(formData: {
    name: string;
    registration_number?: string;
    tax_number?: string;
    vat_number?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    canton?: string;
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    bank_name?: string;
    bank_account?: string;
    industry?: string;
    notes?: string;
}) {
    try {
        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('companies')
            .insert({
                ...formData,
                created_by: user.id
            });

        if (error) throw error;

        revalidatePath('/companies');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCompany(id: string, formData: {
    name: string;
    registration_number?: string;
    tax_number?: string;
    vat_number?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    canton?: string;
    phone?: string;
    fax?: string;
    email?: string;
    website?: string;
    bank_name?: string;
    bank_account?: string;
    industry?: string;
    notes?: string;
    status?: string;
}) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('companies')
            .update({
                ...formData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        revalidatePath('/companies');
        revalidatePath(`/companies/${id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createContact(formData: {
    company_id: string;
    first_name: string;
    last_name: string;
    position?: string;
    department?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    is_primary?: boolean;
    notes?: string;
}) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('contacts')
            .insert(formData);

        if (error) throw error;

        revalidatePath(`/companies/${formData.company_id}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteContact(contactId: string, companyId: string) {
    try {
        const supabase = await createClient();

        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', contactId);

        if (error) throw error;

        revalidatePath(`/companies/${companyId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
