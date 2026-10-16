import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Rss } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { Pagination } from "@/components/blog/Pagination";
import { JsonLd } from "@/components/blog/JsonLd";
import { formatDate, listPosts, siteUrl, type BlogLocale } from "@/lib/blog";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

function pageFrom(raw?: string): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 1 ? n : 1;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const page = pageFrom((await searchParams).page);
  const t = await getTranslations({ locale, namespace: "blog" });
  const base = siteUrl();
  const suffix = page > 1 ? `?page=${page}` : "";
  const title = page > 1 ? `${t("metaTitle")} — ${t("page", { page })}` : t("metaTitle");
  return {
    title,
    description: t("metaDescription"),
    alternates: {
      canonical: `${base}/${locale}/blog${suffix}`,
      languages: { ro: `${base}/ro/blog${suffix}`, en: `${base}/en/blog${suffix}`, "x-default": `${base}/ro/blog${suffix}` },
      types: { "application/rss+xml": `${base}/${locale}/blog/feed.xml` },
    },
    openGraph: {
      type: "website",
      url: `${base}/${locale}/blog${suffix}`,
      siteName: "KnowBest",
      title,
      description: t("metaDescription"),
      locale: locale === "ro" ? "ro_RO" : "en_GB",
    },
    twitter: { card: "summary", title, description: t("metaDescription") },
  };
}

export default async function BlogPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const lang = locale as BlogLocale;
  const requested = pageFrom((await searchParams).page);
  const t = await getTranslations({ locale, namespace: "blog" });
  const { posts, pages, current } = await listPosts(lang, requested);
  if (requested > pages) notFound();
  const base = siteUrl();

  return (
    <PublicLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: t("metaTitle"),
          description: t("metaDescription"),
          url: `${base}/${locale}/blog`,
          inLanguage: locale,
          blogPost: posts.map((p) => ({
            "@type": "BlogPosting",
            headline: p.title,
            url: `${base}/${locale}/blog/${p.slug}`,
            datePublished: p.publishedAt.toISOString(),
            ...(p.imageUrl && { image: p.imageUrl }),
          })),
        }}
      />

      <section className="relative overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[140px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-10 md:pt-28 relative text-center">
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300/90">
            <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
            {t("badge")}
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-bold text-white max-w-3xl mx-auto leading-tight">{t("title")}</h1>
          <p className="mt-5 text-lg text-slate-400 max-w-2xl mx-auto">{t("description")}</p>
          <a
            href={`/${locale}/blog/feed.xml`}
            className="mt-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
          >
            <Rss className="w-4 h-4" /> {t("rss")}
          </a>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {posts.length === 0 ? (
          <p className="text-center text-slate-400 py-16">{t("empty")}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-indigo-400/40 transition-colors"
              >
                {post.imageUrl && (
                  <Link href={`/${locale}/blog/${post.slug}`} className="block aspect-square overflow-hidden bg-white/[0.04]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </Link>
                )}
                <div className="flex flex-1 flex-col p-6">
                  <time dateTime={post.publishedAt.toISOString()} className="text-xs text-slate-500">
                    {formatDate(post.publishedAt, lang)}
                  </time>
                  <h2 className="mt-2 text-lg font-semibold text-white leading-snug">
                    <Link href={`/${locale}/blog/${post.slug}`} className="hover:text-indigo-200">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed flex-1">{post.excerpt}</p>
                  <Link
                    href={`/${locale}/blog/${post.slug}`}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
                    aria-label={`${t("readMore")}: ${post.title}`}
                  >
                    {t("readMore")} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
        <Pagination
          base={`/${locale}/blog`}
          current={current}
          pages={pages}
          labels={{ previous: t("previous"), next: t("next"), page: (n) => t("page", { page: n }) }}
        />
      </section>
    </PublicLayout>
  );
}
