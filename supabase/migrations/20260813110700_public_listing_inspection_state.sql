-- Safe public marketplace state only: no request identifiers, contacts, report
-- content, staff data, or private evidence URLs are exposed.
create function public.get_public_listing_inspection_state(p_car_id uuid)
returns table (
  seller_inspection_status public.verification_request_status,
  inspected_at timestamptz
)
language sql
security definer
set search_path = ''
stable
as $$
  select v.status, v.completed_at
  from public.verification_requests v
  join public.cars c on c.id = v.car_id
  where v.car_id = p_car_id
    and c.status = 'active'
    and v.inspection_type = 'seller_pre_inspection'
    and v.status <> 'cancelled'
  order by v.created_at desc
  limit 1;
$$;

revoke all on function public.get_public_listing_inspection_state(uuid) from public;
grant execute on function public.get_public_listing_inspection_state(uuid) to anon, authenticated;
