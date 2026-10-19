-- Keep used vouchers marked as used if their order is deleted.
ALTER TABLE public.customer_vouchers
  DROP CONSTRAINT IF EXISTS customer_vouchers_check;

ALTER TABLE public.customer_vouchers
  ADD CONSTRAINT customer_vouchers_usage_state_check
  CHECK (
    (used_at IS NULL AND order_id IS NULL)
    OR used_at IS NOT NULL
  );
