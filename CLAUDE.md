# knowbest — SaaS Project Portfolio Management

## Overview
SaaS platform for project portfolio management with CMS admin panel and
multilingual support. Standalone Next.js app, not yet deployed (per
`Master/DEPLOY_REGISTRY.md` Local-Only section).

## Stack
- **Frontend/Backend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind
- **Database**: Prisma 5/6 + PostgreSQL
- **Auth**: NextAuth
- **Payments**: Stripe (via `@aledan/stripe` shared lib)
- **AI**: AIRouter (synced into the project via `npm run sync-ai-router`
  before `dev` and `build`)
- **i18n**: multilingual content surface managed via the CMS admin

## Build & Run
```bash
npm install
npm run dev        # syncs AIRouter then runs next dev on port 3000
npm run build      # syncs AIRouter then production-builds
npm test           # vitest / jest (per project setup)
```

The `sync-ai-router` step copies the local AIRouter build into this
repo's runtime path. Do not skip it — `next build` will fail if the
synced files are stale or missing.

## Project Structure
- `app/` — Next.js App Router routes (admin, CMS, public portfolio surface)
- `prisma/schema.prisma` — DB schema (projects, content blocks, users, locales)
- `prisma/seed-page-content.ts` — content seeder
- `scripts/sync-ai-router.*` — pulls AIRouter dist into runtime path

## DO NOT MODIFY
- `prisma/schema.prisma` without verifying DB state first (per Master memory
  `feedback_prisma_db_vs_schema`)
- AIRouter sync output paths — they're consumed by runtime imports

## Env Vars
```
DATABASE_URL=...
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
ANTHROPIC_API_KEY=...   # via AIRouter
```

Credentials live in `Master/credentials/` per Master `CLAUDE.md` §5
(MASTER CREDENTIAL REPOSITORY). Do not check secrets into this repo.

## Related ecosystem entries
- `Master/CLASSIFICATION.md` — knowbest = ACTIVE (standalone)
- `Master/ECOSYSTEM_REGISTRY.md` — knowbest entry under Platforms & Marketplaces
- `Master/DEPLOY_REGISTRY.md` — Local-Only #11
- Note: `knowbest_fixes/` and `KB/` siblings are DEPRECATED (per Master
  CLASSIFICATION §1 entries 4 + 8). This directory is the canonical version.

## Standing rules
- For any changes that touch payment flows, treat `app/api/payments/*` (or
  Stripe webhook routes) with NO-TOUCH-CRITIC-style discipline: small
  surgical edits, smoke test against Stripe test mode before deploy.
- For schema migrations, follow Master memory `feedback_prisma_db_vs_schema`:
  run `prisma migrate status` against the target DB first; never blind
  `migrate deploy` on a non-empty schema (P3005).

## Governance Reference
See: `Master/knowledge/MASTER_SYSTEM.md` §1-§5. This project follows
Master governance; do not duplicate rules.
