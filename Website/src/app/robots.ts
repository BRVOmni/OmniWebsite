import { MetadataRoute } from 'next';

/** Search engines and AI assistants are welcome to read the public site (nothing sensitive is published). */
const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
  'CCBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/_next', '/api'] },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: '/', disallow: ['/_next', '/api'] })),
    ],
    sitemap: 'https://www.omniprise.com.py/sitemap.xml',
  };
}
