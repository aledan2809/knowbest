# Audit E2E 2026-03-21: Lessons Learned

**Project:** knowbest
**Audit Date:** 2026-03-21
**Fix Date:** 2026-03-28
**Total Issues:** 13 (2 P0, 4 P1, 7 P2)
**Fixed:** 5/13 (100% P0, 75% P1)

---

## Root Causes

### P0 Issues (2 — All Fixed)
- **Hardcoded credential fallbacks** in `src/lib/admin-auth.ts` (AUDIT-001, AUDIT-002)
  - `getAdminPassword()` returned hardcoded `"KnowBest2026!"` when env var missing
  - `getJWTSecret()` fell back to `"fallback-secret"` literal string
  - **Pattern:** Functions using `||` with string literals for security-critical values
  - **Fix:** Replace fallback patterns with `throw new Error()` — fail safe, never fail open

### P1 Issues (3 Fixed, 1 Pending)
- **Missing feature implementations** despite having dependencies installed and DB models defined
  - NextAuth route missing (AUDIT-003) — `next-auth` installed, Prisma models ready, no API route
  - Stripe integration missing (AUDIT-004) — `stripe` installed, `Subscription` model ready, no routes/UI
  - Auth UI pages missing (AUDIT-006) — no login/signup despite auth backend existing
- **Pending:** No input validation/Zod on API routes (AUDIT-005) — deferred for schema design

### P2 Issues (7 — All Pending)
- Credentials in audit report file (AUDIT-007)
- No CSRF protection on contact form (AUDIT-008)
- Hardcoded partner logos instead of DB-driven (AUDIT-009)
- Navbar/Footer imported per-page instead of layout (AUDIT-010)
- API Key management not implemented (AUDIT-011)
- Usage tracking not implemented (AUDIT-012)
- Empty knowledge/ folder (AUDIT-013)

---

## Time Spent

| Issue Type | Count | Avg. Resolution | Notes |
|---|---|---|---|
| Security — Hardcoded secrets (P0) | 2 | ~30 min each | Simple pattern: remove fallback, add throw |
| Missing feature implementation (P1) | 3 | ~1-2 hrs each | Required creating routes + UI + integration |
| Input validation (P1) | 1 | Deferred | Needs Zod schema design per endpoint |
| P2 improvements | 7 | Deferred | Lower priority, planned for next audit cycle |

| **Total** | **5 fixed** | **~4-5 hrs** | Phases 1-10 of pipeline, includes testing + tester verification |

---

## Tooling Gaps

- **E2E Test Coverage:** Only P0 issues got dedicated test files (`__tests__/audit/AUDIT-001.test.ts`, `AUDIT-002.test.ts`). P1 fixes (NextAuth, Stripe, Auth UI) lack automated tests.
- **Input Validation:** No Zod schemas exist for any API route. All public endpoints (`/api/contact`, `/api/projects`) and admin endpoints accept raw unvalidated input.
- **Pre-commit Hooks:** No pre-commit hooks to catch hardcoded secrets. Consider adding `gitleaks` or similar secret scanning.
- **Audit Report Hygiene:** Database connection strings with credentials appeared in the audit report itself (AUDIT-007). Audit tooling should auto-redact sensitive values.
- **Dependency-Model Sync:** Multiple issues (AUDIT-003, 004, 006, 011, 012) stem from installing npm packages and defining Prisma models without implementing the corresponding features. A checklist or CI check for "orphan dependencies" would catch this pattern early.

---

## Recommendations for Future Audits

1. **Add secret scanning** to CI pipeline (gitleaks, truffleHog)
2. **Enforce Zod validation** on all API routes before next audit
3. **Expand test coverage** — minimum 1 test file per fixed issue, not just P0
4. **Auto-redact credentials** in audit report generation tooling
5. **Track orphan dependencies** — flag installed packages with no import references

---

## Key Takeaways

1. **Fail-safe over fail-open**: Environment variable fallbacks with hardcoded strings are a recurring security anti-pattern. Always throw on missing required config.
2. **Scaffold ≠ Implement**: Installing a dependency and creating a DB model is not a feature. Track scaffolded-but-unimplemented features explicitly.
3. **Validation at the boundary**: Every public API route needs input validation — should be a non-negotiable part of route creation.
4. **Test what you fix**: Every P0/P1 fix should ship with at least one regression test.

---

*Generated 2026-03-28 · knowbest Big Pipeline Phase 11*
