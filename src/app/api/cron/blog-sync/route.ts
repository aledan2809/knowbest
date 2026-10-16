// Copies the LinkedIn posts from MarketingAutomation into the blog and translates new ones (2026-10-16).
// Called by the server's cron: POST with `Authorization: Bearer <BLOG_SYNC_SECRET>`.
// `?translate=N` handles up to N posts in this run (default 10, at most 25); `?budget=S` stops starting new
// ones after S seconds (default 180, at most 1500 — for a manual backfill with a longer curl timeout).
import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { syncBlog } from "@/lib/blog-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = process.env.BLOG_SYNC_SECRET;
  const given = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  if (!process.env.BLOG_SYNC_SECRET) {
    return NextResponse.json({ error: "BLOG_SYNC_SECRET is not set" }, { status: 503 });
  }
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const requested = Number(req.nextUrl.searchParams.get("translate") ?? 10);
  const translateLimit = Number.isFinite(requested) ? Math.min(25, Math.max(0, Math.floor(requested))) : 10;
  const seconds = Number(req.nextUrl.searchParams.get("budget") ?? 180);
  const budgetMs = (Number.isFinite(seconds) ? Math.min(1500, Math.max(0, Math.floor(seconds))) : 180) * 1000;
  try {
    const result = await syncBlog({ translateLimit, budgetMs });
    return NextResponse.json(result);
  } catch (error) {
    console.error("blog sync failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "sync failed" }, { status: 502 });
  }
}
