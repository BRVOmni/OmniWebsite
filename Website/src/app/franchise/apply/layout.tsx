import type { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Solicitar Franquicia — Omniprise',
  description:
    'Completá la solicitud de franquicia en 4 pasos. Forma parte de la plataforma gastronómica con mayor crecimiento en Paraguay.',
  openGraph: {
    title: 'Solicitar Franquicia — Omniprise',
    description: 'Completá la solicitud de franquicia en 4 pasos.',
    url: 'https://www.omniprise.com.py/franchise/apply',
    siteName: 'Omniprise',
    locale: 'es_PY',
    type: 'website',
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
