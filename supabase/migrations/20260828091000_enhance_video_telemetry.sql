-- Migration: Add extra granular video production lifecycle and telemetry fields to youtube_videos
ALTER TABLE public.youtube_videos
  ADD COLUMN IF NOT EXISTS likes int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS watch_time_hours numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS script_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vo_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS editing_done boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS thumbnail_done boolean NOT NULL DEFAULT false;
