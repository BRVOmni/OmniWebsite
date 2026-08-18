'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/lib/use-reveal';

const TIMELINE = ['tl1', 'tl2', 'tl3', 'tl4'] as const;

export function StatementSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('statement');

  return (
    <section id="nosotros" className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-12 lg:gap-24 items-start">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-black text-[clamp(36px,5vw,64px)] leading-[1.02] uppercase tracking-wide"
        >
          <span className="text-text-hint">{t('line1')} {t('line2')} </span>
          <span className="text-text-primary">{t('line3')} {t('line4')} </span>
          <span className="text-text-primary">
            {t('line5Prefix')}<span className="text-omniprise-500">{t('line5Highlight')}</span>
          </span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:border-l lg:border-border-medium lg:pl-7"
        >
          <span className="inline-flex items-center gap-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-text-hint">
            <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
            {t('bornLabel')}
          </span>
          <p className="mt-3.5 text-[15px] text-text-secondary leading-relaxed">
            {t('p1')}
            <strong className="text-text-primary font-medium">{t('p1Bold')}</strong>
            {t('p2')}
            <strong className="text-text-primary font-medium">{t('p2Bold')}</strong>
          </p>

          <ul className="mt-6 border-t border-border-subtle">
            {TIMELINE.map((k) => (
              <li key={k} className="grid grid-cols-[96px_1fr] gap-3.5 py-3.5 border-b border-border-subtle">
                <span className="font-display font-bold text-lg leading-tight tracking-[0.04em] uppercase text-omniprise-400">
                  {t(`${k}Date`)}
                </span>
                <span className="text-[13.5px] text-text-secondary leading-snug">
                  <strong className="text-text-primary font-medium">{t(`${k}Strong`)}</strong>
                  {t(`${k}Text`)}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
