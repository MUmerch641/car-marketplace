alter table public.service_types add column short_description text, add column estimated_duration_minutes integer check (estimated_duration_minutes is null or estimated_duration_minutes > 0);
alter table public.service_bookings add column quoted_price numeric(12,2) check (quoted_price is null or quoted_price >= 0), add column confirmed_at timestamptz, add column on_the_way_at timestamptz, add column started_at timestamptz, add column completed_at timestamptz, add column cancelled_at timestamptz, add column cancellation_reason text check (char_length(cancellation_reason) <= 1000);

grant insert, update on public.service_types to authenticated;
create policy "Admins can manage service types" on public.service_types for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create function public.create_service_booking(p_service_type_id uuid, p_car_make text, p_car_model text, p_car_registration text, p_address_line_1 text, p_address_line_2 text, p_city text, p_postcode text, p_preferred_date date, p_preferred_time time, p_notes text default null)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_price numeric;
begin
 if auth.uid() is null or p_preferred_date < current_date then raise exception 'Invalid booking request'; end if;
 select base_price into v_price from public.service_types where id=p_service_type_id and is_active;
 if v_price is null then raise exception 'Service unavailable'; end if;
 insert into public.service_bookings(customer_id,service_type_id,car_make,car_model,car_registration,address_line_1,address_line_2,city,postcode,preferred_date,preferred_time,notes,quoted_price) values(auth.uid(),trim(p_car_make),trim(p_car_model),nullif(trim(p_car_registration),''),trim(p_address_line_1),nullif(trim(p_address_line_2),''),trim(p_city),trim(p_postcode),p_preferred_date,p_preferred_time,nullif(trim(p_notes),''),v_price) returning id into v_id; return v_id;
end; $$;
create function public.cancel_own_service_booking(p_booking_id uuid, p_reason text default null) returns void language plpgsql security definer set search_path = '' as $$ begin update public.service_bookings set status='cancelled',cancelled_at=now(),cancellation_reason=nullif(trim(p_reason),'') where id=p_booking_id and customer_id=auth.uid() and status in ('pending','confirmed'); if not found then raise exception 'Booking cannot be cancelled'; end if; end; $$;
create function public.confirm_service_booking(p_booking_id uuid) returns void language plpgsql security definer set search_path = '' as $$ begin if not (select private.is_admin()) then raise exception 'Admin access required'; end if; update public.service_bookings set status='confirmed',confirmed_at=now() where id=p_booking_id and status='pending'; if not found then raise exception 'Pending booking not found'; end if; end; $$;
create function public.assign_service_worker(p_booking_id uuid,p_worker_id uuid) returns void language plpgsql security definer set search_path = '' as $$ begin if not (select private.is_admin()) then raise exception 'Admin access required'; end if; if not exists(select 1 from public.profiles where id=p_worker_id and role='inspector') then raise exception 'Worker must be an inspector profile'; end if; update public.employee_assignments set status='cancelled' where service_booking_id=p_booking_id and status in ('assigned','accepted','in_progress'); insert into public.employee_assignments(service_booking_id,employee_id,assigned_by,status) values(p_booking_id,p_worker_id,auth.uid(),'assigned'); update public.service_bookings set status='assigned' where id=p_booking_id and status in ('confirmed','assigned'); end; $$;
create function public.advance_service_booking(p_booking_id uuid,p_target public.service_booking_status) returns void language plpgsql security definer set search_path = '' as $$
begin
 if not exists(select 1 from public.employee_assignments where service_booking_id=p_booking_id and employee_id=auth.uid() and status in ('assigned','accepted','in_progress')) and not (select private.is_admin()) then raise exception 'Assigned worker required'; end if;
 if p_target='on_the_way' then update public.service_bookings set status='on_the_way',on_the_way_at=now() where id=p_booking_id and status='assigned';
 elsif p_target='in_progress' then update public.service_bookings set status='in_progress',started_at=now() where id=p_booking_id and status='on_the_way'; update public.employee_assignments set status='in_progress' where service_booking_id=p_booking_id and employee_id=auth.uid() and status in ('assigned','accepted');
 elsif p_target='completed' then update public.service_bookings set status='completed',completed_at=now() where id=p_booking_id and status='in_progress'; update public.employee_assignments set status='completed',completed_at=now() where service_booking_id=p_booking_id and employee_id=auth.uid() and status='in_progress';
 else raise exception 'Invalid transition'; end if;
 if not found then raise exception 'Invalid booking transition'; end if;
end; $$;
revoke all on function public.create_service_booking(uuid,text,text,text,text,text,text,text,date,time,text) from public;
revoke all on function public.cancel_own_service_booking(uuid,text) from public;
revoke all on function public.confirm_service_booking(uuid) from public;
revoke all on function public.assign_service_worker(uuid,uuid) from public;
revoke all on function public.advance_service_booking(uuid,public.service_booking_status) from public;
revoke execute on function public.create_service_booking(uuid,text,text,text,text,text,text,text,date,time,text),public.cancel_own_service_booking(uuid,text),public.confirm_service_booking(uuid),public.assign_service_worker(uuid,uuid),public.advance_service_booking(uuid,public.service_booking_status) from anon;
grant execute on function public.create_service_booking(uuid,text,text,text,text,text,text,text,date,time,text),public.cancel_own_service_booking(uuid,text),public.confirm_service_booking(uuid),public.assign_service_worker(uuid,uuid),public.advance_service_booking(uuid,public.service_booking_status) to authenticated;
create index service_bookings_date_status_idx on public.service_bookings(preferred_date,status);
