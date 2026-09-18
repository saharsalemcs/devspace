# DevSpace — Design System Guide

**Version:** 1.0 (MVP)
**Document Type:** Visual Design System
**Last Updated:** September 17, 2026

---

## Table of Contents

1. [Color Palette & Tailwind Tokens](#1-color-palette--tailwind-tokens)
2. [Typography & Hierarchy](#2-typography--hierarchy)
3. [Component Specs & UI States](#3-component-specs--ui-states)
4. [Tailwind CSS Configuration](#4-tailwind-css-configuration)

---

## 1. Color Palette & Tailwind Tokens

### 1.1 Design Philosophy

A dark-first interface with a warm, energetic accent that speaks to gaming/developer culture — without leaning into neon or "cyberpunk" territory. The neutral scale is slightly warm-tinted to complement the Ember Orange accent instead of clashing with it.

### 1.2 Neutrals (Base Grays)

Warm-tinted grayscale, tuned for a dark UI where text needs to breathe on very dark surfaces.

| Token         | Hex       | Purpose                          |
| ------------- | --------- | -------------------------------- |
| `neutral-950` | `#0A0A0B` | Root page background             |
| `neutral-900` | `#151518` | Surface (cards, panels)          |
| `neutral-800` | `#1A1A1F` | Elevated surface (hover, modals) |
| `neutral-700` | `#26262B` | Borders, dividers                |
| `neutral-600` | `#34343A` | Hover borders                    |
| `neutral-500` | `#4A4A52` | Disabled backgrounds             |
| `neutral-400` | `#6D6D75` | Disabled / muted text            |
| `neutral-300` | `#9A9AA2` | Secondary text                   |
| `neutral-200` | `#C4C4CA` | Tertiary text                    |
| `neutral-100` | `#E4E4E7` | High-emphasis text (alt)         |
| `neutral-50`  | `#F5F5F7` | **Primary text**                 |

### 1.3 Ember Orange (Accent Scale)

The signature color — used for primary CTAs, prices, highlights, and Desk Builder selections.

| Token       | Hex       | Purpose                                       |
| ----------- | --------- | --------------------------------------------- |
| `ember-50`  | `#FFF4EE` | Faintest tint (rare)                          |
| `ember-100` | `#FFE4D3` | Subtle wash backgrounds                       |
| `ember-200` | `#FFC7A6` | Soft highlights                               |
| `ember-300` | `#FFA275` | Light emphasis                                |
| `ember-400` | `#FF7D45` | **Hover state** for primary CTAs              |
| `ember-500` | `#FF5A1F` | **Base accent** — primary CTAs, links, prices |
| `ember-600` | `#E64509` | **Active / pressed** state                    |
| `ember-700` | `#BF3306` | Deep emphasis                                 |
| `ember-800` | `#99280A` | Text on light bg (rare)                       |
| `ember-900` | `#7A230C` | Deepest shade                                 |
| `ember-950` | `#421005` | Ambient / deepest                             |

### 1.4 Semantic Colors

| Token         | Hex       | Purpose                       |
| ------------- | --------- | ----------------------------- |
| `success-500` | `#22C55E` | In-stock, confirmations       |
| `success-600` | `#16A34A` | Success button hover          |
| `danger-500`  | `#EF4444` | Errors, destructive actions   |
| `danger-600`  | `#DC2626` | Destructive button hover      |
| `warning-500` | `#F59E0B` | Warnings, "processing" status |
| `info-500`    | `#3B82F6` | Informational, "New" badges   |

### 1.5 Semantic Aliases (recommended usage in components)

Use these semantic tokens in component code instead of raw color names — this makes theme changes a one-file update.

| Alias                 | Value         |
| --------------------- | ------------- |
| `bg-background`       | `neutral-950` |
| `bg-surface`          | `neutral-900` |
| `bg-surface-elevated` | `neutral-800` |
| `border-default`      | `neutral-700` |
| `border-hover`        | `neutral-600` |
| `text-primary`        | `neutral-50`  |
| `text-secondary`      | `neutral-300` |
| `text-muted`          | `neutral-400` |
| `text-accent`         | `ember-500`   |
| `bg-accent`           | `ember-500`   |
| `bg-accent-hover`     | `ember-400`   |
| `bg-accent-pressed`   | `ember-600`   |

---

## 2. Typography & Hierarchy

### 2.1 Font Families

| Family | Font                               | Fallback                               | Usage                                      |
| ------ | ---------------------------------- | -------------------------------------- | ------------------------------------------ |
| Sans   | **Geist** (or Inter)               | `ui-sans-serif, system-ui, sans-serif` | All UI, headings, body                     |
| Mono   | **Geist Mono** (or JetBrains Mono) | `ui-monospace, monospace`              | Prices, SKUs, product specs, code snippets |

**Why mono for prices?** Uniform digit width makes prices align cleanly across product cards and gives a distinct "tech product" feel.

### 2.2 Type Scale

| Token           | Size / Line-height     | Weight     | Use Case                      |
| --------------- | ---------------------- | ---------- | ----------------------------- |
| `text-display`  | 3.5rem (56px) / 1.05   | 700        | Homepage hero                 |
| `text-h1`       | 2.5rem (40px) / 1.15   | 700        | Page titles                   |
| `text-h2`       | 2rem (32px) / 1.2      | 600        | Section titles                |
| `text-h3`       | 1.5rem (24px) / 1.3    | 600        | Card titles, subsections      |
| `text-h4`       | 1.25rem (20px) / 1.4   | 600        | Product names in cards        |
| `text-body-lg`  | 1.125rem (18px) / 1.55 | 400        | Emphasized body               |
| `text-body`     | 1rem (16px) / 1.55     | 400        | Default body text             |
| `text-body-sm`  | 0.875rem (14px) / 1.5  | 400        | Secondary text                |
| `text-caption`  | 0.75rem (12px) / 1.4   | 500        | Labels, metadata, badges      |
| `text-price`    | 1.25rem (20px) / 1.2   | 600 (mono) | Product prices in cards/cart  |
| `text-price-lg` | 2rem (32px) / 1.1      | 700 (mono) | Featured / detail-page prices |

### 2.3 Letter Spacing

| Context            | Value                      |
| ------------------ | -------------------------- |
| Display / H1 / H2  | `-0.02em` (slightly tight) |
| H3 / H4 / body     | `0` (default)              |
| Caption / labels   | `0.02em` (slightly wide)   |
| Uppercase eyebrows | `0.08em`                   |

### 2.4 Hierarchy Examples

**Product Card**

- Name → `text-h4` · `text-primary`
- Category → `text-caption` · `text-muted` · `uppercase`
- Price → `text-price` · `text-accent` · `font-mono`

**Product Details Page**

- Product Name → `text-h1` · `text-primary`
- Price → `text-price-lg` · `text-accent` · `font-mono`
- Description → `text-body` · `text-secondary`
- Specs table → `text-body-sm` · `font-mono`

---

## 3. Component Specs & UI States

### 3.1 Buttons

**Sizes:** `sm` (32px height) · `md` (40px, default) · `lg` (48px)
**Radius:** `rounded-lg` (8px) — consistent across all button variants
**Transition:** `transition-all duration-200 ease-out`

#### 3.1.1 Primary Button

Ember Orange filled — the highest-emphasis action on any given screen (Add to Cart, Checkout, Add Bundle).

| State             | Background                | Text              | Border                                                        | Extra                             |
| ----------------- | ------------------------- | ----------------- | ------------------------------------------------------------- | --------------------------------- |
| **Default**       | `ember-500`               | `white`           | none                                                          | `shadow-sm`                       |
| **Hover**         | `ember-400`               | `white`           | none                                                          | `shadow-md` + `shadow-ember-glow` |
| **Active**        | `ember-600`               | `white`           | none                                                          | `shadow-inner`                    |
| **Focus-visible** | `ember-500`               | `white`           | `ring-2 ring-ember-400 ring-offset-2 ring-offset-neutral-950` | —                                 |
| **Disabled**      | `neutral-700`             | `neutral-400`     | none                                                          | `cursor-not-allowed`              |
| **Loading**       | `ember-500` (60% opacity) | `white` + spinner | none                                                          | pointer-events disabled           |

#### 3.1.2 Secondary Button

Transparent with visible border — for lower-priority actions alongside a primary (Cancel, Back).

| State             | Background    | Text           | Border                  |
| ----------------- | ------------- | -------------- | ----------------------- |
| **Default**       | `transparent` | `text-primary` | `border-neutral-700`    |
| **Hover**         | `neutral-800` | `text-primary` | `border-neutral-600`    |
| **Active**        | `neutral-700` | `text-primary` | `border-neutral-600`    |
| **Focus-visible** | `transparent` | `text-primary` | `ring-2 ring-ember-400` |
| **Disabled**      | `transparent` | `text-muted`   | `border-neutral-800`    |

#### 3.1.3 Ghost Button

No background, no border — for tertiary actions and toolbar/icon buttons.

| State             | Background    | Text                                     |
| ----------------- | ------------- | ---------------------------------------- |
| **Default**       | `transparent` | `text-secondary`                         |
| **Hover**         | `neutral-800` | `text-primary`                           |
| **Active**        | `neutral-700` | `text-primary`                           |
| **Focus-visible** | `transparent` | `text-primary` + `ring-2 ring-ember-400` |
| **Disabled**      | `transparent` | `text-muted`                             |

#### 3.1.4 Destructive Button (Admin only)

Same anatomy as Primary but with the danger scale — used for "Delete Product", "Delete Review".

| State        | Background    | Text          |
| ------------ | ------------- | ------------- |
| **Default**  | `danger-500`  | `white`       |
| **Hover**    | `danger-600`  | `white`       |
| **Active**   | `#B91C1C`     | `white`       |
| **Disabled** | `neutral-700` | `neutral-400` |

---

### 3.2 Product Card

**Base structure**

- Container: `bg-surface` · `border border-default` · `rounded-xl` · `p-4` · `flex flex-col gap-3`
- Image: `aspect-square` · `rounded-lg` · `overflow-hidden` · `bg-neutral-800`
- Content: name (`text-h4`), category (`text-caption uppercase text-muted`), price (`text-price font-mono text-accent`)
- Footer: "Add to Cart" as Ghost or Secondary button

**Transitions:** `transition-all duration-200 ease-out`

| State                       | Border                      | Background                         | Transform          | Extra                                                          |
| --------------------------- | --------------------------- | ---------------------------------- | ------------------ | -------------------------------------------------------------- |
| **Default**                 | `border-neutral-700`        | `bg-surface`                       | none               | —                                                              |
| **Hover**                   | `border-neutral-600`        | `bg-surface-elevated`              | `-translate-y-0.5` | `shadow-lg`                                                    |
| **Active** (click)          | `border-neutral-600`        | `bg-surface-elevated`              | `translate-y-0`    | `shadow-md`                                                    |
| **Selected** (Desk Builder) | `border-ember-500 border-2` | `bg-surface`                       | none               | Corner check-badge in `bg-accent` + `ring-1 ring-ember-500/30` |
| **Out of stock**            | `border-neutral-700`        | `bg-surface` (content 40% opacity) | none               | Center overlay: "Out of Stock" badge                           |

**Notes on Selected state:** the checkmark badge sits in the top-right corner of the image container — a 24×24 circle filled with `ember-500` containing a white check icon. This gives users instant visual feedback in the Desk Builder without extra prose.

---

### 3.3 Badges

Small pill labels — used for stock, promotions, bundles, and order status.

**Base:** `text-caption` · `font-medium` · `px-2.5 py-1` · `rounded-full` · `uppercase tracking-wide` · `inline-flex items-center gap-1`

| Badge            | Background       | Text                               | Use                                                   |
| ---------------- | ---------------- | ---------------------------------- | ----------------------------------------------------- |
| **In Stock**     | `success-500/15` | `success-500`                      | Product availability                                  |
| **Out of Stock** | `neutral-700`    | `text-muted`                       | Product unavailable                                   |
| **Sale**         | `ember-500`      | `white`                            | Discounted item                                       |
| **New**          | `info-500/15`    | `info-500`                         | Recently added                                        |
| **Bundle**       | `ember-500/15`   | `ember-500` (with 🧩 or link icon) | Item is part of a Desk Builder bundle (shown in Cart) |
| **Featured**     | `neutral-50/10`  | `text-primary`                     | Homepage highlights                                   |

**Order Status Badges** (in Order History & Admin)
| Status | Background | Text |
|---|---|---|
| pending | `neutral-700` | `text-secondary` |
| processing | `info-500/15` | `info-500` |
| shipped | `warning-500/15` | `warning-500` |
| delivered | `success-500/15` | `success-500` |

---

### 3.4 Modal Dialogs

**Anatomy**

- Backdrop: `bg-neutral-950/70` · `backdrop-blur-sm` · `fixed inset-0 z-40`
- Container: `bg-surface` · `border border-default` · `rounded-2xl` · `shadow-2xl` · `p-6` · `z-50`
- Header: title (`text-h3`) + close icon-button (top-right, Ghost variant)
- Body: `text-body` · `text-secondary`
- Footer: right-aligned action row — `flex justify-end gap-3` — Ghost first, Primary last

**Sizes**
| Size | Max Width | Use |
|---|---|---|
| `sm` | `max-w-sm` (400px) | Quick confirmations, alerts |
| `md` | `max-w-lg` (512px) | Default (forms, generic content) |
| `lg` | `max-w-2xl` (672px) | Build confirmation, complex forms |

#### 3.4.1 Desk Builder Confirmation Modal

Opens when the user clicks "Add Bundle to Cart" — a final review before commit.

- **Size:** `lg`
- **Title:** "Confirm Your Build"
- **Body:**
  - Grid/list of selected components: thumbnail + name + category + unit price
  - Divider
  - Subtotal line (regular text)
  - Discount line (if 3+ items): "Bundle Discount (5%)" in `text-accent` with negative amount
  - Grand total: `text-price-lg` · `text-accent` · `font-mono`
- **Footer:** "Keep Editing" (Ghost) + "Add to Cart" (Primary)

**Animation**

- Enter: fade + scale from `0.95` → `1` · `duration-200 ease-out`
- Exit: fade + scale to `0.95` · `duration-150 ease-in`
- Backdrop fades independently at same timing

**Accessibility:** trap focus inside modal, close on `Esc`, restore focus to trigger on close.

---

### 3.5 Tooltips

**Anatomy**

- Container: `bg-neutral-800` · `border border-default` · `text-body-sm` · `text-primary` · `px-3 py-2` · `rounded-lg` · `shadow-md` · `max-w-xs`
- Arrow: 6px, matches container background + border
- Position: above trigger by default, auto-flip on viewport collision
- Trigger delay: 300ms hover / immediate on focus

**Desk Builder Tooltip Variants**

| Variant                  | Trigger                                         | Content                                                          |
| ------------------------ | ----------------------------------------------- | ---------------------------------------------------------------- |
| **Product hint**         | Hover a product thumbnail in a slot             | Full product name + price (helpful when the card is compact)     |
| **Slot hint**            | Hover an empty slot                             | "Select a [category] for your build" (e.g., "Select a keyboard") |
| **Discount hint**        | Hover the "Bundle Discount" line in the summary | "5% discount applies automatically when you add 3+ components"   |
| **Disabled action hint** | Hover a disabled button                         | Explains why (e.g., "Log in to save your build")                 |

**Animation:** fade + slight translate (2px) in the direction of the arrow · `duration-150 ease-out`

---

## 4. Tailwind CSS Configuration (v4)

**Tailwind CSS v4** moved configuration out of JavaScript and into CSS. There is no `tailwind.config.ts` anymore — the design system lives directly inside `globals.css` using the `@theme` directive. All tokens below become both CSS custom properties AND utility classes automatically.

### 4.1 Installation

Install the packages for Next.js (PostCSS integration):

```bash
npm install tailwindcss @tailwindcss/postcss postcss
```

### 4.2 PostCSS Config

Create `postcss.config.mjs` at project root:

```javascript
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

### 4.3 Global CSS Setup (`src/app/globals.css`)

This single file replaces the entire old `tailwind.config.ts`. It now includes **both** our custom design tokens **and** the shadcn/ui semantic variables (see § 5 below) so both systems coexist cleanly.

```css
@import "tailwindcss";
@import "tw-animate-css"; /* used by shadcn/ui for data-[state] animations */

/* ==========================================================
 * SHADCN/UI SEMANTIC VARIABLES
 * Plain CSS custom properties — consumed by shadcn components
 * via bg-primary, text-muted-foreground, etc.
 * ========================================================== */
:root {
  --radius: 0.75rem; /* 12px — matches our design-system radius-xl */

  --background: #0a0a0b;
  --foreground: #f5f5f7;

  --card: #151518;
  --card-foreground: #f5f5f7;

  --popover: #151518;
  --popover-foreground: #f5f5f7;

  --primary: #ff5a1f; /* Ember Orange */
  --primary-foreground: #ffffff;

  --secondary: #1a1a1f;
  --secondary-foreground: #f5f5f7;

  --muted: #1a1a1f;
  --muted-foreground: #9a9aa2;

  --accent: #ff5a1f;
  --accent-foreground: #ffffff;

  --destructive: #ef4444;
  --destructive-foreground: #ffffff;

  --border: #26262b;
  --input: #26262b;
  --ring: #ff7d45;

  /* Chart colors (used by shadcn chart components, if adopted post-MVP) */
  --chart-1: #ff5a1f;
  --chart-2: #3b82f6;
  --chart-3: #22c55e;
  --chart-4: #f59e0b;
  --chart-5: #9a9aa2;
}

/* ==========================================================
 * TAILWIND v4 THEME MAPPING (@theme inline)
 * Maps the shadcn CSS variables above to Tailwind utility
 * classes: bg-primary, text-primary-foreground, etc.
 * ========================================================== */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* ==========================================================
 * DEVSPACE CUSTOM DESIGN TOKENS
 * Our own extended palette + typography, used directly in
 * custom (non-shadcn) components via bg-ember-500, text-h1, etc.
 * ========================================================== */
@theme {
  /* Neutrals (Warm-tinted Grayscale) */
  --color-neutral-50: #f5f5f7;
  --color-neutral-100: #e4e4e7;
  --color-neutral-200: #c4c4ca;
  --color-neutral-300: #9a9aa2;
  --color-neutral-400: #6d6d75;
  --color-neutral-500: #4a4a52;
  --color-neutral-600: #34343a;
  --color-neutral-700: #26262b;
  --color-neutral-800: #1a1a1f;
  --color-neutral-900: #151518;
  --color-neutral-950: #0a0a0b;

  /* Ember Orange (Full Scale) */
  --color-ember-50: #fff4ee;
  --color-ember-100: #ffe4d3;
  --color-ember-200: #ffc7a6;
  --color-ember-300: #ffa275;
  --color-ember-400: #ff7d45;
  --color-ember-500: #ff5a1f;
  --color-ember-600: #e64509;
  --color-ember-700: #bf3306;
  --color-ember-800: #99280a;
  --color-ember-900: #7a230c;
  --color-ember-950: #421005;

  /* Semantic Colors */
  --color-success-500: #22c55e;
  --color-success-600: #16a34a;
  --color-danger-500: #ef4444;
  --color-danger-600: #dc2626;
  --color-warning-500: #f59e0b;
  --color-info-500: #3b82f6;

  /* Semantic Aliases (custom components only) */
  --color-surface: #151518;
  --color-surface-elevated: #1a1a1f;

  /* Typography */
  --font-sans:
    var(--font-geist-sans), "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono:
    var(--font-geist-mono), "JetBrains Mono", ui-monospace, monospace;

  --text-display: 3.5rem;
  --text-display--line-height: 1.05;
  --text-display--font-weight: 700;
  --text-display--letter-spacing: -0.02em;

  --text-h1: 2.5rem;
  --text-h1--line-height: 1.15;
  --text-h1--font-weight: 700;
  --text-h1--letter-spacing: -0.02em;

  --text-h2: 2rem;
  --text-h2--line-height: 1.2;
  --text-h2--font-weight: 600;
  --text-h2--letter-spacing: -0.02em;

  --text-h3: 1.5rem;
  --text-h3--line-height: 1.3;
  --text-h3--font-weight: 600;

  --text-h4: 1.25rem;
  --text-h4--line-height: 1.4;
  --text-h4--font-weight: 600;

  --text-body-lg: 1.125rem;
  --text-body-lg--line-height: 1.55;

  --text-body: 1rem;
  --text-body--line-height: 1.55;

  --text-body-sm: 0.875rem;
  --text-body-sm--line-height: 1.5;

  --text-caption: 0.75rem;
  --text-caption--line-height: 1.4;
  --text-caption--font-weight: 500;
  --text-caption--letter-spacing: 0.02em;

  --text-price: 1.25rem;
  --text-price--line-height: 1.2;
  --text-price--font-weight: 600;

  --text-price-lg: 2rem;
  --text-price-lg--line-height: 1.1;
  --text-price-lg--font-weight: 700;

  /* Shadows */
  --shadow-ember-glow: 0 0 20px rgba(255, 90, 31, 0.25);
  --shadow-ember-glow-lg: 0 0 32px rgba(255, 90, 31, 0.35);

  /* Timing */
  --ease-out-soft: cubic-bezier(0.16, 1, 0.3, 1);

  /* Animations */
  --animate-fade-in: fade-in 200ms ease-out;
  --animate-scale-in: scale-in 200ms cubic-bezier(0.16, 1, 0.3, 1);
  --animate-slide-up: slide-up 200ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ==========================================================
 * BASE LAYER
 * ========================================================== */
@layer base {
  * {
    border-color: var(--border);
    outline-color: color-mix(in oklab, var(--ring) 50%, transparent);
  }

  html {
    background-color: var(--background);
    color: var(--foreground);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    color-scheme: dark;
  }

  body {
    font-size: var(--text-body);
    line-height: 1.55;
  }

  ::selection {
    background-color: color-mix(in oklab, var(--primary) 30%, transparent);
    color: var(--foreground);
  }
}
```

**Why two `@theme` blocks?**

- `@theme inline` maps the **shadcn semantic variables** (`--primary`, `--card`, `--muted`, etc.) so shadcn components (`Button`, `Dialog`, `Card`...) pick up our Ember Orange theme automatically, out of the box, with zero per-component overrides.
- The plain `@theme` block keeps **our own extended tokens** (`ember-500`, `text-h1`, `shadow-ember-glow`...) available for custom, non-shadcn components (ProductCard, Desk Builder slots, price displays) that need finer control than the shadcn semantic layer offers.

Both systems read from the **same source hex values**, so there is never a mismatch between a shadcn `<Button>` and a custom `<ProductCard>` sitting next to each other.

---

## 5. UI Component Library: shadcn/ui

### 5.1 What shadcn/ui Is (and Isn't)

shadcn/ui is **not an npm dependency** you `import` from — it's a CLI that copies component **source code** (Button, Dialog, Tooltip, etc.) directly into `src/components/ui/`. You own and can freely edit every line. It's built on **Radix UI primitives** (accessibility, focus management, keyboard nav handled for you) styled with Tailwind CSS.

**Why this fits DevSpace:**

- Zero black-box abstraction — every component is fully readable/editable TypeScript in your repo
- Built-in accessibility (critical for Modals, Tooltips, Selects — already speced in § 3.4/3.5)
- Themed entirely through the CSS variables defined in § 4.3 — no per-component color props needed
- Pairs naturally with `lucide-react` (already in our stack) for icons

### 5.2 Installation

```bash
npx shadcn@latest init
```

The CLI will ask a few questions — recommended answers for DevSpace:

| Prompt                                           | Answer                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| Which style would you like to use?               | `New York` (denser, more technical feel — fits the dev/gaming aesthetic better than "Default")   |
| Which color would you like to use as base color? | `Neutral` (we'll overwrite the generated variables with our Ember values from § 4.3 right after) |
| Would you like to use CSS variables for theming? | `Yes`                                                                                            |

After `init` finishes, it will have generated its own starter CSS variables — **replace them** with the exact `:root` and `@theme inline` blocks from § 4.3 above, so the base color matches Ember Orange instead of the generated neutral default.

It also creates `components.json` at the project root — this is shadcn's own config file (path aliases, style choice), separate from Tailwind's config (which, as covered in § 4, no longer exists as a JS file in v4).

### 5.3 Adding Components

Components are added one at a time (or in a batch) as needed:

```bash
npx shadcn@latest add button card dialog tooltip badge input textarea select label separator skeleton sonner
```

Each command copies the component's source into `src/components/ui/[name].tsx`, ready to customize.

### 5.4 Mapping Our Component Specs (§ 3) to shadcn Primitives

| Our Spec (§ 3)                                    | shadcn Component                       | Customization Needed                                                                                                                                                   |
| ------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3.1 Buttons (Primary/Secondary/Ghost/Destructive) | `button`                               | Add a custom `variant` for our exact Primary/Ghost states if the default 6 variants don't map 1:1; extend via `class-variance-authority` (already a shadcn dependency) |
| 3.2 Product Card                                  | _Custom component_                     | Not a shadcn primitive — build directly using `card` as a structural base, then apply our custom hover/selected/out-of-stock states from § 3.2                         |
| 3.3 Badges                                        | `badge`                                | Extend variants to match our Success/Danger/Warning/Info/Bundle/Order-status badges from § 3.3                                                                         |
| 3.4 Modal Dialogs                                 | `dialog`                               | Apply our sizing scale (sm/md/lg) via a wrapper component; the Desk Builder Confirmation Modal (§ 3.4.1) is a custom composition built on top of `dialog`              |
| 3.5 Tooltips                                      | `tooltip`                              | Apply our 300ms delay and positioning rules from § 3.5; content styling comes for free from the `--popover` variable                                                   |
| Forms (Input, Textarea, Select, Label)            | `input`, `textarea`, `select`, `label` | Error states styled via `--destructive` variable; wrap in a `FormField` composition for label + error message                                                          |
| Toasts                                            | `sonner`                               | shadcn ships an official Sonner wrapper pre-themed to the CSS variables                                                                                                |

### 5.5 What We Still Build Custom

Not everything is a shadcn primitive. These remain fully custom components (as originally speced), often _composed_ with shadcn primitives underneath:

- **Product Card** — custom, uses `card` structurally
- **Desk Builder Slot Cards** — custom, uses `card` + `badge` (Selected state)
- **Desk Builder Confirmation Modal** — custom composition on top of `dialog`
- **Navbar / Footer** — fully custom layout components
- **Order Status Badge, Bundle Badge** — `badge` with custom variants

---

_End of Design System Guide — v1.1 MVP (Tailwind v4 + shadcn/ui)_
