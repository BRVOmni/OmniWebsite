import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.franchiseApply' });
  return buildPageMetadata({ locale, path: '/franchise/apply', title: t('title'), description: t('description') });
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>{children}</Suspense>
  );
}
