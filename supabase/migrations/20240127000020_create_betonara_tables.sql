-- Drop old table if exists
DROP TABLE IF EXISTS public.betonara_production;

-- Create betonara_materials table to define what we track
CREATE TABLE IF NOT EXISTS public.betonara_materials (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit TEXT DEFAULT 'kg',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimized production table
CREATE TABLE IF NOT EXISTS public.betonara_production (
    id TEXT PRIMARY KEY, -- excel_id_b1/b2
    plant TEXT NOT NULL,
    work_order_number TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    recipe_number TEXT NOT NULL,
    total_quantity NUMERIC DEFAULT 0, -- m3
    water NUMERIC DEFAULT 0,
    issuance_number TEXT,
    materials JSONB DEFAULT '{}'::jsonb, -- dynamic storage for all materials { "code": value }
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recipe mappings (remains the same)
CREATE TABLE IF NOT EXISTS public.betonara_recipe_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_name TEXT UNIQUE NOT NULL,
    mapped_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.betonara_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betonara_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.betonara_recipe_mappings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "View betonara" ON public.betonara_materials FOR SELECT USING (public.authorize('betonara.view'));
CREATE POLICY "View production" ON public.betonara_production FOR SELECT USING (public.authorize('betonara.view'));
CREATE POLICY "Manage production" ON public.betonara_production FOR ALL USING (public.authorize('betonara.manage'));
CREATE POLICY "Manage materials" ON public.betonara_materials FOR ALL USING (public.authorize('betonara.manage'));

-- Seed materials from your report
INSERT INTO public.betonara_materials (code, name, display_order) VALUES
('01030073', 'Riječni agregat 0-4 GEOKOP', 10),
('01030063', 'Kameni drobljeni agregat 0-4', 20),
('01030074', 'Riječni agregat 4-8 GEOKOP2', 30),
('01030075', 'Riječni agregat 8-16 GEOKOP', 40),
('01110045_425', 'Cement 42,5 N', 50),
('01110045_525', 'Cement 52,5 N', 60),
('01044076', 'SF 16(AB)2', 70),
('01044077', 'Aditiv FM 500(ŠUPLJE)', 80)
ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order;
