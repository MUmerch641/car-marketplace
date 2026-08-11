alter table public.cars
  add column mot_expiry date,
  add column service_history text,
  add column ulez_compliant boolean,
  add column owners_count smallint check (owners_count is null or owners_count >= 0),
  add column doors smallint check (doors is null or doors between 1 and 8),
  add column seats smallint check (seats is null or seats between 1 and 12),
  add column submitted_at timestamptz,
  add column moderated_at timestamptz,
  add column moderated_by uuid references public.profiles(id) on delete set null,
  add column rejection_reason text check (char_length(rejection_reason) <= 2000),
  add column sold_at timestamptz,
  add column archived_at timestamptz;

alter table public.cars add constraint cars_lifecycle_timestamps_check check (
  (status <> 'sold' or sold_at is not null)
  and (status <> 'archived' or archived_at is not null)
);

update storage.buckets
set public = false,
    file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id = 'car-images';

drop policy "Public can read car image objects" on storage.objects;
drop policy "Owners can insert car image objects" on storage.objects;
drop policy "Owners can update car image objects" on storage.objects;
drop policy "Owners can delete car image objects" on storage.objects;

create policy "Active car images can be signed for public viewing"
on storage.objects for select to anon, authenticated
using (bucket_id = 'car-images' and exists (select 1 from public.car_images join public.cars on cars.id = car_images.car_id where car_images.storage_path = storage.objects.name and cars.status = 'active'));
create policy "Owners and admins can read private car images"
on storage.objects for select to authenticated
using (bucket_id = 'car-images' and (select private.is_admin()) or (bucket_id = 'car-images' and exists (select 1 from public.car_images join public.cars on cars.id = car_images.car_id where car_images.storage_path = storage.objects.name and cars.seller_id = (select auth.uid()))));
create policy "Owners can insert car image objects into their car folder"
on storage.objects for insert to authenticated
with check (bucket_id = 'car-images' and array_length(storage.foldername(name), 1) = 3 and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.cars where cars.id::text = (storage.foldername(name))[2] and cars.seller_id = (select auth.uid())));
create policy "Owners and admins can update car image objects"
on storage.objects for update to authenticated
using (bucket_id = 'car-images' and ((select private.is_admin()) or exists (select 1 from public.car_images join public.cars on cars.id = car_images.car_id where car_images.storage_path = storage.objects.name and cars.seller_id = (select auth.uid()))))
with check (bucket_id = 'car-images' and ((select private.is_admin()) or (array_length(storage.foldername(name), 1) = 3 and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.cars where cars.id::text = (storage.foldername(name))[2] and cars.seller_id = (select auth.uid())))));
create policy "Owners and admins can delete car image objects"
on storage.objects for delete to authenticated
using (bucket_id = 'car-images' and ((select private.is_admin()) or exists (select 1 from public.car_images join public.cars on cars.id = car_images.car_id where car_images.storage_path = storage.objects.name and cars.seller_id = (select auth.uid()))));

grant delete on public.cars to authenticated;
drop policy "Only admins can delete cars" on public.cars;
create policy "Draft rejected cars can be deleted by owner or admin"
on public.cars for delete to authenticated
using ((select private.is_admin()) or ((select auth.uid()) = seller_id and status in ('draft', 'rejected')));

create function private.enforce_car_image_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.car_images where car_id = new.car_id) >= 12 then
    raise exception 'A listing can contain at most 12 images';
  end if;
  return new;
end;
$$;
create function private.set_car_image_primary()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.is_primary or not exists (select 1 from public.car_images where car_id = new.car_id) then
    update public.car_images set is_primary = false where car_id = new.car_id;
    new.is_primary := true;
  end if;
  return new;
end;
$$;
revoke all on function private.enforce_car_image_limit() from public;
revoke all on function private.set_car_image_primary() from public;
create trigger car_images_limit before insert on public.car_images for each row execute procedure private.enforce_car_image_limit();
create trigger car_images_primary before insert on public.car_images for each row execute procedure private.set_car_image_primary();
revoke update (is_primary) on public.car_images from authenticated;

create function public.reveal_seller_contact(p_car_id uuid)
returns table(full_name text, phone text)
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  return query select p.full_name, p.phone
  from public.cars c join public.profiles p on p.id = c.seller_id
  where c.id = p_car_id and (c.status = 'active' or c.seller_id = auth.uid() or (select private.is_admin()));
end;
$$;

create function public.submit_car_for_review(p_car_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if not exists (select 1 from public.cars where id = p_car_id and seller_id = auth.uid() and status in ('draft', 'rejected') and price >= 0 and description <> '' and city <> '' and postcode <> '') then raise exception 'Listing cannot be submitted'; end if;
  if not exists (select 1 from public.car_images where car_id = p_car_id) then raise exception 'Add at least one image before submitting'; end if;
  update public.cars set status = 'pending_review', submitted_at = now(), rejection_reason = null where id = p_car_id;
end;
$$;

create function public.mark_car_sold(p_car_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.cars set status = 'sold', sold_at = now() where id = p_car_id and seller_id = auth.uid() and status = 'active';
  if not found then raise exception 'Active owned listing not found'; end if;
end;
$$;

create function public.set_primary_car_image(p_image_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare v_car_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  select car_id into v_car_id from public.car_images where id = p_image_id;
  if v_car_id is null or not exists (select 1 from public.cars where id = v_car_id and (seller_id = auth.uid() or (select private.is_admin()))) then raise exception 'Image not found'; end if;
  update public.car_images set is_primary = false where car_id = v_car_id;
  update public.car_images set is_primary = true where id = p_image_id;
end;
$$;

create function public.moderate_car(p_car_id uuid, p_approved boolean, p_rejection_reason text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not (select private.is_admin()) then raise exception 'Admin access required'; end if;
  if p_approved then
    update public.cars set status = 'active', published_at = now(), moderated_at = now(), moderated_by = auth.uid(), rejection_reason = null where id = p_car_id and status = 'pending_review';
  else
    if nullif(trim(coalesce(p_rejection_reason, '')), '') is null then raise exception 'A rejection reason is required'; end if;
    update public.cars set status = 'rejected', moderated_at = now(), moderated_by = auth.uid(), rejection_reason = trim(p_rejection_reason) where id = p_car_id and status = 'pending_review';
  end if;
  if not found then raise exception 'Pending listing not found'; end if;
end;
$$;

revoke all on function public.reveal_seller_contact(uuid) from public;
revoke all on function public.submit_car_for_review(uuid) from public;
revoke all on function public.mark_car_sold(uuid) from public;
revoke all on function public.set_primary_car_image(uuid) from public;
revoke all on function public.moderate_car(uuid, boolean, text) from public;
grant execute on function public.reveal_seller_contact(uuid), public.submit_car_for_review(uuid), public.mark_car_sold(uuid), public.set_primary_car_image(uuid), public.moderate_car(uuid, boolean, text) to authenticated;

create index cars_active_featured_idx on public.cars(is_featured, published_at desc) where status = 'active';
create index cars_active_filters_idx on public.cars(make, fuel_type, transmission, price) where status = 'active';
create index cars_active_postcode_idx on public.cars(postcode text_pattern_ops) where status = 'active';
create index cars_retention_idx on public.cars(status, sold_at, archived_at) where status in ('sold', 'archived');
