/**
 * Usage tracking / credits utilities.
 *
 * AUDIT-012 fix. Records a `UsageRecord` per metered action and provides
 * helpers to check monthly consumption / enforce plan quotas.
 *
 * Plans (initial defaults — tune via env or move to DB later):
 *   free      -> 100 credits/month
 *   starter   -> 1000 credits/month
 *   pro       -> 10000 credits/month
 *   enterprise -> unlimited (-1)
 */

import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type UsageKind =
  | "ai_call"
  | "transcription"
  | "report_export"
  | "other";

const PLAN_QUOTAS: Record<string, number> = {
  free: 100,
  starter: 1000,
  pro: 10000,
  enterprise: -1,
};

/**
 * Record a usage event. Returns the created record id.
 */
export async function recordUsage(params: {
  userId: string;
  kind: UsageKind;
  cost?: number;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const record = await prisma.usageRecord.create({
    data: {
      userId: params.userId,
      kind: params.kind,
      cost: params.cost ?? 1,
      metadata: params.metadata
        ? (params.metadata as Prisma.InputJsonValue)
        : undefined,
    },
    select: { id: true },
  });
  return record.id;
}

/**
 * Get total credits consumed by a user in the current calendar month.
 */
export async function getMonthlyUsage(userId: string): Promise<number> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const result = await prisma.usageRecord.aggregate({
    where: { userId, createdAt: { gte: start } },
    _sum: { cost: true },
  });
  return result._sum.cost ?? 0;
}

/**
 * Resolve the user's active plan name. Falls back to "free".
 */
export async function getUserPlan(userId: string): Promise<string> {
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      currentPeriodEnd: { gt: new Date() },
    },
    orderBy: { currentPeriodEnd: "desc" },
    select: { plan: true },
  });
  return sub?.plan ?? "free";
}

/**
 * Quota check — returns remaining credits or Infinity for enterprise.
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const plan = await getUserPlan(userId);
  const quota = PLAN_QUOTAS[plan] ?? PLAN_QUOTAS.free;
  if (quota === -1) return Infinity;

  const used = await getMonthlyUsage(userId);
  return Math.max(0, quota - used);
}

/**
 * Guard: throw if user is over quota. Use at the start of metered API routes.
 */
export async function assertHasCredits(userId: string, needed = 1): Promise<void> {
  const remaining = await getRemainingCredits(userId);
  if (remaining < needed) {
    const err = new Error("Quota exceeded for the current billing period");
    (err as Error & { code?: string }).code = "QUOTA_EXCEEDED";
    throw err;
  }
}
