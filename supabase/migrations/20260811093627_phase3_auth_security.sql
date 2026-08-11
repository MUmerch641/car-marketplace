create schema if not exists private;
revoke all on schema private from public;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create function private.is_inspector()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'inspector'
  );
$$;

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_inspector() from public;
revoke all on function private.handle_new_user() from public;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_inspector() to authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure private.handle_new_user();

grant usage on schema public to anon, authenticated;
grant select on public.service_types to anon, authenticated;
grant select on public.cars, public.car_images to anon, authenticated;
grant select on public.profiles, public.service_bookings, public.verification_requests, public.inspection_reports, public.inspection_report_images, public.employee_assignments, public.payments, public.notifications to authenticated;

grant insert (seller_id, make, model, variant, year, price, mileage, fuel_type, transmission, body_type, engine_size, colour, registration, registration_city, city, postcode, description) on public.cars to authenticated;
grant update (make, model, variant, year, price, mileage, fuel_type, transmission, body_type, engine_size, colour, registration, registration_city, city, postcode, description) on public.cars to authenticated;
grant insert (car_id, storage_path, sort_order, is_primary) on public.car_images to authenticated;
grant update (storage_path, sort_order, is_primary) on public.car_images to authenticated;
grant delete on public.car_images to authenticated;
grant update (full_name, phone, avatar_url) on public.profiles to authenticated;
grant insert (customer_id, service_type_id, car_make, car_model, car_registration, address_line_1, address_line_2, city, postcode, preferred_date, preferred_time, notes) on public.service_bookings to authenticated;
grant insert (requested_by, car_id, seller_name, seller_phone, vehicle_registration, inspection_address, city, postcode, preferred_date, preferred_time) on public.verification_requests to authenticated;
grant insert, update on public.inspection_reports, public.inspection_report_images, public.employee_assignments, public.payments to authenticated;
grant update (is_read, read_at) on public.notifications to authenticated;

create policy "Profiles are visible to their owner"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);
create policy "Admins can read profiles"
on public.profiles for select to authenticated
using ((select private.is_admin()));
create policy "Owners can update safe profile fields"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Public can read active cars"
on public.cars for select to anon, authenticated
using (status = 'active');
create policy "Owners can read their own cars"
on public.cars for select to authenticated
using ((select auth.uid()) = seller_id);
create policy "Admins can manage cars"
on public.cars for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy "Owners can create draft cars"
on public.cars for insert to authenticated
with check (
  (select auth.uid()) = seller_id
  and status = 'draft'
  and is_featured = false
  and is_verified = false
  and published_at is null
);
create policy "Owners can update editable cars"
on public.cars for update to authenticated
using ((select auth.uid()) = seller_id and status in ('draft', 'rejected'))
with check (
  (select auth.uid()) = seller_id
  and status in ('draft', 'rejected')
  and is_featured = false
  and is_verified = false
  and published_at is null
);

create policy "Public can read active car images"
on public.car_images for select to anon, authenticated
using (exists (select 1 from public.cars where cars.id = car_images.car_id and cars.status = 'active'));
create policy "Owners can read their car images"
on public.car_images for select to authenticated
using (exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())));
create policy "Admins can manage car images"
on public.car_images for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy "Owners can add car images"
on public.car_images for insert to authenticated
with check (exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())));
create policy "Owners can update car images"
on public.car_images for update to authenticated
using (exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())))
with check (exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())));
create policy "Owners can delete car images"
on public.car_images for delete to authenticated
using (exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())));

create policy "Customers can read their service bookings"
on public.service_bookings for select to authenticated
using ((select auth.uid()) = customer_id);
create policy "Assigned inspectors can read service bookings"
on public.service_bookings for select to authenticated
using (exists (select 1 from public.employee_assignments where employee_assignments.service_booking_id = service_bookings.id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed')));
create policy "Admins can manage service bookings"
on public.service_bookings for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy "Customers can create pending service bookings"
on public.service_bookings for insert to authenticated
with check ((select auth.uid()) = customer_id and status = 'pending');

create policy "Customers can read their verification requests"
on public.verification_requests for select to authenticated
using ((select auth.uid()) = requested_by);
create policy "Assigned inspectors can read verification requests"
on public.verification_requests for select to authenticated
using (exists (select 1 from public.employee_assignments where employee_assignments.verification_request_id = verification_requests.id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed')));
create policy "Admins can manage verification requests"
on public.verification_requests for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy "Customers can create pending verification requests"
on public.verification_requests for insert to authenticated
with check ((select auth.uid()) = requested_by and status = 'pending');

create policy "Assigned inspector can access their reports"
on public.inspection_reports for select to authenticated
using (
  inspector_id = (select auth.uid())
  and exists (select 1 from public.employee_assignments where employee_assignments.verification_request_id = inspection_reports.verification_request_id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed'))
);
create policy "Admins can manage inspection reports"
on public.inspection_reports for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy "Assigned inspector can create a report"
on public.inspection_reports for insert to authenticated
with check (
  inspector_id = (select auth.uid())
  and exists (select 1 from public.employee_assignments join public.verification_requests on verification_requests.id = employee_assignments.verification_request_id where employee_assignments.verification_request_id = inspection_reports.verification_request_id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress') and verification_requests.status in ('assigned', 'inspection_scheduled', 'inspection_in_progress'))
);
create policy "Assigned inspector can update their report"
on public.inspection_reports for update to authenticated
using (inspector_id = (select auth.uid()) and exists (select 1 from public.employee_assignments where employee_assignments.verification_request_id = inspection_reports.verification_request_id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')))
with check (inspector_id = (select auth.uid()));

create policy "Assigned inspector can access report images"
on public.inspection_report_images for select to authenticated
using (exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed')));
create policy "Admins can manage report images"
on public.inspection_report_images for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));
create policy "Assigned inspector can create report images"
on public.inspection_report_images for insert to authenticated
with check (exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')));
create policy "Assigned inspector can update report images"
on public.inspection_report_images for update to authenticated
using (exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')))
with check (exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')));

create policy "Employees can read their assignments"
on public.employee_assignments for select to authenticated
using (employee_id = (select auth.uid()));
create policy "Admins can manage assignments"
on public.employee_assignments for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Customers can read their payments"
on public.payments for select to authenticated
using (user_id = (select auth.uid()));
create policy "Admins can manage payments"
on public.payments for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Users can read their notifications"
on public.notifications for select to authenticated
using (user_id = (select auth.uid()));
create policy "Users can update their notification read state"
on public.notifications for update to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));
create policy "Admins can manage notifications"
on public.notifications for all to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Public can read car image objects"
on storage.objects for select to anon, authenticated
using (bucket_id = 'car-images');
create policy "Public can read avatar objects"
on storage.objects for select to anon, authenticated
using (bucket_id = 'avatars');
create policy "Owners can insert car image objects"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'car-images'
  and array_length(storage.foldername(name), 1) = 3
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.cars where cars.id::text = (storage.foldername(name))[2] and cars.seller_id = (select auth.uid()))
);
create policy "Owners can update car image objects"
on storage.objects for update to authenticated
using (bucket_id = 'car-images' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'car-images' and array_length(storage.foldername(name), 1) = 3 and (storage.foldername(name))[1] = (select auth.uid())::text and exists (select 1 from public.cars where cars.id::text = (storage.foldername(name))[2] and cars.seller_id = (select auth.uid())));
create policy "Owners can delete car image objects"
on storage.objects for delete to authenticated
using (bucket_id = 'car-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can insert their avatar objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'avatars' and array_length(storage.foldername(name), 1) = 2 and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can update their avatar objects"
on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and array_length(storage.foldername(name), 1) = 2 and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Users can delete their avatar objects"
on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Assigned inspectors can access inspection image objects"
on storage.objects for select to authenticated
using (bucket_id = 'inspection-images' and exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id::text = (storage.foldername(name))[2] and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed')));
create policy "Admins can access inspection image objects"
on storage.objects for all to authenticated
using (bucket_id = 'inspection-images' and (select private.is_admin()))
with check (bucket_id = 'inspection-images' and (select private.is_admin()));
create policy "Assigned inspectors can insert inspection image objects"
on storage.objects for insert to authenticated
with check (bucket_id = 'inspection-images' and array_length(storage.foldername(name), 1) = 3 and exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id::text = (storage.foldername(name))[2] and inspection_reports.verification_request_id::text = (storage.foldername(name))[1] and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')));

create index if not exists employee_assignments_verification_employee_idx on public.employee_assignments(verification_request_id, employee_id, status);
create index if not exists employee_assignments_service_employee_idx on public.employee_assignments(service_booking_id, employee_id, status);
