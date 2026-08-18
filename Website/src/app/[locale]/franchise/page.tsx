'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useReveal } from '@/lib/use-reveal';
import Image from 'next/image';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { BRANDS } from '@/lib/brands';
import { cn } from '@/lib/utils';
import { Testimonial } from '@/components/Testimonial';

function FranchiseHero() {
  const t = useTranslations('franchisePage');
  const STATS = [
    { value: '7+', label: t('heroStatsBrands') },
    { value: '17', label: t('heroStatsLocations') },
    { value: '135+', label: t('heroStatsTeam') },
    { value: '6', label: t('heroStatsCities') },
  ];

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800 to-surface-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-[11px] font-medium tracking-[0.2em] uppercase text-omniprise-500 mb-8"
        >
          {t('heroEyebrow')}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9 }}
          className="font-display font-black text-[clamp(48px,10vw,120px)] leading-[0.92] tracking-tight uppercase text-text-primary mb-8"
        >
          {t('heroHeading1')}
          <br />
          <span className="text-omniprise-500">{t('heroHeading2')}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary max-w-[580px] mx-auto leading-relaxed mb-12"
        >
          {t('heroDescription')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/franchise/apply"
            className="text-[15px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-9 py-4 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,165,233,0.25)] inline-flex items-center gap-2"
          >
            {t('heroCtaApply')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#beneficios"
            className="text-[15px] font-normal text-text-secondary hover:text-text-primary px-8 py-3.5 rounded-full border border-border-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            {t('heroCtaKnowMore')}
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-black text-4xl text-omniprise-500">{s.value}</div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-text-hint mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('franchisePage');

  const BENEFITS = [
    { icon: '🏗️', title: t('benefitTitle1'), desc: t('benefitDesc1') },
    { icon: '📊', title: t('benefitTitle2'), desc: t('benefitDesc2') },
    { icon: '🎓', title: t('benefitTitle3'), desc: t('benefitDesc3') },
    { icon: '🛒', title: t('benefitTitle4'), desc: t('benefitDesc4') },
    { icon: '📱', title: t('benefitTitle5'), desc: t('benefitDesc5') },
    { icon: '📣', title: t('benefitTitle6'), desc: t('benefitDesc6') },
  ];

  return (
    <section id="beneficios" className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          {t('benefitsEyebrow')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          {t('benefitsHeadingPrefix')} <span className="text-omniprise-500">{t('benefitsHeadingHighlight')}</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
              className="bg-surface-900 border border-border-subtle rounded-2xl p-8 hover:border-border-medium transition-colors duration-300"
            >
              <span className="text-3xl mb-4 block">{b.icon}</span>
              <h3 className="font-display font-bold text-base uppercase tracking-[0.04em] text-text-primary mb-3">
                {b.title}
              </h3>
              <p className="text-[13px] text-text-secondary leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandsSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('franchisePage');

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          {t('brandsEyebrow')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          {t('brandsHeading1')} <span className="text-omniprise-500">{t('brandsHeading2')}</span> {t('brandsHeading3')}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRANDS.map((b, i) => (
            <motion.div
              key={b.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
            >
              <Link
                href={`/marcas/${b.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-card border border-border-subtle bg-surface-800 transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:border-omniprise-500/35 hover:shadow-lift"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-700">
                  <Image
                    src={b.heroImage}
                    alt={b.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-1000 ease-out-expo group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-800/60" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <div className="h-11 flex items-center">
                    <Image
                      src={b.logo}
                      alt={`Logo ${b.name}`}
                      width={160}
                      height={64}
                      className={cn('w-auto h-auto max-w-[140px] max-h-11 object-contain object-left', b.logoColor === 'dark' && 'logo-invert')}
                    />
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-[0.02em] leading-none text-text-primary group-hover:text-omniprise-400 transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{b.tagline}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('franchisePage');

  const steps = [
    { num: '01', title: t('process1Title'), desc: t('process1Desc'), time: t('process1Time') },
    { num: '02', title: t('process2Title'), desc: t('process2Desc'), time: t('process2Time') },
    { num: '03', title: t('process3Title'), desc: t('process3Desc'), time: t('process3Time') },
    { num: '04', title: t('process4Title'), desc: t('process4Desc'), time: t('process4Time') },
  ];

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1000px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          {t('processEyebrow')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          {t('processHeadingPrefix')} <span className="text-omniprise-500">{t('processHeadingHighlight')}</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              className="relative bg-surface-900 border border-border-subtle rounded-2xl p-8 hover:border-border-medium transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-black text-3xl text-omniprise-500">{step.num}</span>
                <span className="text-[11px] tracking-[0.12em] uppercase text-text-hint bg-surface-800 px-3 py-1 rounded-full">
                  {step.time}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg uppercase tracking-[0.04em] text-text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProofSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('franchisePage');

  return (
    <section className="py-20 md:py-28 px-6 md:px-12 border-t border-border-subtle bg-[radial-gradient(70%_60%_at_85%_20%,rgba(14,165,233,0.14),transparent_65%)]">
      <div ref={ref} className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] gap-10 md:gap-16 items-start">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4"
          >
            {t('proofEyebrow')}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide"
          >
            {t('proofHeadingPrefix')} <span className="text-omniprise-500">{t('proofHeadingHighlight')}</span>
          </motion.h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Testimonial />
        </motion.div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { ref, isVisible } = useReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const t = useTranslations('franchisePage');

  const FAQ_ITEMS = [
    { q: t('faq1Q'), a: t('faq1A') },
    { q: t('faq2Q'), a: t('faq2A') },
    { q: t('faq3Q'), a: t('faq3A') },
    { q: t('faq4Q'), a: t('faq4A') },
    { q: t('faq5Q'), a: t('faq5A') },
    { q: t('faq6Q'), a: t('faq6A') },
  ];

  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div ref={ref} className="max-w-[800px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          {t('faqEyebrow')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          {t('faqHeadingPrefix')} <span className="text-omniprise-500">{t('faqHeadingHighlight')}</span>
        </motion.h2>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              className="border border-border-subtle rounded-xl overflow-hidden"
            >
              <button
                id={`faq-button-${i}`}
                aria-expanded={openIndex === i}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-800/50 transition-colors cursor-pointer"
              >
                <span className="font-display font-semibold text-[15px] uppercase tracking-[0.02em] text-text-primary pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-text-hint shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-button-${i}`}
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-60 pb-6' : 'max-h-0'
                }`}
              >
                <p className="px-6 text-[14px] text-text-secondary leading-relaxed">{item.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('franchisePage');

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[700px] mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-6"
        >
          {t('ctaHeadingPrefix')} <span className="text-omniprise-500">{t('ctaHeadingHighlight')}</span>{t('ctaHeadingSuffix')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-base text-text-secondary leading-relaxed mb-10"
        >
          {t('ctaDescription')}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link
            href="/franchise/apply"
            className="inline-flex items-center gap-3 text-base font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-10 py-4 rounded-full tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(14,165,233,0.3)]"
          >
            {t('ctaButton')}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function FranchisePage() {
  return (
    <>
      <FranchiseHero />
      <BenefitsSection />
      <ProofSection />
      <BrandsSection />
      <ProcessSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
