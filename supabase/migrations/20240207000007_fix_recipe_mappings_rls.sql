-- Add RLS policies for recipe mappings table
-- This was missing, causing access denied errors on insert/update

-- Allow reading for anyone with betonara access
CREATE POLICY "View recipe mappings" ON public.betonara_recipe_mappings
FOR SELECT USING (public.authorize('betonara.view'));

-- Allow managing (insert/update/delete) for both managers and importers
CREATE POLICY "Manage recipe mappings" ON public.betonara_recipe_mappings
FOR ALL USING (
    public.authorize('betonara.manage') OR 
    public.authorize('betonara.import')
) 
WITH CHECK (
    public.authorize('betonara.manage') OR 
    public.authorize('betonara.import')
);
