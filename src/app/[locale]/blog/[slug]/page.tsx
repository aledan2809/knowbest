import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { PublicLayout } from "@/components/PublicLayout";
import { PostBody } from "@/components/blog/PostBody";
import { JsonLd } from "@/components/blog/JsonLd";
import { BLOG_AUTHOR, featuredProducts, formatDate, getPost, siteUrl, splitHeadline, type BlogLocale } from "@/lib/blog";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getPost(locale as BlogLocale, slug);
  if (!post) return {};
  const base = siteUrl();
  const url = `${base}/${locale}/blog/${slug}`;
  const en = `${base}/en/blog/${slug}`;
  const ro = `${base}/ro/blog/${slug}`;
  // An untranslated Romanian page shows the English text: it points search engines to the English page
  // instead of competing with it as a copy, and is not offered as the Romanian version.
  const hasRo = locale === "ro" ? !post.untranslated : !(await getPost("ro", slug))?.untranslated;
  const images = post.imageUrl ? [{ url: post.imageUrl, alt: post.title }] : undefined;
  return {
    title: `${post.title} — KnowBest`,
    description: post.excerpt,
    authors: [{ name: BLOG_AUTHOR }],
    alternates: {
      canonical: post.untranslated ? en : url,
      languages: hasRo ? { ro, en, "x-default": ro } : { en, "x-default": en },
    },
    openGraph: {
      type: "article",
      url: post.untranslated ? en : url,
      siteName: "KnowBest",
      title: post.title,
      description: post.excerpt,
      locale: locale === "ro" && !post.untranslated ? "ro_RO" : "en_GB",
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: [BLOG_AUTHOR],
      ...(images && { images }),
    },
    twitter: {
      card: post.imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.excerpt,
      ...(post.imageUrl && { images: [post.imageUrl] }),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const lang = locale as BlogLocale;
  const post = await getPost(lang, slug);
  if (!post) notFound();
  const t = await getTranslations({ locale, namespace: "blog" });
  const products = await featuredProducts(lang);
  const base = siteUrl();
  const url = `${base}/${locale}/blog/${slug}`;
  const { headline, rest } = splitHeadline(post.body, post.title);

  return (
    <PublicLayout>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          articleBody: post.body,
          inLanguage: post.untranslated ? "en" : locale,
          url,
          mainEntityOfPage: url,
          datePublished: post.publishedAt.toISOString(),
          dateModified: post.updatedAt.toISOString(),
          author: { "@type": "Person", name: BLOG_AUTHOR },
          publisher: { "@type": "Organization", name: "KnowBest", url: base },
          ...(post.imageUrl && { image: post.imageUrl }),
          ...(post.linkedinUrl && { sameAs: post.linkedinUrl }),
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("home"), item: `${base}/${locale}` },
            { "@type": "ListItem", position: 2, name: t("badge"), item: `${base}/${locale}/blog` },
            { "@type": "ListItem", position: 3, name: post.title, item: url },
          ],
        }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-20 md:pt-16">
        <nav aria-label="Breadcrumb" className="text-sm text-slate-500">
          <Link href={`/${locale}`} className="hover:text-white">{t("home")}</Link>
          <span className="mx-2">/</span>
          <Link href={`/${locale}/blog`} className="hover:text-white">{t("badge")}</Link>
        </nav>

        <h1 className="mt-6 text-3xl md:text-4xl font-bold text-white leading-tight">{headline}</h1>
        <p className="mt-4 text-sm text-slate-500">
          <time dateTime={post.publishedAt.toISOString()}>{t("publishedOn", { date: formatDate(post.publishedAt, lang) })}</time>
          <span className="mx-2">·</span>
          {BLOG_AUTHOR}
        </p>

        {(post.translated || post.untranslated) && (
          <p className="mt-6 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
            {post.translated ? t("translatedNote") : t("originalNote")}{" "}
            {post.translated && (
              <Link href={`/en/blog/${slug}`} hrefLang="en" className="text-indigo-300 hover:text-indigo-200 underline underline-offset-2">
                {t("readOriginal")}
              </Link>
            )}
          </p>
        )}

        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt={post.title} className="mt-8 mx-auto w-full max-w-xl h-auto rounded-2xl border border-white/[0.08]" />
        )}

        <div className="mt-8" lang={post.untranslated ? "en" : locale}>
          <PostBody text={rest} />
        </div>

        {post.linkedinUrl && (
          <a
            href={post.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/[0.12] px-5 py-2.5 text-sm text-slate-200 hover:bg-white/5"
          >
            {t("viewOnLinkedin")} <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {products.length > 0 && (
          <aside className="mt-14 rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.08] to-purple-500/[0.06] p-6">
            <h2 className="text-lg font-semibold text-white">{t("productsTitle")}</h2>
            <ul className="mt-4 space-y-3">
              {products.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${locale}/products`} className="group flex items-start gap-3">
                    <span className="text-xl leading-6" aria-hidden>{p.icon ?? "•"}</span>
                    <span>
                      <span className="block font-medium text-slate-100 group-hover:text-white">{p.name}</span>
                      {p.text && <span className="block text-sm text-slate-400">{p.text}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/products`}
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-indigo-300 hover:text-indigo-200"
            >
              {t("productsLink")} <ArrowRight className="w-4 h-4" />
            </Link>
          </aside>
        )}

        <Link href={`/${locale}/blog`} className="mt-12 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" /> {t("backToBlog")}
        </Link>
      </article>
    </PublicLayout>
  );
}
