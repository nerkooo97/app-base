'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

import { PERMISSIONS } from '@/config/permissions';

export async function uploadCompanyDocument(companyId: string, formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }

    // Check permissions
    const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
            role:roles(
                name,
                permissions:role_permissions(
                    permission_name
                )
            )
        `)
        .eq('user_id', user.id);

    const hasPermission = (userRoles as any)?.some((ur: any) =>
        ur.role?.name === 'super_admin' ||
        ur.role?.permissions?.some((rp: any) => rp.permission_name === PERMISSIONS.COMPANIES_MANAGE)
    );

    if (!hasPermission) {
        throw new Error('Forbidden');
    }

    const file = formData.get('file') as File;
    if (!file) {
        throw new Error('No file provided');
    }

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^\x00-\x7F]/g, '');
    const fileName = `${Date.now()}-${sanitizedName}`;
    const filePath = `${companyId}/${fileName}`;

    // Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error('Failed to upload file');
    }

    // Insert into DB
    const { error: dbError } = await supabase
        .from('company_documents')
        .insert({
            company_id: companyId,
            name: file.name,
            file_path: filePath,
            file_type: file.type,
            size: file.size,
            created_by: user.id
        });

    if (dbError) {
        console.error('DB error:', dbError);
        // Attempt cleanup
        await supabase.storage.from('company-documents').remove([filePath]);
        throw new Error('Failed to save document metadata');
    }

    revalidatePath(`/companies/${companyId}`);
}

export async function deleteCompanyDocument(documentId: string, filePath: string, companyId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Unauthorized');
    }
    // Check permissions
    const { data: userRoles } = await supabase
        .from('user_roles')
        .select(`
         role:roles(
             name,
             permissions:role_permissions(
                 permission_name
             )
         )
     `)
        .eq('user_id', user.id);

    const hasPermission = (userRoles as any)?.some((ur: any) =>
        ur.role?.name === 'super_admin' ||
        ur.role?.permissions?.some((rp: any) => rp.permission_name === PERMISSIONS.COMPANIES_MANAGE)
    );

    if (!hasPermission) {
        throw new Error('Forbidden');
    }

    // Delete from Storage
    const { error: storageError } = await supabase.storage
        .from('company-documents')
        .remove([filePath]);

    if (storageError) {
        console.error('Storage delete error:', storageError);
        throw new Error('Failed to delete file from storage');
    }

    // Delete from DB
    const { error: dbError } = await supabase
        .from('company_documents')
        .delete()
        .eq('id', documentId);

    if (dbError) {
        console.error('DB delete error:', dbError);
        throw new Error('Failed to delete document metadata');
    }

    revalidatePath(`/companies/${companyId}`);
}

import { unstable_noStore as noStore } from 'next/cache';

export async function getCompanyDocuments(companyId: string) {
    noStore();
    const supabase = await createClient();

    // RLS policies handle permissions check for reading
    const { data, error } = await supabase
        .from('company_documents')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch error:', error);
        throw new Error('Failed to fetch documents');
    }

    // Get signed URLs for downloading
    const documentsWithUrls = await Promise.all(data.map(async (doc) => {
        const { data: signedUrlData } = await supabase.storage
            .from('company-documents')
            .createSignedUrl(doc.file_path, 3600); // 1 hour expiry

        return {
            ...doc,
            url: signedUrlData?.signedUrl
        };
    }));

    return documentsWithUrls;
}
