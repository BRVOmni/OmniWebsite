import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';

export const metadata: Metadata = {
  title: 'Términos y Condiciones — Omniprise',
  description: 'Términos y condiciones de uso del sitio web de Omniprise.',
  robots: { index: true, follow: true },
};

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
