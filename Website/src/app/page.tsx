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

export default function HomePage() {
  return (
    <>
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
