-- ETB installment proposals, scheduled bills, and verified payment history.
CREATE TABLE IF NOT EXISTS public.installment_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  request_id uuid NOT NULL UNIQUE REFERENCES public.service_requests(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'ETB' CHECK (currency = 'ETB'),
  total_amount numeric(15,2) NOT NULL CHECK (total_amount > 0),
  down_payment numeric(15,2) NOT NULL CHECK (down_payment > 0),
  installment_count integer NOT NULL CHECK (installment_count BETWEEN 1 AND 24),
  status text NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review','changes_requested','awaiting_client_acceptance','awaiting_down_payment','active','declined','completed')),
  client_notes text,
  admin_notes text,
  proposed_total numeric(15,2),
  proposed_down_payment numeric(15,2),
  proposed_installment_count integer,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  client_accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (down_payment >= round(total_amount * 0.40, 2)),
  CHECK ((total_amount - down_payment) / installment_count >= 15000)
);

CREATE TABLE IF NOT EXISTS public.installment_schedule (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.installment_plans(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE SET NULL,
  sequence integer NOT NULL,
  label text NOT NULL,
  amount numeric(15,2) NOT NULL CHECK (amount > 0),
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','due','payment_submitted','paid','settled','overdue')),
  receipt_url text,
  payment_reference text,
  payment_notes text,
  submitted_at timestamptz,
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id),
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (plan_id, sequence)
);

ALTER TABLE public.installment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installment_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS installment_plans_staff ON public.installment_plans;
CREATE POLICY installment_plans_staff ON public.installment_plans FOR ALL TO authenticated
  USING (public.is_staff() AND organization_id = public.current_org_id())
  WITH CHECK (public.is_staff() AND organization_id = public.current_org_id());
DROP POLICY IF EXISTS installment_plans_client_read ON public.installment_plans;
CREATE POLICY installment_plans_client_read ON public.installment_plans FOR SELECT TO authenticated
  USING (client_id IN (SELECT public.my_client_ids()));
DROP POLICY IF EXISTS installment_schedule_staff ON public.installment_schedule;
CREATE POLICY installment_schedule_staff ON public.installment_schedule FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.installment_plans p WHERE p.id = plan_id AND public.is_staff() AND p.organization_id = public.current_org_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.installment_plans p WHERE p.id = plan_id AND public.is_staff() AND p.organization_id = public.current_org_id()));
DROP POLICY IF EXISTS installment_schedule_client_read ON public.installment_schedule;
CREATE POLICY installment_schedule_client_read ON public.installment_schedule FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.installment_plans p WHERE p.id = plan_id AND p.client_id IN (SELECT public.my_client_ids())));
GRANT SELECT ON public.installment_plans, public.installment_schedule TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_installment_request(
  p_title text, p_description text, p_request_type text, p_catalog_items jsonb,
  p_total numeric, p_down numeric, p_count integer, p_notes text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_client uuid; v_org uuid; v_request uuid; v_due numeric;
BEGIN
  v_client := public.get_my_client_id();
  IF v_client IS NULL OR public.get_my_role() NOT IN ('client','client_owner','client_member') THEN RAISE EXCEPTION 'Client access required'; END IF;
  IF p_title IS NULL OR length(trim(p_title)) = 0 OR p_total <= 0 OR p_down < round(p_total * .40, 2) OR p_count NOT BETWEEN 1 AND 24 THEN RAISE EXCEPTION 'Invalid installment terms'; END IF;
  v_due := (p_total - p_down) / p_count;
  IF v_due < 15000 THEN RAISE EXCEPTION 'Each installment must be at least 15,000 ETB'; END IF;
  SELECT organization_id INTO v_org FROM public.clients WHERE id = v_client;
  IF v_org IS NULL THEN v_org := public.current_org_id(); END IF;
  INSERT INTO public.service_requests (organization_id, client_id, requested_by, request_type, title, description, catalog_items, estimated_total, currency, urgency, status)
  VALUES (v_org, v_client, auth.uid(), p_request_type, trim(p_title), coalesce(p_description,''), coalesce(p_catalog_items,'[]'::jsonb), p_total, 'ETB', 'normal', 'pending') RETURNING id INTO v_request;
  INSERT INTO public.installment_plans (organization_id,client_id,request_id,total_amount,down_payment,installment_count,client_notes)
  VALUES (v_org,v_client,v_request,p_total,p_down,p_count,nullif(trim(p_notes),''));
  RETURN v_request;
END $$;

CREATE OR REPLACE FUNCTION public.review_installment_plan(
  p_plan_id uuid, p_decision text, p_notes text DEFAULT NULL,
  p_total numeric DEFAULT NULL, p_down numeric DEFAULT NULL, p_count integer DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_plan public.installment_plans%ROWTYPE; v_total numeric; v_down numeric; v_count integer;
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Staff access required'; END IF;
  SELECT * INTO v_plan FROM public.installment_plans WHERE id=p_plan_id AND organization_id=public.current_org_id() FOR UPDATE;
  IF NOT FOUND OR v_plan.status NOT IN ('pending_review','changes_requested') THEN RAISE EXCEPTION 'Plan is not awaiting review'; END IF;
  IF p_decision NOT IN ('approve','decline','counteroffer') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
  IF p_decision='counteroffer' THEN
    v_total := coalesce(p_total,v_plan.total_amount); v_down := coalesce(p_down,v_plan.down_payment); v_count := coalesce(p_count,v_plan.installment_count);
    IF v_down < round(v_total*.40,2) OR v_count NOT BETWEEN 1 AND 24 OR (v_total-v_down)/v_count < 15000 THEN RAISE EXCEPTION 'Counteroffer must meet the 40%% down payment and 15,000 ETB monthly minimum'; END IF;
    UPDATE public.installment_plans SET status='awaiting_client_acceptance',proposed_total=v_total,proposed_down_payment=v_down,proposed_installment_count=v_count,admin_notes=p_notes,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() WHERE id=p_plan_id;
  ELSIF p_decision='approve' THEN
    UPDATE public.installment_plans SET status='awaiting_client_acceptance',proposed_total=total_amount,proposed_down_payment=down_payment,proposed_installment_count=installment_count,admin_notes=p_notes,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() WHERE id=p_plan_id;
  ELSE
    UPDATE public.installment_plans SET status='declined',admin_notes=p_notes,reviewed_by=auth.uid(),reviewed_at=now(),updated_at=now() WHERE id=p_plan_id;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.accept_installment_terms(p_plan_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_plan public.installment_plans%ROWTYPE; v_total numeric; v_down numeric; v_count int; v_monthly numeric; v_remainder numeric; v_amount numeric; v_date date; v_seq int; v_inv uuid; v_num text;
BEGIN
  SELECT * INTO v_plan FROM public.installment_plans WHERE id=p_plan_id AND client_id IN (SELECT public.my_client_ids()) FOR UPDATE;
  IF NOT FOUND OR v_plan.status <> 'awaiting_client_acceptance' THEN RAISE EXCEPTION 'Terms are not ready for acceptance'; END IF;
  v_total:=v_plan.proposed_total; v_down:=v_plan.proposed_down_payment; v_count:=v_plan.proposed_installment_count;
  IF v_down < round(v_total*.40,2) OR (v_total-v_down)/v_count < 15000 THEN RAISE EXCEPTION 'Approved terms are invalid'; END IF;
  UPDATE public.installment_plans SET total_amount=v_total,down_payment=v_down,installment_count=v_count,status='awaiting_down_payment',client_accepted_at=now(),updated_at=now() WHERE id=p_plan_id;
  UPDATE public.service_requests SET estimated_total=v_total,updated_at=now() WHERE id=v_plan.request_id;
  v_monthly:=floor(((v_total-v_down)/v_count)*100)/100; v_remainder:=round(v_total-v_down-(v_monthly*v_count),2);
  FOR v_seq IN 0..v_count LOOP
    IF v_seq=0 THEN v_amount:=v_down; v_date:=CURRENT_DATE; ELSE v_amount:=v_monthly + CASE WHEN v_seq=v_count THEN v_remainder ELSE 0 END; v_date:=(CURRENT_DATE + make_interval(months=>v_seq))::date; END IF;
    v_num:='INS-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12));
    INSERT INTO public.invoices (organization_id,client_id,invoice_number,title,status,currency,subtotal,total,amount_paid,due_date,notes)
    VALUES (v_plan.organization_id,v_plan.client_id,v_num,CASE WHEN v_seq=0 THEN 'Initial down payment' ELSE 'Installment '||v_seq||' of '||v_count END,'sent','ETB',v_amount,v_amount,0,v_date,'Installment plan '||p_plan_id)
    RETURNING id INTO v_inv;
    INSERT INTO public.installment_schedule(plan_id,invoice_id,sequence,label,amount,due_date,status)
    VALUES(p_plan_id,v_inv,v_seq,CASE WHEN v_seq=0 THEN 'Initial payment' ELSE 'Month '||v_seq END,v_amount,v_date,CASE WHEN v_seq=0 THEN 'due' ELSE 'upcoming' END);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.submit_installment_payment(p_schedule_id uuid,p_receipt_url text,p_reference text DEFAULT NULL,p_notes text DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.installment_schedule%ROWTYPE; v_payoff_pending boolean;
BEGIN
  SELECT s.* INTO v_row FROM public.installment_schedule s JOIN public.installment_plans p ON p.id=s.plan_id
  WHERE s.id=p_schedule_id AND p.client_id IN (SELECT public.my_client_ids()) FOR UPDATE OF s;
  IF NOT FOUND OR v_row.status NOT IN ('due','overdue','upcoming') OR v_row.due_date>CURRENT_DATE OR v_row.receipt_url IS NOT NULL THEN RAISE EXCEPTION 'This bill cannot accept a receipt right now'; END IF;
  IF EXISTS (SELECT 1 FROM public.installment_plans WHERE id=v_row.plan_id AND status='completed') THEN RAISE EXCEPTION 'This installment plan is already paid in full'; END IF;
  SELECT EXISTS (SELECT 1 FROM public.installment_schedule WHERE plan_id=v_row.plan_id AND sequence=-1 AND status IN ('due','payment_submitted')) INTO v_payoff_pending;
  IF v_payoff_pending AND v_row.sequence<>-1 THEN RAISE EXCEPTION 'An early payoff is already pending; submit only the payoff bill'; END IF;
  IF p_receipt_url IS NULL OR length(trim(p_receipt_url))=0 THEN RAISE EXCEPTION 'Receipt is required'; END IF;
  UPDATE public.installment_schedule SET receipt_url=p_receipt_url,payment_reference=p_reference,payment_notes=p_notes,submitted_at=now(),status='payment_submitted' WHERE id=p_schedule_id;
END $$;

CREATE OR REPLACE FUNCTION public.verify_installment_payment(p_schedule_id uuid,p_approve boolean,p_notes text DEFAULT NULL) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_row public.installment_schedule%ROWTYPE; v_plan public.installment_plans%ROWTYPE; v_payment uuid; v_paid numeric; v_req record; v_project uuid; v_service uuid; v_type text;
BEGIN
  IF NOT public.is_staff() THEN RAISE EXCEPTION 'Staff access required'; END IF;
  SELECT s.* INTO v_row FROM public.installment_schedule s JOIN public.installment_plans p ON p.id=s.plan_id WHERE s.id=p_schedule_id AND p.organization_id=public.current_org_id() FOR UPDATE OF s;
  IF NOT FOUND OR v_row.status<>'payment_submitted' THEN RAISE EXCEPTION 'Payment is not awaiting verification'; END IF;
  SELECT * INTO v_plan FROM public.installment_plans WHERE id=v_row.plan_id FOR UPDATE;
  IF v_row.sequence<>-1 AND EXISTS (SELECT 1 FROM public.installment_schedule WHERE plan_id=v_plan.id AND sequence=-1 AND status IN ('due','payment_submitted')) THEN RAISE EXCEPTION 'Verify or cancel the early payoff before another payment'; END IF;
  IF NOT p_approve THEN
    UPDATE public.installment_schedule SET status='due',receipt_url=NULL,payment_reference=NULL,payment_notes=p_notes,submitted_at=NULL WHERE id=p_schedule_id;
    RETURN;
  END IF;
  INSERT INTO public.payments(organization_id,client_id,invoice_id,amount,currency,payment_date,method,reference,receipt_url,notes,recorded_by)
  VALUES(v_plan.organization_id,v_plan.client_id,v_row.invoice_id,v_row.amount,'ETB',CURRENT_DATE,'bank_transfer',v_row.payment_reference,v_row.receipt_url,coalesce(p_notes,'Verified installment payment'),auth.uid()) RETURNING id INTO v_payment;
  UPDATE public.invoices SET amount_paid=v_row.amount,status='paid',updated_at=now() WHERE id=v_row.invoice_id;
  UPDATE public.installment_schedule SET status='paid',verified_at=now(),verified_by=auth.uid(),payment_id=v_payment WHERE id=p_schedule_id;
  IF v_row.sequence=0 THEN
    UPDATE public.installment_schedule SET due_date=(CURRENT_DATE + make_interval(months=>sequence))::date WHERE plan_id=v_plan.id AND sequence>0 AND status='upcoming';
    UPDATE public.invoices i SET due_date=s.due_date,updated_at=now() FROM public.installment_schedule s WHERE s.plan_id=v_plan.id AND s.sequence>0 AND s.status='upcoming' AND i.id=s.invoice_id;
    SELECT * INTO v_req FROM public.service_requests WHERE id=v_plan.request_id FOR UPDATE;
    IF NOT EXISTS (SELECT 1 FROM public.services WHERE client_id=v_plan.client_id AND name=v_req.title AND deleted_at IS NULL) THEN
      v_type:=CASE v_req.request_type WHEN 'branding' THEN 'branding' WHEN 'production' THEN 'content_production' WHEN 'social_media' THEN 'social_media' ELSE 'website' END;
      INSERT INTO public.projects(organization_id,client_id,name,description,status,budget,budget_currency,start_date,progress_override)
      VALUES(v_plan.organization_id,v_plan.client_id,v_req.title,coalesce(v_req.description,'Installment service engagement'),'active',v_plan.total_amount,'ETB',CURRENT_DATE,0) RETURNING id INTO v_project;
      INSERT INTO public.services(organization_id,client_id,project_id,name,service_type,description,status,progress,start_date,billing_type,billing_start_date,duration)
      VALUES(v_plan.organization_id,v_plan.client_id,v_project,v_req.title,v_type,coalesce(v_req.description,'Approved installment service'),'in_progress',0,CURRENT_DATE,'one_time',CURRENT_DATE,'Installment plan') RETURNING id INTO v_service;
      UPDATE public.invoices SET project_id=v_project WHERE id IN (SELECT invoice_id FROM public.installment_schedule WHERE plan_id=v_plan.id);
      UPDATE public.payments SET project_id=v_project WHERE id=v_payment;
    END IF;
    UPDATE public.service_requests SET status='approved',manager_notes='Installment down payment verified; service launched.',updated_at=now() WHERE id=v_plan.request_id;
  ELSIF v_row.sequence=-1 THEN
    UPDATE public.installment_schedule SET status='settled' WHERE plan_id=v_plan.id AND id<>p_schedule_id AND status IN ('due','overdue','upcoming');
    UPDATE public.invoices SET status='cancelled',updated_at=now() WHERE id IN (SELECT invoice_id FROM public.installment_schedule WHERE plan_id=v_plan.id AND id<>p_schedule_id AND status='settled');
  END IF;
  SELECT coalesce(sum(amount),0) INTO v_paid FROM public.installment_schedule WHERE plan_id=v_plan.id AND status='paid';
  IF v_paid>=v_plan.total_amount THEN UPDATE public.installment_plans SET status='completed',updated_at=now() WHERE id=v_plan.id;
  ELSE UPDATE public.installment_plans SET status='active',updated_at=now() WHERE id=v_plan.id; END IF;
  UPDATE public.installment_schedule SET status='due' WHERE plan_id=v_plan.id AND status='upcoming' AND due_date<=CURRENT_DATE;
END $$;

CREATE OR REPLACE FUNCTION public.request_installment_payoff(p_plan_id uuid) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_plan public.installment_plans%ROWTYPE; v_paid numeric; v_balance numeric; v_inv uuid; v_seq int;
BEGIN
  SELECT * INTO v_plan FROM public.installment_plans WHERE id=p_plan_id AND client_id IN (SELECT public.my_client_ids()) AND status IN ('active','awaiting_down_payment') FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'This plan is not eligible for payoff'; END IF;
  IF EXISTS (SELECT 1 FROM public.installment_schedule WHERE plan_id=p_plan_id AND status='payment_submitted') THEN RAISE EXCEPTION 'Please wait for the submitted receipt to be verified first'; END IF;
  IF EXISTS (SELECT 1 FROM public.installment_schedule WHERE plan_id=p_plan_id AND sequence=-1 AND status IN ('due','payment_submitted')) THEN RAISE EXCEPTION 'An early payoff bill already exists'; END IF;
  SELECT coalesce(sum(amount),0) INTO v_paid FROM public.installment_schedule WHERE plan_id=p_plan_id AND status='paid';
  v_balance:=round(v_plan.total_amount-v_paid,2);
  IF v_balance<=0 THEN RAISE EXCEPTION 'No balance remains'; END IF;
  SELECT coalesce(max(sequence),0)+1 INTO v_seq FROM public.installment_schedule WHERE plan_id=p_plan_id;
  INSERT INTO public.invoices(organization_id,client_id,invoice_number,title,status,currency,subtotal,total,amount_paid,due_date,notes)
  VALUES(v_plan.organization_id,v_plan.client_id,'PAY-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)),'Early payoff','sent','ETB',v_balance,v_balance,0,CURRENT_DATE,'Early payoff for plan '||p_plan_id) RETURNING id INTO v_inv;
  INSERT INTO public.installment_schedule(plan_id,invoice_id,sequence,label,amount,due_date,status) VALUES(p_plan_id,v_inv,-1,'Early payoff',v_balance,CURRENT_DATE,'due');
  RETURN (SELECT id FROM public.installment_schedule WHERE plan_id=p_plan_id AND sequence=-1);
END $$;

REVOKE EXECUTE ON FUNCTION public.submit_installment_request(text,text,text,jsonb,numeric,numeric,integer,text), public.review_installment_plan(uuid,text,text,numeric,numeric,integer), public.accept_installment_terms(uuid), public.submit_installment_payment(uuid,text,text,text), public.verify_installment_payment(uuid,boolean,text), public.request_installment_payoff(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.submit_installment_request(text,text,text,jsonb,numeric,numeric,integer,text), public.review_installment_plan(uuid,text,text,numeric,numeric,integer), public.accept_installment_terms(uuid), public.submit_installment_payment(uuid,text,text,text), public.verify_installment_payment(uuid,boolean,text), public.request_installment_payoff(uuid) TO authenticated;
