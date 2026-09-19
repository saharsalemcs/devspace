# DevSpace — Database Schema

**Version:** 1.2 (MVP)
**Document Type:** Data Model & Business Rules
**Database:** PostgreSQL (via Supabase)
**Last Updated:** September 19, 2026

**Changelog (v1.1 → v1.2):**

- `reviews`: added `updated_at` column + applied the `set_updated_at` trigger — needed now that a customer can edit their own review (see `project-spec.md` § 4.5 / § 3, `task-breakdown.md` § 2.4)
- `orders`: added `customer_name` + `customer_phone` (snapshotted from `profiles` at checkout — see [2.5](#25-checkout-snapshot-customer_name--customer_phone))
- Account deactivation strategy clarified: **Ban** via Supabase Auth (`auth.users.banned_until`), not hard delete — no schema change needed, avoids the `auth.users → profiles → orders` delete conflict
- `reviews`: confirmed `UNIQUE(product_id, user_id)` as the final rule — **no** verified-purchase requirement in MVP
- `place_order` RPC: now fetches + validates `profiles.phone` server-side before snapshotting (closes the "client-only validation" gap)
- Removed all executable SQL blocks from this document — Section 3 now describes trigger/function _behavior and purpose_ only, with a pointer to the future `supabase/migrations/*.sql` files that will hold the real code. This file is documentation; migrations are code.

---

## Table of Contents

- [DevSpace — Database Schema](#devspace--database-schema)
  - [Table of Contents](#table-of-contents)
  - [Conventions](#conventions)
  - [Entity Relationship Overview](#entity-relationship-overview)
  - [1. Data Model Architecture](#1-data-model-architecture)
    - [1.1 `profiles`](#11-profiles)
    - [1.2 `categories`](#12-categories)
    - [1.3 `products`](#13-products)
    - [1.4 `reviews`](#14-reviews)
    - [1.5 `orders`](#15-orders)
    - [1.6 `order_items`](#16-order_items)
  - [2. Key Data Structures \& Business Rules](#2-key-data-structures--business-rules)
    - [2.1 Product Images: `image_url` + `images text[]`](#21-product-images-image_url--images-text)
    - [2.2 Bundle Grouping via `bundle_id`](#22-bundle-grouping-via-bundle_id)
    - [2.3 Order Status Lifecycle](#23-order-status-lifecycle)
    - [2.4 Price Snapshots in `order_items`](#24-price-snapshots-in-order_items)
    - [2.5 Checkout Snapshot: `customer_name` + `customer_phone`](#25-checkout-snapshot-customer_name--customer_phone)
    - [2.6 Account Deactivation: Ban, Not Delete](#26-account-deactivation-ban-not-delete)
  - [3. Triggers \& RPC Concepts](#3-triggers--rpc-concepts)
    - [3.1 Trigger: `on_auth_user_created`](#31-trigger-on_auth_user_created)
    - [3.2 Trigger: `set_updated_at`](#32-trigger-set_updated_at)
    - [3.3 RPC: `calculate_bundle_total`](#33-rpc-calculate_bundle_total)
    - [3.4 RPC: `place_order`](#34-rpc-place_order)
    - [3.5 View / Function: `product_rating_stats` (Optional but Useful)](#35-view--function-product_rating_stats-optional-but-useful)
  - [4. Supplementary: `cart_items`](#4-supplementary-cart_items)
  - [What's Next](#whats-next)

---

## Conventions

Applied consistently across all tables:

| Convention          | Rule                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Primary Keys**    | `uuid` with `DEFAULT gen_random_uuid()` (except `profiles.id` which mirrors `auth.users.id`)                                |
| **Timestamps**      | `timestamptz` with `DEFAULT now()`; both `created_at` and `updated_at` where mutable                                        |
| **Monetary Values** | `numeric(10, 2)` — never `float`/`real` (precision matters for money)                                                       |
| **Currency**        | All prices in **EGP** — no per-row currency column in MVP                                                                   |
| **Deletes**         | Prefer `ON DELETE CASCADE` for child rows, `ON DELETE RESTRICT` where historical integrity matters (e.g., `orders.user_id`) |
| **Naming**          | `snake_case` for columns; plural for tables; `_id` suffix for foreign keys                                                  |
| **Booleans**        | Always `NOT NULL DEFAULT false` (or `true`) — never nullable                                                                |

---

## Entity Relationship Overview

```
auth.users (Supabase-managed)
    │
    │ 1:1
    ▼
profiles ─────────────────────────────────┐
    │ 1:N                                 │ 1:N
    ▼                                     ▼
reviews ──── N:1 ──── products ── N:1 ── categories
                          │
                          │ 1:N (via order_items)
                          │
orders ── 1:N ── order_items
                     │
                     │ N:1 (self-grouping via bundle_id)
                     └── bundle_id (nullable, groups items from same Desk Build)
```

---

## 1. Data Model Architecture

### 1.1 `profiles`

Extends `auth.users` with application-specific user data. One-to-one relationship with Supabase Auth users.

| Column       | Type          | Constraints                                                | Default      | Notes                                                |
| ------------ | ------------- | ---------------------------------------------------------- | ------------ | ---------------------------------------------------- |
| `id`         | `uuid`        | PRIMARY KEY, REFERENCES `auth.users(id)` ON DELETE CASCADE | —            | Mirrors auth.users.id                                |
| `full_name`  | `text`        | —                                                          | `NULL`       | Optional, filled from profile page                   |
| `phone`      | `text`        | —                                                          | `NULL`       | Required at checkout time (validated client-side)    |
| `role`       | `text`        | NOT NULL, CHECK (`role IN ('customer','admin')`)           | `'customer'` | Only Admin can be set to `'admin'` (via SQL, not UI) |
| `created_at` | `timestamptz` | NOT NULL                                                   | `now()`      | —                                                    |
| `updated_at` | `timestamptz` | NOT NULL                                                   | `now()`      | Auto-updated via trigger                             |

---

### 1.2 `categories`

Product categories. A subset is marked as Desk Builder slots (`is_builder_slot = true`) — those are the 5–8 fixed slots that appear in the Builder UI.

| Column            | Type          | Constraints      | Default             | Notes                                          |
| ----------------- | ------------- | ---------------- | ------------------- | ---------------------------------------------- |
| `id`              | `uuid`        | PRIMARY KEY      | `gen_random_uuid()` | —                                              |
| `name`            | `text`        | NOT NULL         | —                   | Display name (e.g., "Mechanical Keyboards")    |
| `slug`            | `text`        | NOT NULL, UNIQUE | —                   | URL-safe (e.g., `mechanical-keyboards`)        |
| `description`     | `text`        | —                | `NULL`              | Optional intro shown on category pages         |
| `is_builder_slot` | `boolean`     | NOT NULL         | `false`             | If `true`, appears as a slot in Desk Builder   |
| `display_order`   | `integer`     | NOT NULL         | `0`                 | Controls ordering in navigation & Builder      |
| `icon_name`       | `text`        | —                | `NULL`              | Optional Lucide icon name for the Builder slot |
| `created_at`      | `timestamptz` | NOT NULL         | `now()`             | —                                              |

---

### 1.3 `products`

The core catalog table. Includes a **primary image** for card/thumbnail display and a **gallery array** for the detail page.

| Column        | Type            | Constraints                                              | Default             | Notes                                                                           |
| ------------- | --------------- | -------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------- |
| `id`          | `uuid`          | PRIMARY KEY                                              | `gen_random_uuid()` | —                                                                               |
| `name`        | `text`          | NOT NULL                                                 | —                   | Display name                                                                    |
| `slug`        | `text`          | NOT NULL, UNIQUE                                         | —                   | URL segment for `/products/[slug]`                                              |
| `description` | `text`          | —                                                        | `NULL`              | Long-form description (markdown-safe)                                           |
| `price`       | `numeric(10,2)` | NOT NULL, CHECK (`price >= 0`)                           | —                   | In EGP                                                                          |
| `category_id` | `uuid`          | NOT NULL, REFERENCES `categories(id)` ON DELETE RESTRICT | —                   | Cannot delete a category with products                                          |
| `image_url`   | `text`          | NOT NULL                                                 | —                   | **Primary image** — shown in cards & thumbnails                                 |
| `images`      | `text[]`        | NOT NULL                                                 | `'{}'`              | **Gallery** — additional images for detail page                                 |
| `specs`       | `jsonb`         | —                                                        | `'{}'`              | Free-form key/value specs (e.g., `{"switch":"Cherry MX Brown","layout":"75%"}`) |
| `is_active`   | `boolean`       | NOT NULL                                                 | `true`              | Soft-hide from storefront when `false`                                          |
| `created_at`  | `timestamptz`   | NOT NULL                                                 | `now()`             | —                                                                               |
| `updated_at`  | `timestamptz`   | NOT NULL                                                 | `now()`             | Auto-updated via trigger                                                        |

**Indexes recommended:**

- `products(category_id)` — for category filtering
- `products(is_active)` — for storefront queries
- `products USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')))` — for full-text search

---

### 1.4 `reviews`

Product reviews. One review per user per product (enforced by a unique constraint). Editable by their author (see § 2.6 / § 3.2).

| Column       | Type          | Constraints                                           | Default             | Notes                                   |
| ------------ | ------------- | ----------------------------------------------------- | ------------------- | --------------------------------------- |
| `id`         | `uuid`        | PRIMARY KEY                                           | `gen_random_uuid()` | —                                       |
| `product_id` | `uuid`        | NOT NULL, REFERENCES `products(id)` ON DELETE CASCADE | —                   | Delete product → delete its reviews     |
| `user_id`    | `uuid`        | NOT NULL, REFERENCES `profiles(id)` ON DELETE CASCADE | —                   | —                                       |
| `rating`     | `smallint`    | NOT NULL, CHECK (`rating BETWEEN 1 AND 5`)            | —                   | 1–5 stars                               |
| `comment`    | `text`        | —                                                     | `NULL`              | Optional                                |
| `created_at` | `timestamptz` | NOT NULL                                              | `now()`             | —                                       |
| `updated_at` | `timestamptz` | NOT NULL                                              | `now()`             | Auto-updated via trigger on author edit |
|              |               | UNIQUE (`product_id`, `user_id`)                      |                     | One review per user per product         |

**Indexes recommended:**

- `reviews(product_id)` — for aggregating on product pages

---

### 1.5 `orders`

Customer orders. Totals are **snapshotted** at creation time — never recomputed by joining live product prices.

| Column             | Type            | Constraints                                                                              | Default             | Notes                                                                                                                  |
| ------------------ | --------------- | ---------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `id`               | `uuid`          | PRIMARY KEY                                                                              | `gen_random_uuid()` | —                                                                                                                      |
| `user_id`          | `uuid`          | NOT NULL, REFERENCES `profiles(id)` ON DELETE RESTRICT                                   | —                   | Cannot delete a user with orders                                                                                       |
| `customer_name`    | `text`          | NOT NULL                                                                                 | —                   | **Snapshot** of `profiles.full_name` at checkout time — see [2.5](#25-checkout-snapshot-customer_name--customer_phone) |
| `customer_phone`   | `text`          | NOT NULL                                                                                 | —                   | **Snapshot** of `profiles.phone` at checkout time — see [2.5](#25-checkout-snapshot-customer_name--customer_phone)     |
| `status`           | `text`          | NOT NULL, CHECK (`status IN ('pending','processing','shipped','delivered','cancelled')`) | `'pending'`         | Lifecycle managed by Admin                                                                                             |
| `subtotal`         | `numeric(10,2)` | NOT NULL, CHECK (`subtotal >= 0`)                                                        | —                   | Sum of `order_items.unit_price * quantity` before discounts                                                            |
| `discount_total`   | `numeric(10,2)` | NOT NULL, CHECK (`discount_total >= 0`)                                                  | `0`                 | Total bundle discounts applied                                                                                         |
| `total_price`      | `numeric(10,2)` | NOT NULL, CHECK (`total_price >= 0`)                                                     | —                   | Final amount = `subtotal - discount_total`                                                                             |
| `shipping_address` | `jsonb`         | NOT NULL                                                                                 | —                   | Structured: `{full_name, phone, street, city, governorate, postal_code, notes}`                                        |
| `payment_method`   | `text`          | NOT NULL                                                                                 | `'cod'`             | `'cod'` in MVP; ready for future gateways                                                                              |
| `created_at`       | `timestamptz`   | NOT NULL                                                                                 | `now()`             | —                                                                                                                      |
| `updated_at`       | `timestamptz`   | NOT NULL                                                                                 | `now()`             | Auto-updated on status change                                                                                          |

**Indexes recommended:**

- `orders(user_id, created_at DESC)` — for order history queries
- `orders(status)` — for admin filtering

---

### 1.6 `order_items`

Line items within an order. Bundles from the Desk Builder are represented as **multiple rows sharing a `bundle_id`**.

| Column         | Type            | Constraints                                            | Default             | Notes                                                                                             |
| -------------- | --------------- | ------------------------------------------------------ | ------------------- | ------------------------------------------------------------------------------------------------- |
| `id`           | `uuid`          | PRIMARY KEY                                            | `gen_random_uuid()` | —                                                                                                 |
| `order_id`     | `uuid`          | NOT NULL, REFERENCES `orders(id)` ON DELETE CASCADE    | —                   | Delete order → delete its items                                                                   |
| `product_id`   | `uuid`          | NOT NULL, REFERENCES `products(id)` ON DELETE RESTRICT | —                   | Cannot delete a product with historical orders                                                    |
| `product_name` | `text`          | NOT NULL                                               | —                   | **Snapshot** — preserves name if product is later renamed                                         |
| `quantity`     | `integer`       | NOT NULL, CHECK (`quantity > 0`)                       | `1`                 | —                                                                                                 |
| `unit_price`   | `numeric(10,2)` | NOT NULL, CHECK (`unit_price >= 0`)                    | —                   | **Snapshot** at order time — never joined from live `products.price`                              |
| `bundle_id`    | `uuid`          | —                                                      | `NULL`              | If set, this item belongs to a Desk Builder bundle. All items in the same bundle share this UUID. |
| `created_at`   | `timestamptz`   | NOT NULL                                               | `now()`             | —                                                                                                 |

**Indexes recommended:**

- `order_items(order_id)` — always fetched with parent order
- `order_items(bundle_id) WHERE bundle_id IS NOT NULL` — partial index for bundle grouping

---

## 2. Key Data Structures & Business Rules

### 2.1 Product Images: `image_url` + `images text[]`

**Why two columns instead of a separate `product_images` table?**
The MVP only needs image URLs — no per-image captions, alt text, or complex ordering. A separate table would add join overhead for zero real benefit at this scale.

**Rules:**

- `image_url` is the **primary image**. Required. Shown in:
  - Product cards on the listing page
  - Cart line items
  - Order history
  - Desk Builder slot previews
- `images` is the **gallery**. Ordered array (index = display order). Shown in:
  - Product Details page (below the main image, as thumbnails)
- The primary image is **not** duplicated in `images` — the gallery renders `[image_url, ...images]` client-side.
- All URLs point to Supabase Storage (bucket: `product-images`) with public read access.

**Validation (Zod, before insert):**

- `image_url` must be a valid HTTPS URL under the Supabase Storage domain
- `images` array length ≤ 8 (soft limit for MVP)

---

### 2.2 Bundle Grouping via `bundle_id`

**How Desk Builder items reach the cart & order:**

When a user clicks "Add Bundle to Cart" in the Desk Builder:

1. Client generates a `bundle_id` (`crypto.randomUUID()`)
2. Each selected component becomes a **separate line item** in the cart with that shared `bundle_id`
3. At checkout, those `bundle_id` values pass through untouched into `order_items`

**Why separate rows instead of one composite row?**

- Simpler reporting (per-product sales metrics stay accurate)
- Easier partial refunds/cancellations in the future
- Product-level analytics don't need special "bundle unpacking" logic
- The relationship stays visual (grouped in UI) rather than schema-locked

**Rendering rules:**

- **Cart page:** items with the same `bundle_id` are grouped visually under a "Desk Build" header showing the bundle subtotal + discount line
- **Order details page:** same grouping, plus a "Bundle" badge on each item
- Items with `bundle_id IS NULL` are standalone products — rendered normally

**Discount rule:**

- 5% discount applies **per bundle** when that bundle contains **3 or more items** (counted by rows sharing the same `bundle_id`, ignoring `quantity`)
- Calculated **server-side only** — see [Section 3.3](#33-rpc-calculate_bundle_total)

---

### 2.3 Order Status Lifecycle

```
pending  ──► processing  ──► shipped  ──► delivered
   │
   └───────────────► cancelled  (admin or system)
```

**Rules:**

- New orders always start at `pending`
- Only Admin can transition status
- `cancelled` is a terminal state (no going back)
- The `updated_at` trigger fires on every status change, giving an audit trail of "last touched"

---

### 2.4 Price Snapshots in `order_items`

`order_items.unit_price` and `order_items.product_name` are **frozen at checkout** and never joined from the live `products` table. This ensures:

- Historical accuracy — if a product's price changes tomorrow, past orders still show what the customer actually paid
- Deletability — a product can be deactivated without corrupting order history
- Auditability — receipts and invoices reproduce identically forever

The trade-off: if a product image URL rotates, order history may show a broken image. Acceptable for MVP; can be addressed later by adding `image_url` snapshot to `order_items` if needed.

---

### 2.5 Checkout Snapshot: `customer_name` + `customer_phone`

**Why snapshot instead of joining `profiles` on every read?**
The Admin Dashboard's order list/detail views need the customer's name and phone constantly (KPI cards, order table, order detail). Snapshotting avoids a `profiles` join on every query and — more importantly — keeps a **historical record independent of the account**: if the customer later edits their profile (or is banned — see [2.6](#26-account-deactivation-ban-not-delete)), past orders still show exactly what was true when the order was placed.

**Source of truth:** `profiles.full_name` and `profiles.phone` — **not** `orders.shipping_address`. These represent _who the account holder is_, independent of where the order is being shipped (which may differ — a gift order, an office address, etc.). The two are allowed to diverge; that's expected, not a bug.

**Flow (checkout UI + `place_order` RPC):**

1. **Prefill:** when the Customer opens the Checkout page, the form's name/phone fields are prefilled from their current `profiles` row (`full_name`, `phone`) — editable in the UI if they want to correct something for this specific order.
2. **Submit:** the client sends the (possibly edited) `customer_name` / `customer_phone` values to `place_order` — but see the validation rule below.
3. **Snapshot:** `place_order` writes these values onto the new `orders` row. From this point on, they're frozen — never re-joined from `profiles`.

**Server-side validation rule (closes the "client-only validation" gap):**
`place_order` MUST look up the caller's `profiles.phone` via `auth.uid()` and reject the call (raise an exception) if it is `NULL` — regardless of what the client sends. This guarantees every order has a usable contact number even if someone bypasses the UI and calls the RPC directly. `customer_name` follows the same guard if a business rule requires it to be non-empty.

---

### 2.6 Account Deactivation: Ban, Not Delete

**Decision:** the MVP never hard-deletes a row from `auth.users`. When an Admin needs to block a customer, they use Supabase Auth's built-in **Ban** feature (`auth.users.banned_until`), which:

- Instantly invalidates the user's sessions and blocks new logins — enforced by Supabase Auth itself, no extra schema needed.
- Leaves `profiles`, `orders`, `order_items`, and `reviews` completely untouched — full order history and account data stay intact.

**Why this matters for this schema specifically:** `orders.user_id` uses `ON DELETE RESTRICT` (by design — historical integrity), while `profiles.id` cascades from `auth.users`. Hard-deleting a user with order history would trigger a delete conflict (the `auth.users → profiles` cascade would be blocked by the `orders` restrict, aborting the transaction). Using **Ban instead of Delete** sidesteps this entirely — there is nothing to fix in the schema, as long as hard delete of `auth.users` is never exposed as an Admin action in the MVP.

---

## 3. Triggers & RPC Concepts

> **Note:** this section describes _what_ each trigger/function does and _why_ — the actual executable SQL lives in the migration files under `supabase/migrations/` (to be created as a follow-up; see [What's Next](#whats-next)), not in this document. Keeping the two separate means this file stays a stable reference to read, while the `.sql` files are the ones that actually run against the database and evolve with numbered migrations.

### 3.1 Trigger: `on_auth_user_created`

**Purpose:** Automatically create a `profiles` row whenever a new user signs up through Supabase Auth. Without this, users would exist in `auth.users` but have no application-level profile.

**Behavior:**

- Fires **AFTER INSERT** on `auth.users`
- Inserts a matching row into `profiles` with `id = NEW.id`, `full_name` taken from the signup metadata, and default `role = 'customer'`
- Runs as `SECURITY DEFINER` (needs elevated privilege to write into `public.profiles` on behalf of the new `auth.users` row)

**Migration file:** `supabase/migrations/002_triggers.sql`

---

### 3.2 Trigger: `set_updated_at`

**Purpose:** Automatically bump `updated_at` whenever a row is updated. Applied to `profiles`, `products`, `orders`, and `reviews` (the last one is what makes "edit your own review" possible — see § 1.4).

**Behavior:**

- Fires **BEFORE UPDATE** on each of the three tables
- Sets `NEW.updated_at = now()` on every update, giving each table an accurate "last touched" timestamp with zero effort from the application code

**Migration file:** `supabase/migrations/002_triggers.sql`

---

### 3.3 RPC: `calculate_bundle_total`

**Purpose:** Server-authoritative pricing for the Desk Builder. The client sends product IDs; the server returns subtotal, discount, and total. **Never trust client-side pricing.**

**Signature:**

```
calculate_bundle_total(product_ids uuid[])
  RETURNS TABLE(subtotal numeric, discount numeric, total numeric, item_count integer)
```

**Logic:**

1. Look up prices from `products` (only where `is_active = true`)
2. Sum prices → `subtotal`
3. If `array_length(product_ids, 1) >= 3` → `discount = subtotal * 0.05`, else `0`
4. `total = subtotal - discount`

**Called from:** the Desk Builder page (live preview) and the "Add to Cart" flow (final commit).

**Migration file:** `supabase/migrations/003_functions.sql`

---

### 3.4 RPC: `place_order`

**Purpose:** Atomically create an order + its line items with server-verified pricing. Prevents race conditions and client-side price tampering.

**Signature (conceptual):**

```
place_order(
  items jsonb,               -- [{product_id, quantity, bundle_id?}, ...]
  shipping_address jsonb,
  payment_method text,
  customer_name text,        -- prefilled from profiles.full_name, editable in UI
  customer_phone text        -- prefilled from profiles.phone, editable in UI
)
  RETURNS uuid              -- order_id
```

**Logic:**

1. Verify caller is authenticated (`auth.uid() IS NOT NULL`)
2. Look up the caller's row in `profiles`. If `profiles.phone IS NULL`, **raise an exception and abort** — a contact number is mandatory for every order, checked server-side regardless of what the client sends (see [2.5](#25-checkout-snapshot-customer_name--customer_phone))
3. Fetch fresh prices from `products` for all `product_id` values
4. Recalculate subtotals, per-bundle discounts (using the same 3+ rule), and grand total
5. Insert into `orders` (status = `pending`), including `customer_name` and `customer_phone` as **snapshots** — the values passed in (which the Checkout UI prefilled from `profiles`, possibly edited by the customer)
6. Insert all `order_items` in one statement with snapshotted `product_name` and `unit_price`
7. Return the new `order.id`

Wrapped in a transaction — either everything commits or nothing does.

**Migration file:** `supabase/migrations/003_functions.sql`

---

### 3.5 View / Function: `product_rating_stats` (Optional but Useful)

**Purpose:** Pre-aggregated review data to avoid recomputing average rating on every product query.

**Options:**

- **Simple view** — recomputed on each query (fine for MVP)
- **Materialized view** — refreshed periodically (only if performance suffers)

**Behavior:** a view (`public.product_rating_stats`) grouping `reviews` by `product_id`, returning a review count and the average rating rounded to one decimal. Joined into product list/detail queries to show ratings without an N+1 problem.

**Migration file:** `supabase/migrations/003_functions.sql`

---

## 4. Supplementary: `cart_items`

Not part of the core 6 tables listed above, but referenced in the project spec for logged-in cart persistence. Included here for completeness.

| Column       | Type          | Constraints                                           | Default             | Notes                                           |
| ------------ | ------------- | ----------------------------------------------------- | ------------------- | ----------------------------------------------- |
| `id`         | `uuid`        | PRIMARY KEY                                           | `gen_random_uuid()` | —                                               |
| `user_id`    | `uuid`        | NOT NULL, REFERENCES `profiles(id)` ON DELETE CASCADE | —                   | —                                               |
| `product_id` | `uuid`        | NOT NULL, REFERENCES `products(id)` ON DELETE CASCADE | —                   | —                                               |
| `quantity`   | `integer`     | NOT NULL, CHECK (`quantity > 0`)                      | `1`                 | —                                               |
| `bundle_id`  | `uuid`        | —                                                     | `NULL`              | Same semantics as `order_items.bundle_id`       |
| `created_at` | `timestamptz` | NOT NULL                                              | `now()`             | —                                               |
|              |               | UNIQUE (`user_id`, `product_id`, `bundle_id`)         |                     | Prevents duplicates per (user, product, bundle) |

**Merge rule at login:** Guest's localStorage items are upserted into `cart_items` by `(user_id, product_id, bundle_id)`. On conflict, quantities are summed.

---

## What's Next

Two natural follow-up deliverables from this schema, both as **separate `.sql` files**, not inside this document:

1. **Migration files** (`supabase/migrations/001_create_tables.sql`, `002_triggers.sql`, `003_functions.sql`) — the actual executable SQL for the 6 core tables + `cart_items`, the two triggers, and the three functions/views described in [Section 3](#3-triggers--rpc-concepts).
2. **RLS Policies** (`supabase/migrations/004_rls_policies.sql`) — how row-level security enforces the permission matrix from `project-spec.md` (e.g., a customer can only `SELECT` their own orders; only admins can `UPDATE` order status).

Also planned: **Seed data** for the 5–8 builder-slot categories and a handful of sample products, for local development.

This document (`db-schema.md`) stays as the **single source of truth for what the schema is and why** — every future `.sql` file should trace back to a decision documented here.

---

_End of Database Schema — v1.2 MVP_
