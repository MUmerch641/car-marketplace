-- Storage returns the newly-created object after an upload.  An owner needs
-- SELECT access to their own prospective object before its car_images metadata
-- row exists, otherwise the upload transaction is rejected by RLS.
drop policy "Owners and admins can read private car images" on storage.objects;

create policy "Owners and admins can read private car images"
on storage.objects for select to authenticated
using (
  bucket_id = 'car-images'
  and (
    (select private.is_admin())
    or (
      array_length(storage.foldername(name), 1) = 3
      and (storage.foldername(name))[1] = (select auth.uid())::text
      and exists (
        select 1
        from public.cars
        where cars.id::text = (storage.foldername(storage.objects.name))[2]
          and cars.seller_id = (select auth.uid())
      )
    )
  )
);
