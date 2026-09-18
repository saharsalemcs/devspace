# DevSpace — Project Specification

**Version:** 1.1 (MVP)
**Document Type:** Functional Specification
**Last Updated:** September 18, 2026

---

## 1. Project Overview

### 1.1 Name

**DevSpace**

### 1.2 Description

An e-commerce web application specialized in selling desk equipment and accessories for developers and gamers — including monitors, keyboards, mice, lighting, and related peripherals.

### 1.3 Unique Value Proposition

**Desk Builder** — an interactive page that allows customers to visually assemble the components of their workspace (screen + keyboard + mouse + lighting, etc.) into a single bundle and add it to the cart in one action, with an automatic bundle discount.

### 1.4 Target Audience

- Software developers upgrading their workstations
- Gamers building or improving their setup
- Remote workers investing in their home office

### 1.5 MVP Goal

Deliver a fully functional online store where users can browse products, use the Desk Builder to assemble bundles, place orders (COD), and where an admin can manage products and orders — while demonstrating modern full-stack practices.

---

## 2. Tech Stack & Architecture Decisions

### 2.1 Tech Stack

| Layer           | Technology                                                                             |
| --------------- | -------------------------------------------------------------------------------------- |
| Framework       | Next.js (App Router)                                                                   |
| Language        | TypeScript                                                                             |
| Styling         | Tailwind CSS                                                                           |
| UI Components   | shadcn/ui (Radix UI primitives + Tailwind, themed to match Ember Orange design system) |
| Server State    | React Query (TanStack Query)                                                           |
| Client State    | Zustand                                                                                |
| Validation      | Zod                                                                                    |
| Database        | Supabase (PostgreSQL)                                                                  |
| Authentication  | Supabase Auth                                                                          |
| File Storage    | Supabase Storage                                                                       |
| Access Control  | Supabase Row-Level Security (RLS)                                                      |
| UI Components   | shadcn/ui, Lucide Icons & Sonner (toasts)                                              |
| Version Control | Git / GitHub                                                                           |

### 2.2 Key Architectural Decisions

1. **Server Components by default** — client components only where interactivity is required (cart, forms, Desk Builder).
2. **Server-side pricing** — all price calculations (including the 5% bundle discount) happen server-side; the client is never trusted with final pricing.
3. **RLS-first security** — every table has RLS policies. Authorization is enforced at the database level, not only in app code.
4. **Cart hybrid model**:
   - Guest → Zustand + localStorage (no server interaction)
   - Logged-in → on login, merge localStorage cart into `cart_items` table; DB becomes source of truth
5. **Bundle representation** — each bundle product remains a separate line item (in cart and order), linked by a shared `bundle_id`. Simplifies reporting, refunds, and per-item operations.
6. **Route Groups** — organized by user context: `(shop)`, `(auth)`, `(account)`, `(admin)`.
7. **Product images** — stored in a dedicated Supabase Storage bucket; each product supports a gallery via `product_images` table with an `is_primary` flag.
8. **Fixed builder slots** — 5–8 predefined categories, defined in DB (not hardcoded) but not editable via UI in MVP; identified via `is_builder_slot = true`.
9. **State separation** — React Query owns all server state (products, orders, reviews); Zustand owns transient client state (guest cart, current Desk Builder selections, UI toggles).
10. **Component foundation via shadcn/ui** — base primitives (Button, Card, Dialog, Tooltip, Badge, Input, Select, etc.) are scaffolded via the shadcn CLI as owned source code (not an npm dependency), then themed via CSS variables to match the Ember Orange dark design system. This keeps components fully customizable and Server-Component-friendly where possible (interactive primitives like Dialog/Tooltip are client components by nature).
11. **Version control workflow** — the project is tracked in Git from Phase 0 and hosted on GitHub, using Conventional Commits and a protected `main` branch (see `task-breakdown.md` § 0.1).

---

## 3. User Roles & Permissions Matrix

| Feature / Action       | Guest | Customer | Admin |
| ---------------------- | :---: | :------: | :---: |
| Browse products        |  ✅   |    ✅    |  ✅   |
| Search / Filter / Sort |  ✅   |    ✅    |  ✅   |
| View product details   |  ✅   |    ✅    |  ✅   |
| Read reviews           |  ✅   |    ✅    |  ✅   |
| Add to cart            |  ✅   |    ✅    |  ✅   |
| Use Desk Builder       |  ✅   |    ✅    |  ✅   |
| Register / Login       |  ✅   |    —     |   —   |
| Checkout (place order) |  ❌   |    ✅    |  ✅   |
| View own order history |  ❌   |    ✅    |  ✅   |
| Post a review          |  ❌   |    ✅    |  ✅   |
| Edit own profile       |  ❌   |    ✅    |  ✅   |
| Access Admin Dashboard |  ❌   |    ❌    |  ✅   |
| Product CRUD           |  ❌   |    ❌    |  ✅   |
| Update order status    |  ❌   |    ❌    |  ✅   |
| Delete reviews         |  ❌   |    ❌    |  ✅   |
| View KPI dashboard     |  ❌   |    ❌    |  ✅   |

**Notes:**

- The **Admin** is a single, pre-provisioned account. The role is assigned directly in the database — not via public signup.
- Guest actions requiring authentication (checkout, posting a review) redirect to `/login` while preserving the return URL.

---

## 4. Core Features

### 4.1 Product Catalog

- Grid view of all active products
- Full-text search across product name and description
- Filter by: **category**, **price range**
- Sort by: **price (asc/desc)**, **newest**, **top-rated**
- Pagination (page size TBD in Design phase)

### 4.2 Product Details

- Image gallery (multiple images per product; `is_primary` shown first)
- Name, description, price (EGP), category badge
- "Add to Cart" action
- Reviews section (list + posting form for logged-in users)
- Average rating displayed prominently

### 4.3 Shopping Cart

- **Guest:** stored in Zustand + localStorage; no server calls
- **Logged-in:** synced with `cart_items` table (server-authoritative)
- **On login/register:** merge localStorage → DB (dedupe by `product_id`, sum quantities)
- Displays standalone items and bundle items (grouped visually by `bundle_id`)
- Actions: change quantity, remove item, remove an entire bundle
- Live subtotal (client-side display); **final total is server-verified at checkout**

### 4.4 Desk Builder (Core Differentiator)

- **5–8 fixed category slots** (Screen, Keyboard, Mouse, Lighting, ...) sourced from DB where `is_builder_slot = true`
- Each slot lists available products from that category
- User picks one product per slot (empty slots allowed)
- Live preview of the assembled build
- **Pricing logic (server-side only):**
  - Base = sum of selected product prices
  - If **3 or more** components selected → apply **5% bundle discount**
  - No compatibility checks between components
- "Add Bundle to Cart" → each selected product added as a separate cart line item, all sharing the same `bundle_id`

### 4.5 Reviews

- Any logged-in customer may review any product
- No purchase verification required
- Reviews appear **immediately** (no moderation queue)
- Rating (1–5 stars) + optional comment
- Admin can **delete** inappropriate reviews (no edit)

### 4.6 Checkout (COD / Mock)

- Requires authentication
- Form: full name, phone, shipping address
- Order summary with server-calculated final total
- Payment method: **Cash on Delivery** — no real payment gateway
- On submit → order created with status `pending`, cart cleared
- Confirmation screen with order number

### 4.7 Order History (Customer)

- List of user's past orders with status badges
- Order detail: line items, quantities, unit prices, shipping info, current status

### 4.8 Admin Dashboard

- **Products:** full CRUD, manage image gallery per product, deactivate/reactivate
- **Orders:** list all orders, filter by status, update status through the lifecycle:
  `pending → processing → shipped → delivered`
- **Reviews:** list all reviews, delete inappropriate ones
- **KPI Cards** (numeric only, no charts in MVP):
  - Total orders (all-time / this month)
  - Total revenue
  - Number of registered customers
  - Number of active products

### 4.9 Authentication

- Email + password (Supabase Auth)
- SSR-friendly session management
- Middleware protection for `(account)` and `(admin)` route groups
- Password reset flow

---

## 5. MVP Pages

Organized by App Router route groups.

### 5.1 `(shop)` — Public Storefront

| Route              | Page            | Notes                                                           |
| ------------------ | --------------- | --------------------------------------------------------------- |
| `/`                | Home            | Hero, featured products, Desk Builder CTA, categories highlight |
| `/products`        | Product Listing | Search + Filter + Sort + Pagination                             |
| `/products/[slug]` | Product Details | Gallery, info, reviews                                          |
| `/desk-builder`    | Desk Builder    | Interactive bundle assembly                                     |
| `/cart`            | Cart            | Line items with bundle grouping, checkout CTA                   |

### 5.2 `(auth)` — Authentication

| Route              | Page                   |
| ------------------ | ---------------------- |
| `/login`           | Login                  |
| `/register`        | Register               |
| `/forgot-password` | Password reset request |
| `/reset-password`  | Set new password       |

### 5.3 `(account)` — Customer Area _(Protected)_

| Route                  | Page                |
| ---------------------- | ------------------- |
| `/account`             | Profile overview    |
| `/account/orders`      | Order history       |
| `/account/orders/[id]` | Order details       |
| `/checkout`            | Checkout form (COD) |
| `/checkout/success`    | Order confirmation  |

### 5.4 `(admin)` — Admin Dashboard _(Protected, Admin-only)_

| Route                       | Page                           |
| --------------------------- | ------------------------------ |
| `/admin`                    | Dashboard overview (KPI cards) |
| `/admin/products`           | Products list                  |
| `/admin/products/new`       | Create product                 |
| `/admin/products/[id]/edit` | Edit product                   |
| `/admin/orders`             | Orders list                    |
| `/admin/orders/[id]`        | Order details + status update  |
| `/admin/reviews`            | Reviews moderation             |

### 5.5 Utility Pages

| Route        | Page                  |
| ------------ | --------------------- |
| `/not-found` | 404                   |
| `/error`     | Global error boundary |

---

## Appendix A — Locked Decisions Summary

| Area                | Decision                                                                 |
| ------------------- | ------------------------------------------------------------------------ |
| Payment             | COD / Mock only (no real gateway in MVP)                                 |
| Currency            | EGP                                                                      |
| UI Language         | English only                                                             |
| Theme               | Dark Mode (default, no toggle in MVP)                                    |
| Accent Color        | Ember Orange                                                             |
| Typography          | Inter/Geist (sans) + JetBrains Mono/Geist Mono (mono for prices & specs) |
| UI Component Base   | shadcn/ui (owned source code, themed via CSS variables)                  |
| Compatibility Logic | None (any product from any slot)                                         |
| Bundle Discount     | 5% on 3+ components, server-calculated                                   |
| Cart Storage        | Guest → localStorage · Logged-in → DB (merge on login)                   |
| Product Images      | Multiple per product (gallery), Supabase Storage                         |
| Inventory           | All in-stock by default (no stock tracking in MVP)                       |
| Reviews             | Open (no verified purchase), immediate publish, admin delete only        |
| Admin Account       | Single, pre-provisioned (not via public signup)                          |
| Version Control     | Git, hosted on GitHub, Conventional Commits                              |

---

_End of Specification — v1.1 MVP_
