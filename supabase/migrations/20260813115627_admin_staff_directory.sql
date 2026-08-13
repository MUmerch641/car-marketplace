-- Auth email is deliberately exposed only through this admin-authorised RPC.
create function public.get_admin_staff_directory()
returns table (
  id uuid,
  full_name text,
  email text,
  role public.profile_role,
  assignment_count bigint,
  has_active_assignments boolean
)
language sql
security definer
set search_path = ''
stable
as $$
  select
    p.id,
    p.full_name,
    u.email,
    p.role,
    count(ea.id)::bigint,
    bool_or(ea.status in ('assigned','accepted','in_progress')) filter (where ea.id is not null) is true
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.employee_assignments ea on ea.employee_id = p.id
  where (select private.is_admin())
    and p.role <> 'admin'
  group by p.id, p.full_name, u.email, p.role
  order by p.full_name nulls last, u.email;
$$;

revoke all on function public.get_admin_staff_directory() from public;
revoke execute on function public.get_admin_staff_directory() from anon;
grant execute on function public.get_admin_staff_directory() to authenticated;
