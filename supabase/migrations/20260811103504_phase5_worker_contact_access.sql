create function public.get_assigned_service_customer_contact(p_booking_id uuid)
returns table(full_name text, phone text)
language plpgsql security definer set search_path = '' as $$
begin
 if not (select private.is_admin()) and not exists (
   select 1 from public.employee_assignments
   where service_booking_id = p_booking_id and employee_id = auth.uid() and status in ('assigned','accepted','in_progress')
 ) then raise exception 'Assigned worker access required'; end if;
 return query select p.full_name, p.phone from public.service_bookings b join public.profiles p on p.id=b.customer_id where b.id=p_booking_id;
end; $$;
revoke all on function public.get_assigned_service_customer_contact(uuid) from public;
revoke execute on function public.get_assigned_service_customer_contact(uuid) from anon;
grant execute on function public.get_assigned_service_customer_contact(uuid) to authenticated;
