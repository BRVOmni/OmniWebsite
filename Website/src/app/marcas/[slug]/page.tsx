import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrandBySlug, getAllBrandSlugs } from '@/lib/brands';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BrandHero } from '@/components/brand-detail/BrandHero';
import { BrandStory } from '@/components/brand-detail/BrandStory';
import { BrandStats } from '@/components/brand-detail/BrandStats';
import { BrandGallery } from '@/components/brand-detail/BrandGallery';
import { BrandPresence } from '@/components/brand-detail/BrandPresence';
import { BrandCTA } from '@/components/brand-detail/BrandCTA';

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllBrandSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    return { title: 'Marca no encontrada — Omniprise' };
  }

  const title = `${brand.name} — Omniprise`;
  const description = brand.description;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.omniprise.com.py/marcas/${brand.slug}`,
      siteName: 'Omniprise',
      locale: 'es_PY',
      type: 'website',
      images: [
        {
          url: brand.logo,
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
      images: [brand.logo],
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: brand.name,
    description: brand.description,
    url: `https://www.omniprise.com.py/marcas/${brand.slug}`,
    image: `https://www.omniprise.com.py${brand.logo}`,
    servesCuisine: brand.tagline,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Asunción',
      addressCountry: 'PY',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Omniprise',
      url: 'https://www.omniprise.com.py',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <BrandHero brand={brand} />
        <BrandStory brand={brand} />
        <BrandStats brand={brand} />
        <BrandGallery brand={brand} />
        <BrandPresence brand={brand} />
        <BrandCTA brand={brand} />
      </main>
      <Footer />
    </>
  );
}
