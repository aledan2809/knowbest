import { NextRequest, NextResponse } from "next/server";

// POST /api/v1/consent/record  { type?, choice, locale? }
// Records the visitor's cookie consent in the Legal Hub (anonymous path).
// Legal's /api/v1/consents/record schema: { documentVersionId, consentText, method }
// + x-app-slug header. We resolve the current document version server-side.
// Best-effort: never blocks the UI (client also persists locally).

const APP_SLUG = "knowbest";
export const dynamic = "force-dynamic";

// Per-IP rate limit (defense-in-depth: this proxy forwards to Legal Hub).
const RATE_MAX = 10;
const RATE_WINDOW_MS = 60_000;
const counters = new Map<string, { count: number; resetAt: number }>();
function allow(ip: string): boolean {
  const now = Date.now();
  const e = counters.get(ip);
  if (!e || e.resetAt < now) {
    counters.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (e.count >= RATE_MAX) return false;
  e.count++;
  return true;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "local";
  if (!allow(ip)) {
    return NextResponse.json({ recorded: false, reason: "rate-limited" }, { status: 429 });
  }
  type Categories = { necessary?: boolean; analytics?: boolean; marketing?: boolean };
  let payload: { type?: string; choice?: string; locale?: string; categories?: Categories } = {};
  try {
    payload = await request.json();
  } catch {
    /* tolerate */
  }

  const apiUrl = process.env.LEGAL_API_URL;
  const apiKey = process.env.LEGAL_API_KEY;
  if (!apiUrl) return NextResponse.json({ recorded: false, reason: "legal-not-configured" });

  const base = apiUrl.replace(/\/$/, "");
  const docType = (payload.type ?? "COOKIES").toLowerCase();

  // The granted set always includes strictly-necessary cookies (which need no consent).
  const cats = payload.categories ?? {};
  const granted = ["necessary"];
  if (cats.analytics) granted.push("analytics");
  if (cats.marketing) granted.push("marketing");

  // Legal Hub's ConsentRecord is an AFFIRMATIVE-consent ledger. Only record when
  // the visitor actually grants a non-essential category (analytics/marketing).
  // Refusals / essential-only choices need no consent and stay client-side only —
  // recording them here could be misread downstream as "accepted cookies".
  if (granted.length === 1) {
    return NextResponse.json({ recorded: false, reason: "not-granted" });
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "knowbest.ro";

  try {
    // 1) resolve current document version id
    const docRes = await fetch(`${base}/api/v1/public/legal/${APP_SLUG}/${docType}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!docRes.ok) return NextResponse.json({ recorded: false, reason: "doc-unavailable", upstream: docRes.status });
    const doc = await docRes.json();
    const versionId = doc?.version?.id;
    if (!versionId) return NextResponse.json({ recorded: false, reason: "no-version" });

    const catList = granted.join(", ");
    const consentText =
      payload.locale === "en"
        ? `Cookie consent (${payload.choice}) via the in-app banner on ${host} — categories: ${catList} (${docType} ${doc.version?.version ?? ""}).`
        : `Consimțământ cookie (${payload.choice}) prin banner-ul din aplicație pe ${host} — categorii: ${catList} (${docType} ${doc.version?.version ?? ""}).`;

    // 2) record (anonymous path: x-app-slug header, no x-user-id)
    const recRes = await fetch(`${base}/api/v1/consents/record`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-slug": APP_SLUG,
        ...(apiKey ? { "x-api-key": apiKey } : {}),
      },
      body: JSON.stringify({ appSlug: APP_SLUG, documentVersionId: versionId, consentText, method: "IN_APP" }),
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json({ recorded: recRes.ok, upstream: recRes.status });
  } catch {
    return NextResponse.json({ recorded: false, reason: "legal-unreachable" });
  }
}
