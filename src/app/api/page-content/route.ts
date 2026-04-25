import { NextRequest, NextResponse } from 'next/server';
import { getPageContent } from '@/lib/page-content';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  page: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid page name'),
  locale: z.enum(['ro', 'en']).default('ro'),
});

// GET page content for frontend with fallback to JSON
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = QuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      locale: searchParams.get('locale') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters', issues: parsed.error.issues }, { status: 400 });
    }

    const content = await getPageContent(parsed.data.page, parsed.data.locale);

    return NextResponse.json({ content });
  } catch (error: unknown) {
    console.error('Failed to fetch page content:', error);
    return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
  }
}
