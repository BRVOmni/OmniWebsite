'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Boxes, Clock, Handshake, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useReveal } from '@/lib/use-reveal';
import { SupplierForm } from '@/components/SupplierForm';

const WHY: Array<{ Icon: LucideIcon; key: string }> = [
  { Icon: Boxes, key: 'why1' },
  { Icon: Clock, key: 'why2' },
  { Icon: Handshake, key: 'why3' },
  { Icon: ShieldCheck, key: 'why4' },
];

export default function ProveedoresPage() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('suppliersPage');

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-24 px-6 md:px-12 bg-[radial-gradient(60%_50%_at_80%_0%,rgba(14,165,233,0.12),transparent_65%)]">
      <div ref={ref} className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-12 lg:gap-20 items-start">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-text-hint"
          >
            <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
            {t('eyebrow')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-[clamp(44px,6vw,80px)] leading-[0.94] uppercase tracking-wide mt-6 mb-6"
          >
            {t('headingPrefix')} <span className="text-omniprise-500">{t('headingHighlight')}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[clamp(15px,1.4vw,18px)] font-light text-text-secondary leading-relaxed max-w-[52ch] mb-10"
          >
            {t('intro')}
          </motion.p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WHY.map(({ Icon, key }, i) => (
              <motion.li
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.25 + i * 0.08 }}
                className="rounded-tile border border-border-subtle bg-surface-900/70 p-5"
              >
                <span className="grid place-items-center w-9 h-9 rounded-[9px] border border-omniprise-500/[0.16] bg-omniprise-500/10 text-omniprise-400 mb-4">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
                <h2 className="font-display font-bold text-lg uppercase tracking-[0.03em] leading-tight mb-1.5">{t(`${key}Title`)}</h2>
                <p className="text-[13.5px] text-text-secondary leading-snug">{t(`${key}Text`)}</p>
              </motion.li>
            ))}
          </ul>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 text-sm text-text-hint"
          >
            {t('emailPrefix')}{' '}
            <a href="mailto:info@omniprise.com.py" className="text-omniprise-400 hover:text-omniprise-300 transition-colors">info@omniprise.com.py</a>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="rounded-card border border-border-subtle bg-surface-800 p-6 md:p-8"
        >
          <h2 className="font-display font-bold text-2xl uppercase tracking-[0.02em] mb-1">{t('formHeading')}</h2>
          <p className="text-sm text-text-secondary mb-7">{t('formIntro')}</p>
          <SupplierForm />
        </motion.div>
      </div>
    </div>
  );
}
