-- Customer-claimable vouchers. All claim/use transitions are server-side.
CREATE TABLE IF NOT EXISTS public.vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (length(trim(name)) BETWEEN 1 AND 120),
  code text NOT NULL UNIQUE CHECK (code = upper(trim(code)) AND length(code) BETWEEN 3 AND 40),
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric(12,2) NOT NULL CHECK (discount_value > 0),
  max_discount numeric(12,2),
  minimum_subtotal numeric(12,2) NOT NULL DEFAULT 0 CHECK (minimum_subtotal >= 0),
  quantity integer NOT NULL CHECK (quantity > 0),
  claimed_count integer NOT NULL DEFAULT 0 CHECK (claimed_count >= 0 AND claimed_count <= quantity),
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at IS NULL OR expires_at > starts_at),
  CHECK (discount_type <> 'percentage' OR discount_value <= 100),
  CHECK (max_discount IS NULL OR max_discount > 0)
);

CREATE TABLE IF NOT EXISTS public.customer_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id uuid NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz,
  order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE SET NULL,
  UNIQUE (voucher_id, customer_id),
  CHECK ((used_at IS NULL AND order_id IS NULL) OR (used_at IS NOT NULL AND order_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS vouchers_claimable_idx
  ON public.vouchers (is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS customer_vouchers_customer_idx
  ON public.customer_vouchers (customer_id, claimed_at DESC);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_vouchers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active claimable vouchers" ON public.vouchers;
CREATE POLICY "Anyone can view active claimable vouchers"
  ON public.vouchers FOR SELECT TO anon, authenticated
  USING (
    is_active = true
    AND starts_at <= now()
    AND (expires_at IS NULL OR expires_at > now())
    AND claimed_count < quantity
  );

DROP POLICY IF EXISTS "Customers can view own voucher claims" ON public.customer_vouchers;
CREATE POLICY "Customers can view own voucher claims"
  ON public.customer_vouchers FOR SELECT TO authenticated
  USING (customer_id = (SELECT auth.uid()));

REVOKE INSERT, UPDATE, DELETE ON public.vouchers FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.customer_vouchers FROM anon, authenticated;
GRANT SELECT ON public.vouchers TO anon, authenticated;
GRANT SELECT ON public.customer_vouchers TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_customer_voucher(p_voucher_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_customer_id uuid := auth.uid();
  v_claim_id uuid;
  v_voucher public.vouchers%ROWTYPE;
BEGIN
  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Silakan login untuk mengklaim voucher.';
  END IF;

  SELECT * INTO v_voucher
  FROM public.vouchers
  WHERE id = p_voucher_id
  FOR UPDATE;

  IF NOT FOUND
     OR NOT v_voucher.is_active
     OR v_voucher.starts_at > now()
     OR (v_voucher.expires_at IS NOT NULL AND v_voucher.expires_at <= now())
     OR v_voucher.claimed_count >= v_voucher.quantity THEN
    RAISE EXCEPTION 'Voucher sudah tidak tersedia.';
  END IF;

  INSERT INTO public.customer_vouchers (voucher_id, customer_id)
  VALUES (p_voucher_id, v_customer_id)
  RETURNING id INTO v_claim_id;

  UPDATE public.vouchers
  SET claimed_count = claimed_count + 1,
      updated_at = now()
  WHERE id = p_voucher_id;

  RETURN v_claim_id;
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'Kamu sudah pernah mengklaim voucher ini.';
END;
$function$;

REVOKE ALL ON FUNCTION public.claim_customer_voucher(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_customer_voucher(uuid) TO authenticated;
