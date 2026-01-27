-- 20240127000011_user_roles_admin_policy.sql
-- Allow admins with 'users.manage' to also manage user roles assignment.

DROP POLICY IF EXISTS "Allow users with roles.manage to manage user_roles" ON public.user_roles;

CREATE POLICY "Allow admins to manage user roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage') OR public.authorize('users.manage'))
  WITH CHECK (public.authorize('roles.manage') OR public.authorize('users.manage'));
