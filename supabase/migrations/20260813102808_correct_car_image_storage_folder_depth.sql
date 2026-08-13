-- storage.foldername() returns directories only; for
-- {user-id}/{car-id}/{filename}, it returns exactly two folders.
drop policy "Owners can insert car image objects into their car folder" on storage.objects;
drop policy "Owners and admins can read private car images" on storage.objects;
drop policy "Owners and admins can update car image objects" on storage.objects;

create policy "Owners can insert car image objects into their car folder"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'car-images'
  and array_length(storage.foldername(name), 1) = 2
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.cars
    where cars.id::text = (storage.foldername(storage.objects.name))[2]
      and cars.seller_id = (select auth.uid())
  )
);

create policy "Owners and admins can read private car images"
on storage.objects for select to authenticated
using (
  bucket_id = 'car-images'
  and (
    (select private.is_admin())
    or (
      array_length(storage.foldername(name), 1) = 2
      and (storage.foldername(name))[1] = (select auth.uid())::text
      and exists (
        select 1 from public.cars
        where cars.id::text = (storage.foldername(storage.objects.name))[2]
          and cars.seller_id = (select auth.uid())
      )
    )
  )
);

create policy "Owners and admins can update car image objects"
on storage.objects for update to authenticated
using (
  bucket_id = 'car-images'
  and (
    (select private.is_admin())
    or exists (
      select 1 from public.car_images
      join public.cars on cars.id = car_images.car_id
      where car_images.storage_path = storage.objects.name
        and cars.seller_id = (select auth.uid())
    )
  )
)
with check (
  bucket_id = 'car-images'
  and (
    (select private.is_admin())
    or (
      array_length(storage.foldername(name), 1) = 2
      and (storage.foldername(name))[1] = (select auth.uid())::text
      and exists (
        select 1 from public.cars
        where cars.id::text = (storage.foldername(storage.objects.name))[2]
          and cars.seller_id = (select auth.uid())
      )
    )
  )
);
