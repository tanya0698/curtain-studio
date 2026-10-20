-- Photos customers attach to a quote request
alter table quotes add column images text[] not null default '{}';

-- Private bucket for those photos — unlike product-images this is not
-- customer-facing, so it must not be public. Reads go through
-- createSignedUrl(), which itself is gated by the select policy below.
insert into storage.buckets (id, name, public)
values ('quote-attachments', 'quote-attachments', false)
on conflict (id) do nothing;

-- Folder-scoped RLS (Supabase's standard recipe): objects are stored under
-- `${customerId}/...`, so a customer can only write into their own folder.
create policy "Customers upload own quote attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'quote-attachments'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Same folder-owner check for reads, plus the existing admin-role pattern
-- (see 001_initial_schema.sql) so admins can review attached photos too.
create policy "Customers and admins view quote attachments"
  on storage.objects for select
  using (
    bucket_id = 'quote-attachments'
    and (
      auth.uid()::text = (storage.foldername(name))[1]
      or exists (select 1 from profiles where id = auth.uid() and role = 'admin')
    )
  );
