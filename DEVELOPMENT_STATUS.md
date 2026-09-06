# Project Status — knowbest

Last Updated: 2026-06-30

## Current State (Sesiunea 2026-06-30) — Hero carousel: clickable images + per-locale product sets

Lucru pe pagina principală (`src/app/[locale]/page.tsx`), caruselul hero. Toate commit-urile pushed + deployed live pe VPS2 (`knowbest.ro` / `app.knowbest.ro`, port 3023).

### Livrat (în ordine)
1. **Imagini clickabile + caption coborât** (commit `6dbe703`)
   - Ramele hero (desktop + mobil) învelite în `<a href={slide.url} target="_blank" class="group block">` → poza e link direct către produs (click instinctiv, nu doar pe textul caption-ului). Efect `group-hover:scale-[1.015]` ca afordanță de click.
   - Caption mutat `mt-3` → `mt-7` (nu mai trecea peste imagine). Înălțime mobilă explicită `h-[360px]` (nu mai depinde de lanțul `h-full` rupt de wrapper).
2. **Carusel per limbă** (commit `20d4c3e`)
   - Screenshot-urile au limba UI „arsă" în imagine → caruselul e curat per locale (nu un set comun).
   - **/ro**: eat (mobil, RO) + UtilajHub (desktop, RO — captură nouă `public/utilajhub-hero.png` de pe utilajhub.ro public).
   - **/en**: ProcuChain (desktop, EN) + AVE (mobil, EN) — imagini deja corecte.
   - `heroSlidesByLocale` selectat după `useLocale()`; slide resetat la 0 la schimbarea limbii; auto-rotate keyed pe lungimea setului activ.
   - Chei i18n `home.utilajhubImageAlt/Caption` adăugate în `ro.json` + `en.json` (toate cele 4 poze au caption+alt în RO și EN).

### Verificat
- Build local clean (`✓ Compiled successfully`), tsc OK după fix de tip (union `desktop|mobile` pe `heroSlidesByLocale`).
- Playwright: RO → [eat, UtilajHub]; EN → [ProcuChain, AVE]; zero page errors; image-link href == caption href pe fiecare slide.
- Live: `knowbest.ro/ro` 200 (primul slide = eat-hero, fără produse EN), `knowbest.ro/en` 200 (primul slide = dashboard-hero, eat-hero NU mai apare pe /en), `utilajhub-hero.png` 200.

## TODO (deschis)
- [ ] Opțional: al 3-lea produs RO în carusel (BlocHub / eCabinet / TravelAgency) — necesită cont demo (eCabinet/BlocHub = NO-TOUCH). Acum 2 slide-uri per limbă.
- [ ] Catalog `/produse`: adăugare PRO + TravelAgency ca intrări reale în DB.

## Technical Notes
- Caruselul e client-rendered → HTML-ul server conține doar primul slide; restul la hidratare/rotație (comportament corect).
- ProcuChain dashboard hero = demo RedoGroup (`demo@redogroup.ro`) cu logo blurat + „RedoGroup→Acme" prin scriptul de captură (scratchpad `redo-hero.mjs`).
- Deploy VPS2: `git checkout -- package-lock.json; git pull && npm install && npx prisma generate && npm run build && PORT=3023 pm2 restart knowbest --update-env`.

## Lessons Learned (sesiunea 2026-06-30)
- **L01 — Pe un landing bilingv, textul comută prin i18n dar IMAGINILE nu.** Capturile de Ut aplicație au limba „arsă" în pixel. Înainte de a captura screenshot-uri de produs pentru marketing, verifică limba reală suportată de aplicație (probe rută `/en` `/ro` + dir-ul de i18n din cod) — NU presupune că e bilingvă. Bilingvismul site-ului de marketing (`procuchain.com/ro`) ≠ bilingvismul dashboard-ului aplicației (ProcuChain dashboard = doar `en`/`ar`). Soluție: set de imagini curat per locale (`heroSlidesByLocale`), fiecare produs afișat doar pe limba UI-ului lui real; nu fabrica UI tradus.
