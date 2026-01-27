-- Update authorize function to always return true for super_admin
CREATE OR REPLACE FUNCTION public.authorize(requested_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_super_admin BOOLEAN;
  has_permission BOOLEAN;
BEGIN
  -- Check if user is super_admin
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
      AND r.name = 'super_admin'
  ) INTO is_super_admin;

  IF is_super_admin THEN
    RETURN TRUE;
  END IF;

  -- Regular permission check
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles r ON r.id = ur.role_id
    JOIN public.role_permissions rp ON rp.role_id = r.id
    WHERE ur.user_id = auth.uid()
      AND rp.permission_name = requested_permission
  ) INTO has_permission;

  RETURN COALESCE(has_permission, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
