<div align="center">

# 🖥️ DevSpace

**An E-Commerce Platform for Developer & Gaming Desk Setups**

_Build your perfect workspace, one component at a time._

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-components-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Git](https://img.shields.io/badge/Version%20Control-Git%20%2F%20GitHub-F05032?logo=git&logoColor=white)](https://git-scm.com/)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started)

</div>

---

## 📖 About The Project

**DevSpace** is a full-stack e-commerce application designed for developers and gamers to shop for desk gear and customize their ideal workspace.

The platform features an interactive **Desk Builder** that allows users to assemble workspace bundles with dynamic discount logic applied automatically.

---

## ✨ Features

### 🛍️ For Customers

- Browse a curated catalog with **full-text search**, **filters**, and **sorting**
- View detailed product pages with **image galleries** and **customer reviews**
- **Guest cart** — shop without an account (localStorage-backed)
- **Smart cart merge** — your guest cart syncs seamlessly on login
- **Desk Builder** — assemble a complete workspace and save 5% on bundles of 3+ items
- Secure checkout with **Cash on Delivery**
- Track your orders through the delivery lifecycle
- Post reviews and rate products

### 🔐 For Admins

- Complete **Product CRUD** with image gallery management
- **Order management** with status lifecycle control
- **Review moderation**
- **KPI dashboard** with real-time business metrics

---

## 🔧 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Dark Mode by default)
- **UI Components:** shadcn/ui, Lucide Icons & Sonner (toasts)
- **Backend & Auth:** Supabase (PostgreSQL, Auth, RLS, Storage)
- **State Management:** React Query (Server State) & Zustand (Client State)
- **Form & Validation:** React Hook Form + Zod
- **Version Control:** Git / GitHub

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20.9+
- Git
- A [Supabase](https://supabase.com/) account

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/saharsalemcs/devspace.git
cd devspace

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL + keys from your Supabase project settings

# 4. Run database migrations
npx supabase db push

# 5. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📁 Project Structure

```
devspace/
├── src/
│   ├── app/              # Next.js App Router (pages & routes)
│   ├── components/       # UI components (shadcn/ui + custom)
│   ├── lib/               # Supabase clients, schemas, utils
│   ├── hooks/             # React Query hooks
│   ├── stores/            # Zustand stores
│   └── types/              # Shared TypeScript types
│
├── supabase/              # Database migrations & seed data
├── docs/                  # Project documentation
└── public/                # Static assets
```

---

### State Management Strategy

| State Type       | Tool                      | Examples                                        |
| ---------------- | ------------------------- | ----------------------------------------------- |
| **Server State** | React Query 5             | Products, Orders, Reviews, Categories           |
| **Client State** | Zustand 5                 | Guest Cart, Desk Builder Selections, UI Toggles |
| **URL State**    | Next.js `useSearchParams` | Filters, Search Query, Pagination               |
| **Form State**   | React Hook Form + Zod     | Login, Register, Checkout, Product Forms        |

---

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Production
npm run build            # Create production build
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Run TypeScript compiler check

# shadcn/ui
npx shadcn@latest add [component]     # Add a new component
npx shadcn@latest diff [component]    # Check for upstream updates to a component

# Supabase (if using CLI)
npx supabase start       # Start local Supabase instance
npx supabase db push     # Push migrations to remote
npx supabase gen types typescript --local > src/types/database.ts
```

---

## 📚 Documentation

| Document                                      | Description                                                   |
| --------------------------------------------- | ------------------------------------------------------------- |
| [`project-spec.md`](docs/project-spec.md)     | Functional specification, roles, features, and pages          |
| [`design-system.md`](docs/design-system.md)   | Colors, typography, components, Tailwind v4 + shadcn/ui setup |
| [`db-schema.md`](docs/db-schema.md)           | Database schema, business rules, triggers, and RPCs           |
| [`task-breakdown.md`](docs/task-breakdown.md) | Phase-by-phase implementation checklist                       |

---
