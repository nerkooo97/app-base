-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Required fields
  name TEXT NOT NULL,
  
  -- Tax information (Balkan specific)
  registration_number TEXT,        -- ID broj (BiH) / Matični broj (SRB, HR)
  tax_number TEXT,                 -- PIB / OIB (HR)
  vat_number TEXT,                 -- PDV broj
  
  -- Address
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Bosnia and Herzegovina',
  canton TEXT,                     -- Canton (BiH specific)
  
  -- Contact information
  phone TEXT,
  fax TEXT,
  email TEXT,
  website TEXT,
  
  -- Banking information
  bank_name TEXT,
  bank_account TEXT,               -- Bank account number
  
  -- Additional
  industry TEXT,
  notes TEXT,
  
  -- Metadata
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  
  -- Required fields
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  
  -- Optional fields
  position TEXT,
  department TEXT,
  email TEXT,
  phone TEXT,
  mobile TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);
CREATE INDEX IF NOT EXISTS idx_companies_status ON public.companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_created_by ON public.companies(created_by);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_is_primary ON public.contacts(is_primary);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for companies
CREATE POLICY "Users with companies.view can view all companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = auth.uid()
      AND rp.permission_name = 'companies.view'
    )
  );

CREATE POLICY "Users with companies.manage can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = auth.uid()
      AND rp.permission_name = 'companies.manage'
    )
  );

CREATE POLICY "Users with companies.manage can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = auth.uid()
      AND rp.permission_name = 'companies.manage'
    )
  );

CREATE POLICY "Users with companies.manage can delete companies"
  ON public.companies FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = auth.uid()
      AND rp.permission_name = 'companies.manage'
    )
  );

-- RLS Policies for contacts
CREATE POLICY "Users with companies.view can view contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = auth.uid()
      AND rp.permission_name = 'companies.view'
    )
  );

CREATE POLICY "Users with companies.manage can manage contacts"
  ON public.contacts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.role_permissions rp ON ur.role_id = rp.role_id
      WHERE ur.user_id = auth.uid()
      AND rp.permission_name = 'companies.manage'
    )
  );
