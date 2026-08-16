create or replace function public.move_car_image(p_image_id uuid, p_direction text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_car_id uuid; v_order integer; v_other_id uuid; v_other_order integer;
begin
  if auth.uid() is null or p_direction not in ('up', 'down') then raise exception 'Invalid request'; end if;
  select ci.car_id, ci.sort_order into v_car_id, v_order from public.car_images ci join public.cars c on c.id = ci.car_id where ci.id = p_image_id and (c.seller_id = auth.uid() or (select private.is_admin()));
  if v_car_id is null then raise exception 'Image not found'; end if;
  select id, sort_order into v_other_id, v_other_order from public.car_images where car_id = v_car_id and (case when p_direction = 'up' then sort_order < v_order else sort_order > v_order end) order by sort_order * case when p_direction = 'up' then -1 else 1 end limit 1;
  if v_other_id is null then return; end if;
  update public.car_images set sort_order = 999999 where id = p_image_id;
  update public.car_images set sort_order = v_order where id = v_other_id;
  update public.car_images set sort_order = v_other_order where id = p_image_id;
end;
$$;
