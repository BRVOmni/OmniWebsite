'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, GitMerge, Building2, Repeat, ShoppingBasket, Network } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReveal } from '@/lib/use-reveal';

const ICONS: LucideIcon[] = [Sparkles, GitMerge, Building2, Repeat, ShoppingBasket, Network];

export function PillarsSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('pillars');

  const PILLARS = ICONS.map((Icon, i) => ({
    Icon,
    title: t(`title${i + 1}`),
    desc: t(`desc${i + 1}`),
  }));

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3.5 mb-6"
        >
          <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
          <span className="text-[11px] tracking-[0.22em] uppercase text-text-hint font-semibold">{t('eyebrow')}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(42px,6vw,80px)] leading-[0.94] uppercase tracking-wide mb-12 md:mb-16"
        >
          {t('heading1')} {t('heading2')} <span className="text-omniprise-500">{t('heading3')}</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border-subtle border border-border-subtle rounded-card overflow-hidden">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
              className="bg-surface-900 p-7 md:p-8 hover:bg-surface-800 transition-colors duration-300 group"
            >
              <span className="grid place-items-center w-9 h-9 rounded-[9px] border border-omniprise-500/[0.16] bg-omniprise-500/10 text-omniprise-400 mb-6">
                <pillar.Icon className="w-4 h-4" aria-hidden="true" />
              </span>
              <h3 className="font-display font-bold text-[22px] uppercase tracking-[0.02em] text-text-primary mb-2.5 leading-tight group-hover:text-omniprise-400 transition-colors duration-300">
                {pillar.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed max-w-[32ch]">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
