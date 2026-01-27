-- Drop existing policies
DROP POLICY IF EXISTS "Users with companies.view can view all companies" ON public.companies;
DROP POLICY IF EXISTS "Users with companies.manage can insert companies" ON public.companies;
DROP POLICY IF EXISTS "Users with companies.manage can update companies" ON public.companies;
DROP POLICY IF EXISTS "Users with companies.manage can delete companies" ON public.companies;

DROP POLICY IF EXISTS "Users with companies.view can view contacts" ON public.contacts;
DROP POLICY IF EXISTS "Users with companies.manage can manage contacts" ON public.contacts;

-- Re-create policies using authorize function

-- Companies policies
CREATE POLICY "Users with companies.view can view all companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (public.authorize('companies.view'));

CREATE POLICY "Users with companies.manage can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (public.authorize('companies.manage'));

CREATE POLICY "Users with companies.manage can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (public.authorize('companies.manage'));

CREATE POLICY "Users with companies.manage can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (public.authorize('companies.manage'));

-- Contacts policies
CREATE POLICY "Users with companies.view can view contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (public.authorize('companies.view'));

CREATE POLICY "Users with companies.manage can manage contacts"
  ON public.contacts FOR ALL
  TO authenticated
  USING (public.authorize('companies.manage'));
