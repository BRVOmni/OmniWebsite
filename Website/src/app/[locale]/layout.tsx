import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { FIGURES } from '@/lib/company';
import { SITE_URL, localizedPath } from '@/lib/page-metadata';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';

/**
 * Rendered per request: the CSP middleware issues a fresh script nonce on every response,
 * and a nonce can only be stamped into HTML that is rendered for that request. Prerendered
 * HTML served from the CDN would carry no nonce and the browser would block every script.
 * `generateStaticParams` was removed for the same reason: listed params would still be prerendered. (ADR-2 amended 2026-10-19.)
 */
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.root' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Omniprise', 'gastronomía', 'Paraguay', 'franquicia', 'restaurantes', 'delivery', 'food service'],
    metadataBase: new URL(SITE_URL),
    // Defaults for the home page; every other route sets its own canonical/alternates.
    alternates: {
      canonical: `${SITE_URL}${localizedPath(locale, '/')}`.replace(/\/$/, '') || SITE_URL,
      languages: { es: SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
    },
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.webmanifest',
    openGraph: {
      title: t('title'),
      description: t('ogDescription', FIGURES),
      url: SITE_URL,
      siteName: 'Omniprise',
      locale: locale === 'en' ? 'en_US' : 'es_PY',
      type: 'website',
      images: [{ url: '/omniprise-logo.jpg', width: 1200, height: 630, alt: 'Omniprise' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('ogDescription', FIGURES),
      images: ['/omniprise-logo.jpg'],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as 'es' | 'en')) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
      <BackToTop />
    </NextIntlClientProvider>
  );
}
