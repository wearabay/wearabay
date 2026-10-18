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
  p_shipping_weight_grams integer
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_order_id uuid;
BEGIN
  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User tidak valid.';
  END IF;

  IF p_shipping_fee IS NULL
     OR p_shipping_fee < 0
     OR p_shipping_fee <> trunc(p_shipping_fee) THEN
    RAISE EXCEPTION 'Biaya pengiriman tidak valid.';
  END IF;

  IF p_shipping_service IS NULL
     OR length(trim(p_shipping_service)) = 0 THEN
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

    IF p_shipping_destination_id IS NULL
       OR p_shipping_destination_id <= 0 THEN
      RAISE EXCEPTION 'Tujuan pengiriman tidak valid.';
    END IF;

    IF p_shipping_weight_grams IS NULL
       OR p_shipping_weight_grams <= 0
       OR p_shipping_weight_grams > 100000 THEN
      RAISE EXCEPTION 'Berat pengiriman tidak valid.';
    END IF;

    IF p_delivery_method IS DISTINCT FROM
       (p_shipping_courier || ':' || p_shipping_service) THEN
      RAISE EXCEPTION 'Metode pengiriman tidak cocok.';
    END IF;
  END IF;

  PERFORM pg_catalog.set_config(
    'request.jwt.claim.sub',
    p_user_id::text,
    true
  );

  PERFORM pg_catalog.set_config(
    'request.jwt.claims',
    pg_catalog.jsonb_build_object(
      'sub', p_user_id::text,
      'role', 'authenticated'
    )::text,
    true
  );

  v_order_id := public.create_order(
    p_customer_email,
    p_customer_phone,
    p_first_name,
    p_last_name,
    p_country,
    p_province,
    p_city,
    p_postal_code,
    p_street,
    p_delivery_method,
    p_payment_method,
    p_items
  );

  UPDATE public.orders
  SET
    shipping_fee = p_shipping_fee,
    total = subtotal + p_shipping_fee,
    shipping_courier = p_shipping_courier,
    shipping_service = p_shipping_service,
    shipping_destination_id = p_shipping_destination_id,
    shipping_weight_grams = p_shipping_weight_grams
  WHERE id = v_order_id
    AND user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pesanan tidak ditemukan atau tidak cocok dengan pengguna.';
  END IF;

  RETURN v_order_id;
END;
$function$;
