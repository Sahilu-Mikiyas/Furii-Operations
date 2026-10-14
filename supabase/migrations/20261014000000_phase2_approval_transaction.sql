-- Migration: Phase 2.3 — Atomic Service Approval Transaction
-- Replaces sequential browser inserts with a single transactional RPC call.

CREATE OR REPLACE FUNCTION public.approve_service_request(p_request_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req record;
  v_org_id uuid;
  v_project_id uuid;
  v_service_id uuid;
  v_invoice_id uuid;
  v_payment_id uuid;
  v_service_type text;
  v_is_retainer boolean;
  v_start_date date := CURRENT_DATE;
  v_next_date date := NULL;
  v_cycle_day int := EXTRACT(DAY FROM CURRENT_DATE)::int;
  v_duration text;
  v_inv_num text;
  v_pay_date date;
BEGIN
  -- 1. Check permissions
  IF NOT public.is_staff() THEN
    RAISE EXCEPTION 'Only staff members can approve service requests.';
  END IF;

  -- 2. Lock and fetch request
  SELECT * INTO v_req
  FROM public.service_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Service request not found.';
  END IF;

  -- Idempotency: if already approved, return existing IDs
  IF v_req.status = 'approved' THEN
    SELECT p.id, s.id INTO v_project_id, v_service_id
    FROM public.projects p
    JOIN public.services s ON s.project_id = p.id
    WHERE p.client_id = v_req.client_id AND p.name = v_req.title
    LIMIT 1;

    RETURN jsonb_build_object(
      'already_approved', true,
      'project_id', v_project_id,
      'service_id', v_service_id
    );
  END IF;

  v_org_id := COALESCE(v_req.organization_id, public.current_org_id());
  IF v_org_id IS NULL THEN
    SELECT id INTO v_org_id FROM public.organizations LIMIT 1;
  END IF;

  -- 3. Map service type
  v_service_type := 'website';
  IF v_req.request_type = 'branding' THEN
    v_service_type := 'branding';
  ELSIF v_req.request_type = 'production' THEN
    v_service_type := 'content_production';
  ELSIF v_req.request_type = 'development' THEN
    v_service_type := 'website';
  ELSIF v_req.request_type = 'social_media' THEN
    v_service_type := 'social_media';
  END IF;

  v_is_retainer := (v_req.billing_type = 'monthly_retainer');
  IF v_is_retainer THEN
    v_next_date := CURRENT_DATE + INTERVAL '30 days';
  END IF;

  v_duration := COALESCE(v_req.duration, CASE WHEN v_is_retainer THEN 'Monthly Retainer' ELSE 'One-Time Engagement' END);

  -- 4. Create Project
  INSERT INTO public.projects (
    organization_id,
    client_id,
    name,
    description,
    status,
    budget,
    budget_currency,
    start_date,
    progress_override
  ) VALUES (
    v_org_id,
    v_req.client_id,
    v_req.title,
    COALESCE(v_req.description, 'Originating from service request (' || v_req.request_type || ')'),
    'active',
    v_req.estimated_total,
    COALESCE(v_req.currency, 'ETB'),
    v_start_date,
    15
  ) RETURNING id INTO v_project_id;

  -- 5. Create Service
  INSERT INTO public.services (
    organization_id,
    client_id,
    project_id,
    name,
    service_type,
    description,
    status,
    current_phase,
    progress,
    start_date,
    billing_type,
    billing_start_date,
    next_billing_date,
    billing_cycle_day,
    duration
  ) VALUES (
    v_org_id,
    v_req.client_id,
    v_project_id,
    v_req.title,
    v_service_type,
    COALESCE(v_req.description, 'Active client delivery stream'),
    'in_progress',
    NULL,
    0,
    v_start_date,
    COALESCE(v_req.billing_type, 'one_time'),
    v_start_date,
    v_next_date,
    v_cycle_day,
    v_duration
  ) RETURNING id INTO v_service_id;

  -- 6. Create settled Invoice
  v_inv_num := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 4);

  INSERT INTO public.invoices (
    organization_id,
    client_id,
    project_id,
    invoice_number,
    title,
    total,
    amount,
    amount_paid,
    currency,
    due_date,
    notes,
    status
  ) VALUES (
    v_org_id,
    v_req.client_id,
    v_project_id,
    v_inv_num,
    v_req.title,
    v_req.estimated_total,
    v_req.estimated_total,
    v_req.estimated_total,
    COALESCE(v_req.currency, 'ETB'),
    v_start_date,
    COALESCE(v_req.description, 'Settled engagement for ' || v_req.title),
    'paid'
  ) RETURNING id INTO v_invoice_id;

  -- 7. Create Payment record
  v_pay_date := COALESCE(v_req.payment_submitted_at::date, v_start_date);

  INSERT INTO public.payments (
    organization_id,
    client_id,
    project_id,
    invoice_id,
    amount,
    currency,
    payment_date,
    method,
    reference,
    receipt_url,
    notes
  ) VALUES (
    v_org_id,
    v_req.client_id,
    v_project_id,
    v_invoice_id,
    v_req.estimated_total,
    COALESCE(v_req.currency, 'ETB'),
    v_pay_date,
    'bank_transfer',
    COALESCE(v_req.payment_notes, 'REC-' || UPPER(SUBSTRING(v_req.id::text, 1, 8))),
    v_req.receipt_url,
    'Verified & cleared upon service launch'
  ) RETURNING id INTO v_payment_id;

  -- 8. Mark request approved
  UPDATE public.service_requests
  SET
    status = 'approved',
    manager_notes = 'Approved and launched into Project: ' || v_req.title,
    updated_at = NOW()
  WHERE id = p_request_id;

  -- 9. Activity log
  INSERT INTO public.activity_logs (
    organization_id,
    client_id,
    actor_id,
    action,
    entity_type,
    entity_id,
    details,
    visibility
  ) VALUES (
    v_org_id,
    v_req.client_id,
    auth.uid(),
    'approved_and_launched',
    'service_request',
    p_request_id,
    jsonb_build_object(
      'project_id', v_project_id,
      'service_id', v_service_id,
      'invoice_id', v_invoice_id,
      'payment_id', v_payment_id,
      'title', v_req.title
    ),
    'client'
  );

  RETURN jsonb_build_object(
    'success', true,
    'project_id', v_project_id,
    'service_id', v_service_id,
    'invoice_id', v_invoice_id,
    'payment_id', v_payment_id
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.approve_service_request(uuid) TO authenticated;
