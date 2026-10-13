-- =============================================================================
-- Migration: Phase 1 — RLS Hardening
-- Drop all open "demo" policies and anon grants, then enforce real isolation.
-- The helper functions (get_my_role, get_my_client_id, get_my_org_id) already
-- exist in the live DB — these policies rely on them.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- STEP 1: Revoke all grants from anon and authenticated on public tables.
--         We re-grant only what we explicitly need below.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'organizations','clients','projects','services','milestones','tasks',
    'work_records','deliverables','deliverable_versions','approvals',
    'decisions','calendar_events','files','invoices','payments',
    'activity_logs','service_requests','comments',
    'client_contacts','notifications','invoice_items','memberships',
    'profiles'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('REVOKE ALL ON public.%I FROM anon', t);
    EXECUTE format('REVOKE ALL ON public.%I FROM authenticated', t);
  END LOOP;
END $$;

-- Re-grant minimum required privileges per table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverables TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deliverable_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.approvals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.decisions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.files TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.invoices TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT SELECT ON public.client_contacts TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT INSERT ON public.notifications TO authenticated;
GRANT SELECT ON public.invoice_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.invoice_items TO authenticated;
-- anon gets NOTHING on any table

-- ---------------------------------------------------------------------------
-- STEP 2: Drop all open "demo" / USING(true) policies
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (
        policyname ILIKE '%demo%'
        OR policyname ILIKE '%anon%'
        OR qual = 'true'
      )
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
END $$;

-- Also drop the catch-all "Members read org data" policy on clients (qual=true)
DROP POLICY IF EXISTS "Members read org data" ON public.clients;

-- ---------------------------------------------------------------------------
-- STEP 3: Ensure RLS is enabled on every table
-- ---------------------------------------------------------------------------
ALTER TABLE public.organizations          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_records           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverables           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_versions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decisions              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- STEP 4: Add missing policies for tables that had only demo policies
-- (tables with proper manager_*/client_read_* policies keep them as-is)
-- ---------------------------------------------------------------------------

-- organizations: managers see their own org only
DROP POLICY IF EXISTS "org_manager_all" ON public.organizations;
CREATE POLICY org_manager_all ON public.organizations
  FOR ALL TO authenticated
  USING (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
         AND id = get_my_org_id())
  WITH CHECK (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
              AND id = get_my_org_id());

DROP POLICY IF EXISTS "org_client_read" ON public.organizations;
CREATE POLICY org_client_read ON public.organizations
  FOR SELECT TO authenticated
  USING (get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
         AND id = get_my_org_id());

-- projects: managers see all in their org; clients see their own
DROP POLICY IF EXISTS "manager_projects_all" ON public.projects;
CREATE POLICY manager_projects_all ON public.projects
  FOR ALL TO authenticated
  USING (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
         AND organization_id = get_my_org_id())
  WITH CHECK (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
              AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "client_read_projects" ON public.projects;
CREATE POLICY client_read_projects ON public.projects
  FOR SELECT TO authenticated
  USING (get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
         AND client_id = get_my_client_id());

-- services: managers see all; clients see their own (non-deleted)
DROP POLICY IF EXISTS "manager_services_all" ON public.services;
CREATE POLICY manager_services_all ON public.services
  FOR ALL TO authenticated
  USING (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
         AND organization_id = get_my_org_id())
  WITH CHECK (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
              AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "client_read_services" ON public.services;
CREATE POLICY client_read_services ON public.services
  FOR SELECT TO authenticated
  USING (get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
         AND client_id = get_my_client_id()
         AND (deleted_at IS NULL));

-- payments: ensure manager policy exists (invoices already has one)
DROP POLICY IF EXISTS "manager_payments_all" ON public.payments;
CREATE POLICY manager_payments_all ON public.payments
  FOR ALL TO authenticated
  USING (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
         AND organization_id = get_my_org_id())
  WITH CHECK (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
              AND organization_id = get_my_org_id());

-- service_requests: managers all; clients can insert + read own
DROP POLICY IF EXISTS "manager_requests_all" ON public.service_requests;
CREATE POLICY manager_requests_all ON public.service_requests
  FOR ALL TO authenticated
  USING (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
         AND organization_id = get_my_org_id())
  WITH CHECK (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
              AND organization_id = get_my_org_id());

DROP POLICY IF EXISTS "client_read_requests" ON public.service_requests;
CREATE POLICY client_read_requests ON public.service_requests
  FOR SELECT TO authenticated
  USING (get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
         AND client_id = get_my_client_id());

DROP POLICY IF EXISTS "client_insert_requests" ON public.service_requests;
CREATE POLICY client_insert_requests ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
              AND client_id = get_my_client_id());

-- deliverable_versions: join through deliverables for client check
DROP POLICY IF EXISTS "manager_deliv_versions_all" ON public.deliverable_versions;
CREATE POLICY manager_deliv_versions_all ON public.deliverable_versions
  FOR ALL TO authenticated
  USING (get_my_role() = ANY (ARRAY['manager','super_admin','admin']))
  WITH CHECK (get_my_role() = ANY (ARRAY['manager','super_admin','admin']));

DROP POLICY IF EXISTS "client_read_deliv_versions" ON public.deliverable_versions;
CREATE POLICY client_read_deliv_versions ON public.deliverable_versions
  FOR SELECT TO authenticated
  USING (
    get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
    AND EXISTS (
      SELECT 1 FROM public.deliverables d
      WHERE d.id = deliverable_id
        AND d.client_id = get_my_client_id()
    )
  );

-- profiles: users read/update own row; managers read all in org
DROP POLICY IF EXISTS "profiles_own" ON public.profiles;
CREATE POLICY profiles_own ON public.profiles
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "profiles_manager_read" ON public.profiles;
CREATE POLICY profiles_manager_read ON public.profiles
  FOR SELECT TO authenticated
  USING (get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
         AND organization_id = get_my_org_id());

-- ---------------------------------------------------------------------------
-- STEP 5: Make storage buckets private and add scoped storage policies
-- ---------------------------------------------------------------------------
UPDATE storage.buckets
SET public = false
WHERE id IN ('files', 'deliverables', 'brand', 'furii-files', 'receipts');

-- Drop open storage policies
DROP POLICY IF EXISTS "Public Access to Buckets" ON storage.objects;
DROP POLICY IF EXISTS "Public receipts read" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload objects" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;

-- Staff: full access to all buckets in their org
DROP POLICY IF EXISTS "storage_staff_all" ON storage.objects;
CREATE POLICY storage_staff_all ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('files','deliverables','brand','furii-files','receipts')
    AND get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
  )
  WITH CHECK (
    bucket_id IN ('files','deliverables','brand','furii-files','receipts')
    AND get_my_role() = ANY (ARRAY['manager','super_admin','admin'])
  );

-- Clients: read own files (path starts with their client_id)
DROP POLICY IF EXISTS "storage_client_read" ON storage.objects;
CREATE POLICY storage_client_read ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id IN ('files','deliverables','receipts')
    AND get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
    AND (storage.foldername(name))[1] = get_my_client_id()::text
  );

-- Clients: upload their own receipts
DROP POLICY IF EXISTS "storage_client_receipt_insert" ON storage.objects;
CREATE POLICY storage_client_receipt_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'receipts'
    AND get_my_role() = ANY (ARRAY['client','client_owner','client_member'])
    AND (storage.foldername(name))[1] = get_my_client_id()::text
  );

-- ---------------------------------------------------------------------------
-- STEP 6: Helper functions for Phase 1/3/4 access control
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_staff() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (
  SELECT 1 FROM public.memberships m
  WHERE m.user_id = auth.uid() AND m.is_active
  AND m.role IN ('super_admin', 'admin', 'team_member', 'manager')
);
$$;

CREATE OR REPLACE FUNCTION public.current_org_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT m.organization_id FROM public.memberships m
WHERE m.user_id = auth.uid() AND m.is_active LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.my_client_ids() RETURNS SETOF uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT m.client_id FROM public.memberships m
WHERE m.user_id = auth.uid() AND m.is_active AND m.client_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.has_active_service(p_client uuid, p_types text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT EXISTS (
  SELECT 1 FROM public.services s
  WHERE s.client_id = p_client AND s.deleted_at IS NULL
  AND s.service_type = ANY (p_types)
  AND s.status IN ('not_started', 'in_progress', 'waiting_for_client')
);
$$;

REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.my_client_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_active_service(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_org_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_client_id() TO authenticated;

-- Supporting index for service checks
CREATE INDEX IF NOT EXISTS idx_services_client_type_active
ON public.services (client_id, service_type)
WHERE deleted_at IS NULL;

