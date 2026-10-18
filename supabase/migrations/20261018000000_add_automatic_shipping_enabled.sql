alter table public.store_settings
  add column if not exists automatic_shipping_enabled boolean not null default true;

update public.store_settings
set automatic_shipping_enabled = coalesce(automatic_shipping_enabled, true)
where id = 1;
