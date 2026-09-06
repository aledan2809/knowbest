# TRUE E2E FULL Audit [10] — knowbest

**Date:** 2026-05-26
**Mode:** [10] True E2E Full Audit (Max-Speed: N)
**Target:** `knowbest/` (ACTIVE, standalone) — the canonical version (NOT deprecated `KB/` or `knowbest_fixes/`)
**Tested against:** `http://localhost:3000` (local dev server — project is NOT deployed)
**Verdict:** **PASS** (local-only applicable subset) — 1 real P2 bug found + fixed + re-verified; 0 open P0/P1.

---

## 0. Scope reality

knowbest is **local-only / not deployed** (`app.knowbest.ro` = NXDOMAIN; `knowbest.ro` 301 → unrelated host 45.67.39.205). It has **no "TRUE FULL E2E" workflow section** in a TODO_PERSISTENT, no test accounts, and no multi-role business workflows. Per the [10] anti-skip rule, the deployment/role/parity/stress phases are documented below as **explicit N/A blockers**, not silently skipped. The applicable subset (`/review` baseline + [7] CODE + [8] Journey) was run in full against the live local server.

---

## 1. Scope-vs-Completed matrix

| [10] Phase | Status | Notes |
|---|---|---|
| 0. `/review` baseline | ✅ DONE (substituted) | No PR/diff exists locally → cloud `/review` N/A. Substituted by manual review of gap areas + [7]'s AIRouter code-review section (5b). |
| 1. Pre-reqs (accounts + fixtures) | ⚠️ PARTIAL | No test accounts / role fixtures exist (no auth-gated app surface beyond `/admin`). Local Neon DB lacks `partners`/`kb_projects` tables (G-KB-ENV-001). |
| 2. [7] E2E Audit CODE | ✅ DONE | Composite 89/100, 8 plugins. Triage below. |
| 3. [8] E2E Audit Journey | ✅ DONE | 5/5 OK after fix (was 4 OK + 1 EMPTY). |
| 4. TRWG-GW (Tester-Gateway) | ⛔ N/A | No prod URL; TG flows target deployed apps. No `Tester-Gateway/apps/knowbest.json`. |
| 5. TWG loop | ⛔ N/A (not needed) | Single P2 found was fixed directly (1-line, ACTIVE project); no P0/P1 to loop on. |
| 6. Workflow scenarios | ⛔ N/A | No TRUE FULL E2E workflow scope defined for knowbest (marketing/portfolio site, not a multi-role workflow app). |
| 7. Concurrency | ⛔ N/A | No multi-user resource contention surface. |
| 8. Browser real headed (per role) | ⚠️ PARTIAL | Journey audit (Playwright) walked the 5 public pages; no roles to play. |
| 9. Parity (demo/prod, multi-tenant) | ⛔ N/A | Not deployed → no prod to compare; single-tenant. |
| 10. Stress + audit trail | ⛔ N/A | Not deployed; load-tester plugin (local) = 100/100. |
| Role-play (multi-role) | ⛔ N/A | knowbest has no defined business roles (public site + single `/admin`). |

**Tool coverage:** `/review` (substituted) ✅ · [7] CODE ✅ · [8] Journey ✅ · TG ⛔ · TWG ⛔(not needed).

---

## 2. [7] CODE Audit — composite 89/100, triaged

| Plugin | Score | Real? |
|---|---|---|
| infra-checker | 100 | — |
| security-scanner | 100 | — |
| load-tester | 100 | — |
| multi-browser | 100 | — |
| cross-suggester | 100 | — |
| api-tester | 94 (2 issues) | **partly real** — see API 500s (env) |
| a11y-scanner | 75 (3 issues) | **false positive** (redirect-root) |
| mobile-tester | 50 (6 issues) | **false positive** (redirect-root) |

**Triage — every flagged issue verified against the real page:**

- **FALSE POSITIVES (audited the bare `/` 307-redirect root, which has no HTML `<body>`):**
  - "Missing viewport meta on /", "Documents must have `<title>` on /", "Keyboard focus trap on /", "1/1 touch targets <44px on /".
  - Verified on the real homepage `/ro`: `<meta name="viewport" content="width=device-width, initial-scale=1"/>` **present** + `<title>KnowBest - Solutii Software Profesionale</title>` **present**. G-KB-001 (viewport) stays eliminated.
- **ENV (not a code defect) — G-KB-ENV-001:** `GET /api/partners` → 500 `{"error":"Failed to fetch partners"}`, `GET /api/projects` → 500. Root cause: local Neon `neondb` has no `partners`/`kb_projects` tables ("not managed by Prisma Migrate"). `/api/health` reports `database: connected`. Route code is correct (try/catch → graceful 500 + log). On a migrated deploy these return 200. **Not "fixed"** — correct code + unmigrated local DB; schema not mutated as part of an audit.
- **Security note (positive):** api-tester's SQL-injection probe `GET /api/admin/partners?id=' OR 1=1--` was correctly rejected with **401** (auth gate working).

**Net after triage: 0 real code defects in [7]** (consistent with ML2 Wave 5 = PASS / 100% false positives).

---

## 3. [8] Journey Audit — REAL BUG found + fixed (G-KB-007, P2)

**First run:** 4 OK + **1 EMPTY** (Home `/ro`, `bodyLen=30`) — a regression vs the 2026-05-18 5/5 OK.

**Root cause (confirmed in code + dev log):** `src/app/[locale]/page.tsx` is a `"use client"` component that fetches `/api/projects` + `/api/partners` in `useEffect`. SSR renders the full page (`partners=[]`), but after hydration the fetch resolves; with `/api/partners` returning the error object `{error:"..."}`, `setPartners(partnersData || [])` stored the **object**, then line 246 `{[...partners, ...partners].map(...)}` threw `TypeError: not iterable` → unhandled render exception → **homepage white-screened**. The `.catch()` did not catch it (crash is on the subsequent render).

**Severity P2 — genuine resilience bug:** any transient `/api/partners` failure in production would white-screen the entire homepage. Local DB drift merely exposed it.

**Fix (commit `ae3ad23`, 2 lines, surgical):**
```diff
-        const projects = projectsData.projects || [];
+        const projects = Array.isArray(projectsData?.projects) ? projectsData.projects : [];
-        setPartners(partnersData || []);
+        setPartners(Array.isArray(partnersData) ? partnersData : []);
```

**Verification ritual (re-ran the failing test after fix):** journey audit re-run → Home `/ro` **EMPTY→OK** (`bodyLen=1643`, h1="KnowBest"). **Journey now 5/5 OK**, even with the partners/projects APIs still 500ing locally (graceful degradation proven). `npx tsc --noEmit` clean.

---

## 4. Phase 0 baseline review (prior fixes held)

- Rate limiting present on `/api/contact`, `/api/ai`, `/api/create-checkout-session` → **G-KB-002/003/004 stay eliminated**.
- CSRF `verifyOrigin` allowlist (Origin + Referer fallback) intact.
- G-KB-005 (no origin check on GET admin routes) + G-KB-006 (console.error in prod) remain **OPEN/accepted P3** — low risk, unchanged.

---

## 5. Outcome

- **Real bugs found:** 1 (G-KB-007, P2) → **fixed + re-verified**.
- **Open P0/P1:** 0.
- **Open items:** G-KB-005, G-KB-006 (P3 accepted); G-KB-ENV-001 (local env, not code).
- **Commit:** `ae3ad23`.
- **Artifacts:** [7] `Reports/AUDIT_E2E_2026-05-26.md`; [8] `journey-audit-results/knowbest/{report.json,screenshots/}`.

**Note:** local dev server was stopped after the audit; no deploy (project is local-only, no auto-deploy configured).
