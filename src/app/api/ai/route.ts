import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { routeAI } from "@/lib/ai-router";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { assertHasCredits, recordUsage } from "@/lib/usage";
import { verifyOrigin } from "@/lib/csrf";

const AI_RATE_MAX = 30;
const AI_RATE_WINDOW_MS = 60_000;
const aiCounters = new Map<string, { count: number; resetAt: number }>();
function checkAIRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = aiCounters.get(ip);
  if (!entry || entry.resetAt < now) {
    aiCounters.set(ip, { count: 1, resetAt: now + AI_RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= AI_RATE_MAX) return false;
  entry.count++;
  return true;
}

const requestSchema = z.object({
  type: z.string().default("conversation"),
  complexity: z.enum(["low", "medium", "high"]).default("medium"),
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  maxTokens: z.number().int().positive().optional(),
});

type SessionUser = { id?: string; email?: string | null };

async function resolveUserId(): Promise<string | null> {
  const session = await getServerSession();
  const user = session?.user as SessionUser | undefined;
  if (!user) return null;
  if (user.id) return user.id;
  if (user.email) {
    const dbUser = await prisma.users.findFirst({
      where: { email: user.email },
      select: { id: true },
    });
    return dbUser?.id ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "local";
  if (!checkAIRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded — max 30 AI requests/minute" }, { status: 429 });
  }

  const csrfError = verifyOrigin(req);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }
  try {
    const body = await req.json();
    const parsed = requestSchema.parse(body);

    // AUDIT-012: meter authenticated callers; anonymous calls still allowed for
    // widget/demo but do not count toward any quota.
    const userId = await resolveUserId();
    if (userId) {
      try {
        await assertHasCredits(userId, 1);
      } catch (quotaErr) {
        if (quotaErr instanceof Error && (quotaErr as Error & { code?: string }).code === "QUOTA_EXCEEDED") {
          return NextResponse.json(
            { error: "Quota exceeded for current billing period" },
            { status: 402 }
          );
        }
        throw quotaErr;
      }
    }

    const result = await routeAI(parsed);

    if (userId) {
      // Fire-and-forget usage record; failure must not break the response.
      recordUsage({
        userId,
        kind: "ai_call",
        cost: 1,
        metadata: { type: parsed.type, complexity: parsed.complexity },
      }).catch((err) => console.error("[usage] recordUsage failed:", err));
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }
    console.error("AI routing error:", error);
    return NextResponse.json({ error: "AI routing failed" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "configured",
    info: "POST with { prompt, type?, complexity?, systemPrompt?, maxTokens? }",
  });
}
