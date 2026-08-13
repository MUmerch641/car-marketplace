create or replace function public.assign_verification_inspector(p_id uuid,p_inspector uuid) returns void language plpgsql security definer set search_path='' as $$ begin
  if not(select private.is_admin()) or not exists(select 1 from public.profiles where id=p_inspector and role='inspector' and staff_status='active') then raise exception 'Invalid assignment'; end if;
  if not exists(select 1 from public.verification_requests where id=p_id and status in ('confirmed','assigned')) then raise exception 'Request must be confirmed'; end if;
  update public.employee_assignments set status='cancelled' where verification_request_id=p_id and status in ('assigned','accepted','in_progress');
  insert into public.employee_assignments(verification_request_id,employee_id,assigned_by,status) values(p_id,p_inspector,auth.uid(),'assigned');
  update public.verification_requests set status='assigned' where id=p_id;
end; $$;

create or replace function public.assign_service_worker(p_booking_id uuid,p_worker_id uuid) returns void language plpgsql security definer set search_path='' as $$ begin
  if not(select private.is_admin()) then raise exception 'Admin access required'; end if;
  if not exists(select 1 from public.profiles where id=p_worker_id and role='inspector' and staff_status='active') then raise exception 'Worker must be an active inspector profile'; end if;
  update public.employee_assignments set status='cancelled' where service_booking_id=p_booking_id and status in ('assigned','accepted','in_progress');
  insert into public.employee_assignments(service_booking_id,employee_id,assigned_by,status) values(p_booking_id,p_worker_id,auth.uid(),'assigned');
  update public.service_bookings set status='assigned' where id=p_booking_id and status in ('confirmed','assigned');
end; $$;
