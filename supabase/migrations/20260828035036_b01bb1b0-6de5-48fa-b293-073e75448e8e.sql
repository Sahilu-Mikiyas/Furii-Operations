-- Reset pillar progress to zero
UPDATE public.pillars SET current_value = 0;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

-- ============ YOUTUBE ============
CREATE TABLE public.youtube_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key text NOT NULL,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '🎬',
  subscribers integer NOT NULL DEFAULT 0,
  views_count bigint NOT NULL DEFAULT 0,
  monthly_revenue numeric NOT NULL DEFAULT 0,
  target_revenue numeric NOT NULL DEFAULT 0,
  monetized boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_channels TO authenticated;
GRANT ALL ON public.youtube_channels TO service_role;
ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own youtube_channels" ON public.youtube_channels FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_youtube_channels_updated BEFORE UPDATE ON public.youtube_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  channel_key text NOT NULL,
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'Ideas',
  topic text,
  script_content text,
  financial_claims text,
  market_data text,
  doc_day1_done boolean NOT NULL DEFAULT false,
  doc_day2_done boolean NOT NULL DEFAULT false,
  thumbnail_url text,
  scheduled_date date,
  revenue numeric NOT NULL DEFAULT 0,
  rpm numeric NOT NULL DEFAULT 0,
  ctr numeric NOT NULL DEFAULT 0,
  views bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_videos TO authenticated;
GRANT ALL ON public.youtube_videos TO service_role;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own youtube_videos" ON public.youtube_videos FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_youtube_videos_updated BEFORE UPDATE ON public.youtube_videos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.book_database (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  author text NOT NULL DEFAULT '',
  reading_progress integer NOT NULL DEFAULT 0,
  summary_notes text,
  key_takeaways text,
  rating integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_database TO authenticated;
GRANT ALL ON public.book_database TO service_role;
ALTER TABLE public.book_database ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own book_database" ON public.book_database FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_book_database_updated BEFORE UPDATE ON public.book_database FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ SOFTWARE ============
CREATE TABLE public.software_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company text NOT NULL,
  contact text NOT NULL DEFAULT '',
  service text NOT NULL DEFAULT '',
  deal_value numeric NOT NULL DEFAULT 0,
  probability integer NOT NULL DEFAULT 0,
  stage text NOT NULL DEFAULT 'Prospect',
  next_action text,
  deadline date,
  payment_status text NOT NULL DEFAULT 'unpaid',
  amount_collected numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_deals TO authenticated;
GRANT ALL ON public.software_deals TO service_role;
ALTER TABLE public.software_deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own software_deals" ON public.software_deals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_software_deals_updated BEFORE UPDATE ON public.software_deals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.software_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client text NOT NULL DEFAULT '',
  title text NOT NULL,
  requirements text,
  features text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'Backlog',
  demo_url text,
  deadline date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_projects TO authenticated;
GRANT ALL ON public.software_projects TO service_role;
ALTER TABLE public.software_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own software_projects" ON public.software_projects FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_software_projects_updated BEFORE UPDATE ON public.software_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.software_outreach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company text NOT NULL,
  contact text NOT NULL DEFAULT '',
  platform text NOT NULL DEFAULT 'Email',
  email text,
  phone text,
  status text NOT NULL DEFAULT 'contacted',
  date_contacted date NOT NULL DEFAULT CURRENT_DATE,
  follow_up_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_outreach TO authenticated;
GRANT ALL ON public.software_outreach TO service_role;
ALTER TABLE public.software_outreach ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own software_outreach" ON public.software_outreach FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_software_outreach_updated BEFORE UPDATE ON public.software_outreach FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.software_promo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_name text NOT NULL,
  asset_type text NOT NULL DEFAULT 'Demo Video',
  description text,
  status text NOT NULL DEFAULT 'Planned',
  link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_promo TO authenticated;
GRANT ALL ON public.software_promo TO service_role;
ALTER TABLE public.software_promo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own software_promo" ON public.software_promo FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_software_promo_updated BEFORE UPDATE ON public.software_promo FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ MONEY ============
CREATE TABLE public.money_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  key text NOT NULL,
  title text NOT NULL,
  emoji text NOT NULL DEFAULT '💰',
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'ETB',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.money_buckets TO authenticated;
GRANT ALL ON public.money_buckets TO service_role;
ALTER TABLE public.money_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own money_buckets" ON public.money_buckets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_money_buckets_updated BEFORE UPDATE ON public.money_buckets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.fund_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  bucket_id uuid NOT NULL REFERENCES public.money_buckets(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  note text,
  contributed_on date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.fund_contributions TO authenticated;
GRANT ALL ON public.fund_contributions TO service_role;
ALTER TABLE public.fund_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own fund_contributions" ON public.fund_contributions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.marriage_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  saved_amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marriage_categories TO authenticated;
GRANT ALL ON public.marriage_categories TO service_role;
ALTER TABLE public.marriage_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own marriage_categories" ON public.marriage_categories FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_marriage_categories_updated BEFORE UPDATE ON public.marriage_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.relationship_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  financial_gate text,
  status text NOT NULL DEFAULT 'locked',
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.relationship_milestones TO authenticated;
GRANT ALL ON public.relationship_milestones TO service_role;
ALTER TABLE public.relationship_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own relationship_milestones" ON public.relationship_milestones FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER t_relationship_milestones_updated BEFORE UPDATE ON public.relationship_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ bootstrap starts at zero ============
CREATE OR REPLACE FUNCTION public.bootstrap_mission()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO public.mission_settings (user_id) VALUES (uid) ON CONFLICT DO NOTHING;

  INSERT INTO public.pillars (user_id, key, emoji, label, sublabel, unit, current_value, target_value, stretch_value, weight, sort_order)
  VALUES
    (uid, 'media', '🎥', 'MEDIA', 'YouTube monthly revenue', 'USD', 0, 10000, NULL, 25, 1),
    (uid, 'software', '💻', 'SOFTWARE', 'Closed contract value', 'ETB', 0, 2000000, NULL, 25, 2),
    (uid, 'life', '❤️', 'LIFE', 'Proposal + marriage funds', 'ETB', 0, 1200000, NULL, 25, 3),
    (uid, 'relocation', '🇵🇱', 'RELOCATION', 'Poland relocation fund', 'USD', 0, 10000, 15000, 25, 4)
  ON CONFLICT (user_id, key) DO NOTHING;

  INSERT INTO public.identities (user_id, weekday, emoji, name, description, mission, categories, loop, kpis, completion_criteria)
  VALUES
    (uid, 1, '🎬', 'THE MOVIE MAN', 'Monday belongs to the movie review channel.', 'Ship one complete movie review cycle.',
      ARRAY['Movie channel','Research','Editing'],
      ARRAY['Research','Topic','Script','Voiceover','Assets','Editing','Sound','Thumbnail','Title','Description','Upload','Distribution'],
      ARRAY['1 video published','6h+ deep work'], 'Video uploaded and distributed.'),
    (uid, 2, '💰', 'THE MONEY MAN', 'Tuesday belongs to the finance channel.', 'Ship one finance video with verified numbers.',
      ARRAY['Finance channel','Research','Data'],
      ARRAY['Topic','Financial claims','Sources','Numbers','Calculations','Charts','Script','Graphics','Voiceover','Editing','Thumbnail','Upload'],
      ARRAY['1 video published','All claims sourced'], 'Finance video uploaded with sourced claims.'),
    (uid, 3, '🎥', 'THE DOCUMENTARIAN', 'Wednesday is documentary batch day one.', 'Build the documentary to rough-cut stage.',
      ARRAY['Documentary','Research','Production'],
      ARRAY['Research','Story structure','Script','Voiceover','Footage','Graphics','Rough edit','Save project','Update production status'],
      ARRAY['Rough cut complete','7h+ deep work'], 'Rough cut saved and status updated.'),
    (uid, 4, '💻', 'THE CTO', 'Thursday is build day.', 'Move software projects forward and ship demos.',
      ARRAY['Software build','Testing','Demo'],
      ARRAY['Review backlog','Plan build','Build','Test','Fix','Demo build','Deploy','Update client','Log progress'],
      ARRAY['1 feature shipped','1 demo ready'], 'Build deployed or demo ready.'),
    (uid, 5, '🤝', 'THE DEALMAKER', 'Friday is sales day.', 'Fill the pipeline and close deals.',
      ARRAY['Sales','Outreach','Proposals'],
      ARRAY['Review pipeline','Follow-ups','New prospects','Outreach messages','Calls','Meetings','Proposals','Negotiation','Update CRM'],
      ARRAY['10 prospects','3 conversations','1 proposal'], 'Pipeline updated and follow-ups sent.'),
    (uid, 6, '🎥', 'THE DOCUMENTARIAN', 'Saturday is documentary batch day two.', 'Finish and publish the documentary.',
      ARRAY['Documentary','Editing','Publishing'],
      ARRAY['Final edit','Sound','Color','Graphics','Thumbnail','Title','Description','Upload','Distribution'],
      ARRAY['1 documentary published'], 'Documentary uploaded and distributed.'),
    (uid, 0, '📚', 'THE BOOKMAN', 'Sunday is book review plus outreach and weekly planning.', 'Ship the book review and set next week.',
      ARRAY['Book channel','Outreach','Planning'],
      ARRAY['Reading','Notes','Summary','Key ideas','Script','Voiceover','Thumbnail','Upload','Outreach block','Plan the week'],
      ARRAY['1 video published','Week planned'], 'Book video uploaded and week planned.')
  ON CONFLICT (user_id, weekday) DO NOTHING;
END;
$$;