import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.knowbest.ro';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / non-indexable areas (per-locale prefixes + API)
      disallow: [
        '/api/',
        '/ro/admin',
        '/en/admin',
        '/ro/account',
        '/en/account',
        '/ro/auth',
        '/en/auth',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
