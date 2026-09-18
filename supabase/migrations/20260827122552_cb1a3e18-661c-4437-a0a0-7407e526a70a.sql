
CREATE TABLE public.mission_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  departure_date date NOT NULL DEFAULT '2027-02-10',
  title text NOT NULL DEFAULT 'MISSION POLAND',
  tagline text NOT NULL DEFAULT 'Build the life. Earn the money. Make the move.',
  destination text NOT NULL DEFAULT 'Poznań',
  deep_work_target_hours numeric NOT NULL DEFAULT 8,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.pillars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  key text NOT NULL,
  emoji text NOT NULL DEFAULT '🎯',
  label text NOT NULL,
  sublabel text,
  unit text NOT NULL DEFAULT 'USD',
  current_value numeric NOT NULL DEFAULT 0,
  target_value numeric NOT NULL DEFAULT 0,
  stretch_value numeric,
  weight numeric NOT NULL DEFAULT 25,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

CREATE TABLE public.identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  weekday int NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  emoji text NOT NULL DEFAULT '🎯',
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  mission text NOT NULL DEFAULT '',
  categories text[] NOT NULL DEFAULT '{}',
  loop text[] NOT NULL DEFAULT '{}',
  kpis text[] NOT NULL DEFAULT '{}',
  completion_criteria text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, weekday)
);

CREATE TABLE public.days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_date date NOT NULL,
  identity_id uuid REFERENCES public.identities ON DELETE SET NULL,
  objective text NOT NULL DEFAULT '',
  output_note text NOT NULL DEFAULT '',
  key_objective_done boolean NOT NULL DEFAULT false,
  closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_date)
);

CREATE TABLE public.day_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_id uuid NOT NULL REFERENCES public.days ON DELETE CASCADE,
  label text NOT NULL,
  position int NOT NULL DEFAULT 0,
  done boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.work_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  day_id uuid NOT NULL REFERENCES public.days ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Deep work',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  seconds int NOT NULL DEFAULT 0,
  running boolean NOT NULL DEFAULT true,
  result_note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.parked_ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  note text NOT NULL,
  status text NOT NULL DEFAULT 'parked',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mission_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pillars TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.days TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.day_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parked_ideas TO authenticated;
GRANT ALL ON public.mission_settings TO service_role;
GRANT ALL ON public.pillars TO service_role;
GRANT ALL ON public.identities TO service_role;
GRANT ALL ON public.days TO service_role;
GRANT ALL ON public.day_tasks TO service_role;
GRANT ALL ON public.work_sessions TO service_role;
GRANT ALL ON public.parked_ideas TO service_role;

ALTER TABLE public.mission_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parked_ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own mission_settings" ON public.mission_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own pillars" ON public.pillars FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own identities" ON public.identities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own days" ON public.days FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own day_tasks" ON public.day_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own work_sessions" ON public.work_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own parked_ideas" ON public.parked_ideas FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS trigger
LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER t_mission_settings BEFORE UPDATE ON public.mission_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_pillars BEFORE UPDATE ON public.pillars FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_identities BEFORE UPDATE ON public.identities FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER t_days BEFORE UPDATE ON public.days FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.bootstrap_mission() RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;

  INSERT INTO public.mission_settings (user_id) VALUES (uid) ON CONFLICT DO NOTHING;

  INSERT INTO public.pillars (user_id, key, emoji, label, sublabel, unit, current_value, target_value, stretch_value, weight, sort_order)
  VALUES
    (uid, 'media', '🎥', 'MEDIA', 'YouTube monthly revenue', 'USD', 3420, 10000, NULL, 25, 1),
    (uid, 'software', '💻', 'SOFTWARE', 'Closed contract value', 'ETB', 1250000, 2000000, NULL, 25, 2),
    (uid, 'life', '❤️', 'LIFE', 'Proposal + marriage funds', 'ETB', 507500, 1200000, NULL, 25, 3),
    (uid, 'relocation', '🇵🇱', 'RELOCATION', 'Poland relocation fund', 'USD', 6800, 10000, 15000, 25, 4)
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
END; $$;

REVOKE ALL ON FUNCTION public.bootstrap_mission() FROM public;
GRANT EXECUTE ON FUNCTION public.bootstrap_mission() TO authenticated;
