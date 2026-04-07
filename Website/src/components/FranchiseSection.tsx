'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useReveal } from '@/lib/use-reveal';

export function FranchiseSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('franchiseCta');

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[900px] mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-6"
        >
          {t('eyebrow')}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(40px,6vw,68px)] leading-[0.95] uppercase tracking-wide mb-8"
        >
          {t('heading1')}<br />
          <span className="text-omniprise-500">{t('heading2')}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary max-w-[560px] mx-auto leading-relaxed mb-12"
        >
          {t('description')}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/franchise/apply"
            onClick={() => track('franchise_cta', { source: 'homepage', action: 'apply' })}
            className="text-[15px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-9 py-4 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,165,233,0.25)] inline-flex items-center gap-2"
          >
            {t('ctaApply')}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/franchise"
            onClick={() => track('franchise_cta', { source: 'homepage', action: 'learn_more' })}
            className="text-[15px] font-normal text-text-secondary hover:text-text-primary px-8 py-3.5 rounded-full border border-border-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            {t('ctaKnowMore')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
