import { MetadataRoute } from 'next';
import { getAllBrandSlugs } from '@/lib/brands';

const BASE_URL = 'https://www.omniprise.com.py';

export default function sitemap(): MetadataRoute.Sitemap {
  const brandSlugs = getAllBrandSlugs();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/franchise`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/franchise/apply`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  const brandPages: MetadataRoute.Sitemap = brandSlugs.map((slug) => ({
    url: `${BASE_URL}/marcas/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages];
}
