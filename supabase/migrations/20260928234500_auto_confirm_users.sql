-- Migration: Auto-confirm user emails to eliminate email verification step
-- This trigger ensures every new or updated user in auth.users has email_confirmed_at populated immediately.

CREATE OR REPLACE FUNCTION public.handle_auto_confirm_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NULL THEN
    NEW.email_confirmed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;

CREATE TRIGGER on_auth_user_auto_confirm
BEFORE INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_auto_confirm_user();

-- Also immediately confirm any existing unconfirmed users
UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email_confirmed_at IS NULL;
