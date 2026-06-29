# TODO Persistent — knowbest (`app.knowbest.ro` → `knowbest.ro`) — ACTIVE

> Reconciliat 2026-06-29 (sesiune dedicată). Fișierul avea blocul de 6 items triplicat + claim-uri vechi.
> Verificat fiecare item pe codul + DB-ul real. Majoritatea erau deja rezolvate.

## 🌐 Cutover domeniu knowbest.ro — ✅ COMPLET 2026-06-29
- [x] **Arhivă site vechi → `old.knowbest.ro`** — snapshot static WP (9 pagini, 11M), SSL până 2026-09-27, http→https, asset-uri rescrise. LIVE.
- [x] **Apex `knowbest.ro` → app nou (:3023)** — DNS mutat de user la 72.62.155.74; certbot SSL (până 2026-09-27); `www`→apex 301; http→https 301. LIVE + verificat (knowbest.ro/ro+/en 200, title app nou).
- [x] **Canonical SEO** — `NEXT_PUBLIC_SITE_URL=https://knowbest.ro` setat înainte de build; sitemap/robots emit acum apex.
- [x] **Deploy bundle livrat la cutover** — commit-uri `c465c0b` (deps) + `160e888` (cookie categories) LIVE pe knowbest.ro + app.knowbest.ro (HEAD `2b35fd4`). app.knowbest.ro neatins (307, funcțional). L41 ecosystem 200.

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
