-- Add active_days column to track specific days that have data in an import
ALTER TABLE public.betonara_import_history ADD COLUMN active_days date[];

-- Update existing records to have at least their start_date in active_days if it exists
UPDATE public.betonara_import_history 
SET active_days = ARRAY[start_date::date] 
WHERE start_date IS NOT NULL AND active_days IS NULL;
