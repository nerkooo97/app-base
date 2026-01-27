-- Create company_documents table
CREATE TABLE IF NOT EXISTS public.company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for company_documents table using existing permissions
-- View policy: Users with companies.view can see documents
CREATE POLICY "Users can view company documents with permission" ON public.company_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.role_permissions rp ON ur.role_id = rp.role_id
            WHERE ur.user_id = auth.uid()
            AND rp.permission_name = 'companies.view'
        )
    );

-- Manage policy: Users with companies.manage can upload/delete documents
CREATE POLICY "Users can manage company documents with permission" ON public.company_documents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.role_permissions rp ON ur.role_id = rp.role_id
            WHERE ur.user_id = auth.uid()
            AND rp.permission_name = 'companies.manage'
        )
    );

-- Storage Policies for 'company-documents' bucket
-- Note: The bucket 'company-documents' needs to be created in the dashboard or via a separate script if using storage-api.
-- Here we define policies assuming the bucket exists.

-- Allow viewing files
CREATE POLICY "Users can view company documents" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'company-documents' AND
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        WHERE ur.user_id = auth.uid()
        AND rp.permission_name = 'companies.view'
    )
  );

-- Allow uploading files
CREATE POLICY "Users can upload company documents" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'company-documents' AND
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        WHERE ur.user_id = auth.uid()
        AND rp.permission_name = 'companies.manage'
    )
  );

-- Allow deleting files
CREATE POLICY "Users can delete company documents" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'company-documents' AND
    EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        WHERE ur.user_id = auth.uid()
        AND rp.permission_name = 'companies.manage'
    )
  );
