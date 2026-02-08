-- Migration: Update betonara_import_history for manual edits and additions
-- Created: 2026-02-08

ALTER TABLE public.betonara_import_history 
ALTER COLUMN filename DROP NOT NULL,
ADD COLUMN IF NOT EXISTS action_type TEXT DEFAULT 'IMPORT',
ADD COLUMN IF NOT EXISTS record_id TEXT,
ADD COLUMN IF NOT EXISTS previous_data JSONB,
ADD COLUMN IF NOT EXISTS current_data JSONB,
ADD COLUMN IF NOT EXISTS active_days TEXT[];

-- Update comments
COMMENT ON COLUMN public.betonara_import_history.action_type IS 'Type of action: IMPORT, MANUAL_ADD, MANUAL_EDIT';
COMMENT ON COLUMN public.betonara_import_history.record_id IS 'ID of the record in betonara_production being modified (for manual actions)';
COMMENT ON COLUMN public.betonara_import_history.active_days IS 'List of dates (YYYY-MM-DD) that have records in this import';
