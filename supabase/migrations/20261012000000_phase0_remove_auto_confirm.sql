-- Migration: Phase 0 Security Hardening
-- Removes the auto-confirm trigger (all users auto-confirmed at creation,
-- bypassing email verification entirely) and closes open signup.
-- Staff-created users can be pre-confirmed via the Supabase admin API instead.

-- Drop the trigger first, then the function
DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
DROP FUNCTION IF EXISTS public.handle_auto_confirm_user();

-- Note: To turn off new signups entirely, go to:
--   Supabase Dashboard → Authentication → Settings → Disable sign ups
-- That setting lives in Supabase's auth config, not SQL.
-- This migration only removes the auto-confirm bypass.
