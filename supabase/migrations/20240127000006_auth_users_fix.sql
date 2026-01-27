-- 20240127000006_auth_users_fix.sql
-- Fixes the GoTrue "Scan error" when certain columns in auth.users are NULL.

-- 1. Apply fix to email_change
UPDATE auth.users SET email_change = '' WHERE email_change IS NULL;
ALTER TABLE auth.users ALTER COLUMN email_change SET DEFAULT '';

-- 2. Apply fix to confirmation_token (common source of similar errors)
UPDATE auth.users SET confirmation_token = '' WHERE confirmation_token IS NULL;
ALTER TABLE auth.users ALTER COLUMN confirmation_token SET DEFAULT '';

-- 3. Apply fix to recovery_token
UPDATE auth.users SET recovery_token = '' WHERE recovery_token IS NULL;
ALTER TABLE auth.users ALTER COLUMN recovery_token SET DEFAULT '';

-- 4. Clean up legacy triggers that might interfere with modern public.profiles structure
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_update_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Re-sync schema for PostgREST
NOTIFY pgrst, 'reload schema';
