# AUDIT-002: Insecure JWT Secret Fallback

**Priority:** P0
**Type:** security
**Tag:** backend
**Location:** `src/lib/admin-auth.ts` (getJWTSecret function)
**Verified:** true
**Repro:** success
**Status:** FIXED

## Description

The JWT signing function used a fallback string `"fallback-secret"` when both `ADMIN_SECRET` and `NEXTAUTH_SECRET` environment variables were missing. This allowed anyone who could read the source code to forge valid admin JWT tokens.

## Steps to Reproduce

1. Remove or unset both `ADMIN_SECRET` and `NEXTAUTH_SECRET` from `.env`.
2. Run `grep -n "fallback-secret" src/lib/admin-auth.ts` — should find the hardcoded string.
3. Start the dev server: `npm run dev`.
4. Craft a JWT signed with `"fallback-secret"` using HS256 algorithm with payload `{ "role": "admin" }`.
5. Set cookie `kb-admin-token` to the forged JWT.
6. Access any `/api/admin/*` endpoint.
7. **Expected (vulnerable):** Admin access granted with forged token.
8. **Expected (fixed):** Server throws error — no fallback secret exists.

## Reproduction Test

See `AUDIT-002_test.sh` — searches source code for fallback secret string.

## Fix Applied

Removed the hardcoded fallback. `getJWTSecret()` now throws an error if neither env var is set:

```typescript
function getJWTSecret(): string {
  const secret = process.env.ADMIN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not configured. Please set ADMIN_SECRET or NEXTAUTH_SECRET environment variable.");
  }
  return secret;
}
```
