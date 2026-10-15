// /llms.txt (llmstxt.org): a plain summary of the site for AI assistants, with the main pages, the products
// and every blog article (2026-10-16). Built from the database on each request, so new articles appear here
// as soon as they are imported.
import { prisma } from "@/lib/db";
import { allPosts, siteUrl } from "@/lib/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = siteUrl();
  let products: { name: string; nameEn: string | null; descriptionEn: string | null; description: string | null; prodUrl: string | null }[] = [];
  let posts: Awaited<ReturnType<typeof allPosts>> = [];
  try {
    [products, posts] = await Promise.all([
      prisma.project.findMany({
        where: { visible: true, status: "LIVE" },
        orderBy: { sortOrder: "asc" },
        select: { name: true, nameEn: true, description: true, descriptionEn: true, prodUrl: true },
      }),
      allPosts("en"),
    ]);
  } catch (error) {
    console.error("llms.txt: database unavailable", error);
  }

  const lines = [
    "# KnowBest",
    "",
    "> KnowBest builds custom software and automation for businesses that want less manual work: web applications, integrations and tools in use across several industries. The site is in Romanian (/ro) and English (/en).",
    "",
    "## Main pages",
    `- [Home](${base}/en): what KnowBest does`,
    `- [Products](${base}/en/products): the applications KnowBest offers`,
    `- [Use cases](${base}/en/use-cases)`,
    `- [Case studies](${base}/en/case-studies)`,
    `- [About](${base}/en/about)`,
    `- [Contact](${base}/en/contact)`,
    `- [Blog](${base}/en/blog): articles, also in Romanian at ${base}/ro/blog`,
  ];
  if (products.length) {
    lines.push("", "## Products");
    for (const p of products) {
      const text = p.descriptionEn || p.description;
      lines.push(`- ${p.nameEn || p.name}${p.prodUrl ? ` (${p.prodUrl})` : ""}${text ? `: ${text}` : ""}`);
    }
  }
  if (posts.length) {
    lines.push("", "## Blog articles");
    for (const p of posts) lines.push(`- [${p.title.replace(/[[\]]/g, "")}](${base}/en/blog/${p.slug}): ${p.excerpt}`);
  }
  return new Response(`${lines.join("\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
