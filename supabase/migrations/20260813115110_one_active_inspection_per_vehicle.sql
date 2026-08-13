-- Existing duplicate active requests are deliberately preserved for operations.
-- The RPC below prevents any further duplicates, including concurrent submits.
create index if not exists verification_requests_active_car_idx
  on public.verification_requests (car_id)
  where car_id is not null
    and status in ('pending','confirmed','assigned','inspection_scheduled','inspection_in_progress','report_submitted');

create or replace function public.create_verification_request(
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
    -- Serialize all inspection creations for a car. The lock is transaction
    -- scoped, so two concurrent callers cannot both pass the active check.
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(p_car_id::text));

    select * into v_car from public.cars where id = p_car_id and status = 'active';
    if not found then raise exception 'This marketplace listing is not available for inspection'; end if;

    if exists (
      select 1 from public.verification_requests
      where car_id = p_car_id
        and status in ('pending','confirmed','assigned','inspection_scheduled','inspection_in_progress','report_submitted')
    ) then
      raise exception 'An inspection is already in progress for this vehicle';
    end if;

    if p_inspection_type = 'seller_pre_inspection' then
      if v_car.seller_id <> auth.uid() then raise exception 'Only the listing seller can request a seller pre-inspection'; end if;
      if exists (select 1 from public.verification_requests where car_id=p_car_id and inspection_type='seller_pre_inspection' and status='completed') then
        raise exception 'This listing already has a completed seller inspection';
      end if;
      select coalesce(nullif(trim(full_name), ''), 'Listing seller'), nullif(trim(phone), '') into v_seller_name, v_seller_phone from public.profiles where id=auth.uid();
      if coalesce(char_length(v_seller_phone), 0) < 5 then raise exception 'Add a valid contact phone number before requesting an inspection'; end if;
    elsif p_inspection_type = 'buyer_inspection' then
      if v_car.seller_id = auth.uid() then raise exception 'Listing sellers must request a seller pre-inspection'; end if;
      if exists (select 1 from public.verification_requests where car_id=p_car_id and inspection_type='seller_pre_inspection' and status='completed') then
        raise exception 'This listing already has a completed seller inspection';
      end if;
    else
      raise exception 'Invalid inspection type';
    end if;

    insert into public.verification_requests (requested_by,car_id,inspection_type,seller_name,seller_phone,vehicle_registration,inspection_address,city,postcode,preferred_date,preferred_time,notes)
    values (auth.uid(),p_car_id,p_inspection_type,case when p_inspection_type='seller_pre_inspection' then v_seller_name else 'Listing seller' end,case when p_inspection_type='seller_pre_inspection' then v_seller_phone else 'Not provided' end,coalesce(v_car.registration,nullif(trim(coalesce(p_registration,'')),'')),trim(p_address),trim(p_city),upper(trim(p_postcode)),p_preferred_date,p_preferred_time,nullif(trim(coalesce(p_notes,'')),''))
    returning id into v_id;
  else
    if p_inspection_type <> 'buyer_inspection' or trim(coalesce(p_registration,''))='' or trim(coalesce(p_seller_name,''))='' or trim(coalesce(p_seller_phone,''))='' or trim(coalesce(p_make,''))='' or trim(coalesce(p_model,''))='' then raise exception 'External vehicle details are required'; end if;
    insert into public.verification_requests (requested_by,inspection_type,seller_name,seller_phone,vehicle_registration,inspection_address,city,postcode,preferred_date,preferred_time,external_make,external_model,external_year,notes)
    values (auth.uid(),'buyer_inspection',trim(p_seller_name),trim(p_seller_phone),trim(p_registration),trim(p_address),trim(p_city),upper(trim(p_postcode)),p_preferred_date,p_preferred_time,trim(p_make),trim(p_model),p_year,nullif(trim(coalesce(p_notes,'')),'')) returning id into v_id;
  end if;
  return v_id;
end;
$$;

-- Gives public pages only availability, never request IDs, requester identity,
-- contacts, reports, staff data, or private evidence.
create function public.get_public_listing_inspection_availability(p_car_id uuid)
returns table (has_active_inspection boolean, has_completed_seller_inspection boolean)
language sql security definer set search_path = '' stable as $$
  select
    exists(select 1 from public.verification_requests v join public.cars c on c.id=v.car_id where v.car_id=p_car_id and c.status='active' and v.status in ('pending','confirmed','assigned','inspection_scheduled','inspection_in_progress','report_submitted')),
    exists(select 1 from public.verification_requests v join public.cars c on c.id=v.car_id where v.car_id=p_car_id and c.status='active' and v.inspection_type='seller_pre_inspection' and v.status='completed');
$$;
revoke all on function public.get_public_listing_inspection_availability(uuid) from public;
grant execute on function public.get_public_listing_inspection_availability(uuid) to anon, authenticated;
