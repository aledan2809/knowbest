// RSS feed of the blog, one per language: /ro/blog/feed.xml and /en/blog/feed.xml (2026-10-16).
import { getTranslations } from "next-intl/server";
import { allPosts, siteUrl, type BlogLocale } from "@/lib/blog";

export const dynamic = "force-dynamic";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "ro" && locale !== "en") return new Response("Not found", { status: 404 });
  const t = await getTranslations({ locale, namespace: "blog" });
  const base = siteUrl();
  const posts = (await allPosts(locale as BlogLocale)).slice(0, 50);
  const items = posts
    .map((p) => {
      const link = `${base}/${locale}/blog/${p.slug}`;
      return [
        "<item>",
        `<title>${esc(p.title)}</title>`,
        `<link>${link}</link>`,
        `<guid isPermaLink="true">${link}</guid>`,
        `<pubDate>${p.publishedAt.toUTCString()}</pubDate>`,
        `<description>${esc(p.excerpt)}</description>`,
        p.imageUrl ? `<enclosure url="${esc(p.imageUrl)}" type="image/png" length="0"/>` : "",
        "</item>",
      ].join("");
    })
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(t("metaTitle"))}</title>
<link>${base}/${locale}/blog</link>
<description>${esc(t("metaDescription"))}</description>
<language>${locale === "ro" ? "ro-RO" : "en-GB"}</language>
<atom:link href="${base}/${locale}/blog/feed.xml" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=900" },
  });
}
