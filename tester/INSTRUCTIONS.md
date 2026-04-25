# Tester Verification Guide

**Project:** knowbest
**Date:** 2026-03-28
**Audit Source:** `Reports/AUDIT_E2E_2026-03-21.md`

---

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure environment variables are set (check `.env`):
   - `ADMIN_PASSWORD` — required for admin auth
   - `ADMIN_SECRET` or `NEXTAUTH_SECRET` — required for JWT signing
   - `DATABASE_URL` — required for Prisma/DB operations

3. Run the automated regression suite:
   ```bash
   npm run test:audit-regression
   ```
   Expected: **31 tests passing** across 5 test files.

---

## Verification Steps

### Step 1: Review Fixed Issues Report
- Open `AUDIT_E2E_2026-03-21_FIXED.md` for the full fixed audit report.
- Cross-reference with `CHANGES_SUMMARY.txt` for a quick overview of all fixes.

### Step 2: Run Automated Tests
```bash
# Full regression suite
npm run test:audit-regression

# Individual P0 tests
npx vitest run __tests__/audit/AUDIT-001.test.ts
npx vitest run __tests__/audit/AUDIT-002.test.ts
```

### Step 3: Manual P0 Verification
See `TESTER_NOTES.md` for detailed manual verification steps for 3 P0/P1 fixes:
- AUDIT-001: Hardcoded admin password removed
- AUDIT-002: Insecure JWT secret removed
- AUDIT-003: NextAuth route implemented

Quick manual checks:
```bash
# Verify no hardcoded secrets in admin-auth.ts
grep -n "KnowBest2026" src/lib/admin-auth.ts    # should return nothing
grep -n "fallback-secret" src/lib/admin-auth.ts   # should return nothing

# Verify NextAuth route exists
ls src/app/api/auth/\[...nextauth\]/route.ts

# Verify auth pages exist
ls src/app/\[locale\]/auth/signin/page.tsx
ls src/app/\[locale\]/auth/verify-request/page.tsx
ls src/app/\[locale\]/auth/error/page.tsx

# Verify Stripe routes exist
ls src/app/api/create-checkout-session/route.ts
ls src/app/api/stripe-webhook/route.ts
ls src/app/\[locale\]/pricing/page.tsx
```

### Step 4: Build Verification
```bash
npm run build
```
Build should complete without errors.

### Step 5: Report Discrepancies
If any issues are found, document them in `TESTER_FEEDBACK.md` using this format:
```markdown
## [AUDIT-XXX] — Issue Title
- **Expected:** [what should happen]
- **Actual:** [what actually happens]
- **Steps to reproduce:** [how to trigger the issue]
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `AUDIT_E2E_2026-03-21_FIXED.md` | Full audit report with fix details and before/after |
| `CHANGES_SUMMARY.txt` | Quick summary of all fixed issues + test commands |
| `TESTER_NOTES.md` | Manual verification steps for 3 P0 fixes |
| `Reports/AUDIT_PARSED.md` | Parsed audit with status tracking |
| `Reports/AUDIT_PARSED.json` | Machine-readable audit data |

---

## Pending Issues (Not In Scope)

8 issues remain pending (1 P1 + 7 P2). These are documented in the fixed audit report under "Pending Issues" and are **not** expected to pass verification at this time.
