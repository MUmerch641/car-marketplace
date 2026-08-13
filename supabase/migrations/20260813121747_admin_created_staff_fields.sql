create type public.staff_status as enum ('active', 'inactive');

alter table public.profiles
  add column employee_id text,
  add column staff_status public.staff_status not null default 'active';

create unique index profiles_employee_id_unique_idx
  on public.profiles (employee_id)
  where employee_id is not null;

drop function public.get_admin_staff_directory();
create function public.get_admin_staff_directory()
returns table (
  id uuid,
  full_name text,
  email text,
  phone text,
  employee_id text,
  role public.profile_role,
  staff_status public.staff_status,
  assignment_count bigint,
  has_active_assignments boolean
)
language sql security definer set search_path = '' stable as $$
  select p.id, p.full_name, u.email, p.phone, p.employee_id, p.role, p.staff_status,
    count(ea.id)::bigint,
    bool_or(ea.status in ('assigned','accepted','in_progress')) filter (where ea.id is not null) is true
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.employee_assignments ea on ea.employee_id = p.id
  where (select private.is_admin()) and p.role = 'inspector'
  group by p.id, p.full_name, u.email, p.phone, p.employee_id, p.role, p.staff_status
  order by p.full_name nulls last, u.email;
$$;
revoke all on function public.get_admin_staff_directory() from public;
revoke execute on function public.get_admin_staff_directory() from anon;
grant execute on function public.get_admin_staff_directory() to authenticated;
