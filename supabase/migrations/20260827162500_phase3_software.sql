-- Phase 3: Software Sales CRM, Deal Tracker & Build Board

CREATE TABLE IF NOT EXISTS public.software_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company text NOT NULL,
  contact text NOT NULL,
  service text NOT NULL DEFAULT 'Software Development',
  deal_value numeric NOT NULL DEFAULT 300000,
  probability int NOT NULL DEFAULT 50, -- 0-100%
  stage text NOT NULL DEFAULT 'Prospect', -- Prospect, Contacted, Qualified, Proposal, Negotiation, Won, Lost
  next_action text,
  deadline date,
  payment_status text NOT NULL DEFAULT 'unpaid', -- unpaid, partial, collected
  amount_collected numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.software_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  client text NOT NULL,
  title text NOT NULL,
  requirements text,
  features text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Backlog', -- Backlog, Building, Testing, Demo Ready, Deployed
  demo_url text,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.software_outreach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company text NOT NULL,
  contact text NOT NULL,
  platform text NOT NULL DEFAULT 'Email', -- Email, Phone, LinkedIn, Direct
  email text,
  phone text,
  status text NOT NULL DEFAULT 'contacted', -- prospect, contacted, responded, meeting_scheduled, cold
  date_contacted date NOT NULL DEFAULT CURRENT_DATE,
  follow_up_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.software_promo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  product_name text NOT NULL,
  asset_type text NOT NULL DEFAULT 'Demo Video', -- Demo Video, Screenshots, Social Posts, Case Study, Landing Page
  description text,
  status text NOT NULL DEFAULT 'Draft', -- Draft, Ready, Published
  link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_deals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_outreach TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_promo TO authenticated;
GRANT ALL ON public.software_deals TO service_role;
GRANT ALL ON public.software_projects TO service_role;
GRANT ALL ON public.software_outreach TO service_role;
GRANT ALL ON public.software_promo TO service_role;

ALTER TABLE public.software_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.software_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.software_outreach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.software_promo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own software_deals" ON public.software_deals
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own software_projects" ON public.software_projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own software_outreach" ON public.software_outreach
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own software_promo" ON public.software_promo
  FOR ALL USING (auth.uid() = user_id);
