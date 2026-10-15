import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/db';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.knowbest.ro';

// Public, indexable routes relative to the locale prefix. '' = locale home.
const publicPaths = [
  '',
  'about',
  'products',
  'use-cases',
  'case-studies',
  'pricing',
  'contact',
  'blog',
  'privacy',
  'terms',
  'cookies',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    for (const path of publicPaths) {
      const url = path ? `${baseUrl}/${locale}/${path}` : `${baseUrl}/${locale}`;
      entries.push({
        url,
        changeFrequency: 'weekly',
        priority: path === '' ? 1 : 0.7,
      });
    }
  }

  // Every blog article, each pointing at its other-language version (2026-10-16). The Romanian page is
  // listed only once its translation is done: until then it shows the English text and points search
  // engines to the English page. A database outage must not take the rest of the sitemap down with it.
  try {
    const posts = await prisma.blogPost.findMany({
      where: { hidden: false },
      select: { slug: true, updatedAt: true, titleRo: true, bodyRo: true, sourceHash: true, translatedHash: true },
      orderBy: { publishedAt: 'desc' },
    });
    for (const post of posts) {
      const hasRo = Boolean(post.titleRo && post.bodyRo && post.translatedHash === post.sourceHash);
      const locales = routing.locales.filter((l) => l !== 'ro' || hasRo);
      const languages = Object.fromEntries(locales.map((l) => [l, `${baseUrl}/${l}/blog/${post.slug}`]));
      for (const locale of locales) {
        entries.push({
          url: `${baseUrl}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: { languages },
        });
      }
    }
  } catch (error) {
    console.error('sitemap: blog posts unavailable', error);
  }
  return entries;
}
