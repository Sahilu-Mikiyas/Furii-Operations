ALTER TABLE public.fund_contributions ADD COLUMN IF NOT EXISTS bucket_key text;
ALTER TABLE public.fund_contributions ALTER COLUMN bucket_id DROP NOT NULL;

CREATE TABLE IF NOT EXISTS public.relocation_fund_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  label text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  note text,
  due_month text,
  funded boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.relocation_fund_items TO authenticated;
GRANT ALL ON public.relocation_fund_items TO service_role;

ALTER TABLE public.relocation_fund_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own relocation_fund_items" ON public.relocation_fund_items
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER t_relocation_fund_items_updated
  BEFORE UPDATE ON public.relocation_fund_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();