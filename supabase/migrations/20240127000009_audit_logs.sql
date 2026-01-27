-- 20240127000009_audit_logs.sql

-- Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Only admins can view audit logs" ON public.audit_logs
    FOR SELECT USING (public.authorize('users.manage'));

-- Helper function to log actions
CREATE OR REPLACE FUNCTION public.log_action(
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id TEXT,
    p_old_data JSONB DEFAULT NULL,
    p_new_data JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, old_data, new_data, user_id)
    VALUES (p_action, p_entity_type, p_entity_id, p_old_data, p_new_data, auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
