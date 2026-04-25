/**
 * User API Keys — CRUD endpoints.
 *
 * AUDIT-011 fix. Authenticated via NextAuth session (user-scoped).
 *
 * Token format: `kb_<32 random bytes base64url>`
 * Stored as bcrypt hash; the raw token is shown exactly once on creation.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { verifyOrigin } from "@/lib/csrf";
import { generateToken, hashToken } from "@/lib/api-key";

export const dynamic = "force-dynamic";

type SessionUser = { id?: string; email?: string | null };

async function getUserId(): Promise<string | null> {
  const session = await getServerSession();
  const user = session?.user as SessionUser | undefined;
  if (!user) return null;
  if (user.id) return user.id;
  // Fallback: look up by email if adapter didn't set id on the session
  if (user.email) {
    const dbUser = await prisma.users.findFirst({
      where: { email: user.email },
      select: { id: true },
    });
    return dbUser?.id ?? null;
  }
  return null;
}

// GET /api/user/api-keys — list current user's keys (without revealing hashes)
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await prisma.userApiKey.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json(keys);
}

const CreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});

// POST /api/user/api-keys — create a new key (returns raw token once)
export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // Generate: kb_<base64url(32 bytes)>
  const rawToken = generateToken();
  const keyPrefix = rawToken.slice(0, 11); // "kb_" + first 8 chars
  const keyHash = hashToken(rawToken);

  const created = await prisma.userApiKey.create({
    data: {
      userId,
      name: parsed.data.name,
      keyPrefix,
      keyHash,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      createdAt: true,
    },
  });

  // Return raw token ONCE — user must copy it now
  return NextResponse.json({
    ...created,
    token: rawToken,
    notice: "Save this token now — it will not be shown again.",
  });
}

// DELETE /api/user/api-keys?id=... — revoke a key
export async function DELETE(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }

  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Key id required" }, { status: 400 });
  }

  const key = await prisma.userApiKey.findUnique({ where: { id } });
  if (!key || key.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.userApiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
