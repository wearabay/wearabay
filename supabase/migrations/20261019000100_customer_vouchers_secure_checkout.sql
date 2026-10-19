-- Integrate a claimed voucher into the secure order transaction.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS voucher_id uuid REFERENCES public.vouchers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS voucher_discount numeric(12,2) NOT NULL DEFAULT 0
    CHECK (voucher_discount >= 0);

CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_user_id uuid,
  p_customer_email text,
  p_customer_phone text,
  p_first_name text,
  p_last_name text,
  p_country text,
  p_province text,
  p_city text,
  p_postal_code text,
  p_street text,
  p_delivery_method text,
  p_payment_method text,
  p_items jsonb,
  p_shipping_fee numeric,
  p_shipping_courier text,
  p_shipping_service text,
  p_shipping_destination_id integer,
  p_shipping_weight_grams integer,
  p_customer_voucher_id uuid,
  p_voucher_discount_requested numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_order_id uuid;
  v_claim public.customer_vouchers%ROWTYPE;
  v_voucher public.vouchers%ROWTYPE;
  v_subtotal numeric;
  v_discount numeric := 0;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User tidak valid.';
  END IF;

  IF p_shipping_fee IS NULL OR p_shipping_fee < 0
     OR p_shipping_fee <> trunc(p_shipping_fee) THEN
    RAISE EXCEPTION 'Biaya pengiriman tidak valid.';
  END IF;
  IF p_shipping_service IS NULL OR length(trim(p_shipping_service)) = 0 THEN
    RAISE EXCEPTION 'Layanan pengiriman wajib dipilih.';
  END IF;

  IF p_shipping_courier = 'cod' THEN
    IF p_delivery_method IS DISTINCT FROM 'cod_ongkir'
       OR p_shipping_service IS DISTINCT FROM 'COD_ONGKIR'
       OR p_shipping_fee <> 0
       OR p_shipping_destination_id IS NOT NULL
       OR p_shipping_weight_grams IS DISTINCT FROM 0 THEN
      RAISE EXCEPTION 'Pilihan COD ongkir tidak valid.';
    END IF;
  ELSE
    IF p_shipping_courier NOT IN ('jne', 'jnt') THEN
      RAISE EXCEPTION 'Kurir tidak valid.';
    END IF;
    IF p_shipping_destination_id IS NULL OR p_shipping_destination_id <= 0 THEN
      RAISE EXCEPTION 'Tujuan pengiriman tidak valid.';
    END IF;
    IF p_shipping_weight_grams IS NULL OR p_shipping_weight_grams <= 0
       OR p_shipping_weight_grams > 100000 THEN
      RAISE EXCEPTION 'Berat pengiriman tidak valid.';
    END IF;
    IF p_delivery_method IS DISTINCT FROM (p_shipping_courier || ':' || p_shipping_service) THEN
      RAISE EXCEPTION 'Metode pengiriman tidak cocok.';
    END IF;
  END IF;

  IF p_voucher_discount_requested IS NOT NULL AND p_voucher_discount_requested < 0 THEN
    RAISE EXCEPTION 'Diskon voucher tidak valid.';
  END IF;

  IF p_customer_voucher_id IS NOT NULL THEN
    SELECT * INTO v_claim
    FROM public.customer_vouchers
    WHERE id = p_customer_voucher_id AND customer_id = p_user_id
    FOR UPDATE;
    IF NOT FOUND OR v_claim.used_at IS NOT NULL OR v_claim.order_id IS NOT NULL THEN
      RAISE EXCEPTION 'Voucher tidak tersedia atau sudah digunakan.';
    END IF;

    SELECT * INTO v_voucher
    FROM public.vouchers
    WHERE id = v_claim.voucher_id
    FOR UPDATE;
    IF NOT FOUND OR NOT v_voucher.is_active
       OR v_voucher.starts_at > now()
       OR (v_voucher.expires_at IS NOT NULL AND v_voucher.expires_at <= now()) THEN
      RAISE EXCEPTION 'Voucher sudah tidak berlaku.';
    END IF;
  ELSIF COALESCE(p_voucher_discount_requested, 0) <> 0 THEN
    RAISE EXCEPTION 'Voucher tidak valid.';
  END IF;

  PERFORM pg_catalog.set_config('request.jwt.claim.sub', p_user_id::text, true);
  PERFORM pg_catalog.set_config(
    'request.jwt.claims',
    pg_catalog.jsonb_build_object('sub', p_user_id::text, 'role', 'authenticated')::text,
    true
  );

  v_order_id := public.create_order(
    p_customer_email, p_customer_phone, p_first_name, p_last_name,
    p_country, p_province, p_city, p_postal_code, p_street,
    p_delivery_method, p_payment_method, p_items
  );

  SELECT subtotal INTO v_subtotal
  FROM public.orders
  WHERE id = v_order_id AND user_id = p_user_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pesanan tidak ditemukan atau tidak cocok dengan pengguna.';
  END IF;

  IF p_customer_voucher_id IS NOT NULL THEN
    IF v_subtotal < v_voucher.minimum_subtotal THEN
      RAISE EXCEPTION 'Minimum belanja untuk voucher belum tercapai.';
    END IF;
    IF v_voucher.discount_type = 'percentage' THEN
      v_discount := round(v_subtotal * v_voucher.discount_value / 100, 2);
    ELSE
      v_discount := v_voucher.discount_value;
    END IF;
    IF v_voucher.max_discount IS NOT NULL THEN
      v_discount := least(v_discount, v_voucher.max_discount);
    END IF;
    v_discount := least(v_subtotal, v_discount);
    IF p_voucher_discount_requested IS NOT NULL AND p_voucher_discount_requested <> v_discount THEN
      RAISE EXCEPTION 'Nilai diskon voucher berubah. Muat ulang checkout.';
    END IF;
  END IF;

  UPDATE public.orders
  SET shipping_fee = p_shipping_fee,
      total = subtotal - v_discount + p_shipping_fee,
      voucher_id = CASE WHEN p_customer_voucher_id IS NULL THEN NULL ELSE v_voucher.id END,
      voucher_discount = v_discount,
      shipping_courier = p_shipping_courier,
      shipping_service = p_shipping_service,
      shipping_destination_id = p_shipping_destination_id,
      shipping_weight_grams = p_shipping_weight_grams
  WHERE id = v_order_id AND user_id = p_user_id;

  IF p_customer_voucher_id IS NOT NULL THEN
    UPDATE public.customer_vouchers
    SET used_at = now(), order_id = v_order_id
    WHERE id = p_customer_voucher_id AND customer_id = p_user_id
      AND used_at IS NULL AND order_id IS NULL;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Voucher gagal digunakan. Silakan coba lagi.';
    END IF;
  END IF;

  RETURN v_order_id;
END;
$function$;

REVOKE ALL ON FUNCTION public.create_order_secure(
  uuid, text, text, text, text, text, text, text, text, text, text, text,
  jsonb, numeric, text, text, integer, integer, uuid, numeric
) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_order_secure(
  uuid, text, text, text, text, text, text, text, text, text, text, text,
  jsonb, numeric, text, text, integer, integer, uuid, numeric
) TO service_role;
