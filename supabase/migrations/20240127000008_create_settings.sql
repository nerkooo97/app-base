-- 20240127000008_create_settings.sql

-- System Settings
CREATE TABLE IF NOT EXISTS public.settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_by UUID REFERENCES auth.users(id)
);

-- RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view settings" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Only super admins can update settings" ON public.settings
    FOR ALL USING (public.authorize('settings.view'))
    WITH CHECK (public.authorize('settings.view'));

-- Seed default settings
INSERT INTO public.settings (key, value, description)
VALUES 
    ('system_name', '"ERP EdVision"', 'The name display in the sidebar and titles'),
    ('allow_registration', 'false', 'Whether to allow public registration'),
    ('theme_color', '"indigo"', 'Main brand color of the system')
ON CONFLICT (key) DO NOTHING;
