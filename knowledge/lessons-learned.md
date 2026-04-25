# Lessons Learned — knowbest

> Incident root causes and patterns specific to knowbest.
> Master-level lessons: `Master/knowledge/lessons-learned.md`.

## Lessons

#### L01: 39d STALE_WIP from initial commit + post-scaffold tooling/UI work
- **Date**: 2026-04-25
- **Category**: Git / Recovery
- **Lesson**: Optimise flagged 70 modified files for 39 days. Real changes (10 files) covered Next.js scaffold polish (page.tsx, layout.tsx, globals.css, button.tsx) plus tooling (eslint.config.mjs, next.config.ts, package.json/lock, tsconfig.json). Plus untracked: ~50 files including governance docs, schema, scripts, full Stripe + Prisma + i18n integration code that grew local without commits. CRLF accounted for the bulk of the inflation.
- **Action**: (1) Added `.gitattributes` (`* text=auto eol=lf`). Cross-ref Master L43. (2) Recovered via patch-extract + reset + reapply. (3) For Stripe-using projects: verify `.env*` files are gitignored AND not committed in initial scaffold (knowbest passed this check — only `.env.example` tracked). (4) ESLint v9 config migration (`eslint.config.mjs` flat config) was part of the 39d work — already correct format, no migration needed.

---

## How to Add New Lessons

1. Identify the lesson from your project work
2. Add it under an appropriate category
3. Follow the format above
4. Cross-reference Master L## if the pattern applies broadly
