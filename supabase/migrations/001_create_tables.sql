-- =============================================================================
-- Migration: 001_create_tables.sql
-- Purpose:   Create all core DevSpace tables, in dependency order.
-- Source of truth: db-schema.md (v1.2) — every table/column here traces back
--                  to a decision documented there. Do not edit column meaning
--                  here without updating db-schema.md first.
--
-- Tables (dependency order):
--   1. profiles     (extends auth.users)
--   2. categories
--   3. products      (references categories)
--   4. reviews        (references products, profiles)
--   5. orders          (references profiles)
--   6. order_items       (references orders, products)
--   7. cart_items         (references profiles, products)
-- =============================================================================

-- Safe on Supabase even if already enabled; ensures gen_random_uuid() works.
create extension if not exists pgcrypto;

-- =============================================================================
-- 1. profiles — db-schema.md § 1.1
-- =============================================================================
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  role       text not null default 'customer'
             check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Extends auth.users with application-specific user data. One-to-one with Supabase Auth users. See db-schema.md § 1.1.';
comment on column public.profiles.phone is
  'Required at checkout time; validated both client-side and server-side inside place_order().';
comment on column public.profiles.role is
  'Only ever set to admin manually via SQL — never through public signup or app UI.';

-- =============================================================================
-- 2. categories — db-schema.md § 1.2
-- =============================================================================
create table public.categories (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  slug            text not null unique,
  description     text,
  is_builder_slot boolean not null default false,
  display_order   integer not null default 0,
  icon_name       text,
  created_at      timestamptz not null default now()
);

comment on table public.categories is
  'Product categories. A subset is marked is_builder_slot = true — those appear as slots in the Desk Builder UI. See db-schema.md § 1.2.';

-- =============================================================================
-- 3. products — db-schema.md § 1.3
-- =============================================================================
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  description text,
  price       numeric(10, 2) not null check (price >= 0),
  category_id uuid not null references public.categories (id) on delete restrict,
  image_url   text not null,
  images      text[] not null default '{}',
  specs       jsonb default '{}',
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.products is
  'Core catalog table. image_url = primary image; images[] = gallery array (no separate product_images table — see db-schema.md § 2.1).';
comment on column public.products.category_id is
  'ON DELETE RESTRICT: cannot delete a category that still has products.';

-- Indexes recommended in db-schema.md § 1.3
create index products_category_id_idx on public.products (category_id);
create index products_is_active_idx on public.products (is_active);
create index products_search_idx on public.products
  using gin (to_tsvector('english', name || ' ' || coalesce(description, '')));

-- =============================================================================
-- 4. reviews — db-schema.md § 1.4
-- =============================================================================
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  rating     smallint not null check (rating between 1 and 5),
  comment    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

comment on table public.reviews is
  'One review per user per product. Editable/deletable by its author; admin can delete (not edit) any review. See db-schema.md § 1.4.';

-- Index recommended in db-schema.md § 1.4
create index reviews_product_id_idx on public.reviews (product_id);

-- =============================================================================
-- 5. orders — db-schema.md § 1.5
-- =============================================================================
create table public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles (id) on delete restrict,
  customer_name    text not null,
  customer_phone   text not null,
  status           text not null default 'pending'
                   check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  subtotal         numeric(10, 2) not null check (subtotal >= 0),
  discount_total   numeric(10, 2) not null default 0 check (discount_total >= 0),
  total_price      numeric(10, 2) not null check (total_price >= 0),
  shipping_address jsonb not null,
  payment_method   text not null default 'cod',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.orders is
  'Customer orders. Totals are snapshotted at creation — never recomputed from live product prices. See db-schema.md § 1.5.';
comment on column public.orders.customer_name is
  'Snapshot of profiles.full_name at checkout time (prefilled + possibly edited in the UI). See db-schema.md § 2.5.';
comment on column public.orders.customer_phone is
  'Snapshot of profiles.phone at checkout time; place_order() rejects the call server-side if profiles.phone is null. See db-schema.md § 2.5.';
comment on column public.orders.user_id is
  'ON DELETE RESTRICT: historical integrity. Customers are banned (auth.users.banned_until), never hard-deleted — see db-schema.md § 2.6.';
comment on column public.orders.shipping_address is
  'Structured jsonb: {full_name, phone, street, city, governorate, postal_code, notes}. Independent of customer_name/customer_phone — see db-schema.md § 2.5.';

-- Indexes recommended in db-schema.md § 1.5
create index orders_user_id_created_at_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status);

-- =============================================================================
-- 6. order_items — db-schema.md § 1.6
-- =============================================================================
create table public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid not null references public.products (id) on delete restrict,
  product_name text not null,
  quantity     integer not null default 1 check (quantity > 0),
  unit_price   numeric(10, 2) not null check (unit_price >= 0),
  bundle_id    uuid,
  created_at   timestamptz not null default now()
);

comment on table public.order_items is
  'Line items within an order. Desk Builder bundles are multiple rows sharing the same bundle_id. See db-schema.md § 1.6 / § 2.2.';
comment on column public.order_items.product_name is
  'Snapshot — preserves the name shown on this order even if the product is later renamed.';
comment on column public.order_items.unit_price is
  'Snapshot at order time — never joined from live products.price. See db-schema.md § 2.4.';
comment on column public.order_items.product_id is
  'ON DELETE RESTRICT: cannot delete a product that appears in historical order_items.';

-- Indexes recommended in db-schema.md § 1.6
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_bundle_id_idx on public.order_items (bundle_id)
  where bundle_id is not null;

-- =============================================================================
-- 7. cart_items — db-schema.md § 4 (Supplementary)
-- =============================================================================
create table public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity   integer not null default 1 check (quantity > 0),
  bundle_id  uuid,
  created_at timestamptz not null default now()
);

comment on table public.cart_items is
  'Server-side cart for logged-in users only. Guests use Zustand + localStorage; merged into this table on login. See db-schema.md § 4.';

-- NOTE: a single `unique (user_id, product_id, bundle_id)` constraint would NOT
-- reliably dedupe standalone items, because Postgres treats every NULL as
-- distinct from every other NULL in a unique constraint — two standalone rows
-- (bundle_id IS NULL) for the same product would NOT violate a plain unique
-- constraint. Two partial unique indexes instead, one per case:
create unique index cart_items_bundle_unique_idx
  on public.cart_items (user_id, product_id, bundle_id)
  where bundle_id is not null;

create unique index cart_items_standalone_unique_idx
  on public.cart_items (user_id, product_id)
  where bundle_id is null;

-- =============================================================================
-- End of 001_create_tables.sql
-- =============================================================================