import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { StatementSection } from '@/components/StatementSection';
import { StatsSection } from '@/components/StatsSection';
import { PillarsSection } from '@/components/PillarsSection';
import { BrandsSection } from '@/components/BrandsSection';
import { VisionSection } from '@/components/VisionSection';
import { PartnersSection } from '@/components/PartnersSection';
import { FranchiseSection } from '@/components/FranchiseSection';
import { Footer } from '@/components/Footer';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Omniprise',
  url: 'https://www.omniprise.com.py',
  logo: 'https://www.omniprise.com.py/omniprise-logo.png',
  description:
    'Omniprise es un operador gastronómico creado para desarrollar, operar e integrar marcas de alto impacto en Paraguay.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Asunción',
    addressCountry: 'PY',
  },
  numberOfEmployees: {
    '@type': 'QuantitativeValue',
    value: 135,
  },
  sameAs: [],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <HeroSection />
        <StatementSection />
        <StatsSection />
        <PillarsSection />
        <BrandsSection />
        <VisionSection />
        <PartnersSection />
        <FranchiseSection />
      </main>
      <Footer />
    </>
  );
}
