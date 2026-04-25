# AUDIT-002 — Insecure JWT Secret Fallback

**Status:** FIXED & APPROVED
**Fix commit:** `963acbb`
**Test commit:** `d8f3c7f`
**Approved by:** AI Pipeline Tester · 2026-03-28

## Before
- JWT tokens signed with `"fallback-secret"` when env vars missing — tokens forgeable

## After
- Application throws `Error` when env vars missing — no insecure tokens created

## Evidence
- Test file: `__tests__/audit/AUDIT-002.test.ts` (4 tests passing)
- Repro script: `repro/P0/AUDIT-002_test.sh`
