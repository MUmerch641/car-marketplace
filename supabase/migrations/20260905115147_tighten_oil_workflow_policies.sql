-- Keep public catalogue reads and admin writes in separate policies so each
-- operation has one clear permission path.

drop policy "Public reads active oils" on public.oil_products;
drop policy "Admins manage oils" on public.oil_products;

create policy "Oil products readable by customers and admins"
on public.oil_products
for select
to anon, authenticated
using (is_active or (select private.is_admin()));

create policy "Admins insert oils"
on public.oil_products
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins update oils"
on public.oil_products
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete oils"
on public.oil_products
for delete
to authenticated
using ((select private.is_admin()));

drop policy "Public reads verified fitments" on public.oil_fitments;
drop policy "Admins manage fitments" on public.oil_fitments;

create policy "Oil fitments readable by customers and admins"
on public.oil_fitments
for select
to anon, authenticated
using (
  (select private.is_admin())
  or (
    verified_at is not null
    and exists (
      select 1
      from public.oil_products p
      where p.id = oil_product_id
        and p.is_active
    )
  )
);

create policy "Admins insert fitments"
on public.oil_fitments
for insert
to authenticated
with check ((select private.is_admin()));

create policy "Admins update fitments"
on public.oil_fitments
for update
to authenticated
using ((select private.is_admin()))
with check ((select private.is_admin()));

create policy "Admins delete fitments"
on public.oil_fitments
for delete
to authenticated
using ((select private.is_admin()));

create index service_bookings_oil_product_idx
on public.service_bookings (oil_product_id)
where oil_product_id is not null;

create index supplier_orders_supplier_idx
on public.supplier_orders (supplier_id);

create trigger suppliers_set_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

create trigger oil_products_set_updated_at
before update on public.oil_products
for each row execute function public.set_updated_at();

create trigger oil_fitments_set_updated_at
before update on public.oil_fitments
for each row execute function public.set_updated_at();

create trigger supplier_orders_set_updated_at
before update on public.supplier_orders
for each row execute function public.set_updated_at();
