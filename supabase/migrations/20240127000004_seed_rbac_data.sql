-- Initial permissions
INSERT INTO public.permissions (name) VALUES
  ('roles.manage'),
  ('users.manage'),
  ('settings.view'),
  ('dashboard.view')
ON CONFLICT (name) DO NOTHING;

-- Super Admin role
INSERT INTO public.roles (name, description, hierarchy_level) VALUES
  ('super_admin', 'Full system access', 0)
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to super_admin
INSERT INTO public.role_permissions (role_id, permission_name)
SELECT r.id, p.name
FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, permission_name) DO NOTHING;
