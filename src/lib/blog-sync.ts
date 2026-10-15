// Copies the published LinkedIn posts from MarketingAutomation into kb_blog_posts and translates the new or
// changed ones into Romanian (2026-10-16). Run by /api/cron/blog-sync; safe to run any number of times.
import { prisma } from "@/lib/db";
import { hashText, slugFrom, titleFrom } from "@/lib/blog";
import { translateToRomanian } from "@/lib/blog-translate";

const DEFAULT_SOURCE = "https://ma.techbiz.ae/api/public/linkedin-posts";

interface SourcePost {
  id: string;
  text: string;
  image: string | null;
  publishedAt: string;
  url: string | null;
}

function isSourcePost(p: unknown): p is SourcePost {
  const o = p as Record<string, unknown>;
  return (
    !!o &&
    typeof o.id === "string" &&
    typeof o.text === "string" &&
    o.text.trim().length > 0 &&
    typeof o.publishedAt === "string" &&
    !Number.isNaN(Date.parse(o.publishedAt)) &&
    (o.image === null || (typeof o.image === "string" && /^https:\/\//.test(o.image))) &&
    (o.url === null || (typeof o.url === "string" && /^https:\/\/www\.linkedin\.com\//.test(o.url)))
  );
}

export interface SyncResult {
  received: number;
  /** Posts whose text was already published earlier: they are not separate articles. */
  repeats: number;
  created: number;
  updated: number;
  hidden: number;
  translated: number;
  translationFailed: { slug: string; reason: string }[];
  waitingTranslation: number;
}

export async function syncBlog({ translateLimit = 10 }: { translateLimit?: number } = {}): Promise<SyncResult> {
  const res = await fetch(process.env.BLOG_SOURCE_URL || DEFAULT_SOURCE, {
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`source answered ${res.status}`);
  const data = await res.json();
  const posts: SourcePost[] = Array.isArray(data?.posts) ? data.posts.filter(isSourcePost) : [];

  // The same text posted again later (LinkedIn reposts: 16 of 50 on 2026-10-16) is one article, not two
  // copies of the same page: the first publication is kept and the repeats are treated as not published.
  const firstOf = new Map<string, SourcePost>();
  for (const p of [...posts].sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))) {
    const key = p.text.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
    if (!firstOf.has(key)) firstOf.set(key, p);
  }
  const unique = [...firstOf.values()];

  const result: SyncResult = { received: posts.length, repeats: posts.length - unique.length, created: 0, updated: 0, hidden: 0, translated: 0, translationFailed: [], waitingTranslation: 0 };

  for (const p of unique) {
    const text = p.text.trim();
    const fields = {
      titleEn: titleFrom(text),
      bodyEn: text,
      imageUrl: p.image,
      linkedinUrl: p.url,
      publishedAt: new Date(p.publishedAt),
      sourceHash: hashText(text),
      hidden: false,
    };
    const existing = await prisma.blogPost.findUnique({ where: { sourceId: p.id }, select: { id: true, sourceHash: true, hidden: true, imageUrl: true, linkedinUrl: true, publishedAt: true } });
    if (!existing) {
      await prisma.blogPost.create({ data: { ...fields, sourceId: p.id, slug: slugFrom(fields.titleEn, p.id) } });
      result.created++;
    } else if (
      existing.sourceHash !== fields.sourceHash ||
      existing.hidden ||
      existing.imageUrl !== fields.imageUrl ||
      existing.linkedinUrl !== fields.linkedinUrl ||
      existing.publishedAt.getTime() !== fields.publishedAt.getTime()
    ) {
      // The slug stays: links to the article must keep working when the post is edited.
      await prisma.blogPost.update({ where: { id: existing.id }, data: fields });
      result.updated++;
    }
  }

  // A post that is no longer published in MarketingAutomation, or is a repeat, leaves the blog. An empty answer is not
  // taken as "everything was unpublished": a glitch there must not empty the blog.
  if (unique.length) {
    const hidden = await prisma.blogPost.updateMany({
      where: { hidden: false, sourceId: { notIn: unique.map((p) => p.id) } },
      data: { hidden: true },
    });
    result.hidden = hidden.count;
  }

  // New and edited posts, newest first, a few per run: the free models allow only so much per minute.
  const pending = await prisma.blogPost.findMany({
    where: { hidden: false },
    select: { id: true, slug: true, bodyEn: true, sourceHash: true, translatedHash: true },
    orderBy: { publishedAt: "desc" },
  });
  const todo = pending.filter((p) => p.translatedHash !== p.sourceHash);
  for (const post of todo.slice(0, Math.max(0, translateLimit))) {
    const got = await translateToRomanian(post.bodyEn);
    if (!got.ok) {
      result.translationFailed.push({ slug: post.slug, reason: got.reason });
      continue;
    }
    await prisma.blogPost.update({
      where: { id: post.id },
      data: {
        bodyRo: got.text,
        titleRo: titleFrom(got.text),
        translatedHash: post.sourceHash,
        translatedBy: got.by,
        translatedAt: new Date(),
      },
    });
    result.translated++;
  }
  result.waitingTranslation = todo.length - result.translated;
  return result;
}
