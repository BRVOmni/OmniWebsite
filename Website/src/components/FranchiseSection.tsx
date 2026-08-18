'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useReveal } from '@/lib/use-reveal';
import { Testimonial } from './Testimonial';

const STEPS = [1, 2, 3, 4] as const;

export function FranchiseSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('franchiseCta');
  const tp = useTranslations('franchisePage');

  const reveal = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: isVisible ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      id="franquicia"
      className="relative py-24 md:py-36 px-6 md:px-12 border-t border-omniprise-500/15 bg-[radial-gradient(70%_60%_at_85%_20%,rgba(14,165,233,0.16),transparent_65%),linear-gradient(180deg,#0b1218,#0a0c0f)]"
    >
      <div ref={ref} className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-12 lg:gap-24 items-start">
        {/* Pitch */}
        <div>
          <motion.div {...reveal(0)} className="flex items-center gap-3.5 mb-6">
            <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-text-hint font-semibold">{t('eyebrow')}</span>
          </motion.div>

          <motion.h2 {...reveal(0.1)} className="font-display font-black text-[clamp(42px,6vw,80px)] leading-[0.94] uppercase tracking-wide mb-6">
            {t('heading1')} <span className="text-omniprise-500">{t('heading2')}</span>
          </motion.h2>

          <motion.p {...reveal(0.2)} className="text-[clamp(15px,1.4vw,18px)] font-light text-text-secondary leading-relaxed mb-9 max-w-[52ch]">
            <strong className="text-text-primary font-medium">{t('description')}</strong> {t('firstFranchise')}
          </motion.p>

          <motion.div {...reveal(0.3)} className="flex flex-wrap items-center gap-3">
            <Link
              href="/franchise/apply"
              className="group inline-flex items-center gap-2 h-12 px-7 rounded-full text-[15px] font-medium text-surface-950 bg-omniprise-500 hover:bg-omniprise-400 tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              {t('ctaApply')}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link
              href="/franchise"
              className="inline-flex items-center h-12 px-7 rounded-full text-[15px] font-normal text-text-secondary hover:text-text-primary border border-border-medium hover:border-border-strong tracking-wide transition-all duration-200 hover:-translate-y-0.5"
            >
              {t('ctaKnowMore')}
            </Link>
          </motion.div>
        </div>

        {/* Process + proof */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:pt-1">
          {STEPS.map((n, i) => (
            <motion.div
              key={n}
              {...reveal(0.1 + i * 0.08)}
              className="rounded-tile border border-border-subtle bg-surface-900/70 backdrop-blur-sm p-5"
            >
              <div className="flex items-baseline justify-between mb-3">
                <span className="font-display font-black text-[30px] leading-none text-omniprise-500">0{n}</span>
                <span className="text-[11px] tracking-[0.14em] uppercase text-text-hint font-semibold">{tp(`process${n}Time`)}</span>
              </div>
              <h3 className="font-display font-bold text-[19px] uppercase tracking-[0.03em] mb-1.5">{tp(`process${n}Title`)}</h3>
              <p className="text-[13.5px] text-text-secondary leading-snug">{tp(`process${n}Desc`)}</p>
            </motion.div>
          ))}
          <motion.div {...reveal(0.45)} className="sm:col-span-2 mt-3">
            <p className="flex items-center gap-3.5 mb-3 text-[11px] tracking-[0.22em] uppercase text-text-hint font-semibold">
              <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
              {t('proofLabel')}
            </p>
            <Testimonial />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
