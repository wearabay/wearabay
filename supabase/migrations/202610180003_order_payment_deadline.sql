-- Payment deadline: 24 hours from order creation. Admin approval remains authoritative.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_expires_at timestamptz;

UPDATE public.orders
SET payment_expires_at = created_at + interval '24 hours'
WHERE payment_expires_at IS NULL
  AND payment_status = 'pending'
  AND status = 'pending';

CREATE OR REPLACE FUNCTION public.set_order_payment_deadline()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO ''
AS $$
BEGIN
  IF NEW.payment_expires_at IS NULL THEN
    NEW.payment_expires_at := COALESCE(NEW.created_at, now()) + interval '24 hours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_order_payment_deadline_trigger ON public.orders;
CREATE TRIGGER set_order_payment_deadline_trigger
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_order_payment_deadline();

CREATE OR REPLACE FUNCTION public.expire_unapproved_orders()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.orders
  SET status = 'cancelled',
      payment_status = 'expired',
      updated_at = now()
  WHERE status = 'pending'
    AND payment_status = 'pending'
    AND payment_expires_at IS NOT NULL
    AND payment_expires_at <= now()
    AND payment_proof_verified_at IS NULL;

  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Enable the database scheduler for automatic expiry processing.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- Run expiry checks every five minutes.
DO $
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobid)
    FROM cron.job
    WHERE jobname = 'wearabay-expire-unapproved-orders';

    PERFORM cron.schedule(
      'wearabay-expire-unapproved-orders',
      '*/5 * * * *',
      'SELECT public.expire_unapproved_orders();'
    );
  END IF;
EXCEPTION WHEN undefined_table OR undefined_function THEN
  RAISE EXCEPTION 'Could not configure pg_cron. Enable the pg_cron extension in Supabase, then rerun this migration.';
END;
$$;
