import { NextRequest, NextResponse } from "next/server";

// GET /api/v1/consent/document?type=cookies|privacy|tos
// Proxies the Legal Hub public document API (legal.knowbest.ro) and renders the
// markdown with this app's controller entity (Fabulosos S.R.L.). Token substitution
// is server-side so LEGAL_API_URL stays private and the modal always shows the
// correct entity. Falls back to Fabulosos defaults when Legal has no app→entity
// mapping yet (knowbest mapping pending — see Master TODO Legal coverage).

const APP_SLUG = "knowbest";
const APP_NAME = "KnowBest";
const VALID_TYPES = ["tos", "privacy", "cookies"] as const;
type ValidType = (typeof VALID_TYPES)[number];

// Controller entity for knowbest (Fabulosos S.R.L.) — used as fallback until the
// Legal-side AppEntityMapping is created (NO-TOUCH Legal write, propose-confirm).
const ENTITY_FALLBACK = {
  name: "Fabulosos S.R.L.",
  cui: "RO33968578",
  jurisdiction: "RO",
  address: "Str. Valea Oltului nr. 8, Sector 6, București",
  dpoEmail: "dpo@4pro.io",
};

function isValidType(t: string): t is ValidType {
  return (VALID_TYPES as readonly string[]).includes(t);
}

function formatAddress(address: unknown): string {
  if (typeof address === "string") return address || "—";
  if (!address || typeof address !== "object") return ENTITY_FALLBACK.address;
  const a = address as Record<string, string | undefined>;
  const parts = [a.street, a.sector, a.city, a.country].filter(Boolean);
  return parts.length ? parts.join(", ") : ENTITY_FALLBACK.address;
}

function substitute(text: string, vars: Record<string, string>): string {
  let r = text;
  for (const [k, v] of Object.entries(vars)) r = r.replaceAll(k, v);
  return r;
}

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "cookies").toLowerCase();
  if (!isValidType(type)) {
    return NextResponse.json({ error: `type must be one of ${VALID_TYPES.join(", ")}` }, { status: 400 });
  }
  const apiUrl = process.env.LEGAL_API_URL;
  if (!apiUrl) return NextResponse.json({ error: "Legal Hub not configured" }, { status: 503 });

  try {
    const url = `${apiUrl.replace(/\/$/, "")}/api/v1/public/legal/${APP_SLUG}/${type}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (!res.ok) return NextResponse.json({ error: "Legal Hub upstream error", upstream: res.status }, { status: 502 });

    const body = await res.json();
    const entity = body.entity ?? {};
    const version = body.version ?? {};
    if (!version.id || !version.contentMarkdown) {
      return NextResponse.json({ error: "Legal Hub response malformed" }, { status: 502 });
    }

    const effDate = version.effectiveFrom
      ? new Intl.DateTimeFormat("ro-RO", { year: "numeric", month: "long", day: "2-digit" }).format(new Date(version.effectiveFrom))
      : "—";

    const vars: Record<string, string> = {
      "{entity_name}": entity.name ?? ENTITY_FALLBACK.name,
      "{entity_cui}": entity.cui ?? ENTITY_FALLBACK.cui,
      "{entity_jurisdiction}": entity.jurisdiction ?? ENTITY_FALLBACK.jurisdiction,
      "{entity_address}": entity.address ? formatAddress(entity.address) : ENTITY_FALLBACK.address,
      "{entity_dpo_email}": entity.dpoEmail ?? ENTITY_FALLBACK.dpoEmail,
      "{effective_date}": effDate,
      "{version}": version.version ?? "—",
      "{app_name}": APP_NAME,
      "{app_slug}": APP_SLUG,
      "{user_email}": "—",
      "{rendered_at}": new Intl.DateTimeFormat("ro-RO", { year: "numeric", month: "long", day: "2-digit" }).format(new Date()),
    };

    return NextResponse.json(
      {
        contentMarkdown: substitute(version.contentMarkdown, vars),
        versionId: version.id,
        version: version.version ?? null,
        effectiveFrom: version.effectiveFrom ?? null,
        entityName: vars["{entity_name}"],
        entityMapped: Boolean(entity.name),
      },
      { headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=60" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return NextResponse.json({ error: "Legal Hub unreachable", detail: message }, { status: 502 });
  }
}
