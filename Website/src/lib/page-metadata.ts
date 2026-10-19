import type { Metadata } from 'next';

export const SITE_URL = 'https://www.omniprise.com.py';

/** Path with the locale prefix the site actually serves (Spanish at `/`, English at `/en`). */
export function localizedPath(locale: string, path: string): string {
  return locale === 'en' ? `/en${path}` : path;
}

interface PageMetadataInput {
  locale: string;
  /** Path without locale prefix, e.g. `/franchise`. */
  path: string;
  title: string;
  description: string;
}

/** Title, description, canonical URL, hreflang alternates and Open Graph for a static page. */
export function buildPageMetadata({ locale, path, title, description }: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${localizedPath(locale, path)}`;
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `${SITE_URL}${path}`,
        en: `${SITE_URL}/en${path}`,
        'x-default': `${SITE_URL}${path}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Omniprise',
      locale: locale === 'en' ? 'en_US' : 'es_PY',
      type: 'website',
    },
    robots: { index: true, follow: true },
  };
}
