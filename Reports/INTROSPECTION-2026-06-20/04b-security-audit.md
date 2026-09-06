# Audit Securitate (Cyber) — knowbest

**Data:** 2026-06-20 · **Tip:** audit read-only (fără modificări de cod) · **Țintă:** `/Users/danciulescu/Projects/knowbest` + `https://app.knowbest.ro`
**Stack:** Next.js 16.2 · React 19 · Prisma 6.19 · NextAuth 4.24 · Stripe · PostgreSQL local (VPS2, DBM).

---

## 🗣️ Pe înţelesul tău (non-tehnic)

**Vestea bună: site-ul tău e construit corect din punct de vedere al securităţii.** Scanerul automat i-a dat **95/100 la securitate**, iar citirea codului confirmă: ai HTTPS, antete de protecţie, cookie-uri sigure, protecţie împotriva atacurilor de tip „CSRF" (cineva care te păcăleşte să faci acţiuni fără voie), limitări de viteză anti-abuz, parole verificate „pe timp constant" (anti-ghicit), şi cheile API stocate criptat. Echipa a făcut deja **o serie de fix-uri de securitate** documentate (AUDIT-005, AUDIT-008, AUDIT-011 etc.) şi se vede în cod.

**Ce rămâne de atenţie — niciunul critic:**
1. **Câteva biblioteci au actualizări de securitate disponibile** (19 alerte, din care 4 „high"). Niciuna nu pune site-ul în pericol imediat (sunt mai ales unelte de build/dezvoltare), dar e bine să le actualizezi cu o comandă.
2. **Un email-placeholder** (`email@exemplu.ro`) a rămas vizibil într-un text de pagină — de curăţat.
3. **Câteva întăriri opţionale** (antet care blochează încărcarea Google Analytics greşit, log-uri în producţie) — îmbunătăţiri, nu găuri.

Pe scurt: **nu ai vulnerabilităţi grave.** Ai un site bine securizat cu câteva îmbunătăţiri de igienă. Toate propunerile de mai jos **aşteaptă review-ul tău** — nu am aplicat nimic.

---

## 1. Autentificare / Autorizare (Auth/Authz) — ✅ SOLID

**Severitate generală: scăzută (bine implementat).**

**Dovezi pozitive:**
- **Admin:** token JWT semnat (`jose`, HS256, expirare 24h) în cookie `httpOnly` + `secure` în producţie + `sameSite: lax`. Secret obligatoriu din env (`ADMIN_SECRET`) — aruncă eroare dacă lipseşte, fără fallback hardcodat. (`src/lib/admin-auth.ts`)
- **Comparare parolă admin „timing-safe"** cu `crypto.timingSafeEqual` (anti-atac pe timp). (`src/app/api/admin/auth/route.ts:11-20`)
- **Toate cele 6 rute `/api/admin/*`** verifică tokenul înainte de orice operaţie (`checkAdmin` / `isAdminAuthenticated` → 401 dacă lipseşte). Verificat pe: `admin/projects`, `admin/partners`, `admin/page-content`, `admin/audit-logs`, `admin/knowledge`.
- **Rute user** (`/api/user/api-keys`, `/api/user/usage`, `/api/ai`) gate-uite pe **sesiune NextAuth** (`getServerSession` → 401 dacă lipseşte), cu rezolvare userId din sesiune sau email.
- **Login user:** magic-link pe email (NextAuth + Resend), fără parole de furat.

**Observaţie minoră (P3):** modelul admin e **single-password** (un singur ADMIN_PASSWORD, fără conturi individuale / audit pe cine a făcut ce). Acceptabil pentru un panou intern mono-operator, dar nu scalează la echipă.

**PROPUNERE (în aşteptarea review-ului tău):** nicio acţiune necesară. Dacă în viitor mai multe persoane administrează → migrează la conturi admin individuale legate de `users` + rol.

---

## 2. Secrets (chei, parole) — ✅ CURAT, cu 1 placeholder de curăţat

**Severitate: scăzută.**

**Dovezi pozitive:**
- **Niciun fişier `.env` în git** (`git ls-files | grep .env` → 0 rezultate). ✅
- **Niciun secret expus client-side:** `grep NEXT_PUBLIC_*KEY/SECRET/TOKEN/PASSWORD` → 0 rezultate. ✅ (cheile sensibile — `STRIPE_SECRET_KEY`, `RESEND_API_KEY`, `ADMIN_SECRET`, `LEGAL_API_KEY` — sunt toate citite server-side din `process.env`).
- Toate accesările de chei se fac în funcţii server (`getStripe()`, `getResend()`) care aruncă dacă lipseşte env — fără chei hardcodate.

**Finding (P3 — LOW): email placeholder expus.**
- **Evidenţă:** AIWebAuditor raportează `email@exemplu.ro` ca email expus pe pagina live. E un **text-placeholder** rămas (nu un secret), dar dă impresie de neîngrijit + atrage spam.
- **PROPUNERE (în aşteptarea review-ului tău):** caută `email@exemplu.ro` în `src/` (probabil într-un text i18n sau page-content) şi înlocuieşte-l cu `contact@knowbest.ro` sau elimină-l.

**Notă DBM:** DB rulează pe PostgreSQL local VPS2; vechiul Neon e doar comentariu de rollback (`credentials/.env.knowbest`). Rotirea parolei Neon din TODO e **obsoletă** (risc redus — nimic nu se mai conectează la Neon).

---

## 3. Injection / XSS — ✅ FĂRĂ vulnerabilităţi reale

**Severitate: scăzută.**

**SQL Injection — sigur:**
- Singura folosire de SQL brut: `prisma.$queryRaw\`SELECT 1\`` în `/api/health` (literal static, fără input de utilizator). ✅
- Tot restul accesului la date trece prin Prisma ORM (parametrizat). `grep $queryRaw|$executeRaw` → 1 singur hit, benign.

**XSS — un singur `dangerouslySetInnerHTML`, sursă de încredere:**
- **Evidenţă:** `src/components/LegalDocBody.tsx:26` injectează `doc.html`.
- **Analiză:** `doc.html` provine din `src/lib/legal-doc.ts` → `mdToHtml(text)`, unde `text` e **conţinut legal versionat preluat server-side din Legal Hub** (`legal.knowbest.ro`, sursă proprie de încredere), NU input de utilizator. `mdToHtml` e un convertor markdown→HTML hand-rolled care procesează linie-cu-linie. **Risc real: scăzut** (sursa e controlată de tine).
- **PROPUNERE (în aşteptarea review-ului tău):** dacă vrei defense-in-depth, treci output-ul `mdToHtml` printr-un sanitizer (`isomorphic-dompurify`) înainte de injectare. Opţional — nu blocant, întrucât sursa e de încredere.

**Validare input — excelentă:**
- Toate rutele de scriere (POST/PUT) folosesc **scheme Zod** stricte (verificat pe `contact`, `create-checkout-session`, `admin/*`, `user/api-keys`). Ex: `priceId` validat cu regex `^price_`, email cu `.email()`, lungimi maxime peste tot.

---

## 4. Dependencies (biblioteci) — 🟠 19 alerte, niciuna exploatabilă direct

**Severitate: medie (igienă, nu breşă activă).**

**Evidenţă (`npm audit --omit=dev`):** **19 vulnerabilităţi — 2 low, 13 moderate, 4 high.**

**Cele 4 „high" (din `npm audit --json`):**
| Pachet | Tip | Notă |
|---|---|---|
| `fast-uri` | Path traversal / host confusion via percent-encoding | Tranzitiv (build/tooling). |
| `hono` | CSS Declaration Injection (JSX SSR) | Tranzitiv — knowbest nu foloseşte Hono direct. |
| `next` | DoS via Server Components / Middleware | Framework — fix prin bump minor Next. |
| `nodemailer` | SMTP command injection (`envelope.size`) | Tranzitiv via `resend`/email tooling; knowbest nu construieşte envelope manual. |

**Analiză:** majoritatea sunt **tranzitive** (build tools: `@babel/core`, `postcss`, `js-yaml`, `uuid`, `next-intl`) sau în căi neexpuse direct utilizatorului. `next` în sine merită bump-ul de securitate.

**PROPUNERE (în aşteptarea review-ului tău):**
1. `npm audit fix` (non-breaking) — rezolvă cele care nu cer schimbări majore.
2. Bump punctual `next` la ultimul patch din linia 16.x (testează build + login după).
3. NU rula `npm audit fix --force` orbeşte — poate sări versiuni majore. Verifică build + smoke după orice bump.

---

## 5. GDPR / Privacy — 🟠 conform parţial

**Severitate: medie (risc legal RO/UE).**

**Dovezi pozitive:**
- Banner consimţământ cookie EXISTĂ (`CookieConsentBanner.tsx`).
- Pagini legale reale (`/privacy /terms /cookies`) randate din Legal Hub versionat.
- Rute de înregistrare consimţământ (`/api/v1/consent/record`, `/document`) cu rate-limit, care trimit către Legal Hub (evidenţă imutabilă).
- Cookie-uri marcate `secure` + `httpOnly` (confirmat de scaner).

**Lipsuri (din AIWebAuditor):**
- Banner-ul **nu explică categoriile** de cookie-uri (GDPR cere granular: Necesare/Funcţionale/Analitice/Marketing).
- **Google Analytics** detectat — trebuie încărcat DOAR după consimţământ (altfel = tracking fără consimţământ = încălcare).
- Link Privacy **nu e suficient de vizibil** din footer (scanerul nu l-a găsit → CRITICAL fals-amplificat).

**PROPUNERE (în aşteptarea review-ului tău):**
1. Extinde banner-ul cu categorii + toggle per categorie.
2. Gate-uieşte încărcarea GA pe consimţământul „Analitice".
3. Link explicit „Politica de confidenţialitate" în footer global pe toate paginile.

---

## 6. Headers / Hardening — ✅ FOARTE BUN

**Severitate: scăzută (deja întărit).**

**Evidenţă (`next.config.ts` — antete pe `/(.*)`):**
| Antet | Valoare | Verdict |
|---|---|---|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | ✅ Excelent (2 ani + preload) |
| `Content-Security-Policy` | `default-src 'self'`; restricţii pe script/style/img/font/connect; `frame-ancestors 'self'`; `base-uri 'self'`; `form-action 'self'` | ✅ Bună — singurul punct slab: `'unsafe-inline'` pe script-src/style-src |
| `X-Frame-Options` | `SAMEORIGIN` | ✅ |
| `X-Content-Type-Options` | `nosniff` | ✅ |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | ✅ |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | ✅ |

**CSRF:** `src/lib/csrf.ts` verifică `Origin`/`Referer` faţă de allowlist (`ALLOWED_ORIGINS` env + fallback dev) pe toate rutele de scriere. ✅
**Rate limiting:** punctual pe `/api/contact` (5/min), `/api/ai` (30/min), `/api/create-checkout-session` (5/min), `/api/v1/consent/record` (10/min). ✅

**Finding (P3): CSP cu `'unsafe-inline'`.**
- `script-src 'self' 'unsafe-inline'` permite scripturi inline (slăbeşte protecţia anti-XSS). E un compromis comun cu Next.js + Framer Motion.
- **PROPUNERE (în aşteptarea review-ului tău):** migrare la CSP cu nonce pentru scripturi inline — efort mediu, doar dacă vrei strictness maxim. Acceptabil aşa cum e pentru profilul de risc actual.

**Finding (P3): `console.error` în producţie** (notat şi în `AUDIT_GAPS.md` G-KB-006) — poate scurge detalii în loguri. Acceptat ca monitorizare; nu e breşă.

---

## Rezumat severităţi

| Severitate | Nr. findings | Note |
|---|---|---|
| 🔴 Critical | **0** | — |
| 🟠 High | **0** reale în cod (4 „high" sunt alerte de dependinţe tranzitive) | Dependency hygiene |
| 🟡 Medium | **2** | Dependencies (audit fix), GDPR cookie categories |
| ⚪ Low / P3 | **5** | email placeholder, CSP unsafe-inline, console.error, single-password admin, GA post-consent |

**Verdict securitate: BUN spre FOARTE BUN.** Codul arată maturitate de securitate (Zod + CSRF + rate-limit + timing-safe + httpOnly + CSP + HSTS). Nu există vulnerabilitate critică sau high reală în codul propriu. Restul = igienă de dependinţe + conformitate cookie + curăţenie cosmetică.

---

## Acţiuni care necesită USER

> Niciun fix nu a fost aplicat (audit read-only). Acestea cer decizia / acţiunea ta:

1. **[DECIZIE] Rulează `npm audit fix`** (non-breaking) + bump punctual `next` la ultimul patch 16.x → apoi build + smoke login. **NU** `--force` orbeşte.
2. **[CURĂŢARE] Elimină placeholder-ul `email@exemplu.ro`** din `src/` (text i18n/page-content) → înlocuieşte cu `contact@knowbest.ro`.
3. **[CONFORMITATE GDPR] Decide** dacă extinzi banner-ul cu categorii cookie + gate-uieşti Google Analytics pe consimţământ (recomandat pentru RO/UE).
4. **[CONFIRMARE ENV] Verifică pe VPS2** că `ALLOWED_ORIGINS` e setat în producţie (CSRF se bazează pe el; fallback-ul dev nu trebuie să fie activ în prod). Comandă: `ssh root@72.62.155.74 'grep ALLOWED_ORIGINS /var/www/knowbest/.env'`.
5. **[OPŢIONAL] Decide** dacă vrei sanitizer (DOMPurify) peste `mdToHtml` şi CSP cu nonce (strictness maxim — nu blocant).
6. **[OPŢIONAL] Decide** dacă panoul admin trebuie să treacă de la single-password la conturi individuale (dacă echipa creşte).

---

*Generat: 2026-06-20 · audit securitate read-only, fără modificări de cod. Toate propunerile aşteaptă review-ul tău.*
