/**
 * CSRF protection via Origin header check.
 *
 * Use on state-changing API routes (POST/PUT/DELETE/PATCH) called from browser forms.
 * Rejects requests where the Origin or Referer does not match our domain.
 *
 * Why Origin check works for CSRF:
 * - Browsers always set Origin on cross-origin POST
 * - Attacker cannot forge Origin via fetch() or form submit from their domain
 * - Only same-origin requests will pass the allowlist
 *
 * Introduced by AUDIT-008 fix.
 */

import type { NextRequest } from "next/server";

/**
 * Origins allowed for state-changing requests.
 * Reads from `ALLOWED_ORIGINS` env var (comma-separated) with sensible dev fallback.
 */
function getAllowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean);
  if (fromEnv && fromEnv.length > 0) return fromEnv;

  // Dev fallback — production MUST set ALLOWED_ORIGINS env var
  return [
    "http://localhost:3000",
    "http://localhost:3011",
    "http://localhost:3012",
    "https://app.knowbest.ro",
    "https://knowbest.ro",
  ];
}

/**
 * Verifies the request's Origin (or Referer fallback) is in our allowlist.
 *
 * @returns null if allowed, or an error object if blocked
 */
export function verifyOrigin(request: NextRequest): { error: string; status: number } | null {
  const allowed = getAllowedOrigins();
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Primary check: Origin header
  if (origin) {
    if (allowed.includes(origin)) return null;
    return { error: "Forbidden — invalid origin", status: 403 };
  }

  // Fallback: Referer header (some browsers strip Origin on same-origin)
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      if (allowed.includes(refererOrigin)) return null;
      return { error: "Forbidden — invalid referer", status: 403 };
    } catch {
      return { error: "Forbidden — malformed referer", status: 403 };
    }
  }

  // No Origin and no Referer — likely a direct API call (curl, Postman).
  // For state-changing endpoints exposed to browsers, this is suspicious.
  return { error: "Forbidden — missing origin", status: 403 };
}
