# AUDIT-001: Hardcoded Admin Password Fallback

**Priority:** P0
**Type:** security
**Tag:** backend
**Location:** `src/lib/admin-auth.ts` (getAdminPassword function)
**Verified:** true
**Repro:** success
**Status:** FIXED

## Description

The `getAdminPassword()` function contained a hardcoded fallback password `"KnowBest2026!"`. If the `ADMIN_PASSWORD` environment variable was missing, anyone who could read the source code would know the admin password.

## Steps to Reproduce

1. Remove or unset the `ADMIN_PASSWORD` environment variable from `.env`.
2. Run `grep -n "KnowBest2026" src/lib/admin-auth.ts` — should find the hardcoded string.
3. Start the dev server: `npm run dev`.
4. POST to `/api/admin/auth` with body `{ "password": "KnowBest2026!" }`.
5. **Expected (vulnerable):** Login succeeds with hardcoded password.
6. **Expected (fixed):** Server throws error — no fallback password exists.

## Reproduction Test

See `AUDIT-001_test.sh` — searches source code for hardcoded password string.

## Fix Applied

Removed the hardcoded fallback. `getAdminPassword()` now throws an error if `ADMIN_PASSWORD` env var is not set:

```typescript
export function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("Admin password is not configured. Please set ADMIN_PASSWORD environment variable.");
  }
  return password;
}
```
