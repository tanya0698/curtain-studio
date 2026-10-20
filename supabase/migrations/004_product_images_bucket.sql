-- This bucket already existed on the project curtain-studio used to share
-- with an unrelated app — created manually via the dashboard at some point,
-- undocumented anywhere in this repo. Codifying it here so a fresh project
-- (like the one this app now runs on) doesn't need that undocumented step
-- repeated by hand. Public bucket: product photos are customer-facing.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Anyone can view product images" on storage.objects;
create policy "Anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "Admins manage product images" on storage.objects;
create policy "Admins manage product images"
  on storage.objects for all
  using (
    bucket_id = 'product-images'
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
