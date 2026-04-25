# Prioritized Issues — knowbest
**Source:** AUDIT_E2E_2026-03-21.md
**Generated:** 2026-03-27
**Audit Score:** 6/10

---

## Status Assessment (Audit vs Current)

Many issues from the audit have **already been fixed** since 2026-03-21. Below is the current state.

### Already Fixed (No Action Needed)

| # | Issue | Audit Status | Current Status |
|---|-------|-------------|----------------|
| 1 | Hardcoded admin password fallback | ❌ CRITIC | ✅ FIXED — `getAdminPassword()` throws if env var missing |
| 2 | JWT secret fallback insecur | ❌ CRITIC | ✅ FIXED — `getJWTSecret()` throws if env var missing |
| 3 | NextAuth incomplete (no route) | ❌ MAJOR | ✅ FIXED — `/api/auth/[...nextauth]/route.ts` exists |
| 4 | Stripe fără implementare | ❌ MAJOR | ✅ FIXED — checkout session, webhook, pricing page exist |
| 5 | Partners hard-coded | ❌ MINOR | ✅ FIXED — fetched from DB via `/api/partners` |

### Remaining Issues (To Fix)

#### P0 — Critical
_None remaining._

#### P1 — High
| # | Issue | Details |
|---|-------|---------|
| 1 | **Build fails (global-error prerender)** | Next.js 16 + next-intl: `_global-error` prerender fails with `useContext` null. Dev mode works. Known compatibility issue. |
| 2 | **No Zod validation on some API routes** | Contact, admin page-content, admin projects have Zod. Verify coverage is complete. |
| 3 | **CSRF on contact form** | No CSRF token on public contact form. Low risk but should be addressed. |

#### P2 — Medium
| # | Issue | Details |
|---|-------|---------|
| 4 | **Navbar/Footer duplicated in pages** | Each page imports `<Navbar />` and `<Footer />` manually instead of using a shared layout. |
| 5 | **No knowledge/ folder** | Audit recommends knowledge base docs; folder is empty. |
| 6 | **Build warning: "key" props** | Multiple React key warnings during build (non-blocking in dev). |
| 7 | **Middleware deprecated warning** | Next.js 16 warns: "middleware" file convention deprecated, use "proxy" instead. |

#### P3 — Low / Informational
| # | Issue | Details |
|---|-------|---------|
| 8 | **DB credentials in audit report** | Connection string with credentials visible in AUDIT_E2E_2026-03-21.md. |
| 9 | **Default README** | README.md is still the create-next-app template. |

---

## Recommended Fix Order (for next phases)
1. Fix build failure (P1 #1) — resolve next-intl / global-error prerender
2. Add CSRF protection to contact form (P1 #3)
3. Move Navbar/Footer to shared layout (P2 #4)
4. Fix React key warnings (P2 #6)
5. Update middleware to proxy convention (P2 #7)
6. Update README (P3 #9)
7. Redact credentials from audit report (P3 #8)
