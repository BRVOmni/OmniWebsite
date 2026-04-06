'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/lib/use-reveal';

export function StatementSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('statement');

  return (
    <section id="nosotros" className="py-24 md:py-36 px-6 md:px-12 max-w-[1200px] mx-auto">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[clamp(32px,5vw,64px)] leading-[1.1] uppercase tracking-wide"
        >
          <div className="text-text-hint">{t('line1')}</div>
          <div className="text-text-hint">{t('line2')}</div>
          <div className="text-text-primary">{t('line3')}</div>
          <div className="text-text-primary">{t('line4')}</div>
          <div className="text-text-primary">
            {t('line5Prefix')}<span className="text-omniprise-500">{t('line5Highlight')}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-col sm:flex-row gap-6 sm:gap-20 items-start border-t border-border-subtle pt-12"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium whitespace-nowrap min-w-[100px] pt-1">
            {t('bornLabel')}
          </span>
          <p className="text-base text-text-secondary max-w-[440px] leading-relaxed">
            {t('p1')}
            <strong className="text-text-primary font-medium">
              {t('p1Bold')}
            </strong>
            {t('p2')}
            <strong className="text-text-primary font-medium">{t('p2Bold')}</strong>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
