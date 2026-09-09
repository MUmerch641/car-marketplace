-- Shaz oil-change foundation.
-- Oil recommendations are only public when a fitment has been verified.

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  status text not null default 'prospective' check (status in ('prospective', 'active', 'paused')),
  contact_name text,
  contact_email text,
  contact_phone text,
  ordering_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.oil_products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id) on delete set null,
  supplier_sku text,
  brand text not null check (char_length(trim(brand)) between 1 and 100),
  name text not null check (char_length(trim(name)) between 1 and 160),
  viscosity_grade text not null check (char_length(trim(viscosity_grade)) between 2 and 20),
  specifications text[] not null default '{}',
  volume_litres numeric(5,2) not null check (volume_litres > 0),
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  description text,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique nulls not distinct (supplier_id, supplier_sku)
);

create table public.oil_fitments (
  id uuid primary key default gen_random_uuid(),
  oil_product_id uuid not null references public.oil_products(id) on delete cascade,
  make text not null check (char_length(trim(make)) between 1 and 80),
  model text not null check (char_length(trim(model)) between 1 and 120),
  year_from smallint check (year_from is null or year_from between 1886 and 2100),
  year_to smallint check (year_to is null or year_to between 1886 and 2100),
  fuel_type public.fuel_type,
  engine_capacity_min_cc integer check (engine_capacity_min_cc is null or engine_capacity_min_cc > 0),
  engine_capacity_max_cc integer check (engine_capacity_max_cc is null or engine_capacity_max_cc > 0),
  is_primary boolean not null default false,
  source_reference text,
  notes text,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (year_from is null or year_to is null or year_from <= year_to),
  check (engine_capacity_min_cc is null or engine_capacity_max_cc is null or engine_capacity_min_cc <= engine_capacity_max_cc)
);

create index oil_fitments_vehicle_idx on public.oil_fitments (lower(make), lower(model), year_from, year_to);
create index oil_fitments_product_idx on public.oil_fitments (oil_product_id);
create unique index oil_fitments_one_primary_idx on public.oil_fitments (lower(make), lower(model), year_from, year_to, fuel_type, engine_capacity_min_cc, engine_capacity_max_cc) nulls not distinct where is_primary and verified_at is not null;

alter table public.service_bookings
  add column vehicle_year smallint check (vehicle_year is null or vehicle_year between 1886 and 2100),
  add column fuel_type public.fuel_type,
  add column engine_capacity_cc integer check (engine_capacity_cc is null or engine_capacity_cc > 0),
  add column oil_product_id uuid references public.oil_products(id) on delete restrict,
  add column oil_product_name text,
  add column oil_viscosity_grade text,
  add column oil_price numeric(10,2) check (oil_price is null or oil_price >= 0),
  add column oil_fitment_status text not null default 'manual_confirmation' check (oil_fitment_status in ('verified', 'manual_confirmation'));

create table public.supplier_orders (
  id uuid primary key default gen_random_uuid(),
  service_booking_id uuid not null unique references public.service_bookings(id) on delete restrict,
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  status text not null default 'draft' check (status in ('draft', 'sent', 'acknowledged', 'ready', 'collected', 'cancelled')),
  external_reference text,
  order_notes text,
  sent_at timestamptz,
  ready_at timestamptz,
  collected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.suppliers enable row level security;
alter table public.oil_products enable row level security;
alter table public.oil_fitments enable row level security;
alter table public.supplier_orders enable row level security;

create policy "Admins manage suppliers" on public.suppliers for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Public reads active oils" on public.oil_products for select to anon, authenticated using (is_active);
create policy "Admins manage oils" on public.oil_products for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Public reads verified fitments" on public.oil_fitments for select to anon, authenticated using (verified_at is not null and exists (select 1 from public.oil_products p where p.id = oil_product_id and p.is_active));
create policy "Admins manage fitments" on public.oil_fitments for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins manage supplier orders" on public.supplier_orders for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

grant select on public.oil_products, public.oil_fitments to anon, authenticated;
grant select, insert, update, delete on public.suppliers, public.oil_products, public.oil_fitments, public.supplier_orders to authenticated;

insert into public.suppliers (name, status, ordering_notes)
values ('GSF Car Parts', 'prospective', 'Open a local trade account and confirm the branch ordering and collection process before activation.')
on conflict do nothing;

update public.service_types set is_active = false where slug <> 'oil-change';
insert into public.service_types (name, slug, description, short_description, base_price, estimated_duration_minutes, is_active)
values (
  'Oil & Filter Change',
  'oil-change',
  'A mobile oil and filter change at your home or workplace. Shaz confirms the manufacturer-approved oil specification for your vehicle before the appointment.',
  'The right oil and a new filter, fitted where your car is parked.',
  89,
  60,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  short_description = excluded.short_description,
  base_price = excluded.base_price,
  estimated_duration_minutes = excluded.estimated_duration_minutes,
  is_active = true,
  updated_at = now();

create or replace function private.create_oil_change_booking(
  p_service_type_id uuid,
  p_car_make text,
  p_car_model text,
  p_car_registration text,
  p_vehicle_year smallint,
  p_fuel_type public.fuel_type,
  p_engine_capacity_cc integer,
  p_oil_product_id uuid,
  p_address_line_1 text,
  p_address_line_2 text,
  p_city text,
  p_postcode text,
  p_preferred_date date,
  p_preferred_time time,
  p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking_id uuid;
  v_service_price numeric;
  v_oil public.oil_products%rowtype;
  v_fitment_status text := 'manual_confirmation';
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if p_preferred_date < current_date or trim(p_car_registration) = '' or trim(p_car_make) = '' or trim(p_car_model) = '' or trim(p_address_line_1) = '' or trim(p_city) = '' or trim(p_postcode) !~* '^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$' then
    raise exception 'Invalid booking request';
  end if;

  select base_price into v_service_price from public.service_types where id = p_service_type_id and slug = 'oil-change' and is_active;
  if v_service_price is null then raise exception 'Oil change unavailable'; end if;

  if p_oil_product_id is not null then
    select * into v_oil from public.oil_products where id = p_oil_product_id and is_active;
    if v_oil.id is null then raise exception 'Oil product unavailable'; end if;
    if exists (
      select 1 from public.oil_fitments f
      where f.oil_product_id = v_oil.id and f.verified_at is not null
        and lower(f.make) = lower(trim(p_car_make)) and lower(f.model) = lower(trim(p_car_model))
        and (f.year_from is null or p_vehicle_year >= f.year_from) and (f.year_to is null or p_vehicle_year <= f.year_to)
        and (f.fuel_type is null or f.fuel_type = p_fuel_type)
        and (f.engine_capacity_min_cc is null or p_engine_capacity_cc >= f.engine_capacity_min_cc)
        and (f.engine_capacity_max_cc is null or p_engine_capacity_cc <= f.engine_capacity_max_cc)
    ) then v_fitment_status := 'verified'; end if;
  end if;

  insert into public.service_bookings (
    customer_id, service_type_id, car_make, car_model, car_registration, vehicle_year, fuel_type, engine_capacity_cc,
    oil_product_id, oil_product_name, oil_viscosity_grade, oil_price, oil_fitment_status,
    address_line_1, address_line_2, city, postcode, preferred_date, preferred_time, notes, quoted_price
  ) values (
    auth.uid(), p_service_type_id, trim(p_car_make), trim(p_car_model), upper(regexp_replace(p_car_registration, '[^A-Za-z0-9]', '', 'g')), p_vehicle_year, p_fuel_type, p_engine_capacity_cc,
    v_oil.id, case when v_oil.id is null then null else v_oil.brand || ' ' || v_oil.name end, v_oil.viscosity_grade, v_oil.price, v_fitment_status,
    trim(p_address_line_1), nullif(trim(p_address_line_2), ''), trim(p_city), upper(trim(p_postcode)), p_preferred_date, p_preferred_time, nullif(trim(p_notes), ''), v_service_price + coalesce(v_oil.price, 0)
  ) returning id into v_booking_id;

  return v_booking_id;
end;
$$;

create or replace function public.create_oil_change_booking(
  p_service_type_id uuid,
  p_car_make text,
  p_car_model text,
  p_car_registration text,
  p_vehicle_year smallint,
  p_fuel_type public.fuel_type,
  p_engine_capacity_cc integer,
  p_oil_product_id uuid,
  p_address_line_1 text,
  p_address_line_2 text,
  p_city text,
  p_postcode text,
  p_preferred_date date,
  p_preferred_time time,
  p_notes text default null
) returns uuid
language sql
security invoker
set search_path = ''
as $$
  select private.create_oil_change_booking(
    p_service_type_id, p_car_make, p_car_model, p_car_registration, p_vehicle_year, p_fuel_type,
    p_engine_capacity_cc, p_oil_product_id, p_address_line_1, p_address_line_2, p_city,
    p_postcode, p_preferred_date, p_preferred_time, p_notes
  );
$$;

revoke all on function private.create_oil_change_booking(uuid,text,text,text,smallint,public.fuel_type,integer,uuid,text,text,text,text,date,time,text) from public;
grant execute on function private.create_oil_change_booking(uuid,text,text,text,smallint,public.fuel_type,integer,uuid,text,text,text,text,date,time,text) to authenticated;
revoke all on function public.create_oil_change_booking(uuid,text,text,text,smallint,public.fuel_type,integer,uuid,text,text,text,text,date,time,text) from public;
grant execute on function public.create_oil_change_booking(uuid,text,text,text,smallint,public.fuel_type,integer,uuid,text,text,text,text,date,time,text) to authenticated;
