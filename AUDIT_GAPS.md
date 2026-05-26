# AUDIT_GAPS — knowbest
Last Updated: 2026-05-26

## Eliminated Gaps

| ID | Severitate | Descriere | Status | Commit | Data |
|----|-----------|-----------|--------|--------|------|
| G-KB-001 | P2 | Lipsă viewport export Next.js 16 (layout.tsx) | Eliminated | 14c320f | 2026-05-18 |
| G-KB-002 | P1 | Lipsă rate limiting pe /api/contact (email spam) | Eliminated | 14c320f | 2026-05-18 |
| G-KB-003 | P1 | Lipsă rate limiting pe /api/ai (per-IP, defense-in-depth) | Eliminated | 14c320f | 2026-05-18 |
| G-KB-004 | P1 | Lipsă rate limiting pe /api/create-checkout-session (Stripe spam) | Eliminated | 14c320f | 2026-05-18 |
| G-KB-007 | P2 | Home `/ro` white-screen crash când `/api/partners` returnează non-array (`[...partners]` not iterable) — homepage degradează acum grațios | Eliminated | ae3ad23 | 2026-05-26 |

## Open Gaps

| ID | Severitate | Descriere | Status | Note |
|----|-----------|-----------|--------|------|
| G-KB-005 | P3 | CSRF origin check lipsă pe GET admin routes | OPEN | GET nu modifică state; risc scăzut, acceptat |
| G-KB-006 | P3 | console.error() în producție | OPEN | Monitorizare normală, risc scăzut |
| G-KB-ENV-001 | env | Local dev Neon DB (`neondb`) nu are tabelele `partners` + `kb_projects` (no migrations applied; "not managed by Prisma Migrate") → `/api/partners` + `/api/projects` 500 local | OPEN (env, nu cod) | Cod-ul rutelor e corect (try/catch → 500 grațios). Pe un deploy migrat → 200. NU se modifică schema Neon ca parte din audit. |

Journey audit (True E2E [10], 2026-05-26): 5/5 OK (/ro, /ro/products, /ro/pricing, /ro/about, /ro/contact) — Home EMPTY→OK după fix G-KB-007.
[7] CODE audit composite 89/100; după triaj 0 defecte reale de cod (restul = false-positives pe `/` redirect-root + G-KB-ENV-001 local DB drift).
True E2E [10] Verdict: PASS (local-only subset — vezi Reports/TRUE-E2E-FULL-2026-05-26.md pentru fazele N/A).
