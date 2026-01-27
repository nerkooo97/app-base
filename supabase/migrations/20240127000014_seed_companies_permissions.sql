-- New permissions for Companies module
INSERT INTO public.permissions (name) VALUES
  ('companies.view'),
  ('companies.manage')
ON CONFLICT (name) DO NOTHING;

-- Assign new permissions to super_admin
INSERT INTO public.role_permissions (role_id, permission_name)
SELECT r.id, p.name
FROM public.roles r, public.permissions p
WHERE r.name = 'super_admin' 
AND p.name IN ('companies.view', 'companies.manage')
ON CONFLICT (role_id, permission_name) DO NOTHING;
