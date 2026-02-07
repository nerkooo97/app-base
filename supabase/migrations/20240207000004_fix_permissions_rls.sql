-- Allow users with roles.manage to manage permissions table
-- This was missing from the initial RBAC policy setup
CREATE POLICY "Allow users with roles.manage to manage permissions"
  ON public.permissions FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));
