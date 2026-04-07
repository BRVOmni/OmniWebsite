import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrandBySlug, getAllBrandSlugs } from '@/lib/brands';
import { BrandHero } from '@/components/brand-detail/BrandHero';
import { BrandStory } from '@/components/brand-detail/BrandStory';
import { BrandStats } from '@/components/brand-detail/BrandStats';
import { BrandGallery } from '@/components/brand-detail/BrandGallery';
import { BrandPresence } from '@/components/brand-detail/BrandPresence';
import { BrandCTA } from '@/components/brand-detail/BrandCTA';
import { ScrollTracker } from '@/components/ScrollTracker';

interface BrandPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  return getAllBrandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    return { title: locale === 'en' ? 'Brand not found — Omniprise' : 'Marca no encontrada — Omniprise' };
  }

  const title = `${brand.name} — Omniprise`;
  const description = brand.description;
  const isEn = locale === 'en';
  const baseUrl = 'https://www.omniprise.com.py';
  const pageUrl = isEn ? `${baseUrl}/en/marcas/${brand.slug}` : `${baseUrl}/marcas/${brand.slug}`;
  const ogImage = brand.galleryImages?.[0]
    ? `${baseUrl}${brand.galleryImages[0]}`
    : `${baseUrl}${brand.logo}`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        es: `${baseUrl}/marcas/${brand.slug}`,
        en: `${baseUrl}/en/marcas/${brand.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Omniprise',
      locale: isEn ? 'en_US' : 'es_PY',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${brand.name} — Omniprise`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { locale, slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const isEn = locale === 'en';
  const baseUrl = 'https://www.omniprise.com.py';
  const pageUrl = isEn ? `${baseUrl}/en/marcas/${brand.slug}` : `${baseUrl}/marcas/${brand.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: brand.name,
    description: brand.description,
    url: pageUrl,
    image: `${baseUrl}${brand.logo}`,
    servesCuisine: brand.tagline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Asunción',
      addressCountry: 'PY',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Omniprise',
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ScrollTracker page={`brand_${brand.slug}`} />
      <BrandHero brand={brand} />
      <BrandStory brand={brand} />
      <BrandStats brand={brand} />
      <BrandGallery brand={brand} />
      <BrandPresence brand={brand} />
      <BrandCTA brand={brand} />
    </>
  );
}
