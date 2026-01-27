-- Drop existing policies
DROP POLICY IF EXISTS "Users can view company documents with permission" ON company_documents;
DROP POLICY IF EXISTS "Users can manage company documents with permission" ON company_documents;

-- Re-create policies using authorize function
CREATE POLICY "Users can view company documents" ON company_documents
    FOR SELECT
    TO authenticated
    USING (public.authorize('companies.view'));

CREATE POLICY "Users can insert company documents" ON company_documents
    FOR INSERT
    TO authenticated
    WITH CHECK (public.authorize('companies.manage'));

CREATE POLICY "Users can update company documents" ON company_documents
    FOR UPDATE
    TO authenticated
    USING (public.authorize('companies.manage'));

CREATE POLICY "Users can delete company documents" ON company_documents
    FOR DELETE
    TO authenticated
    USING (public.authorize('companies.manage'));

-- Also update Storage object policies to use authorize if possible, 
-- but storage policies are often more complex. 
-- However, let's update them to be safe as well if they rely on the same logic.

DROP POLICY IF EXISTS "Users can view company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload company documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete company documents" ON storage.objects;

CREATE POLICY "Users can view company documents" ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'company-documents' AND
    public.authorize('companies.view')
  );

CREATE POLICY "Users can upload company documents" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'company-documents' AND
    public.authorize('companies.manage')
  );

CREATE POLICY "Users can delete company documents" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'company-documents' AND
    public.authorize('companies.manage')
  );
