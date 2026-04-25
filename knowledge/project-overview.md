# knowbest — Project Overview

## What It Is

knowbest is a multi-project knowledge platform built on Next.js 16 with NextAuth (Email Magic Link), Prisma ORM on Neon PostgreSQL, and Stripe subscriptions. It serves as a presentation and management portal across multiple i18n locales (RO/EN).

## Tech Stack

- **Framework:** Next.js 16 (App Router, RSC)
- **Language:** TypeScript 5
- **Database:** PostgreSQL (Neon serverless)
- **ORM:** Prisma
- **Auth:** NextAuth with Prisma adapter + Email Magic Link (Resend)
- **Payments:** Stripe (Checkout Sessions + Webhooks)
- **i18n:** next-intl (locales: `ro`, `en`)
- **UI:** Tailwind CSS 4, Radix UI primitives via `@base-ui/react`, Framer Motion
- **Deploy:** VPS PM2 (port via ecosystem.config.js)
- **AI Routing:** `ai-router` package (local link to `../AIRouter`)

## Key Architectural Decisions

1. **Route structure:** `src/app/[locale]/<page>/page.tsx` for public pages, `src/app/api/<route>/route.ts` for API endpoints
2. **Auth-gated content:** Admin routes protected via `src/lib/admin-auth.ts` (requires `ADMIN_PASSWORD` + `ADMIN_SECRET` env vars — no fallbacks allowed; throws Error at startup if missing)
3. **Internationalization-first:** All user-facing pages live under `[locale]`, machine translations via `messages/<locale>.json`
4. **Partners/content dynamic:** Currently hardcoded; planned migration to `Partner` and `PageContent` Prisma models (see AUDIT-009)
5. **Credits/Usage:** `UsageRecord` model exists; tracking logic pending (AUDIT-012)

## Primary Prisma Models

- `User`, `Account`, `Session`, `VerificationToken` — NextAuth standard
- `Subscription` — Stripe subscription lifecycle
- `ApiKey` — user API keys (management UI pending, AUDIT-011)
- `Partner` — partner logos (migration pending, AUDIT-009)
- `PageContent` — editable CMS-like content blocks
- `Project`, `projects` — legacy overlap, to consolidate
- `knowledge_entries` — AI knowledge base records

## API Endpoints

Public:
- `POST /api/contact` — contact form submission
- `POST /api/ai` — AI proxy through `ai-router`
- `GET /api/partners` — partner logos
- `GET /api/page-content` — CMS blocks

Auth/Payments:
- `/api/auth/[...nextauth]` — NextAuth catch-all
- `POST /api/create-checkout-session` — Stripe checkout
- `POST /api/stripe-webhook` — Stripe event handler

Admin (protected):
- `POST /api/admin/auth` — admin login
- `/api/admin/projects`, `/api/admin/partners`, `/api/admin/page-content`

## Audit Status (as of 2026-04-16)

- **Fixed (5):** P0 security (hardcoded passwords + JWT fallback), P1 (NextAuth route, Stripe integration, auth UI pages) — commit `963acbb`
- **Pending (7 after this session):** AUDIT-005 Zod validation (P1), AUDIT-008 CSRF, AUDIT-009 Partner migration, AUDIT-011 ApiKey UI, AUDIT-012 Usage tracking (P2)
- **Fixed this session (5):** AUDIT-005 Zod (P1), AUDIT-007 redact creds (P2), AUDIT-008 CSRF (P2), AUDIT-010 shared layout (P2), AUDIT-013 this doc (P2)

## References

- Regression tests: `tests/regression/audit/*.test.ts`
- Fix reports: `Reports/AUDIT_E2E_2026-03-21_FIXED.md`
- Session logs: `Reports/SETUP_COMPLETE.md`, `Reports/ENV_SETUP_LOG.md`
