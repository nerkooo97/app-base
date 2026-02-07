-- Create specific permission for Betonara Import
INSERT INTO public.permissions (name) VALUES ('betonara.import') 
ON CONFLICT (name) DO NOTHING;

-- Grant to super_admin (so admin can also import)
INSERT INTO public.role_permissions (role_id, permission_name)
SELECT id, 'betonara.import' FROM public.roles WHERE name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Allow Import (Insert/Update) on production table for users with this permission
CREATE POLICY "Import production insert" ON public.betonara_production
FOR INSERT WITH CHECK (public.authorize('betonara.import'));

CREATE POLICY "Import production update" ON public.betonara_production
FOR UPDATE USING (public.authorize('betonara.import')) WITH CHECK (public.authorize('betonara.import'));

-- Allow Insert into History Log (crucial for import tracking)
CREATE POLICY "Log import history" ON public.betonara_import_history
FOR INSERT WITH CHECK (public.authorize('betonara.import'));
