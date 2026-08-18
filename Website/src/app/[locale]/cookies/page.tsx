import type { Metadata } from 'next';
import { LegalArticle } from '@/components/LegalArticle';

export const metadata: Metadata = {
  title: 'Política de Cookies — Omniprise',
  description: 'Qué cookies y almacenamiento local utiliza el sitio de Omniprise y para qué.',
  robots: { index: true, follow: true },
};

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
