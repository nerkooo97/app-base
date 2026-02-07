-- Add target columns for deviation analysis
ALTER TABLE public.betonara_production 
ADD COLUMN IF NOT EXISTS target_materials JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS target_water NUMERIC DEFAULT 0;
