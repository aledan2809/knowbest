# Gap Analysis — Strategie vs. Cod (knowbest)

**Data:** 2026-06-20 · **Tip:** introspecție read-only (fără modificări de cod) · **Țintă:** `/Users/danciulescu/Projects/knowbest` (ACTIVE, LIVE pe https://app.knowbest.ro)

---

## 🗣️ Pe înțelesul tău + implicații (non-tehnic)

knowbest e **vitrina online** a ecosistemului tău de produse software — un fel de „portofoliu + magazin de prezentare" pentru cele ~28-30 de aplicații (clinici, asociații de proprietari, fitness, trading etc.). Are pagini publice (acasă, produse, studii de caz, despre, contact, prețuri), un **panou de administrare** unde poți edita produsele și conținutul fără să atingi codul, suport pentru **două limbi** (română + engleză) și **plăți Stripe** pentru abonamente.

**Vestea bună:** codul este **mai avansat decât documentația**. În ultimele săptămâni au fost livrate funcții reale (pagini legale conectate la hub-ul Legal, banner de cookie-uri, logos de clienți reali, texte orientate pe business) care **NU sunt încă reflectate în strategie/documentație**. Cu alte cuvinte, nu lipsesc funcții — lipsește **documentația care să țină pasul cu ce ai construit deja**.

**Singura problemă tehnică reală** găsită: un script de „populare CMS" (`seed-page-content.ts`) scrie într-o coloană (`type`) care **nu mai există** în baza de date. Efectul practic: panoul CMS rămâne gol, iar paginile afișează textele din fișierele de traducere (mecanismul de rezervă) în loc de textele din baza de date. Site-ul **funcționează perfect** pentru vizitator — dar CMS-ul nu-și face treaba până nu repari acest mic decalaj.

**Ce înseamnă asta pentru tine, în 3 puncte:**
1. **Nimic de tăiat.** Codul e mai bogat decât strategia → strategia trebuie **ridicată la nivelul codului**, nu invers.
2. **Un singur fix tehnic prioritar** (CMS seed) ca panoul de administrare să devină util — restul sunt îmbunătățiri, nu defecte.
3. **Documentația e veche** (CLAUDE.md spune „not deployed", DESIGN-IDEAS spune „cookie consent: currently none") — dar realitatea e că site-ul e LIVE și acele funcții EXISTĂ deja.

---

## Inventar real al codului (dovezi)

| Metrică | Valoare | Comandă / dovadă |
|---|---|---|
| Pagini (`page.tsx`) | **18** | `find src/app -name page.tsx \| wc -l` |
| Rute API (`route.ts`) | **21** | `find src/app/api -name route.ts \| wc -l` |
| Modele Prisma | **25** | `grep -c '^model ' prisma/schema.prisma` |
| Module `src/lib` | **10** | `admin-auth, ai-router, api-key, csrf, db, legal-doc, page-content, usage, utils` (+1) |
| Limbi (i18n) | **2** (ro/en) | `src/i18n/routing.ts` → `locales: ['ro','en']`, `defaultLocale: 'ro'` |
| Commit-uri în istoric | ~20 | `git log --oneline` (HEAD `9cf616b`) |

**Modele Prisma (25)** — observație: schema conține un **bloc legacy** mare de modele `music_*` (9 modele: `music_generations`, `music_users`, `music_tracks`, `music_playlists` etc.) + `launchers` + `project_capabilities` + `test_results` care **nu au legătură cu knowbest** (par moștenite dintr-o bază partajată / proiect Music). Modelele active knowbest: `users`, `sessions`, `Subscription`, `UserApiKey`, `UsageRecord`, `api_keys`, `Partner`, `PageContent`, `Project`, `projects`, `knowledge_entries`, `audit_logs`, `user_preferences`.

**Rute API (21), grupate:**
- Public: `/api/contact`, `/api/ai`, `/api/partners`, `/api/projects`, `/api/page-content`, `/api/knowledge`, `/api/health`
- Auth/Plăți: `/api/auth/[...nextauth]`, `/api/create-checkout-session`, `/api/stripe-session`, `/api/stripe-webhook`
- Cont user: `/api/user/api-keys`, `/api/user/usage`
- Admin (protejate): `/api/admin/auth`, `/api/admin/projects`, `/api/admin/partners`, `/api/admin/page-content`, `/api/admin/knowledge`, `/api/admin/audit-logs`
- Legal (consimțământ): `/api/v1/consent/document`, `/api/v1/consent/record`

---

## (a) Promis în strategie, dar LIPSEȘTE în cod

Puține — strategia e mai *săracă* decât codul (vezi secțiunea b). Reale lipsuri/incomplete:

| # | Promisiune (sursă) | Stare reală | Dovadă |
|---|---|---|---|
| A1 | „Consolidate overlap between `Project` and `projects` models" (TODO.md) | **NEFĂCUT** — coexistă 2 modele (`Project` cu câmpuri bogate, `projects` legacy) | `prisma/schema.prisma:240` (`Project`) + model `projects` separat |
| A2 | „UI pentru `/account/subscription` (gestiune abonamente Stripe)" (TODO.md) | **LIPSEȘTE** — nu există pagină de gestiune subscripție | `find src/app -path '*subscription*'` → 0 rezultate; există doar `pricing/success` |
| A3 | „Email notifications la creare/revocare API key" (TODO.md) | **NEFĂCUT** — pagina `/account/api-keys` există, dar fără notificări email | `src/app/[locale]/account/api-keys/page.tsx` (CRUD), fără hook de email |
| A4 | „Move plan quotas out of `src/lib/usage.ts` constants into DB/env" (TODO.md) | **NEFĂCUT** — cote hardcodate | `src/lib/usage.ts` (constante plan) |
| A5 | „Rate limiting middleware general" (TODO.md) | **PARȚIAL** — rate limiting adăugat punctual pe `/api/contact`, `/api/ai`, `/api/create-checkout-session` (G-KB-002/003/004), dar nu middleware global | `AUDIT_GAPS.md` (Eliminated G-KB-002..004) |
| A6 | Case Studies „dacă e gol, adaugă 2-3" (DESIGN-IDEAS) | **PAGINĂ EXISTĂ, conținut din i18n** — 4 industrii × cazuri hardcodate prin chei de traducere, nu studii reale cu cifre | `src/app/[locale]/case-studies/page.tsx` (industries hardcodate: healthcare/finance/retail/consulting) |

---

## (b) Construit, dar NEDOCUMENTAT — DRIFT (strategia e veche, NU codul)

> **Regula:** unde codul e mai avansat decât strategia, **strategia e cea învechită**. Recomandarea NU e „taie funcții", ci „**ridică documentația/strategia la nivelul codului**".

| # | Funcție livrată în cod | Documentația spune | Realitatea (dovadă) | Acțiune |
|---|---|---|---|---|
| B1 | **Site LIVE pe VPS2** la `app.knowbest.ro` | `CLAUDE.md`: „Standalone Next.js app, **not yet deployed**" | LIVE din 2026-05-26 (DEPLOY_REGISTRY VPS2 row 14d) | Actualizează CLAUDE.md → „LIVE, VPS2 :3023, local PG" |
| B2 | **Integrare Legal Hub** (pagini `/privacy`, `/terms`, `/cookies` randate server-side din `legal.knowbest.ro`) + 2 rute consimțământ | `project-overview.md`: Partner/PageContent „migration pending"; DESIGN-IDEAS: „Cookie consent **currently none**" | Livrat: `src/lib/legal-doc.ts` + `src/app/api/v1/consent/{document,record}` + commit-uri `895a22c`, `4992d57` | Documentează T7 Legal integration ca DONE |
| B3 | **Cookie consent banner** | DESIGN-IDEAS (2026-05-26): „Currently none. Required (RO/EU)" | `src/components/CookieConsentBanner.tsx` EXISTĂ | Marchează DESIGN-IDEAS P1.3 ca DONE |
| B4 | **Logos clienți reali** (din site-ul legacy) + management Partners CRUD | DESIGN-IDEAS: „Social proof band" listat ca P1.2 *de făcut* | Livrat: commit `82cff55` „real client logos"; `PartnersManagement.tsx` | Marchează social-proof band ca PARȚIAL DONE |
| B5 | **Texte orientate pe business (ro/en)** + linkuri produse gate-uite pe LIVE-only | project-overview nu menționează | commit-uri `1c3ab89`, `72a507f` | Documentează |
| B6 | **Reconciliator săptămânal de produse din ecosistem** (`sync-ecosystem-products.mjs`) + catalog | Nedocumentat în project-overview | `scripts/sync-ecosystem-products.mjs` + `scripts/ecosystem-catalog.json` + commit `2042ed2`, auto-commit `9cf616b` | Documentează pipeline-ul de sync |
| B7 | **Pagini account** (`/account/api-keys`, `/account/usage`) | project-overview: „management UI **pending**" (AUDIT-011/012) | Ambele pagini există + rute `/api/user/{api-keys,usage}` | Marchează AUDIT-011/012 ca DONE |
| B8 | **Audit logs admin** (`/api/admin/audit-logs` + model `audit_logs`) | Nedocumentat | rută + model în schema | Documentează |
| B9 | **CSRF + rate limiting** | LESSONS.md: AUDIT-008 CSRF „pending" | `src/lib/csrf.ts` + rate limiting (G-KB-002..004 Eliminated) | Marchează ca DONE |

**Concluzie (b):** documentația de bază (CLAUDE.md, project-overview.md, DESIGN-IDEAS.md) este **cu 3-4 săptămâni în urmă** față de cod. Nu există funcții „de tăiat" — există **9 funcții reale care trebuie urcate în documentație**.

---

## (c) Reconciliere TODO

| Item TODO/Gap | Stare documentată | Stare reală (cod) | Verdict |
|---|---|---|---|
| Rotire parolă Neon DB (TODO.md) | `[ ]` deschis | DBM: migrat Neon→PG local VPS2 (DEPLOY_REGISTRY) → Neon e doar rollback comentat | **OBSOLET** — DB-ul rulează pe PG local; risc Neon redus |
| Rulare migrare `user_api_keys`/`usage_records` (TODO.md) | `[ ]` deschis | Paginile `/account/*` LIVE → migrarea pare aplicată pe prod | **PROBABIL DONE** pe prod (de confirmat) |
| `ALLOWED_ORIGINS` în prod (TODO.md) | `[ ]` deschis | `src/lib/csrf.ts` citește env | **DE CONFIRMAT** că e setat pe VPS2 |
| G-KB-005 CSRF pe GET admin (AUDIT_GAPS) | OPEN P3 acceptat | GET nu modifică state | **ACCEPTAT** (risc scăzut) |
| G-KB-006 console.error în prod (AUDIT_GAPS) | OPEN P3 | prezent | **ACCEPTAT** (monitorizare) |
| G-KB-ENV-001 tabele lipsă local (AUDIT_GAPS) | OPEN (env, nu cod) | Local Neon fără tabele migrate → 500 pe `/api/partners`,`/api/projects` LOCAL; pe prod (PG migrat) → 200 | **ENV, nu defect** — confirmat că prod e OK |
| **CMS seed drift** (DEPLOY_REGISTRY notează: „`seed-page-content.ts` schema drift `type` vs `page` → CMS content empty, i18n fallback") | menționat doar în DEPLOY_REGISTRY | **CONFIRMAT** în cod (vezi G-01 mai jos) | **DESCHIS — fix prioritar** |

---

## (d) Top 10 gap-uri — P0 / P1 / P2

> Niciun P0 critic de securitate găsit (P0-urile istorice — parole hardcodate, fallback JWT — sunt rezolvate per LESSONS.md). Prioritizarea de mai jos = impact funcțional + datorie de documentație.

| # | ID | Prio | Gap | Dovadă (cale reală) |
|---|----|----|------|----|
| 1 | **G-01** | **P0** | **CMS seed rupt** — `seed-page-content.ts` scrie câmpul `type` în `prisma.pageContent.upsert({ create/update })`, dar modelul `PageContent` NU are coloană `type` (are `page/section/key/valueRo/valueEn/sortOrder`). Seed-ul aruncă la rulare → tabela `page_content` rămâne goală → `getPageContent()` cade pe fallback i18n. CMS-ul de fapt nu controlează conținutul. | `prisma/seed-page-content.ts:34,90,98` (`type`) vs `prisma/schema.prisma:212-225` (fără `type`); fallback la `src/lib/page-content.ts:24` |
| 2 | **G-02** | **P1** | **Documentație învechită** — CLAUDE.md zice „not deployed", DESIGN-IDEAS zice „cookie consent: none", project-overview zice „Partner/PageContent migration pending" — toate FALSE acum. Risc: decizii greșite în sesiuni viitoare. | `CLAUDE.md` Overview; `knowledge/DESIGN-IDEAS-2026-05-26.md` P1.3; `knowledge/project-overview.md` §4 |
| 3 | **G-03** | **P1** | **Modele Prisma legacy `music_*` (9) + `launchers`/`project_capabilities`/`test_results`** poluează schema knowbest — confuzie + risc la migrări viitoare. NU se șterg fără verificare DB (per `feedback_prisma_db_vs_schema`), dar trebuie documentate/separate. | `prisma/schema.prisma` (`model music_*`, `launchers`, etc.) |
| 4 | **G-04** | **P1** | **Dublură `Project` vs `projects`** — două modele pentru aceeași entitate; sursă de bug-uri de citire/scriere și efort dublu. | `prisma/schema.prisma:240` (`Project`) + model `projects` |
| 5 | **G-05** | **P1** | **Case-studies fără conținut real** — pagina există dar industriile + cazurile sunt chei i18n hardcodate, fără cifre/clienți reali. Slab driver de conversie B2B. | `src/app/[locale]/case-studies/page.tsx:24-50` |
| 6 | **G-06** | **P1** | **Produse cu emoji icons** în loc de imagini/screenshot-uri reale — „MVP look". DESIGN-IDEAS îl marchează ca cel mai mare salt de calitate percepută. | `src/app/[locale]/products/page.tsx` (categoryIcons emoji/lucide); `knowledge/DESIGN-IDEAS` P1.1 |
| 7 | **G-07** | **P2** | **Lipsă pagini detaliu produs** (`/products/[slug]`) — produsele duc direct extern; pierde SEO + dwell time. | `src/app/[locale]/products/page.tsx` (link extern); nicio rută `[slug]` |
| 8 | **G-08** | **P2** | **Lipsă gestiune abonament** (`/account/subscription`) — userul plătește dar nu-și poate administra planul. | TODO.md „Future"; `find src/app -path '*subscription*'` → 0 |
| 9 | **G-09** | **P2** | **Cote plan hardcodate** în `usage.ts` — nu pot fi ajustate fără redeploy. | `src/lib/usage.ts` |
| 10 | **G-10** | **P2** | **Linkuri social placeholder dezactivate** + lipsă OG/Twitter meta per pagină pentru shareability. | commit `8f99311` (social disabled); DESIGN-IDEAS P3.11 |

**Recomandare de secvențiere:** G-01 (CMS seed) primul — deblochează CMS-ul real. Apoi G-02 (sync docs, ~1h, zero risc). Apoi G-05/G-06 (conținut + imagery, cel mai mare impact de conversie). G-03/G-04 (curățare schema) într-o sesiune dedicată cu verificare DB prealabilă.

---

*Generat: 2026-06-20 · introspecție read-only, fără modificări de cod.*
