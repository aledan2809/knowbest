import { NextRequest, NextResponse } from "next/server";

// POST /api/v1/consent/record  { type, choice, locale }
// Best-effort: forwards the visitor's cookie consent to the Legal Hub
// (legal.knowbest.ro /api/v1/consents/record) for the knowbest app. Never blocks
// the UI — the client also persists the choice locally. Returns { recorded:bool }.
//
// NOTE: full persistence requires the knowbest -> Fabulosos AppEntityMapping in
// Legal (NO-TOUCH Legal DB write, propose-confirm). Until then Legal may reject;
// we degrade gracefully.

const APP_SLUG = "knowbest";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let payload: { type?: string; choice?: string; locale?: string } = {};
  try {
    payload = await request.json();
  } catch {
    /* tolerate empty body */
  }

  const apiUrl = process.env.LEGAL_API_URL;
  const apiKey = process.env.LEGAL_API_KEY;
  if (!apiUrl || !apiKey) {
    return NextResponse.json({ recorded: false, reason: "legal-not-configured" });
  }

  try {
    const res = await fetch(`${apiUrl.replace(/\/$/, "")}/api/v1/consents/record`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        appSlug: APP_SLUG,
        consentType: (payload.type ?? "COOKIES").toUpperCase(),
        granted: payload.choice === "accepted",
        channel: "IN_APP_BANNER",
        locale: payload.locale ?? "ro",
        userAgent: request.headers.get("user-agent") ?? undefined,
      }),
      signal: AbortSignal.timeout(8000),
    });
    return NextResponse.json({ recorded: res.ok, upstream: res.status });
  } catch {
    return NextResponse.json({ recorded: false, reason: "legal-unreachable" });
  }
}
