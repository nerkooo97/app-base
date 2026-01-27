-- 20240127000012_fix_user_roles_relationship.sql
-- Fix the foreign key relationship to allow PostgREST to join profiles and user_roles.

-- 1. Drop the old foreign key that points to auth.users
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- 2. Add a new foreign key that points to public.profiles
-- This allows Supabase (PostgREST) to "see" the relationship for .select('..., user_roles(...)')
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

-- 3. Notify PostgREST to reload the schema cache
-- Note: In Supabase dashboard, this happens automatically when you run SQL, 
-- but this is a good practice.
NOTIFY pgrst, 'reload schema';
