# Project Status — knowbest

Last Updated: 2026-09-08

## Current State (Sesiunea 2026-09-02 → 09-08) — Redesign dark-premium al site-ului public + catalog corectat

13 commit-uri, toate pushed + LIVE pe `knowbest.ro` (VPS2 :3023). Reper vizual cerut de user:
`razvanmares.com` — inspirație, nu copie: am păstrat identitatea KnowBest (accent albastru→mov
electric, nu coralul reperului). Scop: tot site-ul public, nu doar prima pagină.

### Livrat (în ordine)
1. **`dcaa5ff` — redesign dark-premium + reparat fontul.** Pânză aproape neagră, accent
   albastru→mov, secțiuni motion-first. Limbaj de design comun în `src/components/site/index.tsx`
   (SmoothScroll/Magnetic/Reveal/SectionTitle/GlowBackdrop/Marquee/Tilt/BackToTop/Grain/Cursor).
   **Reparat un defect vechi și tăcut**: `--font-sans: var(--font-sans)` era circular → tot site-ul
   rula în Times, inclusiv pe producție (vezi L532).
2. **`16155c5` — marquee cu rezultate reale** sub testimonial (cifre din studiile de caz, nu decor).
3. **`5e4e2a5` — catalogul vine din baza de date**, nu hardcodat. `scripts/ecosystem-catalog.json`
   = sursă unică (28 produse); `sync-ecosystem-products.mjs --full` aliniază totul, iar `--hide-missing`
   **ascunde** (`visible:false`), nu șterge — reversibil. + analytics Umami (verificat 1 vizită reală)
   + hero-uri convertite la webp (541KB → 40KB).
4. **`1d5cea3` → `c054f39` — cinci runde de corectat catalogul**, toate pornite de la tine:
   „AVE nu are Supabase" → scoase tehnologiile inventate; „verifică vizual, nu doar prin API" → am
   găsit 3 carduri rămase placeholder (Tutor/UtilajHub/CONSJ) pe care API-ul le raporta „complete";
   apoi descrieri corectate per feedback; apoi `tagsEn` ca etichetele să fie cu adevărat pe două limbi.
5. **`7c5692c` — efectele din reper**: înclinare 3D la mouse, dezvăluire pe caracter, back-to-top,
   granulație, cursor propriu, filtru după tehnologie (calculat din date, nu listă fixă).
6. **`340a2de` + `81b8a93` — cardul care se întoarce**, cu „ce rezolvă" per produs (RO+EN, 3-4 cuvinte
   de poziționare + probleme rezolvate). A doua livrare a fost **reparația unei verificări greșite
   de-a mea** — vezi L531.
7. **`990f56e` — igienă**: șters directorul `C:/` (reziduu al unei căi Windows din AIRouter, cauza
   deja reparată acolo), `.gitignore` pentru artefacte de sesiune, rapoarte netrackuite adăugate,
   TODO sincronizat.

### Verificat
- Fiecare livrare: tsc + build + `/review` + verificare pe browser real (nu doar build verde).
- Catalog: **fiecare URL de produs testat pentru viață** înainte de reconciliere — au ieșit la iveală
  feedback-hub 404, pmb 404, racex care avea nevoie de `racex.ro`.
- Umami: vizită din browser real (UA headless e filtrat) → 1 pageview înregistrat.
- Cardul întors: reprodus traseul omului pe producție (hover + clic real) → spatele e elementul
  pictat; clicul pe „Vezi producția" navighează și **nu** întoarce cardul.

### Corectări de traseu (nu le ascund)
- Am declarat „verificat" cardul întors pe baza proprietății CSS, iar tu l-ai infirmat live. Aveai
  dreptate: mecanismul mergea, declanșatorul era invizibil. (L531)
- Panoul de browser ascuns raporta identitate la **orice** transformare — era instrumentul, nu codul.
  Prins pentru că am măsurat și un caz banal. (L530)
- Am livrat de două ori cod mort (`Marquee`, `CharReveal`), prins de `/review` ambele dăți.

## TODO (deschis)
- [ ] 3 slide-uri în caruselul erou (ContaKT, TravelAgency, eCabinet) — blocate pe conturi demo cu date.
- [ ] 4 module de refolosit (Feedback-Hub, broker Stripe, CAS, ai-governance) — fiecare sesiune dedicată.
- [ ] Materiale de la user: ID de măsurare GA4, capturi reale de produs, cifre de studii de caz,
      acordul Hotel Alpin pentru testimonial pe nume.
- [ ] **Bază de date locală** — decizie de infrastructură (docker local pe 5444 vs acces la VPS2).
      Detaliat în `TODO_PERSISTENT.md`; nu e blocant pentru ce urmează.

## Lessons Learned (sesiunea 2026-09-08)
- **L530** — Când o măsurătoare spune ceva imposibil, testează întâi instrumentul, nu codul.
- **L531** — „Se aplică transformarea" nu înseamnă „omul vede că merge"; când userul contrazice un
  „verificat", primul suspect e verificarea.
- **L532** — O variabilă CSS circulară anulează tăcut toată declarația — site-ul a rulat în Times, pe
  producție, fără nicio eroare nicăieri.
- (numerele sunt cele din `Master/knowledge/lessons-learned.md`; L01 de mai jos e numerotarea veche,
  locală acestui fișier)

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
