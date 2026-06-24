# AUDIT_GAPS — knowbest
Last Updated: 2026-06-24

## Eliminated Gaps

| ID | Severitate | Descriere | Status | Commit | Data |
|----|-----------|-----------|--------|--------|------|
| G-KB-CMS-01 | P2 | CMS gol: `seed-page-content.ts` scrie câmpul `type` inexistent în `PageContent` → upsert aruncă → tabel gol → pagini pe fallback i18n. Fix: coloană `type String @default("text")` (aditiv). **LIVE pe VPS2 2026-06-24**: `prisma db push` (coloana adăugată, default `'text'`) + seed re-rulat → `page_content` 0→153 rânduri. Backup pre-deploy `/root/backups/knowbest-pre-cms-2026-06-24.dump`. | Eliminated + LIVE | 4897b0d | 2026-06-24 |
| G-KB-SEO-01 | P2 | Lipsă `sitemap.ts` + `robots.ts` (SEO 60/100). Adăugate la `src/app/` (rute publice × locale; zone private disallow). | Eliminated | 4897b0d | 2026-06-24 |
| G-KB-SEO-02 | P2 | 2× H1/pagină (brand Navbar `h1` + h1 real). Navbar `h1`→`span`; pricing primește h1 propriu. Un singur H1/pagină. | Eliminated | 4897b0d | 2026-06-24 |
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
