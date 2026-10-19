import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { buildPageMetadata } from '@/lib/page-metadata';
import { FIGURES } from '@/lib/company';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata.proveedores' });
  return buildPageMetadata({ locale, path: '/proveedores', title: t('title'), description: t('description', FIGURES) });
}

export default function ProveedoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
