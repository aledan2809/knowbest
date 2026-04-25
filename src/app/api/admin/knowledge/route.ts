import { NextRequest, NextResponse } from "next/server";
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
  project_id: z.string().min(1, "Project ID is required"),
  key: z.string().trim().min(1, "Key is required").max(500),
  value: z.string().min(1, "Value is required"),
});

const updateSchema = z.object({
  id: z.string().min(1, "ID is required"),
  key: z.string().trim().min(1).max(500).optional(),
  value: z.string().min(1).optional(),
});

// GET /api/admin/knowledge — list knowledge entries, optionally filtered by project_id
export async function GET(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("project_id");

    const where = projectId ? { project_id: projectId } : {};

    const entries = await prisma.knowledge_entries.findMany({
      where,
      orderBy: [{ project_id: "asc" }, { key: "asc" }],
      include: {
        projects: {
          select: { id: true, name: true, display_name: true },
        },
      },
    });

    return NextResponse.json({ entries });
  } catch (error: unknown) {
    console.error("Failed to fetch knowledge entries:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge entries" }, { status: 500 });
  }
}

// POST /api/admin/knowledge — create a knowledge entry
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

    const entry = await prisma.knowledge_entries.create({
      data: {
        id: crypto.randomUUID(),
        project_id: data.project_id,
        key: data.key,
        value: data.value,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2002") {
      return NextResponse.json({ error: "Entry with this project_id and key already exists" }, { status: 409 });
    }
    if (prismaError.code === "P2003") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    console.error("Failed to create knowledge entry:", error);
    return NextResponse.json({ error: "Failed to create knowledge entry" }, { status: 500 });
  }
}

// PUT /api/admin/knowledge — update a knowledge entry
export async function PUT(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, ...rest } = updateSchema.parse(body);

    const entry = await prisma.knowledge_entries.update({
      where: { id },
      data: {
        ...rest,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ entry });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "Knowledge entry not found" }, { status: 404 });
    }
    if (prismaError.code === "P2002") {
      return NextResponse.json({ error: "Entry with this project_id and key already exists" }, { status: 409 });
    }
    console.error("Failed to update knowledge entry:", error);
    return NextResponse.json({ error: "Failed to update knowledge entry" }, { status: 500 });
  }
}

// DELETE /api/admin/knowledge?id=... — delete a knowledge entry
export async function DELETE(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.knowledge_entries.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === "P2025") {
      return NextResponse.json({ error: "Knowledge entry not found" }, { status: 404 });
    }
    console.error("Failed to delete knowledge entry:", error);
    return NextResponse.json({ error: "Failed to delete knowledge entry" }, { status: 500 });
  }
}
