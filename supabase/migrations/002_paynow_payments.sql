-- Replace Stripe/PayPal payment_method values with Paynow sub-channels
alter table orders drop constraint if exists orders_payment_method_check;
alter table orders add constraint orders_payment_method_check
  check (payment_method in ('paynow_ecocash','paynow_onemoney','paynow_card'));

-- Repurpose the intent-id column as Paynow's own transaction reference (customer-visible)
alter table orders rename column payment_intent_id to paynow_reference;

-- Internal payment reconciliation state — holds Paynow's poll URL, which must never be
-- exposed to customers. Kept off `orders` (customers can select('*') on their own orders)
-- and put in its own admin-only table instead. Only the service-role key (Edge Functions)
-- may write to it.
create table order_payments (
  order_id uuid primary key references orders on delete cascade,
  poll_url text not null,
  last_status text,
  updated_at timestamptz not null default now()
);

alter table order_payments enable row level security;

create policy "Admins can view payment records" on order_payments for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
