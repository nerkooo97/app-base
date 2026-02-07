-- Create betonara_import_history table
CREATE TABLE IF NOT EXISTS public.betonara_import_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    plant TEXT NOT NULL,
    added_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    imported_by UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
    import_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ensure the foreign key exists and is correct (in case table existed without it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'betonara_import_history_imported_by_fkey'
    ) THEN
        ALTER TABLE public.betonara_import_history 
        ADD CONSTRAINT betonara_import_history_imported_by_fkey 
        FOREIGN KEY (imported_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.betonara_import_history ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "View import history" ON public.betonara_import_history;
CREATE POLICY "View import history" ON public.betonara_import_history 
    FOR SELECT USING (public.authorize('betonara.view'));

DROP POLICY IF EXISTS "Manage import history" ON public.betonara_import_history;
CREATE POLICY "Manage import history" ON public.betonara_import_history 
    FOR ALL USING (public.authorize('betonara.manage'));
