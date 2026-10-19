import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.privacidad' });
  return buildPageMetadata({ locale, path: '/privacidad', title: t('title'), description: t('description') });
}

export default function PrivacidadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
