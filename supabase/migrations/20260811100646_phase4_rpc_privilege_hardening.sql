revoke execute on function public.reveal_seller_contact(uuid) from anon;
revoke execute on function public.submit_car_for_review(uuid) from anon;
revoke execute on function public.mark_car_sold(uuid) from anon;
revoke execute on function public.set_primary_car_image(uuid) from anon;
revoke execute on function public.moderate_car(uuid, boolean, text) from anon;
