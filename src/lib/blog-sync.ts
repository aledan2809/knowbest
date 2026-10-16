// Copies the published LinkedIn posts from MarketingAutomation into kb_blog_posts and translates the new or
// changed ones into Romanian (2026-10-16). Run by /api/cron/blog-sync; safe to run any number of times.
import { prisma } from "@/lib/db";
import { hashText, slugFrom, titleFrom } from "@/lib/blog";
import { translateToRomanian } from "@/lib/blog-translate";

// `site=knowbest`: MarketingAutomation labels every post (Emirates / Romania / general) and returns only the
// ones meant for this site — Romania and general (decided with Alex, 2026-10-16).
const DEFAULT_SOURCE = "https://ma.techbiz.ae/api/public/linkedin-posts?site=knowbest";

// Until MarketingAutomation labels the posts, an answer without `site` is filtered here: posts about the
// Emirates or carrying a TechBiz offer are not for a Romanian reader (16 of 35 named Dubai or the UAE,
// 11 linked to TechBiz.ae on 2026-10-16). A post that only names a brand in passing still goes out.
const NOT_FOR_ROMANIA = /\b(dubai|uae|u\.a\.e|emirat\w*|abu dhabi|sharjah|souk|aed|techbiz(\.ae)?)\b|\+971|\d+\s?% off|\bdiscount/i;

export function notForRomania(text: string): boolean {
  return NOT_FOR_ROMANIA.test(text);
}

const words = (text: string) => new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []);

/** Share of words two texts have in common (Jaccard). 1 = the same words. */
export function sameWords(a: string, b: string): number {
  const x = words(a);
  const y = words(b);
  if (!x.size || !y.size) return 0;
  let common = 0;
  for (const w of x) if (y.has(w)) common++;
  return common / (x.size + y.size - common);
}

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
  /** Posts about the Emirates or carrying a TechBiz offer: not shown on knowbest.ro. */
  notForThisSite: number;
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
  const received: SourcePost[] = Array.isArray(data?.posts) ? data.posts.filter(isSourcePost) : [];
  const labelled = data?.site === "knowbest";
  const posts = labelled ? received : received.filter((p) => !notForRomania(p.text));

  // The same text posted again later (LinkedIn reposts: 16 of 50 on 2026-10-16) is one article, not two
  // copies of the same page: the first publication is kept and the repeats are treated as not published.
  // A repost with one word changed ("last week" → "recently") is still a repeat: 80% of the words in common.
  const unique: SourcePost[] = [];
  for (const p of [...posts].sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))) {
    if (!unique.some((u) => sameWords(u.text, p.text) >= 0.8)) unique.push(p);
  }

  const result: SyncResult = { received: received.length, notForThisSite: received.length - posts.length, repeats: posts.length - unique.length, created: 0, updated: 0, hidden: 0, translated: 0, translationFailed: [], waitingTranslation: 0 };

  for (const p of unique) {
    const text = p.text.trim();
    const fields = {
      titleEn: titleFrom(text),
      bodyEn: text,
      // The pictures are the posters MarketingAutomation draws for each project. Until it says which site a
      // picture belongs to, none is shown here: every AVE poster carries a UAE phone number and techbiz.ae.
      imageUrl: labelled ? p.image : null,
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

  // A post that is no longer published in MarketingAutomation, is a repeat or is not for this site leaves the blog. An empty answer is not
  // taken as "everything was unpublished": a glitch there must not empty the blog.
  if (received.length) {
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
