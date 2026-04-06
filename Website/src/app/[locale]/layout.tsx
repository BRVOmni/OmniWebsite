import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BackToTop } from '@/components/BackToTop';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.root' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: ['Omniprise', 'gastronomía', 'Paraguay', 'franquicia', 'restaurantes', 'delivery', 'food service'],
    metadataBase: new URL('https://www.omniprise.com.py'),
    icons: {
      icon: [
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      ],
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    openGraph: {
      title: t('title'),
      description: t('ogDescription'),
      url: 'https://www.omniprise.com.py',
      siteName: 'Omniprise',
      locale: locale === 'en' ? 'en_US' : 'es_PY',
      type: 'website',
      images: [{ url: '/omniprise-logo.jpg', width: 1200, height: 630, alt: 'Omniprise' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('ogDescription'),
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
