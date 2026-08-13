-- A seller pre-inspection is the only inspection that may create public trust status.
-- Legacy requests pre-date seller requests (the previous RPC rejected a listing owner),
-- so they are deliberately classified as buyer inspections.
create type public.inspection_type as enum ('seller_pre_inspection', 'buyer_inspection');

alter table public.verification_requests
  add column inspection_type public.inspection_type;

update public.verification_requests
set inspection_type = 'buyer_inspection'
where inspection_type is null;

alter table public.verification_requests
  alter column inspection_type set not null,
  alter column inspection_type set default 'buyer_inspection';

create index verification_requests_car_type_status_idx
  on public.verification_requests (car_id, inspection_type, status)
  where car_id is not null;

-- A historic buyer inspection must never become a public seller-inspection claim.
update public.cars c
set is_verified = false,
    verified_at = null,
    verified_verification_request_id = null
from public.verification_requests v
where c.verified_verification_request_id = v.id
  and v.inspection_type = 'buyer_inspection';

drop function public.create_verification_request(uuid,text,text,text,integer,text,text,text,text,text,date,time,text);

create function public.create_verification_request(
  p_car_id uuid,
  p_registration text,
  p_make text,
  p_model text,
  p_year integer,
  p_seller_name text,
  p_seller_phone text,
  p_address text,
  p_city text,
  p_postcode text,
  p_preferred_date date,
  p_preferred_time time,
  p_inspection_type public.inspection_type,
  p_notes text default null
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_car public.cars%rowtype;
  v_seller_name text;
  v_seller_phone text;
begin
  if auth.uid() is null
     or p_preferred_date < current_date
     or trim(coalesce(p_address, '')) = ''
     or trim(coalesce(p_city, '')) = ''
     or trim(coalesce(p_postcode, '')) !~* '^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$'
  then
    raise exception 'Invalid verification request';
  end if;

  if p_car_id is not null then
    select * into v_car
    from public.cars
    where id = p_car_id and status = 'active';

    if not found then
      raise exception 'This marketplace listing is not available for inspection';
    end if;

    if p_inspection_type = 'seller_pre_inspection' then
      if v_car.seller_id <> auth.uid() then
        raise exception 'Only the listing seller can request a seller pre-inspection';
      end if;

      if exists (
        select 1 from public.verification_requests
        where car_id = p_car_id
          and inspection_type = 'seller_pre_inspection'
          and status <> 'cancelled'
      ) then
        raise exception 'A seller inspection already exists for this listing';
      end if;

      select coalesce(nullif(trim(full_name), ''), 'Listing seller'), nullif(trim(phone), '')
        into v_seller_name, v_seller_phone
      from public.profiles
      where id = auth.uid();

      if coalesce(char_length(v_seller_phone), 0) < 5 then
        raise exception 'Add a valid contact phone number before requesting an inspection';
      end if;
    elsif p_inspection_type = 'buyer_inspection' then
      if v_car.seller_id = auth.uid() then
        raise exception 'Listing sellers must request a seller pre-inspection';
      end if;

      if exists (
        select 1 from public.verification_requests
        where car_id = p_car_id
          and inspection_type = 'seller_pre_inspection'
          and status in ('pending','confirmed','assigned','inspection_scheduled','inspection_in_progress','report_submitted','completed')
      ) then
        raise exception 'A seller inspection is already in progress or completed for this listing';
      end if;

      if exists (
        select 1 from public.verification_requests
        where car_id = p_car_id
          and requested_by = auth.uid()
          and inspection_type = 'buyer_inspection'
          and status in ('pending','confirmed','assigned','inspection_scheduled','inspection_in_progress','report_submitted')
      ) then
        raise exception 'You already have an active inspection request for this vehicle';
      end if;
    else
      raise exception 'Invalid inspection type';
    end if;

    insert into public.verification_requests (
      requested_by, car_id, inspection_type, seller_name, seller_phone,
      vehicle_registration, inspection_address, city, postcode,
      preferred_date, preferred_time, notes
    ) values (
      auth.uid(), p_car_id, p_inspection_type,
      case when p_inspection_type = 'seller_pre_inspection' then v_seller_name else 'Listing seller' end,
      case when p_inspection_type = 'seller_pre_inspection' then v_seller_phone else 'Not provided' end,
      coalesce(v_car.registration, nullif(trim(coalesce(p_registration, '')), '')),
      trim(p_address), trim(p_city), upper(trim(p_postcode)),
      p_preferred_date, p_preferred_time, nullif(trim(coalesce(p_notes, '')), '')
    ) returning id into v_id;
  else
    if p_inspection_type <> 'buyer_inspection'
       or trim(coalesce(p_registration, '')) = ''
       or trim(coalesce(p_seller_name, '')) = ''
       or trim(coalesce(p_seller_phone, '')) = ''
       or trim(coalesce(p_make, '')) = ''
       or trim(coalesce(p_model, '')) = ''
    then
      raise exception 'External vehicle details are required';
    end if;

    insert into public.verification_requests (
      requested_by, inspection_type, seller_name, seller_phone,
      vehicle_registration, inspection_address, city, postcode,
      preferred_date, preferred_time, external_make, external_model,
      external_year, notes
    ) values (
      auth.uid(), 'buyer_inspection', trim(p_seller_name), trim(p_seller_phone),
      trim(p_registration), trim(p_address), trim(p_city), upper(trim(p_postcode)),
      p_preferred_date, p_preferred_time, trim(p_make), trim(p_model), p_year,
      nullif(trim(coalesce(p_notes, '')), '')
    ) returning id into v_id;
  end if;

  return v_id;
end;
$$;

create or replace function public.finalise_verification(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_car uuid;
  v_type public.inspection_type;
begin
  if not (select private.is_admin()) then
    raise exception 'Admin access required';
  end if;

  select car_id, inspection_type into v_car, v_type
  from public.verification_requests
  where id = p_id and status = 'report_submitted';

  if not found or not exists (
    select 1 from public.inspection_reports
    where verification_request_id = p_id and submitted_at is not null
  ) then
    raise exception 'Submitted report required';
  end if;

  update public.verification_requests
  set status = 'completed', completed_at = now()
  where id = p_id;

  update public.employee_assignments
  set status = 'completed', completed_at = now()
  where verification_request_id = p_id and status = 'in_progress';

  if v_car is not null and v_type = 'seller_pre_inspection' then
    update public.cars
    set is_verified = true,
        verified_at = now(),
        verified_verification_request_id = p_id
    where id = v_car and status = 'active';
  end if;
end;
$$;

revoke all on function public.create_verification_request(uuid,text,text,text,integer,text,text,text,text,text,date,time,public.inspection_type,text) from public;
grant execute on function public.create_verification_request(uuid,text,text,text,integer,text,text,text,text,text,date,time,public.inspection_type,text) to authenticated;
revoke execute on function public.create_verification_request(uuid,text,text,text,integer,text,text,text,text,text,date,time,public.inspection_type,text) from anon;
