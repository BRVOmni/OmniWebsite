import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/page-metadata';
import { LegalArticle } from '@/components/LegalArticle';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.cookies' });
  return buildPageMetadata({ locale, path: '/cookies', title: t('title'), description: t('description') });
}

const SECTIONS = [
  { heading: 's1Heading', body: 's1Body' },
  { heading: 's2Heading', body: 's2Intro', items: ['s2Item1', 's2Item2', 's2Item3'] },
  { heading: 's3Heading', body: 's3Body' },
  { heading: 's4Heading', body: 's4Body' },
  { heading: 's5Heading', body: 's5Body' },
];

export default function CookiesPage() {
  return <LegalArticle namespace="cookiesPage" sections={SECTIONS} />;
}
