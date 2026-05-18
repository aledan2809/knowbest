# AUDIT_GAPS — knowbest
Last Updated: 2026-05-18

## Eliminated Gaps

| ID | Severitate | Descriere | Status | Commit | Data |
|----|-----------|-----------|--------|--------|------|
| G-KB-001 | P2 | Lipsă viewport export Next.js 16 (layout.tsx) | Eliminated | 14c320f | 2026-05-18 |
| G-KB-002 | P1 | Lipsă rate limiting pe /api/contact (email spam) | Eliminated | 14c320f | 2026-05-18 |
| G-KB-003 | P1 | Lipsă rate limiting pe /api/ai (per-IP, defense-in-depth) | Eliminated | 14c320f | 2026-05-18 |
| G-KB-004 | P1 | Lipsă rate limiting pe /api/create-checkout-session (Stripe spam) | Eliminated | 14c320f | 2026-05-18 |

## Open Gaps

| ID | Severitate | Descriere | Status | Note |
|----|-----------|-----------|--------|------|
| G-KB-005 | P3 | CSRF origin check lipsă pe GET admin routes | OPEN | GET nu modifică state; risc scăzut, acceptat |
| G-KB-006 | P3 | console.error() în producție | OPEN | Monitorizare normală, risc scăzut |

Journey audit: 5/5 OK (/ro, /ro/products, /ro/pricing, /ro/about, /ro/contact)
ML2 Wave 5 Verdict: PASS
