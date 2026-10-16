// Blog (2026-10-16): LinkedIn posts copied from MarketingAutomation (see /api/cron/blog-sync).
// A LinkedIn post has no title, so the title is the post's first sentence; the slug comes from the
// English title plus the end of the source id, so it never changes when a translation arrives.
import { createHash } from "crypto";
import { prisma } from "@/lib/db";

export const POSTS_PER_PAGE = 10;
export const BLOG_AUTHOR = "Alex Danciulescu";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://knowbest.ro").replace(/\/$/, "");
}

export function hashText(text: string): string {
  return createHash("sha256").update(text).digest("hex").slice(0, 32);
}

/** The first sentence (or line) of the post, cut at a word boundary. */
export function titleFrom(text: string, max = 90): string {
  const firstLine = text.trim().split(/\n/)[0].trim();
  const sentence = firstLine.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? firstLine;
  if (sentence.length <= max) return sentence.replace(/[:;,]$/, "");
  const cut = sentence.slice(0, max);
  const space = cut.lastIndexOf(" ");
  return `${cut.slice(0, space > 40 ? space : max).replace(/[,:;.!?-]+$/, "")}…`;
}

/** Text for meta descriptions and cards: no title line, no line breaks, about 155 characters. */
export function excerptFrom(text: string, title: string, max = 155): string {
  // A title cut short ends mid-sentence; the excerpt then starts from the beginning instead of continuing it.
  const rest = !title.endsWith("…") && text.trim().startsWith(title) ? text.trim().slice(title.length) : text;
  const flat = (rest.trim() || text.trim()).replace(/\s+/g, " ").replace(/^[.!?:,;\s]+/, "");
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : max)}…`;
}

export function slugFrom(title: string, sourceId: string): string {
  const full = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Cut long titles at a word boundary, never in the middle of a word.
  const base = full.length <= 70 ? full : full.slice(0, 70).replace(/-[^-]*$/, "");
  return `${base || "post"}-${sourceId.slice(-6).toLowerCase()}`;
}

/**
 * The article page's heading and the text under it. The heading is the post's whole first sentence (the
 * stored title may be cut at 90 characters for cards and meta tags), and the text starts after it, so the
 * first sentence is not read twice. A first sentence longer than 200 characters stays in the text.
 */
export function splitHeadline(text: string, title: string): { headline: string; rest: string } {
  const trimmed = text.trim();
  const sentence = trimmed.split(/\n/)[0].trim().match(/^.+?[.!?](?=\s|$)/)?.[0] ?? trimmed.split(/\n/)[0].trim();
  const rest = trimmed.slice(sentence.length).trim();
  if (sentence.length > 200 || !rest) return { headline: title, rest: trimmed };
  return { headline: sentence.replace(/[:;,]$/, ""), rest };
}

export type BlogLocale = "ro" | "en";

export interface BlogView {
  slug: string;
  title: string;
  /** The whole first sentence — the heading on cards and the article page. */
  headline: string;
  body: string;
  /** Starts after the first sentence, so the card does not repeat its heading. */
  excerpt: string;
  imageUrl: string | null;
  linkedinUrl: string | null;
  publishedAt: Date;
  updatedAt: Date;
  /** The Romanian page shows the English original because no checked translation exists yet. */
  untranslated: boolean;
  /** The text shown is a machine translation of the English original. */
  translated: boolean;
}

type Row = {
  slug: string;
  titleEn: string;
  bodyEn: string;
  titleRo: string | null;
  bodyRo: string | null;
  sourceHash: string;
  translatedHash: string | null;
  reviewedHash: string | null;
  imageUrl: string | null;
  linkedinUrl: string | null;
  publishedAt: Date;
  updatedAt: Date;
};

export function viewFor(row: Row, locale: BlogLocale): BlogView {
  // A translation made from an older English text is not shown (the post changed since), nor one that has not
  // passed the two readings yet (blog-proofread.ts).
  const ro =
    locale === "ro" && row.titleRo && row.bodyRo && row.translatedHash === row.sourceHash && row.reviewedHash === row.sourceHash;
  const title = ro ? row.titleRo! : row.titleEn;
  const body = ro ? row.bodyRo! : row.bodyEn;
  return {
    slug: row.slug,
    title,
    body,
    headline: splitHeadline(body, title).headline,
    excerpt: excerptFrom(splitHeadline(body, title).rest, ""),
    imageUrl: row.imageUrl,
    linkedinUrl: row.linkedinUrl,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    untranslated: locale === "ro" && !ro,
    translated: Boolean(ro),
  };
}

const ROW_SELECT = {
  slug: true,
  titleEn: true,
  bodyEn: true,
  titleRo: true,
  bodyRo: true,
  sourceHash: true,
  translatedHash: true,
  reviewedHash: true,
  imageUrl: true,
  linkedinUrl: true,
  publishedAt: true,
  updatedAt: true,
} as const;

export async function listPosts(locale: BlogLocale, page: number) {
  const where = { hidden: false };
  const total = await prisma.blogPost.count({ where });
  const pages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const current = Math.min(Math.max(1, page), pages);
  const rows = await prisma.blogPost.findMany({
    where,
    select: ROW_SELECT,
    orderBy: { publishedAt: "desc" },
    skip: (current - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
  });
  return { posts: rows.map((r) => viewFor(r, locale)), total, pages, current };
}

export async function getPost(locale: BlogLocale, slug: string) {
  const row = await prisma.blogPost.findFirst({ where: { slug, hidden: false }, select: ROW_SELECT });
  return row ? viewFor(row, locale) : null;
}

/** Every visible post, newest first — for the sitemap, the feed and llms.txt. */
export async function allPosts(locale: BlogLocale) {
  const rows = await prisma.blogPost.findMany({
    where: { hidden: false },
    select: ROW_SELECT,
    orderBy: { publishedAt: "desc" },
  });
  return rows.map((r) => viewFor(r, locale));
}

const PRODUCT_SELECT = { slug: true, name: true, nameEn: true, tagline: true, taglineEn: true, description: true, descriptionEn: true, icon: true } as const;
type ProductRow = { slug: string; name: string; nameEn: string | null; tagline: string | null; taglineEn: string | null; description: string | null; descriptionEn: string | null; icon: string | null };
export type BlogProduct = { slug: string; icon: string | null; name: string; text: string };

const productView = (p: ProductRow, locale: BlogLocale): BlogProduct => ({
  slug: p.slug,
  icon: p.icon,
  name: locale === "en" ? p.nameEn || p.name : p.name,
  text: (locale === "en" ? p.taglineEn || p.descriptionEn : p.tagline || p.description) || "",
});

/** Up to three of the site's own products marked as recommended. */
export async function featuredProducts(locale: BlogLocale, take = 3): Promise<BlogProduct[]> {
  const rows = await prisma.project.findMany({
    where: { visible: true, featured: true, status: "LIVE" },
    orderBy: { sortOrder: "asc" },
    select: PRODUCT_SELECT,
    take,
  });
  return rows.map((p) => productView(p, locale));
}

// An article about websites leads to the products that check and fix a website (2026-10-17, decided with
// Alex): a reader convinced by "your site loads too slowly" has nothing to do with a procurement tool. The
// words are read in both languages, so an article that is shown in English still finds its products.
const WEBSITE_WORDS =
  /(?<![\p{L}\p{N}])(site|website|web page|pagin|page|google|seo|lac[aă]t|padlock|certificat|https|accesibil|accessib|încărc|load)/iu;
const WEBSITE_PRODUCTS = ["ave", "website-guru"];

/** The products shown under an article: the ones its subject is about, otherwise the recommended ones. */
export async function productsForPost(text: string, locale: BlogLocale): Promise<BlogProduct[]> {
  if (WEBSITE_WORDS.test(text)) {
    const rows = await prisma.project.findMany({
      where: { visible: true, status: "LIVE", slug: { in: WEBSITE_PRODUCTS } },
      select: PRODUCT_SELECT,
    });
    const bySlug = new Map(rows.map((p) => [p.slug, p]));
    const matched = WEBSITE_PRODUCTS.flatMap((slug) => (bySlug.has(slug) ? [productView(bySlug.get(slug)!, locale)] : []));
    if (matched.length) return matched;
  }
  return featuredProducts(locale);
}

export function formatDate(date: Date, locale: BlogLocale): string {
  return new Intl.DateTimeFormat(locale === "ro" ? "ro-RO" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Bucharest",
  }).format(date);
}
