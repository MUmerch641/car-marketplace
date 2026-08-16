create or replace function public.create_service_booking(p_service_type_id uuid, p_car_make text, p_car_model text, p_car_registration text, p_address_line_1 text, p_address_line_2 text, p_city text, p_postcode text, p_preferred_date date, p_preferred_time time, p_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_price numeric;
begin
 if auth.uid() is null or p_preferred_date < current_date or trim(p_car_make) = '' or trim(p_car_model) = '' or trim(p_address_line_1) = '' or trim(p_city) = '' or trim(p_postcode) !~* '^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$' then raise exception 'Invalid booking request'; end if;
 select base_price into v_price from public.service_types where id=p_service_type_id and is_active;
 if v_price is null then raise exception 'Service unavailable'; end if;
 insert into public.service_bookings(customer_id,service_type_id,car_make,car_model,car_registration,address_line_1,address_line_2,city,postcode,preferred_date,preferred_time,notes,quoted_price) values(auth.uid(),p_service_type_id,trim(p_car_make),trim(p_car_model),nullif(trim(p_car_registration),''),trim(p_address_line_1),nullif(trim(p_address_line_2),''),trim(p_city),upper(trim(p_postcode)),p_preferred_date,p_preferred_time,nullif(trim(p_notes),''),v_price) returning id into v_id; return v_id;
end; $$;

create or replace function public.assign_service_worker(p_booking_id uuid,p_worker_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare v_status public.service_booking_status;
begin
 if not (select private.is_admin()) then raise exception 'Admin access required'; end if;
 select status into v_status from public.service_bookings where id=p_booking_id for update;
 if v_status not in ('confirmed','assigned') then raise exception 'Booking must be confirmed before assignment'; end if;
 if not exists(select 1 from public.profiles where id=p_worker_id and role='inspector') then raise exception 'Worker must be an inspector profile'; end if;
 update public.employee_assignments set status='cancelled' where service_booking_id=p_booking_id and status in ('assigned','accepted','in_progress');
 insert into public.employee_assignments(service_booking_id,employee_id,assigned_by,status) values(p_booking_id,p_worker_id,auth.uid(),'assigned');
 update public.service_bookings set status='assigned' where id=p_booking_id;
end; $$;

create or replace function public.advance_service_booking(p_booking_id uuid,p_target public.service_booking_status) returns void language plpgsql security definer set search_path = '' as $$
begin
 if not (select private.is_admin()) and not exists(select 1 from public.employee_assignments where service_booking_id=p_booking_id and employee_id=auth.uid() and status in ('assigned','accepted','in_progress')) then raise exception 'Assigned worker required'; end if;
 if p_target='on_the_way' then
   update public.service_bookings set status='on_the_way',on_the_way_at=now() where id=p_booking_id and status='assigned';
 elsif p_target='in_progress' then
   update public.service_bookings set status='in_progress',started_at=now() where id=p_booking_id and status='on_the_way';
 elsif p_target='completed' then
   update public.service_bookings set status='completed',completed_at=now() where id=p_booking_id and status='in_progress';
 else raise exception 'Invalid transition'; end if;
 if not found then raise exception 'Invalid booking transition'; end if;
 if p_target='in_progress' then update public.employee_assignments set status='in_progress' where service_booking_id=p_booking_id and status in ('assigned','accepted'); end if;
 if p_target='completed' then update public.employee_assignments set status='completed',completed_at=now() where service_booking_id=p_booking_id and status='in_progress'; end if;
end; $$;

create function public.cancel_service_booking_as_admin(p_booking_id uuid, p_reason text default null) returns void language plpgsql security definer set search_path = '' as $$
begin
 if not (select private.is_admin()) then raise exception 'Admin access required'; end if;
 update public.service_bookings set status='cancelled',cancelled_at=now(),cancellation_reason=nullif(trim(p_reason),'') where id=p_booking_id and status in ('pending','confirmed','assigned');
 if not found then raise exception 'Booking cannot be cancelled'; end if;
 update public.employee_assignments set status='cancelled' where service_booking_id=p_booking_id and status in ('assigned','accepted');
end; $$;

revoke all on function public.cancel_service_booking_as_admin(uuid,text) from public;
revoke execute on function public.cancel_service_booking_as_admin(uuid,text) from anon;
grant execute on function public.cancel_service_booking_as_admin(uuid,text) to authenticated;
