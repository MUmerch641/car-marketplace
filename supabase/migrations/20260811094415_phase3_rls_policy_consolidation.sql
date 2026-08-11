drop policy "Profiles are visible to their owner" on public.profiles;
grant usage on schema private to anon;
grant execute on function private.is_admin() to anon;
grant update, delete on public.service_bookings, public.verification_requests, public.inspection_reports, public.inspection_report_images, public.employee_assignments, public.payments to authenticated;

create function private.ensure_assignment_employee_is_inspector()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = new.employee_id and role = 'inspector') then
    raise exception 'Assignments can only be made to inspector profiles';
  end if;
  return new;
end;
$$;
revoke all on function private.ensure_assignment_employee_is_inspector() from public;
create trigger employee_assignments_require_inspector
  before insert or update of employee_id on public.employee_assignments
  for each row execute procedure private.ensure_assignment_employee_is_inspector();

drop policy "Admins can read profiles" on public.profiles;
create policy "Owners and admins can read profiles" on public.profiles for select to authenticated using ((select auth.uid()) = id or (select private.is_admin()));

drop policy "Public can read active cars" on public.cars;
drop policy "Owners can read their own cars" on public.cars;
drop policy "Admins can manage cars" on public.cars;
drop policy "Owners can create draft cars" on public.cars;
drop policy "Owners can update editable cars" on public.cars;
create policy "Cars can be read by public owners and admins" on public.cars for select to anon, authenticated using (status = 'active' or (select auth.uid()) = seller_id or (select private.is_admin()));
create policy "Draft cars can be created by owners or admins" on public.cars for insert to authenticated with check ((select private.is_admin()) or ((select auth.uid()) = seller_id and status = 'draft' and is_featured = false and is_verified = false and published_at is null));
create policy "Cars can be updated by owners or admins" on public.cars for update to authenticated using ((select private.is_admin()) or ((select auth.uid()) = seller_id and status in ('draft', 'rejected'))) with check ((select private.is_admin()) or ((select auth.uid()) = seller_id and status in ('draft', 'rejected') and is_featured = false and is_verified = false and published_at is null));
create policy "Only admins can delete cars" on public.cars for delete to authenticated using ((select private.is_admin()));

drop policy "Public can read active car images" on public.car_images;
drop policy "Owners can read their car images" on public.car_images;
drop policy "Admins can manage car images" on public.car_images;
drop policy "Owners can add car images" on public.car_images;
drop policy "Owners can update car images" on public.car_images;
drop policy "Owners can delete car images" on public.car_images;
create policy "Car images can be read by public owners and admins" on public.car_images for select to anon, authenticated using (exists (select 1 from public.cars where cars.id = car_images.car_id and (cars.status = 'active' or cars.seller_id = (select auth.uid()) or (select private.is_admin()))));
create policy "Car images can be inserted by owners or admins" on public.car_images for insert to authenticated with check ((select private.is_admin()) or exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())));
create policy "Car images can be updated by owners or admins" on public.car_images for update to authenticated using ((select private.is_admin()) or exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid()))) with check ((select private.is_admin()) or exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())));
create policy "Car images can be deleted by owners or admins" on public.car_images for delete to authenticated using ((select private.is_admin()) or exists (select 1 from public.cars where cars.id = car_images.car_id and cars.seller_id = (select auth.uid())));

drop policy "Customers can read their service bookings" on public.service_bookings;
drop policy "Assigned inspectors can read service bookings" on public.service_bookings;
drop policy "Admins can manage service bookings" on public.service_bookings;
drop policy "Customers can create pending service bookings" on public.service_bookings;
create policy "Service bookings can be read by participants" on public.service_bookings for select to authenticated using ((select private.is_admin()) or (select auth.uid()) = customer_id or exists (select 1 from public.employee_assignments where employee_assignments.service_booking_id = service_bookings.id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed')));
create policy "Service bookings can be created by owners or admins" on public.service_bookings for insert to authenticated with check ((select private.is_admin()) or ((select auth.uid()) = customer_id and status = 'pending'));
create policy "Only admins can update service bookings" on public.service_bookings for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Only admins can delete service bookings" on public.service_bookings for delete to authenticated using ((select private.is_admin()));

drop policy "Customers can read their verification requests" on public.verification_requests;
drop policy "Assigned inspectors can read verification requests" on public.verification_requests;
drop policy "Admins can manage verification requests" on public.verification_requests;
drop policy "Customers can create pending verification requests" on public.verification_requests;
create policy "Verification requests can be read by participants" on public.verification_requests for select to authenticated using ((select private.is_admin()) or (select auth.uid()) = requested_by or exists (select 1 from public.employee_assignments where employee_assignments.verification_request_id = verification_requests.id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed')));
create policy "Verification requests can be created by owners or admins" on public.verification_requests for insert to authenticated with check ((select private.is_admin()) or ((select auth.uid()) = requested_by and status = 'pending'));
create policy "Only admins can update verification requests" on public.verification_requests for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Only admins can delete verification requests" on public.verification_requests for delete to authenticated using ((select private.is_admin()));

drop policy "Assigned inspector can access their reports" on public.inspection_reports;
drop policy "Admins can manage inspection reports" on public.inspection_reports;
drop policy "Assigned inspector can create a report" on public.inspection_reports;
drop policy "Assigned inspector can update their report" on public.inspection_reports;
create policy "Inspection reports can be read by their inspector or admin" on public.inspection_reports for select to authenticated using ((select private.is_admin()) or (inspector_id = (select auth.uid()) and exists (select 1 from public.employee_assignments where employee_assignments.verification_request_id = inspection_reports.verification_request_id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed'))));
create policy "Inspection reports can be created by assigned inspectors or admins" on public.inspection_reports for insert to authenticated with check ((select private.is_admin()) or (inspector_id = (select auth.uid()) and exists (select 1 from public.employee_assignments join public.verification_requests on verification_requests.id = employee_assignments.verification_request_id where employee_assignments.verification_request_id = inspection_reports.verification_request_id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress') and verification_requests.status in ('assigned', 'inspection_scheduled', 'inspection_in_progress'))));
create policy "Inspection reports can be updated by their inspector or admin" on public.inspection_reports for update to authenticated using ((select private.is_admin()) or (inspector_id = (select auth.uid()) and exists (select 1 from public.employee_assignments where employee_assignments.verification_request_id = inspection_reports.verification_request_id and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')))) with check ((select private.is_admin()) or inspector_id = (select auth.uid()));
create policy "Only admins can delete inspection reports" on public.inspection_reports for delete to authenticated using ((select private.is_admin()));

drop policy "Assigned inspector can access report images" on public.inspection_report_images;
drop policy "Admins can manage report images" on public.inspection_report_images;
drop policy "Assigned inspector can create report images" on public.inspection_report_images;
drop policy "Assigned inspector can update report images" on public.inspection_report_images;
create policy "Report images can be read by their inspector or admin" on public.inspection_report_images for select to authenticated using ((select private.is_admin()) or exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress', 'completed')));
create policy "Report images can be created by assigned inspectors or admins" on public.inspection_report_images for insert to authenticated with check ((select private.is_admin()) or exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')));
create policy "Report images can be updated by assigned inspectors or admins" on public.inspection_report_images for update to authenticated using ((select private.is_admin()) or exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress'))) with check ((select private.is_admin()) or exists (select 1 from public.inspection_reports join public.employee_assignments on employee_assignments.verification_request_id = inspection_reports.verification_request_id where inspection_reports.id = inspection_report_images.inspection_report_id and inspection_reports.inspector_id = (select auth.uid()) and employee_assignments.employee_id = (select auth.uid()) and employee_assignments.status in ('assigned', 'accepted', 'in_progress')));
create policy "Only admins can delete report images" on public.inspection_report_images for delete to authenticated using ((select private.is_admin()));

drop policy "Employees can read their assignments" on public.employee_assignments;
drop policy "Admins can manage assignments" on public.employee_assignments;
create policy "Assignments can be read by employee or admin" on public.employee_assignments for select to authenticated using ((select private.is_admin()) or employee_id = (select auth.uid()));
create policy "Only admins can create assignments" on public.employee_assignments for insert to authenticated with check ((select private.is_admin()));
create policy "Only admins can update assignments" on public.employee_assignments for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Only admins can delete assignments" on public.employee_assignments for delete to authenticated using ((select private.is_admin()));

drop policy "Customers can read their payments" on public.payments;
drop policy "Admins can manage payments" on public.payments;
create policy "Payments can be read by owner or admin" on public.payments for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "Only admins can create payments" on public.payments for insert to authenticated with check ((select private.is_admin()));
create policy "Only admins can update payments" on public.payments for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Only admins can delete payments" on public.payments for delete to authenticated using ((select private.is_admin()));

drop policy "Users can read their notifications" on public.notifications;
drop policy "Users can update their notification read state" on public.notifications;
drop policy "Admins can manage notifications" on public.notifications;
create policy "Notifications can be read by owner or admin" on public.notifications for select to authenticated using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "Notifications can be updated by owner or admin" on public.notifications for update to authenticated using (user_id = (select auth.uid()) or (select private.is_admin())) with check (user_id = (select auth.uid()) or (select private.is_admin()));
create policy "Only admins can create notifications" on public.notifications for insert to authenticated with check ((select private.is_admin()));
create policy "Only admins can delete notifications" on public.notifications for delete to authenticated using ((select private.is_admin()));
