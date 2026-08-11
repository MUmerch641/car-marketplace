create extension if not exists pgcrypto;

create type public.profile_role as enum ('customer', 'inspector', 'admin');
create type public.listing_status as enum ('draft', 'pending_review', 'active', 'rejected', 'sold', 'archived');
create type public.fuel_type as enum ('petrol', 'diesel', 'hybrid', 'plug_in_hybrid', 'electric', 'other');
create type public.transmission_type as enum ('manual', 'automatic', 'semi_automatic', 'other');
create type public.service_booking_status as enum ('pending', 'confirmed', 'assigned', 'on_the_way', 'in_progress', 'completed', 'cancelled');
create type public.verification_request_status as enum ('pending', 'confirmed', 'assigned', 'inspection_scheduled', 'inspection_in_progress', 'report_submitted', 'completed', 'cancelled');
create type public.condition_rating as enum ('excellent', 'good', 'fair', 'poor', 'not_checked');
create type public.inspection_result as enum ('passed', 'passed_with_advisories', 'attention_required', 'not_suitable');
create type public.assignment_status as enum ('assigned', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled');
create type public.payment_status as enum ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled');
create type public.payment_provider as enum ('manual', 'stripe', 'other');
create type public.notification_type as enum ('listing', 'service_booking', 'verification', 'inspection_report', 'payment', 'system');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role public.profile_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete restrict,
  make text not null check (char_length(trim(make)) between 1 and 80),
  model text not null check (char_length(trim(model)) between 1 and 120),
  variant text check (char_length(trim(variant)) <= 120),
  year smallint not null check (year between 1886 and 2100),
  price numeric(12, 2) not null check (price >= 0),
  mileage integer not null check (mileage >= 0),
  fuel_type public.fuel_type not null,
  transmission public.transmission_type not null,
  body_type text check (char_length(trim(body_type)) <= 80),
  engine_size numeric(4, 1) check (engine_size is null or engine_size > 0),
  colour text check (char_length(trim(colour)) <= 60),
  registration text check (char_length(trim(registration)) between 2 and 16),
  registration_city text check (char_length(trim(registration_city)) <= 100),
  city text not null check (char_length(trim(city)) between 1 and 100),
  postcode text not null check (char_length(trim(postcode)) between 3 and 10),
  description text not null check (char_length(trim(description)) between 20 and 10000),
  status public.listing_status not null default 'draft',
  is_featured boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint cars_active_requires_published_at check (status <> 'active' or published_at is not null)
);

create table public.car_images (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  storage_path text not null unique check (char_length(trim(storage_path)) > 0),
  sort_order integer not null default 0 check (sort_order >= 0),
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (car_id, sort_order)
);
create unique index car_images_one_primary_per_car on public.car_images(car_id) where is_primary;

create table public.service_types (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  description text not null check (char_length(trim(description)) between 1 and 2000),
  base_price numeric(12, 2) not null check (base_price >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  service_type_id uuid not null references public.service_types(id) on delete restrict,
  car_make text not null check (char_length(trim(car_make)) between 1 and 80),
  car_model text not null check (char_length(trim(car_model)) between 1 and 120),
  car_registration text check (char_length(trim(car_registration)) between 2 and 16),
  address_line_1 text not null check (char_length(trim(address_line_1)) between 1 and 200),
  address_line_2 text check (char_length(trim(address_line_2)) <= 200),
  city text not null check (char_length(trim(city)) between 1 and 100),
  postcode text not null check (char_length(trim(postcode)) between 3 and 10),
  preferred_date date not null,
  preferred_time time not null,
  notes text check (char_length(notes) <= 4000),
  status public.service_booking_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references public.profiles(id) on delete restrict,
  car_id uuid references public.cars(id) on delete set null,
  seller_name text not null check (char_length(trim(seller_name)) between 1 and 160),
  seller_phone text not null check (char_length(trim(seller_phone)) between 5 and 40),
  vehicle_registration text not null check (char_length(trim(vehicle_registration)) between 2 and 16),
  inspection_address text not null check (char_length(trim(inspection_address)) between 1 and 300),
  city text not null check (char_length(trim(city)) between 1 and 100),
  postcode text not null check (char_length(trim(postcode)) between 3 and 10),
  preferred_date date,
  preferred_time time,
  status public.verification_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inspection_reports (
  id uuid primary key default gen_random_uuid(),
  verification_request_id uuid not null unique references public.verification_requests(id) on delete cascade,
  inspector_id uuid not null references public.profiles(id) on delete restrict,
  overall_result public.inspection_result not null,
  summary text not null check (char_length(trim(summary)) between 1 and 10000),
  inspector_notes text check (char_length(inspector_notes) <= 10000),
  body_condition public.condition_rating not null default 'not_checked',
  tyre_condition public.condition_rating not null default 'not_checked',
  interior_condition public.condition_rating not null default 'not_checked',
  engine_condition public.condition_rating not null default 'not_checked',
  brakes_condition public.condition_rating not null default 'not_checked',
  mileage_checked boolean not null default false,
  registration_checked boolean not null default false,
  additional_checks jsonb not null default '{}'::jsonb check (jsonb_typeof(additional_checks) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);

create table public.inspection_report_images (
  id uuid primary key default gen_random_uuid(),
  inspection_report_id uuid not null references public.inspection_reports(id) on delete cascade,
  storage_path text not null unique check (char_length(trim(storage_path)) > 0),
  caption text check (char_length(caption) <= 500),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  unique (inspection_report_id, sort_order)
);

create table public.employee_assignments (
  id uuid primary key default gen_random_uuid(),
  service_booking_id uuid references public.service_bookings(id) on delete cascade,
  verification_request_id uuid references public.verification_requests(id) on delete cascade,
  employee_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by uuid references public.profiles(id) on delete set null,
  status public.assignment_status not null default 'assigned',
  assigned_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  notes text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_assignments_exactly_one_job check (num_nonnulls(service_booking_id, verification_request_id) = 1)
);
create unique index employee_assignments_one_current_service_assignment on public.employee_assignments(service_booking_id) where status in ('assigned', 'accepted', 'in_progress');
create unique index employee_assignments_one_current_verification_assignment on public.employee_assignments(verification_request_id) where status in ('assigned', 'accepted', 'in_progress');

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  service_booking_id uuid references public.service_bookings(id) on delete restrict,
  verification_request_id uuid references public.verification_requests(id) on delete restrict,
  amount numeric(12, 2) not null check (amount >= 0),
  currency char(3) not null default 'GBP' check (currency ~ '^[A-Z]{3}$'),
  status public.payment_status not null default 'pending',
  provider public.payment_provider not null default 'manual',
  provider_reference text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  constraint payments_at_most_one_source check (num_nonnulls(service_booking_id, verification_request_id) <= 1)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 200),
  message text not null check (char_length(trim(message)) between 1 and 4000),
  type public.notification_type not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  constraint notifications_read_at_matches_state check ((is_read and read_at is not null) or (not is_read and read_at is null))
);

create index cars_seller_id_idx on public.cars(seller_id);
create index cars_status_published_at_idx on public.cars(status, published_at desc);
create index cars_make_model_idx on public.cars(make, model);
create index cars_city_idx on public.cars(city);
create index cars_price_idx on public.cars(price);
create index cars_created_at_idx on public.cars(created_at desc);
create index service_bookings_customer_id_idx on public.service_bookings(customer_id);
create index service_bookings_status_idx on public.service_bookings(status);
create index verification_requests_requested_by_idx on public.verification_requests(requested_by);
create index verification_requests_status_idx on public.verification_requests(status);
create index employee_assignments_employee_status_idx on public.employee_assignments(employee_id, status);
create index payments_user_id_idx on public.payments(user_id);
create index notifications_user_unread_idx on public.notifications(user_id, is_read, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function public.set_updated_at() from public;

create trigger profiles_set_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger cars_set_updated_at before update on public.cars for each row execute function public.set_updated_at();
create trigger service_types_set_updated_at before update on public.service_types for each row execute function public.set_updated_at();
create trigger service_bookings_set_updated_at before update on public.service_bookings for each row execute function public.set_updated_at();
create trigger verification_requests_set_updated_at before update on public.verification_requests for each row execute function public.set_updated_at();
create trigger inspection_reports_set_updated_at before update on public.inspection_reports for each row execute function public.set_updated_at();
create trigger employee_assignments_set_updated_at before update on public.employee_assignments for each row execute function public.set_updated_at();
create trigger payments_set_updated_at before update on public.payments for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.cars enable row level security;
alter table public.car_images enable row level security;
alter table public.service_types enable row level security;
alter table public.service_bookings enable row level security;
alter table public.verification_requests enable row level security;
alter table public.inspection_reports enable row level security;
alter table public.inspection_report_images enable row level security;
alter table public.employee_assignments enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;

create policy "Anyone can read active service types"
on public.service_types for select
to anon, authenticated
using (is_active = true);

insert into storage.buckets (id, name, public)
values
  ('car-images', 'car-images', true),
  ('inspection-images', 'inspection-images', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;
