# Ghid pe pagini — knowbest (pentru orice user)

> Pentru fiecare pagină: la ce folosește, ce butoane/acțiuni are și ce impact are pentru tine sau pentru vizitator. Pe înțelesul oricui, fără jargon.
> **18 pagini** găsite (`find src/app -name page.tsx`). Toate paginile publice trăiesc sub `/[locale]/` — adică au versiune `/ro/...` și `/en/...`.

---

## 1. Pagini publice principale (vizitatori)

### 🏠 Acasă — `/[locale]/page.tsx`
Pagina de start (`app.knowbest.ro/ro`). Are un **hero** cu titlu mare, o **bară de statistici animate** (28+ produse, 50+ clienți, 8 industrii, 99.9% uptime — numere care „cresc" la scroll prin componenta CountUp), produse evidențiate luate din baza de date, și butoane care duc spre produse/contact. **Impact:** prima impresie — convinge vizitatorul că ecosistemul e serios și matur.

### 📦 Produse — `/[locale]/products/page.tsx`
Catalogul tuturor produselor, **alimentat din baza de date**, cu **căutare** și **filtrare** pe categorii (aplicație web, serviciu API, modul, utilitar). Fiecare produs are status (LIVE/Beta/Development/Coming Soon), iconițe (deocamdată emoji/iconuri generice) și buton de „deschide aplicația" doar pentru cele LIVE. **Impact:** aici vizitatorul descoperă ce poți livra; principalul motor de explorare.

### 🏥 Cazuri de utilizare — `/[locale]/use-cases/page.tsx`
Grupează produsele **pe industrii** (sănătate, asociații de proprietari, fitness, imobiliare, marketing) și arată ce produs rezolvă ce nevoie. Mapează industrii → produse concrete (ex: sănătate → stt, ecabinet, ocr). **Impact:** ajută un client să se regăsească („eu am o clinică → uite ce am pentru tine").

### 📊 Studii de caz — `/[locale]/case-studies/page.tsx`
Prezintă povești de succes **pe verticale** (healthcare, finance, retail, consulting), fiecare cu o listă de cazuri. Momentan conținutul vine din fișierele de traducere (cazuri generice, fără cifre/clienți reali). **Impact:** instrument puternic de încredere B2B — dar are nevoie de conținut real (cifre, nume) ca să convingă.

### ℹ️ Despre — `/[locale]/about/page.tsx`
Povestea companiei: valori (inovație, calitate, colaborare, fiabilitate), stack tehnologic afișat ca listă de tehnologii, și o cronologie de etape (2020 fondat, 2021 primul produs...). Animații Framer Motion. **Impact:** construiește credibilitate și „cine suntem".

### 📞 Contact — `/[locale]/contact/page.tsx`
**Formular de lead**: nume, email, companie, subiect, mesaj → trimite la `/api/contact`. Afișează și date de contact (email, telefon, adresă), iconuri social. **Impact:** poarta principală prin care un potențial client te contactează — sursa de lead-uri.

### 💶 Prețuri — `/[locale]/pricing/page.tsx`
Patru planuri (Free / Starter 9€ / Pro / Enterprise) cu liste de funcții și limitări. Butoanele duc spre **checkout Stripe** (`/api/create-checkout-session`). **Impact:** unde se ia decizia de cumpărare; conectat direct la încasări.

### ✅ Succes plată — `/[locale]/pricing/success/page.tsx`
Pagina de confirmare după o plată reușită. Verifică sesiunea Stripe (`/api/stripe-session?session_id=...`) și arată un mesaj de mulțumire + următorii pași. **Impact:** liniștește clientul că plata a mers și îl ghidează mai departe.

---

## 2. Pagini legale (conectate la Legal Hub)

> Aceste trei pagini își iau conținutul **server-side** din hub-ul `legal.knowbest.ro` (versionat), cu fallback la entitatea Fabulosos S.R.L. dacă hub-ul nu răspunde. Sunt randate în HTML-ul inițial (bune pentru SEO, funcționează fără JavaScript).

### 🔒 Confidențialitate — `/[locale]/privacy/page.tsx`
Politica de confidențialitate (GDPR), trasă din Legal Hub (`getLegalDocument("privacy")`). **Impact:** obligatoriu legal (RO/UE); construiește încredere.

### 📜 Termeni — `/[locale]/terms/page.tsx`
Termenii și condițiile, din Legal Hub (`getLegalDocument("tos")`). **Impact:** acoperire legală a serviciului.

### 🍪 Cookie-uri — `/[locale]/cookies/page.tsx`
Politica de cookie-uri, din Legal Hub (`getLegalDocument("cookies")`). Lucrează împreună cu banner-ul de consimțământ cookie. **Impact:** conformitate GDPR/cookie pentru vizitatorii UE.

---

## 3. Pagini de autentificare

### 🔑 Conectare — `/[locale]/auth/signin/page.tsx`
Login prin **magic link pe email** (NextAuth + Resend): introduci emailul → primești un link de conectare. Fără parolă. **Impact:** poarta de intrare pentru utilizatorii cu cont.

### ✉️ Verifică emailul — `/[locale]/auth/verify-request/page.tsx`
Pagină statică afișată după ce ai cerut magic link-ul: „Verifică-ți inbox-ul, dă click pe link". **Impact:** ghidează userul prin pasul de confirmare email.

### ⚠️ Eroare autentificare — `/[locale]/auth/error/page.tsx`
Afișează mesaje prietenoase când login-ul eșuează (configurare, acces refuzat, link expirat). Buton de reîncercare + întoarcere acasă. **Impact:** evită blocaje confuze la conectare.

---

## 4. Zona de cont (utilizatori autentificați)

### 🔐 Chei API — `/[locale]/account/api-keys/page.tsx`
Utilizatorul își poate **crea / lista / revoca chei API** personale. Cheia brută se afișează **o singură dată** la creare (nu poate fi recuperată). Butoane: „Adaugă cheie", „Șterge", „Copiază". Conectat la `/api/user/api-keys`. **Impact:** permite clienților tehnici să integreze programatic cu platforma. *(Notă: fără notificări email la creare/revocare — îmbunătățire de securitate viitoare.)*

### 📈 Consum — `/[locale]/account/usage/page.tsx`
Tablou de bord cu **planul curent, consumul lunar, creditele rămase** și ultimele 20 de evenimente de utilizare. Trage din `/api/user/usage`. **Impact:** transparență pentru client asupra cât a folosit din plan.

---

## 5. Administrare (panou protejat)

### 🛠️ Admin — `/[locale]/admin/page.tsx`
Panoul de control intern (cea mai mare pagină, ~778 linii), protejat prin parolă admin. De aici **gestionezi tot conținutul fără să atingi codul**:
- **Produse** — adaugă/editează/șterge produse, cu taburi pe **Basic / Media / Tehnic / Prețuri** și comutare **RO/EN** pentru texte bilingve; marcaje featured, vizibilitate, ordonare, status.
- **Parteneri** — CRUD pe logos/parteneri (prin componenta `PartnersManagement`).
- **Conținut pagini (CMS)** — editor de conținut (`PageEditor`) pentru textele paginilor. *(Notă: din cauza unui mic decalaj în scriptul de seed — vezi raportul de gap G-01 — tabela CMS poate fi goală, iar paginile cad pe textele din traduceri.)*
- Comutator de limbă + buton de delogare.

**Impact:** centrul de comandă editorial — îți dă control complet asupra a ce văd vizitatorii, în ambele limbi, fără programare.

---

## 6. Pagină tehnică (redirect)

### ↪️ Root redirect — `/page.tsx`
Pagină tehnică minimă (7 linii): redirecționează automat `/` către `/ro` (limba implicită). Fără conținut vizibil. **Impact:** asigură că oricine intră pe domeniul gol ajunge pe varianta în română. *(Aceasta e și pagina care a generat „false positive"-uri în audit-urile automate — auditoarele scanau acest root gol, nu pagina reală `/ro`.)*

---

## Rezumat acoperire

| Grup | Pagini | Stare |
|---|---|---|
| Publice principale | 8 (acasă, produse, use-cases, case-studies, despre, contact, pricing, success) | Funcționale; case-studies + produse au nevoie de conținut/imagery real |
| Legale | 3 (privacy, terms, cookies) | Funcționale, conectate la Legal Hub |
| Autentificare | 3 (signin, verify-request, error) | Funcționale (magic link) |
| Cont user | 2 (api-keys, usage) | Funcționale |
| Admin | 1 (panou CMS complet) | Funcțional; CMS blocat de seed drift (G-01) |
| Tehnice | 1 (root redirect) | Funcțional |
| **Total** | **18** | — |

*Generat: 2026-06-20 · pe baza citirii fiecărei pagini din `src/app`.*
