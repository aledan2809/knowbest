import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { verifyAdminToken, COOKIE_NAME } from '@/lib/admin-auth';
import { verifyOrigin } from '@/lib/csrf';

async function checkAdmin(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export const dynamic = 'force-dynamic';

const projectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  descriptionEn: z.string().nullable().optional(),
  longDescription: z.string().optional(),
  longDescriptionEn: z.string().nullable().optional(),
  nameEn: z.string().nullable().optional(),
  category: z.enum(['WEB_APP', 'API_SERVICE', 'MODULE', 'UTILITY', 'MOBILE_APP']).default('WEB_APP'),
  status: z.enum(['LIVE', 'BETA', 'DEVELOPMENT', 'COMING_SOON', 'DEPRECATED']).default('DEVELOPMENT'),
  demoUrl: z.string().nullable().optional(),
  prodUrl: z.string().nullable().optional(),
  repoUrl: z.string().nullable().optional(),
  standalone: z.boolean().default(false),
  icon: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  screenshots: z.array(z.string()).optional(),
  videoUrl: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  sortOrder: z.number().default(0),
  visible: z.boolean().default(true),
  featured: z.boolean().default(false),
  accessType: z.enum(['PUBLIC', 'PASSWORD', 'AUTHENTICATED', 'SUBSCRIBERS']).default('PUBLIC'),
  accessCode: z.string().nullable().optional(),
  pricingType: z.enum(['FREE', 'FREEMIUM', 'PAID', 'CONTACT']).default('FREE'),
  monthlyPrice: z.number().nullable().optional(),
  yearlyPrice: z.number().nullable().optional(),
});

// GET all projects (admin - includes hidden)
export async function GET(request: NextRequest) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const projects = await prisma.project.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ projects });
  } catch (error: unknown) {
    console.error("Failed to fetch projects:", error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST create project
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
    const data = projectSchema.parse(body);

    const project = await prisma.project.create({
      data: {
        ...data,
        screenshots: data.screenshots || [],
        tags: data.tags || [],
        techStack: data.techStack || [],
      },
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    console.error("Failed to create project:", error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT update project
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
    const { id, ...rest } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const data = projectSchema.partial().parse(rest);

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json({ project });
  } catch (error: unknown) {
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    console.error("Failed to update project:", error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE project
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
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Failed to delete project:", error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
