-- Phase 5: Relocation Command & Document Vault

CREATE TABLE IF NOT EXISTS public.relocation_checklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category text NOT NULL, -- academic, documents, visa, travel
  task_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, in_progress, completed
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.document_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  doc_type text NOT NULL DEFAULT 'Document', -- Passport, Degree, Transcript, Legalization, Translation, Visa, Insurance, Flight
  status text NOT NULL DEFAULT 'missing', -- missing, in_progress, verified
  expiry_date date,
  file_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  role_type text NOT NULL DEFAULT 'collaborator', -- client, prospect, university, lawyer, accountant, collaborator
  organization text,
  email text,
  phone text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relocation_checklist TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.document_vault TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contacts TO authenticated;
GRANT ALL ON public.relocation_checklist TO service_role;
GRANT ALL ON public.document_vault TO service_role;
GRANT ALL ON public.contacts TO service_role;

ALTER TABLE public.relocation_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own relocation_checklist" ON public.relocation_checklist
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own document_vault" ON public.document_vault
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own contacts" ON public.contacts
  FOR ALL USING (auth.uid() = user_id);
