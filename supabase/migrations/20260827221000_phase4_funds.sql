-- Phase 4: Financial Gates, Four Money Buckets & Milestones

CREATE TABLE IF NOT EXISTS public.money_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  key text NOT NULL, -- proposal, marriage, poland, business
  title text NOT NULL,
  emoji text NOT NULL DEFAULT '💰',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ETB', -- ETB, USD
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

CREATE TABLE IF NOT EXISTS public.fund_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  bucket_key text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.marriage_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  saved_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.relationship_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  financial_gate text,
  status text NOT NULL DEFAULT 'locked', -- locked, unlocked, completed
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.money_buckets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fund_contributions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marriage_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_milestones TO authenticated;
GRANT ALL ON public.money_buckets TO service_role;
GRANT ALL ON public.fund_contributions TO service_role;
GRANT ALL ON public.marriage_categories TO service_role;
GRANT ALL ON public.relationship_milestones TO service_role;

ALTER TABLE public.money_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marriage_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationship_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own money_buckets" ON public.money_buckets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own fund_contributions" ON public.fund_contributions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own marriage_categories" ON public.marriage_categories
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own relationship_milestones" ON public.relationship_milestones
  FOR ALL USING (auth.uid() = user_id);
