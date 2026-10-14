-- Calculate net follower change from consecutive totals in the database.
CREATE OR REPLACE FUNCTION public.save_social_snapshot(
  p_account_id uuid, p_slot_date date, p_slot text, p_metrics jsonb,
  p_note text DEFAULT NULL, p_source text DEFAULT 'manual', p_screenshot_path text DEFAULT NULL
) RETURNS public.social_snapshots
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_account public.social_accounts;
  v_revision integer;
  v_row public.social_snapshots;
  v_previous jsonb;
  v_previous_metrics jsonb;
  v_follower_key text;
  v_previous_followers numeric;
  v_current_followers numeric;
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
  -- Net followers is derived from consecutive follower totals, never trusted from the caller.
  p_metrics := p_metrics - 'net_followers';
  IF EXISTS (SELECT 1 FROM jsonb_each(p_metrics) e WHERE jsonb_typeof(e.value) <> 'number'
    OR (e.key <> 'net_followers' AND (e.value #>> '{}')::numeric < 0)
    OR (e.value #>> '{}')::numeric <> trunc((e.value #>> '{}')::numeric)) THEN
    RAISE EXCEPTION 'Metrics must be whole numbers; totals cannot be negative';
  END IF;
  v_follower_key := CASE v_account.platform
    WHEN 'facebook' THEN 'page_followers'
    WHEN 'tiktok' THEN 'followers'
    WHEN 'instagram' THEN 'followers'
    WHEN 'linkedin' THEN 'followers'
    ELSE NULL END;
  SELECT metrics INTO v_previous_metrics
    FROM public.social_snapshots
    WHERE account_id = p_account_id
      AND metrics ? v_follower_key
      AND (slot_date < p_slot_date OR (slot_date = p_slot_date
        AND CASE WHEN slot = 'am' THEN 1 ELSE 2 END < CASE WHEN p_slot = 'am' THEN 1 ELSE 2 END))
    ORDER BY slot_date DESC, CASE WHEN slot = 'am' THEN 1 ELSE 2 END DESC, revision DESC
    LIMIT 1;
  IF v_follower_key IS NOT NULL THEN
    v_previous_followers := NULLIF(v_previous_metrics ->> v_follower_key, '')::numeric;
    v_current_followers := COALESCE(NULLIF(p_metrics ->> v_follower_key, '')::numeric, v_previous_followers);
    IF v_current_followers IS NOT NULL THEN
      IF p_metrics ->> v_follower_key IS NULL AND v_previous_followers IS NOT NULL THEN
        p_metrics := p_metrics || jsonb_build_object(v_follower_key, v_previous_followers);
      END IF;
      p_metrics := p_metrics || jsonb_build_object('net_followers', COALESCE(v_current_followers - v_previous_followers, v_current_followers));
    END IF;
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
