import type { Metadata } from 'next';

import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Franquicias — Omniprise',
  description:
    'Convertite en franquiciado de Omniprise. Operador gastronómico con la mayor presencia en Paraguay.',
  openGraph: {
    title: 'Franquicias — Omniprise',
    description:
      'Convertite en franquiciado de Omniprise. Operador gastronómico con la mayor presencia en Paraguay.',
    url: 'https://www.omniprise.com.py/franchise',
    siteName: 'Omniprise',
    locale: 'es_PY',
    type: 'website',
  },
};

export default function FranchiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>{children}</Suspense>
  );
}
