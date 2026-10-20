-- Fix: every "is this caller an admin?" policy checked
-- `exists (select 1 from profiles where id = auth.uid() and role = 'admin')`.
-- That subquery reads from `profiles`, which is itself subject to RLS —
-- including this exact policy when it's the one defined ON `profiles`
-- ("Admins can view all profiles"). Evaluating that policy requires
-- re-evaluating it, forever: Postgres error 42P17, infinite recursion.
-- This broke the ENTIRE app for real (anon-key/RLS-enforced) traffic —
-- every query that touched profiles, products, quotes, or orders — but
-- was never caught earlier because all prior testing this project went
-- through the Management API / service-role, which bypasses RLS entirely.
--
-- Standard fix: a SECURITY DEFINER function. Functions owned by the
-- migration-running role (which has BYPASSRLS in Supabase) skip RLS on
-- their own internal queries, so this can safely read `profiles` without
-- re-triggering `profiles`' own policies.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- profiles (the actual recursion — this one queries the table it's defined on)
drop policy if exists "Admins can view all profiles" on profiles;
create policy "Admins can view all profiles" on profiles for select using (is_admin());

-- products & categories
drop policy if exists "Admins can manage products" on products;
create policy "Admins can manage products" on products for all using (is_admin());
drop policy if exists "Admins can manage categories" on product_categories;
create policy "Admins can manage categories" on product_categories for all using (is_admin());

-- quotes
drop policy if exists "Admins manage all quotes" on quotes;
create policy "Admins manage all quotes" on quotes for all using (is_admin());
drop policy if exists "Admins manage quote items" on quote_items;
create policy "Admins manage quote items" on quote_items for all using (is_admin());

-- orders
drop policy if exists "Admins manage all orders" on orders;
create policy "Admins manage all orders" on orders for all using (is_admin());
drop policy if exists "Admins manage order items" on order_items;
create policy "Admins manage order items" on order_items for all using (is_admin());

-- order_payments (from 002_paynow_payments.sql — same pattern)
drop policy if exists "Admins can view payment records" on order_payments;
create policy "Admins can view payment records" on order_payments for select using (is_admin());

-- storage (quote-attachments, product-images — both had the same pattern)
drop policy if exists "Customers and admins view quote attachments" on storage.objects;
create policy "Customers and admins view quote attachments"
  on storage.objects for select
  using (
    bucket_id = 'quote-attachments'
    and (auth.uid()::text = (storage.foldername(name))[1] or is_admin())
  );

drop policy if exists "Admins manage product images" on storage.objects;
create policy "Admins manage product images"
  on storage.objects for all
  using (bucket_id = 'product-images' and is_admin());
