-- 20240127000010_profiles_admin_policy.sql
-- Allow admins to see and manage all profiles.

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.authorize('users.manage'));

CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.authorize('users.manage'))
  WITH CHECK (public.authorize('users.manage'));
