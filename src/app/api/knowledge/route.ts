import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  project_id: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, "Invalid project_id"),
  key: z.string().trim().min(1).max(500).optional(),
});

// GET /api/knowledge — public read-only access to knowledge entries
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      project_id: searchParams.get("project_id") ?? undefined,
      key: searchParams.get("key") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid parameters", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const where: Record<string, string> = { project_id: parsed.data.project_id };
    if (parsed.data.key) {
      where.key = parsed.data.key;
    }

    const entries = await prisma.knowledge_entries.findMany({
      where,
      orderBy: { key: "asc" },
      select: {
        id: true,
        key: true,
        value: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ entries });
  } catch (error: unknown) {
    console.error("Failed to fetch knowledge entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch knowledge entries" },
      { status: 500 }
    );
  }
}
