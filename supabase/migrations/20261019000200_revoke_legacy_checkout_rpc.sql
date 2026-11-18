-- Prevent public/client roles from calling the legacy 18-argument checkout RPC.
-- The application uses the newer 20-argument RPC through service_role.
REVOKE EXECUTE ON FUNCTION public.create_order_secure(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  numeric,
  text,
  text,
  integer,
  integer
) FROM PUBLIC, anon, authenticated;
