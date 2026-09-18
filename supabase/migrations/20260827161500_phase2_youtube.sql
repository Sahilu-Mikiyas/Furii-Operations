-- Phase 2: YouTube Revenue Engine & Channel Production Hubs

CREATE TABLE IF NOT EXISTS public.youtube_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  key text NOT NULL, -- 'movie', 'finance', 'documentary', 'books'
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '🎬',
  subscribers int NOT NULL DEFAULT 0,
  views_count numeric NOT NULL DEFAULT 0,
  monthly_revenue numeric NOT NULL DEFAULT 0,
  target_revenue numeric NOT NULL DEFAULT 0,
  monetized boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, key)
);

CREATE TABLE IF NOT EXISTS public.youtube_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  channel_key text NOT NULL,
  title text NOT NULL,
  stage text NOT NULL DEFAULT 'Ideas', -- Ideas, Research, Script, Production, Editing, Thumbnail, Scheduled, Published
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
  views int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.book_database (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title text NOT NULL,
  author text NOT NULL,
  reading_progress int NOT NULL DEFAULT 0, -- 0 to 100
  summary_notes text,
  key_takeaways text,
  rating int DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_channels TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.youtube_videos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_database TO authenticated;
GRANT ALL ON public.youtube_channels TO service_role;
GRANT ALL ON public.youtube_videos TO service_role;
GRANT ALL ON public.book_database TO service_role;

ALTER TABLE public.youtube_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.youtube_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_database ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own channels" ON public.youtube_channels
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own videos" ON public.youtube_videos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own books" ON public.book_database
  FOR ALL USING (auth.uid() = user_id);
