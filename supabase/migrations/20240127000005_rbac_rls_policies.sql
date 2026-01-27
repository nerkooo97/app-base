-- Policies for permissions (Read by all auth users, Manage by those with roles.manage)
CREATE POLICY "Allow authenticated users to read permissions"
  ON public.permissions FOR SELECT
  TO authenticated
  USING (TRUE);

-- Policies for roles (Read by all auth users, Manage by those with roles.manage)
CREATE POLICY "Allow authenticated users to read roles"
  ON public.roles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Allow users with roles.manage to manage roles"
  ON public.roles FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

-- Policies for role_permissions (Read by all auth users, Manage by those with roles.manage)
CREATE POLICY "Allow authenticated users to read role_permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Allow users with roles.manage to manage role_permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));

-- Policies for user_roles (Read by all auth users, Manage by those with roles.manage)
CREATE POLICY "Allow authenticated users to read user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Allow users with roles.manage to manage user_roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.authorize('roles.manage'))
  WITH CHECK (public.authorize('roles.manage'));
