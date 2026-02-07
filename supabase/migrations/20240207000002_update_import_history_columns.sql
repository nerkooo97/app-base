-- Migration to fix and update betonara_import_history
-- 1. Rename records_count to added_count if it exists
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='betonara_import_history' AND column_name='records_count') THEN
        ALTER TABLE public.betonara_import_history RENAME COLUMN records_count TO added_count;
    END IF;
END $$;

-- 2. Add skipped_count if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='betonara_import_history' AND column_name='skipped_count') THEN
        ALTER TABLE public.betonara_import_history ADD COLUMN skipped_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. Fix Foreign Key relationship for imported_by
-- First, drop the old foreign key if it exists (it might point to auth.users)
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' 
      AND tc.table_name = 'betonara_import_history'
      AND kcu.column_name = 'imported_by';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.betonara_import_history DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Add the correct foreign key relationship to profiles
ALTER TABLE public.betonara_import_history 
ADD CONSTRAINT betonara_import_history_imported_by_fkey 
FOREIGN KEY (imported_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- 4. Ensure RLS is enabled and policies are refreshed
ALTER TABLE public.betonara_import_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View import history" ON public.betonara_import_history;
CREATE POLICY "View import history" ON public.betonara_import_history 
    FOR SELECT USING (public.authorize('betonara.view'));

DROP POLICY IF EXISTS "Manage import history" ON public.betonara_import_history;
CREATE POLICY "Manage import history" ON public.betonara_import_history 
    FOR ALL USING (public.authorize('betonara.manage'));
