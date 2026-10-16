// Copies the published LinkedIn posts from MarketingAutomation into kb_blog_posts and translates the new or
// changed ones into Romanian (2026-10-16). Run by /api/cron/blog-sync; safe to run any number of times.
import { prisma } from "@/lib/db";
import { hashText, slugFrom, titleFrom } from "@/lib/blog";
import { translateToRomanian } from "@/lib/blog-translate";
import { reviewTranslation } from "@/lib/blog-proofread";

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
  /** New translations saved as drafts; the page shows them only after the readings. */
  translated: number;
  translationFailed: { slug: string; reason: string }[];
  /** Translations that passed both readings and are now shown (`corrected` of them needed fixes). */
  reviewed: number;
  corrected: number;
  /** Translations a reader refused: the page keeps the English text and Alex is told. */
  held: { slug: string; reason: string }[];
  /** No reader answered: tried again on the next run. */
  reviewUnavailable: { slug: string; reason: string }[];
  waitingTranslation: number;
}

// A run is called by cron with a 280-second deadline: no new post is started after this.
const DEFAULT_BUDGET_MS = 180_000;

export async function syncBlog({ translateLimit = 10, budgetMs = DEFAULT_BUDGET_MS }: { translateLimit?: number; budgetMs?: number } = {}): Promise<SyncResult> {
  const startedAt = Date.now();
  const res = await fetch(process.env.BLOG_SOURCE_URL || DEFAULT_SOURCE, {
    cache: "no-store",
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`source answered ${res.status}`);
  const data = await res.json();
  const received: SourcePost[] = Array.isArray(data?.posts) ? data.posts.filter(isSourcePost) : [];
  const labelled = data?.site === "knowbest";
  // Posts MarketingAutomation has not judged yet: missing from the list only because of that, so they stay.
  const notJudgedYet: string[] = labelled && Array.isArray(data?.pending) ? data.pending.filter((id: unknown): id is string => typeof id === "string") : [];
  const posts = labelled ? received : received.filter((p) => !notForRomania(p.text));

  // The same text posted again later (LinkedIn reposts: 16 of 50 on 2026-10-16) is one article, not two
  // copies of the same page: the first publication is kept and the repeats are treated as not published.
  // A repost with one word changed ("last week" → "recently") is still a repeat: 80% of the words in common.
  const unique: SourcePost[] = [];
  for (const p of [...posts].sort((a, b) => Date.parse(a.publishedAt) - Date.parse(b.publishedAt))) {
    if (!unique.some((u) => sameWords(u.text, p.text) >= 0.8)) unique.push(p);
  }

  const result: SyncResult = { received: received.length, notForThisSite: received.length - posts.length, repeats: posts.length - unique.length, created: 0, updated: 0, hidden: 0, translated: 0, translationFailed: [], reviewed: 0, corrected: 0, held: [], reviewUnavailable: [], waitingTranslation: 0 };

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
  // taken as "everything was unpublished": a glitch there must not empty the blog. A post MarketingAutomation has not judged yet stays.
  if (received.length) {
    const hidden = await prisma.blogPost.updateMany({
      where: { hidden: false, sourceId: { notIn: [...unique.map((p) => p.id), ...notJudgedYet] } },
      data: { hidden: true },
    });
    result.hidden = hidden.count;
  }

  // New and edited posts, a few per run: translated into a draft, then read (blog-proofread.ts). The Romanian
  // page shows a translation only once the readings confirmed it; until then, or when the readers refused
  // it, it shows the English text. A refused translation is read again a day later; Alex is told once per
  // text, on Telegram. Posts never tried come first (newest first), then the ones tried longest ago, so a
  // post that keeps failing does not take every run's places.
  const rows = await prisma.blogPost.findMany({
    where: { hidden: false },
    select: {
      id: true, slug: true, titleEn: true, bodyEn: true, bodyRo: true, sourceHash: true, translatedHash: true, translatedBy: true,
      reviewedHash: true, reviewIssue: true, reviewIssueHash: true, reviewAttemptAt: true, publishedAt: true,
    },
  });
  const now = Date.now();
  const todo = rows
    .filter(
      (p) =>
        p.translatedHash !== p.sourceHash ||
        (p.reviewedHash !== p.sourceHash && (!p.reviewIssue || !p.reviewAttemptAt || now - p.reviewAttemptAt.getTime() > RETRY_HELD_MS)),
    )
    .sort(
      (a, b) =>
        (a.reviewAttemptAt?.getTime() ?? 0) - (b.reviewAttemptAt?.getTime() ?? 0) || b.publishedAt.getTime() - a.publishedAt.getTime(),
    );
  let started = 0;
  for (const post of todo) {
    if (started >= Math.max(0, translateLimit) || Date.now() - startedAt > budgetMs) break;
    started++;
    // Every write is conditional on the English text it was made from: an edit during the run wins.
    const sameText = { id: post.id, sourceHash: post.sourceHash };
    // A refused draft is not read again as it is: a day later it is translated afresh.
    let draft = post.translatedHash === post.sourceHash && !post.reviewIssue ? post.bodyRo : null;
    let translatedBy = post.translatedBy;
    if (!draft) {
      const got = await translateToRomanian(post.bodyEn);
      if (!got.ok) {
        result.translationFailed.push({ slug: post.slug, reason: got.reason });
        continue;
      }
      draft = got.text;
      translatedBy = got.by;
      // A new draft has not been read: whatever was read or refused before was about another text.
      const saved = await prisma.blogPost.updateMany({
        where: sameText,
        data: {
          bodyRo: draft, titleRo: titleFrom(draft), translatedHash: post.sourceHash, translatedBy, translatedAt: new Date(),
          reviewedHash: null, reviewIssue: null, reviewAttemptAt: null,
        },
      });
      if (!saved.count) continue;
      result.translated++;
    }

    const review = await reviewTranslation(post.bodyEn, draft);
    if (review.status === "ok") {
      await prisma.blogPost.updateMany({
        where: sameText,
        data: {
          bodyRo: review.text,
          titleRo: titleFrom(review.text),
          reviewedHash: post.sourceHash,
          reviewIssue: null,
          reviewAttemptAt: new Date(),
          translatedBy: `${(translatedBy ?? "?").split("; citit:")[0]}; citit: ${review.by}, ${review.fixes} cuvinte corectate`.slice(0, 250),
        },
      });
      result.reviewed++;
      if (review.fixes > 0) result.corrected++;
    } else if (review.status === "held") {
      const saved = await prisma.blogPost.updateMany({
        where: sameText,
        data: { reviewedHash: null, reviewIssue: review.reason, reviewAttemptAt: new Date() },
      });
      result.held.push({ slug: post.slug, reason: review.reason });
      if (saved.count && post.reviewIssueHash !== post.sourceHash && (await tellAlex(post.titleEn, post.slug, review.reason))) {
        await prisma.blogPost.updateMany({ where: sameText, data: { reviewIssueHash: post.sourceHash } });
      }
    } else {
      // Nothing decided: the draft stays unread and is tried again on the next run.
      await prisma.blogPost.updateMany({ where: sameText, data: { reviewAttemptAt: new Date() } });
      result.reviewUnavailable.push({ slug: post.slug, reason: review.reason });
    }
  }
  result.waitingTranslation = todo.length - result.reviewed - result.held.length;
  return result;
}

const RETRY_HELD_MS = 24 * 60 * 60 * 1000;

/** One Telegram message per refused translation (the Master Alerts bot). True when it was delivered. */
async function tellAlex(titleEn: string, slug: string, reason: string): Promise<boolean> {
  const token = process.env.BLOG_ALERT_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.BLOG_ALERT_TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn(`[blog] translation held, no Telegram configured: ${slug}: ${reason}`);
    return false;
  }
  const text = [
    "📝 knowbest.ro — o traducere nu a fost publicată",
    titleEn,
    `Motiv: ${reason}`,
    `https://knowbest.ro/ro/blog/${slug} rămâne în engleză; o încerc din nou peste o zi.`,
  ].join("\n");
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok;
  } catch {
    return false; // the sync result and the server log still carry the reason; tried again with the next refusal
  }
}
