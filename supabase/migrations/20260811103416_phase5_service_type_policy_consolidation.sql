drop policy "Admins can manage service types" on public.service_types;
drop policy "Anyone can read active service types" on public.service_types;

create policy "Public can read active service types" on public.service_types for select to public using (is_active or (select private.is_admin()));
create policy "Admins can create service types" on public.service_types for insert to authenticated with check ((select private.is_admin()));
create policy "Admins can update service types" on public.service_types for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "Admins can delete service types" on public.service_types for delete to authenticated using ((select private.is_admin()));
