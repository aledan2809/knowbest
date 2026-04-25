# knowbest — Developer Onboarding

## Prerequisites

- Node.js >= 20
- npm 10+ (or pnpm 9)
- Access to Neon PostgreSQL database
- Anthropic or other AI provider API key (for `/api/ai`)
- Resend account + API key (for NextAuth email magic links)
- Stripe account (for subscriptions)

## First-Time Setup

1. **Clone and install:**
   ```bash
   git clone <repo>
   cd knowbest
   npm install
   ```

   This also auto-syncs `ai-router` from `../AIRouter` via `npm run sync-ai-router` (see `scripts` in `package.json`).

2. **Environment variables:**
   Copy `.env.example` to `.env.local` and fill:
   ```env
   # Database
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=<openssl rand -base64 32>

   # Admin (BOTH REQUIRED — no fallbacks)
   ADMIN_PASSWORD=<bcrypt hash of your admin password>
   ADMIN_SECRET=<openssl rand -base64 32>

   # Email (Resend for magic links)
   RESEND_API_KEY=re_...
   EMAIL_FROM=noreply@yourdomain.com

   # AI
   ANTHROPIC_API_KEY=sk-ant-...

   # Stripe
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

3. **Generate admin password hash:**
   ```bash
   node -e "require('bcryptjs').hash('your-admin-password', 12).then(h => console.log(h))"
   ```
   Copy the output into `ADMIN_PASSWORD` env var.

4. **Generate Prisma client + run migrations:**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start dev server:**
   ```bash
   npm run dev
   ```
   Accessible at http://localhost:3000

## Running Tests

```bash
# Regression tests for audit fixes
npx vitest run tests/regression/audit/

# All tests
npm test
```

## Common Workflows

### Adding a new page (localized)

1. Create `src/app/[locale]/<page-name>/page.tsx`
2. Add translations in `messages/ro.json` and `messages/en.json` under relevant namespace
3. Import `getTranslations` from `next-intl/server` in the page
4. The shared `[locale]/layout.tsx` automatically provides Navbar + Footer (as of AUDIT-010 fix)

### Adding a new API route

1. Create `src/app/api/<route>/route.ts`
2. **Always add Zod validation** for request body (AUDIT-005 standard)
3. For state-changing endpoints on public routes: add CSRF protection via middleware or server actions
4. For admin routes: wrap with `requireAdminAuth()` from `src/lib/admin-auth.ts`

### Running a Prisma migration

```bash
# Development (auto-applies)
npx prisma migrate dev --name "describe_change"

# Production (apply pre-generated migrations)
npx prisma migrate deploy
```

### Stripe webhook testing locally

```bash
# In separate terminal
stripe listen --forward-to localhost:3000/api/stripe-webhook
# Copy the whsec_... output into STRIPE_WEBHOOK_SECRET env
```

## Deploy (VPS via PM2)

See `ecosystem.config.js` for PM2 configuration. Deploy script typically:

```bash
ssh root@vps "cd /var/www/knowbest && git pull && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build && pm2 restart knowbest"
```

## Troubleshooting

### "Error: ADMIN_PASSWORD is not configured"
Missing `ADMIN_PASSWORD` or `ADMIN_SECRET` env var. This is intentional (AUDIT-001/002 fix) — no insecure fallback. Set both in `.env.local`.

### "Module not found: Can't resolve 'ai-router'"
Run `npm run sync-ai-router` manually, or ensure `../AIRouter` repo exists and is built (`cd ../AIRouter && npm run build`).

### Prisma client errors after schema changes
```bash
npx prisma generate
```

### NextAuth magic links not arriving
Check `RESEND_API_KEY` is valid and `EMAIL_FROM` domain is verified in Resend dashboard.
