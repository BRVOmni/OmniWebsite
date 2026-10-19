import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/page-metadata';
import { PressKit } from '@/components/PressKit';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.prensa' });
  return buildPageMetadata({ locale, path: '/prensa', title: t('title'), description: t('description') });
}

export default function PrensaPage() {
  return <PressKit />;
}
