# AUDIT-001 — Hardcoded Admin Password Fallback

**Status:** FIXED & APPROVED
**Fix commit:** `963acbb`
**Test commit:** `d8f3c7f`
**Approved by:** AI Pipeline Tester · 2026-03-28

## Before
- `getAdminPassword()` returned hardcoded `"KnowBest2026!"` when env var missing

## After
- `getAdminPassword()` throws `Error` when env var missing — fails safe

## Evidence
- Test file: `__tests__/audit/AUDIT-001.test.ts` (4 tests passing)
- Repro script: `repro/P0/AUDIT-001_test.sh`
