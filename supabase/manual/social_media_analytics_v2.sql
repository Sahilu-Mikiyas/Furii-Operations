-- Manual, append-only social analytics for eligible service workspaces.
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS modules_disabled text[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.service_type_modules (
  service_type text NOT NULL,
  module text NOT NULL,
  PRIMARY KEY (service_type, module)
);
ALTER TABLE public.service_type_modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS service_type_modules_staff_read ON public.service_type_modules;
CREATE POLICY service_type_modules_staff_read ON public.service_type_modules FOR SELECT TO authenticated USING (public.is_staff());
INSERT INTO public.service_type_modules (service_type, module) VALUES
  ('social_media', 'social_accounts'), ('social_media', 'social_analytics'), ('social_media', 'social_reports'),
  ('content_production', 'social_accounts'), ('content_production', 'social_analytics'), ('content_production', 'social_reports')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.service_has_module(p_service uuid, p_module text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.services s JOIN public.service_type_modules m ON m.service_type = s.service_type
    WHERE s.id = p_service AND s.deleted_at IS NULL
      AND s.status IN ('not_started','in_progress','waiting_for_client')
      AND m.module = p_module AND NOT (p_module = ANY(s.modules_disabled))
      AND ((public.is_staff() AND s.organization_id = public.current_org_id()) OR s.client_id IN (SELECT public.my_client_ids()))
  );
$$;
REVOKE ALL ON FUNCTION public.service_has_module(uuid,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.service_has_module(uuid,text) TO authenticated;

CREATE TABLE IF NOT EXISTS public.social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('tiktok','instagram','facebook','linkedin')),
  handle text NOT NULL,
  display_name text NOT NULL,
  profile_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (service_id, platform, handle)
);

CREATE TABLE IF NOT EXISTS public.social_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.social_accounts(id) ON DELETE CASCADE,
  slot_date date NOT NULL,
  slot text NOT NULL CHECK (slot IN ('am','pm')),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  captured_at timestamptz NOT NULL DEFAULT now(),
  metrics jsonb NOT NULL CHECK (jsonb_typeof(metrics) = 'object'),
  entered_by uuid NOT NULL REFERENCES auth.users(id),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN ('manual','csv')),
  screenshot_path text,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (account_id, slot_date, slot, revision)
);
CREATE INDEX IF NOT EXISTS social_snapshots_account_date_idx ON public.social_snapshots (account_id, slot_date DESC, slot DESC);

CREATE OR REPLACE VIEW public.social_snapshots_latest WITH (security_invoker = true) AS
SELECT DISTINCT ON (account_id, slot_date, slot) *
FROM public.social_snapshots
ORDER BY account_id, slot_date, slot, revision DESC;

CREATE TABLE IF NOT EXISTS public.social_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  commentary text NOT NULL DEFAULT '',
  file_path text,
  generated_by uuid REFERENCES auth.users(id),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (period_end >= period_start)
);

ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS social_accounts_staff_all ON public.social_accounts;
CREATE POLICY social_accounts_staff_all ON public.social_accounts FOR ALL TO authenticated
  USING (public.is_staff() AND organization_id = public.current_org_id())
  WITH CHECK (public.is_staff() AND organization_id = public.current_org_id()
    AND EXISTS (SELECT 1 FROM public.services s WHERE s.id = social_accounts.service_id AND s.client_id = social_accounts.client_id AND s.organization_id = social_accounts.organization_id AND public.service_has_module(s.id,'social_accounts')));
DROP POLICY IF EXISTS social_accounts_client_read ON public.social_accounts;
CREATE POLICY social_accounts_client_read ON public.social_accounts FOR SELECT TO authenticated
  USING (client_id IN (SELECT public.my_client_ids()) AND is_active AND public.service_has_module(service_id,'social_accounts'));

DROP POLICY IF EXISTS social_snapshots_staff_read ON public.social_snapshots;
CREATE POLICY social_snapshots_staff_read ON public.social_snapshots FOR SELECT TO authenticated
  USING (public.is_staff() AND EXISTS (SELECT 1 FROM public.social_accounts a WHERE a.id = account_id AND a.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS social_snapshots_client_read ON public.social_snapshots;
CREATE POLICY social_snapshots_client_read ON public.social_snapshots FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.social_accounts a WHERE a.id = account_id AND a.client_id IN (SELECT public.my_client_ids()) AND a.is_active AND public.service_has_module(a.service_id,'social_analytics')));

DROP POLICY IF EXISTS social_reports_staff_all ON public.social_reports;
CREATE POLICY social_reports_staff_all ON public.social_reports FOR ALL TO authenticated
  USING (public.is_staff() AND organization_id = public.current_org_id())
  WITH CHECK (public.is_staff() AND organization_id = public.current_org_id()
    AND public.service_has_module(service_id,'social_reports')
    AND EXISTS (SELECT 1 FROM public.services s WHERE s.id = social_reports.service_id AND s.client_id = social_reports.client_id AND s.organization_id = social_reports.organization_id));
DROP POLICY IF EXISTS social_reports_client_read ON public.social_reports;
CREATE POLICY social_reports_client_read ON public.social_reports FOR SELECT TO authenticated
  USING (client_id IN (SELECT public.my_client_ids()) AND status = 'published' AND public.service_has_module(service_id,'social_reports'));

GRANT SELECT ON public.service_type_modules, public.social_accounts, public.social_snapshots, public.social_snapshots_latest, public.social_reports TO authenticated;
GRANT INSERT, UPDATE ON public.social_accounts, public.social_reports TO authenticated;

-- Snapshot correction is a new revision; no UPDATE/DELETE policy is provided.
CREATE OR REPLACE FUNCTION public.save_social_snapshot(
  p_account_id uuid, p_slot_date date, p_slot text, p_metrics jsonb,
  p_note text DEFAULT NULL, p_source text DEFAULT 'manual', p_screenshot_path text DEFAULT NULL
) RETURNS public.social_snapshots
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_account public.social_accounts; v_revision integer; v_row public.social_snapshots; v_previous jsonb;
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Staff access required'; END IF;
  SELECT * INTO v_account FROM public.social_accounts WHERE id = p_account_id FOR UPDATE;
  IF NOT FOUND OR NOT v_account.is_active OR v_account.organization_id <> public.current_org_id() OR NOT public.service_has_module(v_account.service_id,'social_analytics') THEN
    RAISE EXCEPTION 'Active social analytics service not found';
  END IF;
  IF p_slot NOT IN ('am','pm') OR jsonb_typeof(p_metrics) <> 'object' THEN RAISE EXCEPTION 'Invalid snapshot'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_each(p_metrics) e WHERE NOT (e.key = ANY (CASE v_account.platform
    WHEN 'tiktok' THEN ARRAY['followers','net_followers','video_views','profile_views','likes','comments','shares']
    WHEN 'instagram' THEN ARRAY['followers','net_followers','accounts_reached','views','profile_visits','interactions','likes','saves','shares','comments']
    WHEN 'facebook' THEN ARRAY['page_followers','net_followers','reach','page_views','engagement','reactions','comments','shares','link_clicks']
    WHEN 'linkedin' THEN ARRAY['followers','net_followers','impressions','reactions','comments','reposts','link_clicks']
    ELSE ARRAY[]::text[] END))) THEN RAISE EXCEPTION 'Metric key is not valid for this platform'; END IF;
  IF EXISTS (SELECT 1 FROM jsonb_each(p_metrics) e WHERE jsonb_typeof(e.value) <> 'number' OR (e.value #>> '{}')::numeric < 0 OR (e.value #>> '{}')::numeric <> trunc((e.value #>> '{}')::numeric)) THEN
    RAISE EXCEPTION 'Metrics must be non-negative whole numbers';
  END IF;
  SELECT COALESCE(max(revision),0)+1 INTO v_revision FROM public.social_snapshots WHERE account_id=p_account_id AND slot_date=p_slot_date AND slot=p_slot;
  IF v_revision > 1 AND NULLIF(btrim(p_note), '') IS NULL THEN RAISE EXCEPTION 'A correction note is required'; END IF;
  SELECT metrics INTO v_previous FROM public.social_snapshots
    WHERE account_id=p_account_id AND slot_date=p_slot_date AND slot=p_slot ORDER BY revision DESC LIMIT 1;
  INSERT INTO public.social_snapshots(account_id,slot_date,slot,revision,metrics,entered_by,source,screenshot_path,note)
  VALUES(p_account_id,p_slot_date,p_slot,v_revision,p_metrics,auth.uid(),p_source,p_screenshot_path,p_note)
  RETURNING * INTO v_row;
  INSERT INTO public.activity_logs (organization_id,project_id,service_id,client_id,actor_id,action,entity_type,entity_id,entity_title,previous_state,new_state,metadata,visibility)
  VALUES (v_account.organization_id,
    (SELECT project_id FROM public.services WHERE id=v_account.service_id),
    v_account.service_id,v_account.client_id,auth.uid(),
    CASE WHEN v_revision > 1 THEN 'social_snapshot_corrected' ELSE 'social_snapshot_recorded' END,
    'social_snapshot',v_row.id::text,
    v_account.display_name || ' · ' || p_slot_date::text || ' · ' || p_slot,
    v_previous,p_metrics,jsonb_build_object('revision',v_revision,'account_id',p_account_id,'note',p_note), 'client');
  RETURN v_row;
END;
$$;
REVOKE ALL ON FUNCTION public.save_social_snapshot(uuid,date,text,jsonb,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.save_social_snapshot(uuid,date,text,jsonb,text,text,text) TO authenticated;

INSERT INTO storage.buckets(id,name,public) VALUES ('social-reports','social-reports',false),('social-proofs','social-proofs',false)
ON CONFLICT (id) DO UPDATE SET public=false;
DROP POLICY IF EXISTS social_storage_staff ON storage.objects;
CREATE POLICY social_storage_staff ON storage.objects FOR ALL TO authenticated
  USING (bucket_id IN ('social-reports','social-proofs') AND public.is_staff() AND (storage.foldername(name))[1] = public.current_org_id()::text)
  WITH CHECK (bucket_id IN ('social-reports','social-proofs') AND public.is_staff() AND (storage.foldername(name))[1] = public.current_org_id()::text);
DROP POLICY IF EXISTS social_reports_client_files ON storage.objects;
CREATE POLICY social_reports_client_files ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id='social-reports' AND EXISTS (
    SELECT 1 FROM public.social_reports r
    WHERE r.file_path=name AND r.status='published' AND r.client_id IN (SELECT public.my_client_ids())
      AND public.service_has_module(r.service_id,'social_reports')
  ));
