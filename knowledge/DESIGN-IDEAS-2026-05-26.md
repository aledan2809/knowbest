# knowbest — Design Audit + Best-Practice Ideas (2026-05-26)

**Method:** journey pass on live `https://app.knowbest.ro` (5/5 OK) + heuristic review of home/products/use-cases/contact/footer + [7] a11y/mobile signals (the FAIL scores there were redirect-root false positives — see TRUE-E2E report).

**Current state:** solid foundation — Framer Motion animations, gradient system, badges, i18n (ro/en), DB-driven products. Functionally clean. The gaps below are about *perceived premium-ness + conversion + trust + a11y*, not bugs.

---

## Top recommendations (prioritized)

### P1 — high impact, do first
1. **Real product imagery instead of emoji icons.** Products/use-cases use emoji + glow (good, but reads "MVP"). Generate per-product hero images via `@aledan/aicr` (Gemini Imagen) OR use real screenshots. Biggest single jump in perceived quality. *(extends T4)*
2. **Social proof band.** "Trusted by / Built for" logo strip + 2-3 testimonials + metrics ("30+ produse live, 2 VPS, X clienți"). Portfolio sites convert on credibility. The home already has a stats row (`projects: 28+`) — extend with logos.
3. **Cookie consent banner + GDPR.** Currently none. Required (RO/EU) + ties directly into **Legal hub integration** (Task 7). Pull ToS/Privacy/Cookies from `legal.knowbest.ro` (versioned) instead of static `/privacy` `/terms` pages.

### P2 — medium impact
4. **Hero upgrade.** Add an animated product showcase / looping mockup carousel or a subtle animated gradient mesh behind the hero headline. First-screen WOW.
5. **Case Studies population.** `nav.caseStudies` route exists — if empty, add 2-3 mini case studies (problem → solution → product). Strong B2B conversion driver.
6. **Dark mode toggle.** The footer is already dark; a full theme toggle is now table-stakes for a dev/tech portfolio and cheap with Tailwind `dark:`.
7. **Product detail pages.** Clicking a product → dedicated page (gallery, tech deep-dive, "open app" CTA) instead of just an external link. SEO + dwell time.

### P3 — polish / a11y
8. **Skip-navigation link** (a11y-scanner flagged "no skip nav") + visible focus rings on interactive elements.
9. **Sticky header with scroll-shrink** + active-section highlighting.
10. **Loading skeletons** for the products fetch (currently a spinner/empty) — perceived performance.
11. **OG/Twitter meta + favicon polish** per page for shareability.
12. **Micro-interactions on CTAs** (magnetic buttons, arrow slide) — already partial; extend.

---

## Quick wins I can ship next (low risk, no new deps)
- Skip-nav link + focus rings (a11y)
- Social proof band on home (logos from the 30 products + stats)
- Loading skeletons on products grid
- Sticky shrinking header

## Needs a decision / bigger effort
- AICR hero images (adds AI calls + storage) — your call on cost vs polish
- Cookie consent + Legal hub integration → **Task 7** (separate, touches NO-TOUCH Legal)
- Product detail pages (new routes + content)
- Case studies content (needs real copy)

**Recommendation:** ship the "quick wins" + P1.2 (social proof) + P1.3 (cookie/Legal) together; defer AICR imagery + detail pages to a focused follow-up.
