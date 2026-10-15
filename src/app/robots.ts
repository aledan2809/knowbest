import type { MetadataRoute } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.knowbest.ro';

// Private / non-indexable areas (per-locale prefixes + API)
const disallow = [
  '/api/',
  '/ro/admin',
  '/en/admin',
  '/ro/account',
  '/en/account',
  '/ro/auth',
  '/en/auth',
];

// AI assistants' crawlers, named so the public pages and the blog are explicitly open to them (2026-10-16).
// A crawler that matches a named group follows only that group, so it carries the same private paths.
const aiCrawlers = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      { userAgent: aiCrawlers, allow: '/', disallow },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
