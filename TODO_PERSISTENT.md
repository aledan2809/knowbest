
## knowbest (`app.knowbest.ro`) — ACTIVE (fix-urile așteaptă review-ul tău)
Sursă: `knowbest/Reports/INTROSPECTION-2026-06-20/`

- [ ] 🟡 **Fix CMS seed (G-01)** — `seed-page-content.ts` scrie câmpul `type` inexistent în modelul `PageContent` → CMS nu se populează, paginile cad pe fallback i18n. (fix de cod — aprobă-l)
- [ ] 🟡 **SEO de bază** — lipsesc `sitemap.ts` / `robots.ts` + 2× H1 (cel mai mare ROI funcțional). (fix de cod)
- [ ] 🟡 **Decide `npm audit fix` + bump `next` patch 16.x** (build + smoke login; fără `--force`).
- [ ] 🟡 **Confirmă `ALLOWED_ORIGINS` setat pe VPS2 prod** (CSRF depinde de el).
- [ ] 🟡 **GDPR** — extinde banner cookie cu categorii + GA după consimțământ.
- [ ] 🟢 **Conținut** — screenshot-uri reale de produs + studii de caz cu cifre (driverul #1 de conversie) + elimină placeholder `email@exemplu.ro`.

---

## knowbest (`app.knowbest.ro`) — ACTIVE (fix-urile așteaptă review-ul tău)
Sursă: `knowbest/Reports/INTROSPECTION-2026-06-20/`

- [ ] 🟡 **Fix CMS seed (G-01)** — `seed-page-content.ts` scrie câmpul `type` inexistent în modelul `PageContent` → CMS nu se populează, paginile cad pe fallback i18n. (fix de cod — aprobă-l)
- [ ] 🟡 **SEO de bază** — lipsesc `sitemap.ts` / `robots.ts` + 2× H1 (cel mai mare ROI funcțional). (fix de cod)
- [ ] 🟡 **Decide `npm audit fix` + bump `next` patch 16.x** (build + smoke login; fără `--force`).
- [ ] 🟡 **Confirmă `ALLOWED_ORIGINS` setat pe VPS2 prod** (CSRF depinde de el).
- [ ] 🟡 **GDPR** — extinde banner cookie cu categorii + GA după consimțământ.
- [ ] 🟢 **Conținut** — screenshot-uri reale de produs + studii de caz cu cifre (driverul #1 de conversie) + elimină placeholder `email@exemplu.ro`.

---

## 🔍 Introspection Audit 2026-06-20
> Audit complet (gap strategie↔cod · ghid per-pagină · deep research · funcțional + cyber).
> **Scor AIWebAuditor: 78/100** · GDPR 65. 6 acțiuni deschise · fără critice.
> Rapoarte: `Reports/INTROSPECTION-2026-06-20/` (00-SUMMARY.md, 01-gap-strategy-vs-code.md, 02-pages-guide-RO.md, 03-deep-research-optimization.md, 04-audit-findings.md, 04b-security-audit.md)
> Checklist Alex centralizat: `Master/reports/Alex_TODO_2026-06-20.md` + tab „Introspection Audit" în UI Master.

## knowbest (`app.knowbest.ro`) — ACTIVE (fix-urile așteaptă review-ul tău)
Sursă: `knowbest/Reports/INTROSPECTION-2026-06-20/`

- [ ] 🟡 **Fix CMS seed (G-01)** — `seed-page-content.ts` scrie câmpul `type` inexistent în modelul `PageContent` → CMS nu se populează, paginile cad pe fallback i18n. (fix de cod — aprobă-l)
  - 🗣️ *Pe înțelesul tău:* Plătești un panou de administrare care de fapt nu controlează conținutul — un mic bug face ca textele pe care le editezi acolo să nu apară pe site. După fix, panoul chiar schimbă paginile.
- [ ] 🟡 **SEO de bază** — lipsesc `sitemap.ts` / `robots.ts` + 2× H1 (cel mai mare ROI funcțional). (fix de cod)
  - 🗣️ *Pe înțelesul tău:* Google nu reușește să-ți indexeze bine site-ul, deci apari mai jos în căutări. După ce adăugăm aceste fișiere standard, te găsesc mai mulți vizitatori gratis.
- [ ] 🟡 **Decide `npm audit fix` + bump `next` patch 16.x** (build + smoke login; fără `--force`).
  - 🗣️ *Pe înțelesul tău:* Câteva biblioteci externe au update-uri de securitate de aplicat. Le actualizez cu testare după (login + build), ca să nu stric nimic.
- [ ] 🟡 **Confirmă `ALLOWED_ORIGINS` setat pe VPS2 prod** (CSRF depinde de el).
  - 🗣️ *Pe înțelesul tău:* O setare de pe server protejează formularele site-ului de abuz din afară. Confirmă doar că e pusă, ca protecția să fie activă.
- [ ] 🟡 **GDPR** — extinde banner cookie cu categorii + GA după consimțământ.
  - 🗣️ *Pe înțelesul tău:* Urmărirea vizitatorilor pornește înainte ca ei să accepte — risc de amendă. După fix, bannerul cere acordul mai întâi și ești în regulă cu legea.
- [ ] 🟢 **Conținut** — screenshot-uri reale de produs + studii de caz cu cifre (driverul #1 de conversie) + elimină placeholder `email@exemplu.ro`.
  - 🗣️ *Pe înțelesul tău:* Acum produsul e arătat cu emoji-uri și texte de probă, nu cu poze reale și rezultate cu cifre — semnalul #1 care convinge un client B2B. Cu materiale reale, mai mulți vizitatori cumpără.

---

## [ ] 🧩 Module reuse gaps (adăugat 2026-06-24 din Master MODULE-PROJECT-MATRIX, aprobat user — necesită sesiune dedicată per item)
- [ ] **Feedback-Hub widget** — colectare feedback pe app.knowbest.ro (modul neutilizat în tot ecosistemul).
- [ ] **Stripe broker** — folosește Stripe direct; de migrat la broker central `stripe.knowbest.ro`.
- [ ] **CAS (Carusel de Ads)** — cross-promo din MarketingAutomation (`<CasBanner>`/widget) — knowbest e suprafață cu trafic bună pentru cross-promo ecosystem.
- [ ] **@aledan/ai-governance** — AIRouter fără harness guvernanță.
