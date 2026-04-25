/**
 * GET /api/user/usage — return current user's credit usage for the month.
 *
 * AUDIT-012 fix. Powers the usage dashboard UI.
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/db";
import { getMonthlyUsage, getUserPlan, getRemainingCredits } from "@/lib/usage";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string; email?: string | null };

async function getUserId(): Promise<string | null> {
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

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [used, plan, remaining] = await Promise.all([
      getMonthlyUsage(userId),
      getUserPlan(userId),
      getRemainingCredits(userId),
    ]);

    const recent = await prisma.usageRecord.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        kind: true,
        cost: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      plan,
      usedThisMonth: used,
      remaining: remaining === Infinity ? null : remaining,
      recent,
    });
  } catch (error: unknown) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}
