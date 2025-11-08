# Invoice Easy — Quick Start & Project Map

A short, plain-language guide to this repository: what it is, how to run it, and where to find the main pages, APIs and helpers.

## What this project is
- A simple invoice app built with Next.js (App Router), TypeScript, Tailwind CSS, Prisma (Postgres) and Supabase for authentication.

## Quick start (local)
1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create `.env` from `.env.example` and set values for:
    - `DATABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `SUPABASE_SERVICE_ROLE_KEY` (server-side, optional)
    - `BLOB_READ_WRITE_TOKEN` (if you use Vercel Blob for uploads)
    - SMTP settings (if you use email features)

## Project structure (short)

## Project structure (short & current)

- `app/` — Next.js App Router
   - UI pages: `app/page.tsx`, `app/dashboard/*`, `app/login`, `app/signup`, `app/reset-password`, `app/pdf-test`, `app/env-check`
   - API routes: `app/api/*` (many endpoints; examples below)

- `app/api/` (examples)
   - `app/api/users/` — user profile, logo upload
   - `app/api/invoices/` — invoice creation, PDF endpoints
   - `app/api/auth/`, `app/api/pdf-warmup/`, `app/api/reports/`, `app/api/email/`, `app/api/chatbot/` — other server handlers

- `components/` — UI components and grouped folders
   - `components/ui/` — design primitives (buttons, cards, icons)
   - `components/dashboard/`, `components/invoices/`, `components/landing/`, `components/settings/` — feature groups

- `lib/` — business logic & helpers
   - `lib/prisma.ts` — Prisma client wrapper
   - `lib/supabase*.ts` — Supabase client/helpers
   - `lib/pdf-generator-fast.ts` — server-only PDF generator (keep in API routes)
   - Other helpers: `lib/api-cache.ts`, `lib/fast-user-cache.ts`, `lib/utils.ts`, `lib/cache-manager.ts`

- `hooks/` — React hooks (e.g., `use-toast.ts`, `use-fetch-once.ts`)
- `prisma/` — `schema.prisma` and migrations
- `public/` — static assets (images, favicon)
- `docs/` — documentation (migration notes, guides); I added `docs/quick-start.md`
- `scripts/` — small maintenance scripts
- `backups/` — DB dumps (optional)
- `types/` / `components.json` / `utils/supabase/` — misc helpers and type definitions

## Where to look (quick)

- Landing: `app/page.tsx`
- Dashboard: `app/dashboard/` (protected UI)
- Branding / logo UI: `app/dashboard/settings/branding`
- API handlers: `app/api/*` (search for the route folder)
- DB usage: `lib/prisma.ts` and `prisma/schema.prisma`
- Server auth: `lib/supabase.ts` and `lib/fast-user-cache.ts`

Note: keep server-only code (Puppeteer, blob token calls) inside `app/api/*` so it doesn't run at build-time or end up in client bundles.

Notes:

│   └── protected-route.tsx      # Route protection wrapper
├── lib/                         # Utilities and configurations
│   ├── auth-context.tsx         # Authentication context
│   ├── supabase.ts             # Supabase client
│   ├── types.ts                # TypeScript interfaces
│   └── utils.ts                # Helper functions
├── prisma/                      # Database schema and migrations
│   └── schema.prisma           # Database models
└── .env                        # Environment configuration
```

## � Detailed File & Folder Map

The list below maps important files and folders in this repository to their paths and a short description. Use this as a quick reference to find code, configuration, and utilities.

Top-level files and folders
- `app/` - Next.js App Router (pages and API routes; main application UI)
- `backups/` - Database dump backups (example dumps for recovery/testing)
- `components/` - Reusable React components and UI building blocks
- `components.json` - Component metadata/config used by the project
- `docker-compose.yml` - Docker compose for local services (if used)
- `docs/` - Documentation files (guides, rules, migration notes)
- `fix-supabase-routes.sh` - Helper script for fixing Supabase-related routes or permissions
- `hooks/` - React hooks used across the app (e.g., `use-toast.ts`)
- `lib/` - App utilities, clients, and shared logic (Supabase, prisma helpers, websocket client)
# Invoice Easy - Professional Invoice Management

Short description
-----------------

Invoice Easy is a full-stack invoice management application aimed at solo operators, contractors and small businesses. It uses Next.js (App Router), TypeScript, Tailwind CSS, Prisma and Supabase for auth and persistence.

This README focuses on a clear, developer-friendly project structure to help you quickly find code and contribute.

## Project structure (current, short)

This project has been reorganized. Use the small tree below to find the main folders and where things live now.

./
├─ .env.example                # Example env (copy to .env and fill)
├─ package.json                # NPM scripts & dependencies
├─ tsconfig.json               # TypeScript config
├─ next.config.js              # Next.js config
├─ tailwind.config.ts          # Tailwind config
├─ README.md                   # Project README (this file)
├─ docs/                       # Documentation (guides, quick-start)
├─ public/                     # Static assets (images, favicon)
├─ prisma/                     # Prisma schema & migrations
│  └─ schema.prisma
├─ app/                        # Next.js App Router (pages + API routes)
│  ├─ page.tsx                 # Landing page
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ login/
│  ├─ signup/
│  ├─ reset-password/
│  ├─ dashboard/               # Protected UI (invoices, settings)
│  └─ api/                     # Server endpoints (see examples below)
├─ components/                 # React components & UI groups
│  ├─ ui/
│  ├─ dashboard/
│  └─ invoices/
├─ lib/                        # Business logic, clients, helpers
│  ├─ prisma.ts
│  ├─ supabase.ts
│  ├─ pdf-generator-fast.ts     # Server-only PDF generator
│  └─ api-cache.ts
├─ hooks/                       # React hooks
├─ scripts/                     # Maintenance scripts
└─ backups/                     # Optional DB dumps

Examples under `app/api/`:
- `app/api/users/` — user profile & logo upload
- `app/api/invoices/` — invoice creation & PDF endpoints
- `app/api/auth/`, `app/api/pdf-warmup/`, `app/api/reports/`, `app/api/email/`

## Folder descriptions (short)

- app/: UI and server routes. Top-level React components and API routes live here. Use this as your starting point for UI changes.
- components/: Shared UI components and design primitives. `components/ui/` contains building blocks used across the app.
- lib/: Integrations and business logic. Supabase and Prisma helpers, WebSocket client, PDF helpers and other utilities.
- prisma/: Database schema and migration history. Edit `schema.prisma` for model changes and run migrations.
- public/: Static assets (images, fonts, client-side scripts) available under `/` at runtime.
- scripts/: Small maintenance scripts (database helpers, route fixes, etc.).
- tests/: Tiny scripts to validate DB connectivity and environment variables.

## Quick developer setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Create `.env` from `.env.example` and fill values (DATABASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SMTP, etc.)

3. Generate Prisma client and run migrations:

   ```powershell
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Run dev server:

   ```powershell
   npm run dev
   ```

Visit `http://localhost:3000`.

## Notes for contributors

- Keep changes scoped: modify `lib/` for business logic and `app/` for UI & routes.
- When adding new API routes, create a folder under `app/api/` and add route handlers there.
- If you add or modify Prisma models, run `npx prisma migrate dev` and commit the migration files.

---

If you'd like, I can now expand the `app/api/` section into a file-by-file map (showing specific route files), or generate a short CONTRIBUTING.md with coding conventions and PR checklist.

---

## 🔧 Setup (developer)

1. Install

```powershell
npm install
```

2. Create `.env` from `.env.example` and fill in credentials (Supabase, DATABASE_URL, SMTP, etc.).

3. Generate Prisma client and run migrations (after `.env`):

```powershell
npx prisma generate
npx prisma migrate dev --name init
```

4. Run dev server:

```powershell
npm run dev
```

Visit `http://localhost:3000`.

---

## 🚀 Deployment notes

- For Vercel builds, ensure Prisma client is generated during build. Add a `postinstall` script to `package.json`:

```json
"postinstall": "prisma generate"
```

- If you deploy in an environment without a persistent WS server, point `NEXT_PUBLIC_WS_URL` to your WebSocket provider or remove real-time features.

---

If you'd like, I can now:
- expand the `app/api/` section with a file-by-file list,
- add a CONTRIBUTING.md with dev conventions, or
- generate a short developer quickstart (one-liner commands and env checklist).
#   i n v o i c e - d e m o - l a n d 
 
 #   l a n d i n g - p a g e - n e w 
 
 #   l a n d i n g - p a g e - n e w 
 
 