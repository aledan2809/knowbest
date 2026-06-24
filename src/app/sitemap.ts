import type { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

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
  'privacy',
  'terms',
  'cookies',
];

export default function sitemap(): MetadataRoute.Sitemap {
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
  return entries;
}
