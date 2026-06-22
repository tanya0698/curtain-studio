-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  phone text,
  address text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Product categories
create table product_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text
);

-- Products
create table products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references product_categories on delete set null,
  name text not null,
  description text,
  starting_price numeric(10,2) not null,
  unit text not null default 'per panel',
  is_quotable boolean not null default false,
  is_purchasable boolean not null default true,
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Quotes
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references profiles on delete cascade not null,
  status text not null default 'pending'
    check (status in ('pending','quoted','accepted','rejected','completed')),
  notes text,
  admin_notes text,
  quoted_price numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Quote items
create table quote_items (
  id uuid primary key default uuid_generate_v4(),
  quote_id uuid references quotes on delete cascade not null,
  product_id uuid references products on delete set null,
  quantity integer not null default 1,
  measurements jsonb,
  fabric_choice text,
  customizations jsonb
);

-- Orders
create table orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references profiles on delete cascade not null,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','paid','in_progress','ready','delivered','cancelled')),
  total_amount numeric(10,2) not null,
  deposit_amount numeric(10,2),
  payment_method text check (payment_method in ('stripe','paypal')),
  payment_intent_id text,
  created_at timestamptz not null default now()
);

-- Order items
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders on delete cascade not null,
  product_id uuid references products on delete set null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null,
  customizations jsonb
);

-- Row Level Security
alter table profiles enable row level security;
alter table products enable row level security;
alter table product_categories enable row level security;
alter table quotes enable row level security;
alter table quote_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Profiles: users can read/update own, admins can read all
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Admins can view all profiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Products & categories: public read, admin write
create policy "Anyone can view active products" on products for select using (is_active = true);
create policy "Admins can manage products" on products for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Anyone can view categories" on product_categories for select using (true);
create policy "Admins can manage categories" on product_categories for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Quotes: customers see own, admins see all
create policy "Customers view own quotes" on quotes for select using (auth.uid() = customer_id);
create policy "Customers create quotes" on quotes for insert with check (auth.uid() = customer_id);
create policy "Customers update own quotes" on quotes for update using (auth.uid() = customer_id);
create policy "Admins manage all quotes" on quotes for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Quote items follow quote" on quote_items for select using (
  exists (select 1 from quotes where id = quote_id and customer_id = auth.uid())
);
create policy "Customers insert quote items" on quote_items for insert with check (
  exists (select 1 from quotes where id = quote_id and customer_id = auth.uid())
);
create policy "Admins manage quote items" on quote_items for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);

-- Orders: customers see own, admins see all
create policy "Customers view own orders" on orders for select using (auth.uid() = customer_id);
create policy "Customers create orders" on orders for insert with check (auth.uid() = customer_id);
create policy "Admins manage all orders" on orders for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
create policy "Order items follow order" on order_items for select using (
  exists (select 1 from orders where id = order_id and customer_id = auth.uid())
);
create policy "Customers insert order items" on order_items for insert with check (
  exists (select 1 from orders where id = order_id and customer_id = auth.uid())
);
create policy "Admins manage order items" on order_items for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
