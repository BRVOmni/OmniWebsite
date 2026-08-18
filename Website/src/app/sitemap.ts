import { MetadataRoute } from 'next';
import { getAllBrandSlugs } from '@/lib/brands';

const BASE_URL = 'https://www.omniprise.com.py';
const LOCALES = ['es', 'en'] as const;
const PATHS = ['/', '/franchise', '/franchise/apply', '/proveedores', '/prensa', '/privacidad', '/terminos', '/cookies'] as const;
const LEGAL = new Set<string>(['/privacidad', '/terminos', '/cookies']);

export default function sitemap(): MetadataRoute.Sitemap {
  const brandSlugs = getAllBrandSlugs();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    PATHS.map((path) => ({
      url: locale === 'es' ? `${BASE_URL}${path}` : `${BASE_URL}/en${path}`,
      lastModified: now,
      changeFrequency: path === '/' ? ('weekly' as const) : LEGAL.has(path) ? ('yearly' as const) : ('monthly' as const),
      priority: path === '/' ? 1 : path === '/franchise' ? 0.8 : path === '/franchise/apply' ? 0.6 : LEGAL.has(path) ? 0.3 : 0.5,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, l === 'es' ? `${BASE_URL}${path}` : `${BASE_URL}/en${path}`])
        ),
      },
    }))
  );

  const brandPages: MetadataRoute.Sitemap = LOCALES.flatMap((locale) =>
    brandSlugs.map((slug) => ({
      url: locale === 'es' ? `${BASE_URL}/marcas/${slug}` : `${BASE_URL}/en/marcas/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(
          LOCALES.map((l) => [l, l === 'es' ? `${BASE_URL}/marcas/${slug}` : `${BASE_URL}/en/marcas/${slug}`])
        ),
      },
    }))
  );

  return [...staticPages, ...brandPages];
}
