import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/page-metadata';
import { LegalArticle } from '@/components/LegalArticle';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.terminos' });
  return buildPageMetadata({ locale, path: '/terminos', title: t('title'), description: t('description') });
}

const SECTIONS = [
  { heading: 's1Heading', body: 's1Body' },
  { heading: 's2Heading', body: 's2Body' },
  { heading: 's3Heading', body: 's3Body' },
  { heading: 's4Heading', body: 's4Body' },
  { heading: 's5Heading', body: 's5Body' },
  { heading: 's6Heading', body: 's6Body' },
  { heading: 's7Heading', body: 's7Body' },
  { heading: 's8Heading', body: 's8Body' },
];

export default function TerminosPage() {
  return <LegalArticle namespace="terminosPage" sections={SECTIONS} />;
}
