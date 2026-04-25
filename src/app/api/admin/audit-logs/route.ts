import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { verifyAdminToken, COOKIE_NAME } from "@/lib/admin-auth";
import { verifyOrigin } from "@/lib/csrf";

export const dynamic = "force-dynamic";

async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

const createSchema = z.object({
  action: z.string().min(1, "Action is required").max(255),
  details: z.record(z.string(), z.unknown()).optional(),
  user_id: z.string().optional(),
  ip_address: z.string().optional(),
});

// GET /api/admin/audit-logs — list audit log entries with optional filters
export async function GET(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 200);
    const offset = Math.max(Number(searchParams.get("offset")) || 0, 0);

    const where: Record<string, unknown> = {};
    if (action) where.action = action;

    const [entries, total] = await Promise.all([
      prisma.audit_logs.findMany({
        where,
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.audit_logs.count({ where }),
    ]);

    return NextResponse.json({ entries, total, limit, offset });
  } catch (error: unknown) {
    console.error("Failed to fetch audit logs:", error);
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 });
  }
}

// POST /api/admin/audit-logs — create an audit log entry
export async function POST(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createSchema.parse(body);

    const entry = await prisma.audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        action: data.action,
        details: (data.details as Prisma.InputJsonValue) ?? Prisma.JsonNull,
        user_id: data.user_id ?? null,
        ip_address: data.ip_address ?? null,
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    console.error("Failed to create audit log:", error);
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
  }
}
