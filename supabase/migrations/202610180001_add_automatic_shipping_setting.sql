alter table public.store_settings
  add column if not exists automatic_shipping_enabled boolean not null default true;
