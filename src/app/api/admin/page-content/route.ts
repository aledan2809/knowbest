import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth';
import { verifyOrigin } from '@/lib/csrf';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  id: z.string(),
  valueRo: z.string(),
  valueEn: z.string().nullable().optional(),
});

// GET all content for a specific page (admin-only)
export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page');

    if (!page) {
      return NextResponse.json({ error: 'Page parameter required' }, { status: 400 });
    }

    const content = await prisma.pageContent.findMany({
      where: { page },
      orderBy: [{ section: 'asc' }, { sortOrder: 'asc' }],
    });

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error("Failed to fetch page content:", error);
    return NextResponse.json({ error: "Failed to fetch page content" }, { status: 500 });
  }
}

// PUT update page content entry
export async function PUT(request: NextRequest) {
  const csrfError = verifyOrigin(request);
  if (csrfError) {
    return NextResponse.json({ error: csrfError.error }, { status: csrfError.status });
  }
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, valueRo, valueEn } = updateSchema.parse(body);

    const content = await prisma.pageContent.update({
      where: { id },
      data: {
        valueRo,
        valueEn: valueEn === undefined ? null : valueEn,
      },
    });

    return NextResponse.json({ content });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }
    console.error("Failed to update page content:", error);
    return NextResponse.json({ error: 'Failed to update page content' }, { status: 500 });
  }
}
