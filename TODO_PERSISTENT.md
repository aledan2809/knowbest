# TODO Persistent — knowbest (`app.knowbest.ro` → `knowbest.ro`) — ACTIVE

> Reconciliat 2026-06-29 (sesiune dedicată). Fișierul avea blocul de 6 items triplicat + claim-uri vechi.
> Verificat fiecare item pe codul + DB-ul real. Majoritatea erau deja rezolvate.

## 🌐 Cutover domeniu knowbest.ro — ✅ COMPLET 2026-06-29
- [x] **Arhivă site vechi → `old.knowbest.ro`** — snapshot static WP (9 pagini, 11M), SSL până 2026-09-27, http→https, asset-uri rescrise. LIVE.
- [x] **Apex `knowbest.ro` → app nou (:3023)** — DNS mutat de user la 72.62.155.74; certbot SSL (până 2026-09-27); `www`→apex 301; http→https 301. LIVE + verificat (knowbest.ro/ro+/en 200, title app nou).
- [x] **Canonical SEO** — `NEXT_PUBLIC_SITE_URL=https://knowbest.ro` setat înainte de build; sitemap/robots emit acum apex.
- [x] **Deploy bundle livrat la cutover** — commit-uri `c465c0b` (deps) + `160e888` (cookie categories) LIVE pe knowbest.ro + app.knowbest.ro (HEAD `2b35fd4`). app.knowbest.ro neatins (307, funcțional). L41 ecosystem 200.

## 🎨 Redesign teaser homepage + copy nou — ✅ LIVE 2026-06-29 (commit `58ab434`)
Direcție: **hibrid** = erou dark („Mai puțină muncă manuală. **Mai mult control.**" + dovadă + dashboard) → corp light (selector industrii + produse + testimonial + CTA). Copy fără „AI". RO aprobat de user → tradus EN. Deployat pe knowbest.ro (tsc + /review Approve + build OK + verificat live, zero pageerrors prod).
- [x] **Captură produs** — DONE: dashboard ProcuChain (tenant demo RedoGroup) capturat headless + **anonimizat** (RedoGroup→Acme, chrome de test tăiat) → `public/dashboard-hero.png`. KPI-uri + grafice (bar + donut).
- [x] **Selector industrie (7)** — DONE: Cabinet medical / Asociații / Service / **Horeca-Turism** / Comerț / Administrație publică / **IT & web**. Interactiv (verificat).
- [x] **8 flagship homepage** — DONE: ProcuChain, eCabinet, BlocHub, PRO, TravelAgency, SEAP, AVE, Marketing Automation (copy outcome).
- [x] **Testimonial anonim** (Manager hotel · Poiana Brașov, decizie B) + **CTA cu reducere de risc** — DONE.
- [x] **DONE 2026-09-02 (commit `5e4e2a5`) — catalog DB `/produse`:** adaugă **PRO** + **TravelAgency** ca produse reale în DB (acum sunt flagship doar hardcodate pe homepage; nu apar în `/produse`). + reconciliere completă catalog (ecosisteme 4PRO/AVE ca suite; exclude module interne `@aledan/*`/AIRouter/OCR; exclude deprecate PMB/KB). Sursă: ECOSYSTEM_REGISTRY + CLASSIFICATION + `knowledge/projects.json`.
- [x] **DONE 2026-09-02 (`5e4e2a5`):** optimizează `dashboard-hero.png` 541KB → webp (40KB; toate 4 hero-urile convertite) pt LCP (Next/Image oricum servește optimizat). + dacă obții acordul Hotel Alpin → testimonial pe nume real (acum anonim).

## [~] 🎠 Carusel produse în erou (creat 2026-06-30) — mecanism LIVE, slide-uri în creștere
Componentă carusel în erou (`heroSlides` în `page.tsx`): 1 slide = imagine framed (ca acum); ≥2 = auto-rotire 5s + puncte. **Slide 1 = ProcuChain LIVE** (link → `procuchain.com`, decizie b = app live).
**Principiu (rafinat 2026-06-30):** fiecare slide = **ecranul *signature*** al produsului (ce-l face wow), NU obligatoriu grafic. Blocajul real per produs = un **cont demo cu date prezentabile**, nu lipsa graficului.
- [x] **4pro-eat** — ✅ DONE 2026-06-30 (commit `ec1228c`): slide 2 LIVE (ramă telefon, ecran „Mesele mele" — macros+scor+masă). Sursă = **asset reel din MA** (`MarketingAutomation/Reports/reel-eat-real-2026-06-26/frames/meals.png`), zero NO-TOUCH. Link → eat.4pro.io.
- 💡 **Cale nouă (descoperită 2026-06-30):** MA are **creative/reel-uri gata** pentru produse (`MarketingAutomation/Reports/reel-*`, `public/campaigns`) — folosește-le ca slide-uri în loc de captură+seed pe app-uri NO-TOUCH. User: „inclusiv AVE e acolo". Verifică MA pentru AVE + altele înainte de a captura dashboard-uri.
- [ ] **ContaKT** (`contakt.knowbest.ro`) — signature = ecran reconciliere (extras↔factură). Blocaj: tenant sintetic cu date.
- [ ] **TravelAgency** (`ta.knowbest.ro`) — signature = rezultat sourcing (potrivire pensiuni/grup). Blocaj: cont demo cu date.
- [ ] **eCabinet** (`cabinet.4pro.io`) — signature = agendă/calendar agregat. ⚠️ tenant SINTETIC, fără date pacienți.
- Rețetă per slide: login demo → captură ecran signature → anonimizare (client→Acme, chrome test tăiat) → `public/<slug>-hero.png` → add în `heroSlides` + caption în i18n (`home.<slug>ImageCaption`). TODO-urile din proiecte = „asigură demo + ecran signature prezentabil" (nu strict grafic).

## Items din Introspection 2026-06-20 — REZOLVATE (verificat 2026-06-29)
- [x] **CMS seed (G-01)** — *claim vechi, nu era bug.* Modelul `PageContent` ARE câmpurile `page`+`type`, DB-ul prod are **153 rânduri** pe toate paginile, seeder-ul trece tsc. Nimic de reparat.
  - 🗣️ *Pe înțelesul tău:* panoul de conținut e populat corect în baza de date; bug-ul descris nu există (a fost reparat între timp).
- [x] **SEO de bază** — *parțial vechi.* `sitemap.ts` + `robots.ts` EXISTĂ deja; fiecare pagină de marketing are exact 1 `<h1>` (`motion.h1`). Singurul rest real = canonical-ul să arate spre apex `knowbest.ro` → se face la cutover.
- [x] **`npm audit fix` (fără `--force`)** — DONE 2026-06-29 (commit `c465c0b`). Rezolvate babel/fast-uri/hono/brace-expansion; tsc curat. Rămân 7 (nodemailer/postcss/uuid) care cer `--force` (major, breaking) → amânate exact per instrucțiune.
- [x] **`ALLOWED_ORIGINS` pe prod** — DONE 2026-06-29. Confirmat setat + extins cu apex (`knowbest.ro`,`www`).
- [x] **GDPR — banner cookie cu categorii** — DONE 2026-06-29 (commit `160e888`). Banner cu toggle-uri Necesare(blocat)/Analitice/Marketing + „Preferări"; alegerea granulară se înregistrează în **Legal Hub** (ca toate proiectele), fără analytics terț (decizie user). Doar consimțămintele afirmative (non-esențiale acordate) se scriu în Legal; refuzurile rămân local.
  - 🗣️ *Pe înțelesul tău:* vizitatorul alege exact ce acceptă, iar acordul se păstrează în hub-ul legal — ești în regulă cu legea, fără urmărire Google.

## Items care depind de tine (materiale)
- [~] **Conținut** — screenshot-uri reale de produs + studii de caz cu cifre (driverul #1 de conversie B2B). NU pot fabrica imagini/cifre reale → am nevoie de materialele tale. *(Placeholder-ul `email@exemplu.ro` e doar hint-ul câmpului din formular — corect așa; datele reale de contact `contact@knowbest.ro` + telefon + adresă sunt deja afișate pe pagina Contact.)*

## [ ] 🧩 Module reuse gaps (din Master MODULE-PROJECT-MATRIX — sesiune dedicată per item)
- [ ] **Feedback-Hub widget** — colectare feedback pe app.knowbest.ro (modul neutilizat în tot ecosistemul).
- [ ] **Stripe broker** — folosește Stripe direct; de migrat la broker central `stripe.knowbest.ro` (NO-TOUCH, propose-confirm).
- [ ] **CAS (Carusel de Ads)** — cross-promo din MarketingAutomation (`<CasBanner>`/widget).
- [ ] **@aledan/ai-governance** — AIRouter fără harness guvernanță.

## Deploy în așteptare (bundle la cutover)
Commit-uri locale gata de livrat ÎMPREUNĂ când muți DNS-ul (decizie user „totul odată"):
`c465c0b` (deps) + `160e888` (cookie categories). La cutover: certbot apex + `NEXT_PUBLIC_SITE_URL` + deploy + TWG verify live.

---

## [x] 📊 Analytics — DONE 2026-09-02 (`5e4e2a5`, Umami LIVE verificat 1 pageview; GA4 inert până la NEXT_PUBLIC_GA4_ID de la user) — adoptă `@aledan/analytics` pe knowbest.ro (propus 2026-07-01, modul ANL în /matrix)

**De ce**: apex-ul knowbest.ro e live (cutover 2026-06-29) fără analytics. Modulul dă Umami cookieless + GA4 consent-gated, datele pe VPS-ul nostru.

**Specific knowbest**: are DEJA banner de cookie-uri integrat Legal Hub (consent record 201 verificat la integrare) → **NU monta `CookieConsent`** (2 bannere). Cazul 3 din `Projects/Analytics/README.md`: `loadGA4('G-<knowbest>')` din calea Accept a banner-ului Legal existent + la load când decizia salvată e granted.

**Mecanica (din modul — vezi `Projects/Analytics/README.md`):**
1. Provisionează site-ul în Umami: `node Projects/Analytics/scripts/provision-umami.mjs --name "<domeniu>" --domain <domeniu>` → primești `websiteId`. (Dacă `analytics.knowbest.ro` nu are încă DNS, folosește `UMAMI_TECHBIZ_SRC`.)
2. Vendored tgz: `cd Projects/Analytics && npm run build && npm pack` → copiază ca `<proiect>/vendor/analytics.tgz`; în package.json `"@aledan/analytics": "file:vendor/analytics.tgz"`; în next.config `transpilePackages: ["@aledan/analytics"]`.
3. În root layout: `<UmamiScript websiteId="..."/>` (mereu, cookieless — NU cere consimțământ).
4. **CSP obligatoriu** (lecția techbiz: CSP strict = zero date, silențios): adaugă originile din `umamiCsp()` + `GA4_CSP` în headerul CSP al proiectului (script-src/connect-src/img-src). Fără asta nu funcționează nimic.
5. GA4: proprietate NOUĂ în contul Google al business-ului respectiv (NU refolosi G-WGNEF06DWS al techbiz) → un singur Measurement ID per business (subdomeniile aceluiași apex NU primesc stream-uri separate).
6. Verificare onestă: vizită browser real (UA normal, nu headless) → hit în Umami dashboard; Accept → `gtag/js` 200 + `/g/collect` 204 → GA4 Realtime. Nu declara done pe build verde.

**Extra knowbest**: GA4 property proprie (business knowbest). Umami provisionat pt `knowbest.ro` (apex; app.knowbest.ro e același apex → același website Umami e OK sau separat, la alegere).

## [ ] 🧰 Bază de date locală pentru dezvoltare — decizie de infrastructură (creat 2026-09-06)

`/produse` e **gol pe local** dar plin pe producție, iar asta a costat deja timp de diagnostic
într-o sesiune. Cauza nu e aplicația: `.env`-ul local încă are `DATABASE_URL` spre **Neon**, baza
abandonată (politica VPS+PG only, 2026-06-10). Am marcat linia ca MOARTĂ direct în `.env`, cu
explicația, ca să nu mai păcălească pe nimeni — dar **remedierea reală rămâne o alegere de-a ta**,
fiindcă baza vie stă pe VPS2 și nu e accesibilă din afară (port 5432 filtrat + `pg_hba` per-IP;
verificat 2026-09-06: conexiunea din exterior e refuzată).

Două căi, ambele o singură dată:
- **(a) PostgreSQL local în docker** pentru knowbest — portul liber următor din tabelul Master este
  **5444**; e nevoie și de un `docker-compose.dev.yml` (proiectul nu are unul) + seed. Curat și
  independent de rețea, dar datele locale nu sunt cele reale.
- **(b) Acces la VPS2** — deschidere firewall + o linie `pg_hba` pentru IP-ul tău de acasă. Datele
  sunt cele adevărate, dar IP-ul e **dinamic** (se rupe la fiecare schimbare) și e o modificare de
  firewall pe o mașină de producție.

Până alegi, dezvoltarea de interfață merge prin interceptarea răspunsului `/api/projects` (ce am
folosit în redesign) — fără să atingă nicio bază de date.
