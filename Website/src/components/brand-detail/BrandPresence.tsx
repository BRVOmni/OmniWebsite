'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MapPin, Truck, Store, TrendingUp } from 'lucide-react';
import { useReveal } from '@/lib/use-reveal';
import type { Brand } from '@/lib/brands';

interface BrandPresenceProps {
  brand: Brand;
}

export function BrandPresence({ brand }: BrandPresenceProps) {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('brandDetail');

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          {t('presenceEyebrow')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          {t('presenceHeadingPrefix')} <span className="text-omniprise-500">{t('presenceHeadingHighlight')}</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Locations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-surface-800 border border-border-subtle rounded-2xl p-8 hover:border-border-medium transition-colors duration-300"
          >
            <MapPin className="w-6 h-6 text-omniprise-500 mb-4" />
            <h3 className="font-display font-bold text-sm uppercase tracking-[0.1em] text-text-primary mb-3">
              {t('presenceLocations')}
            </h3>
            <p className="text-[14px] text-text-secondary leading-relaxed">
              {brand.locations}
            </p>
          </motion.div>

          {/* Model */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-surface-800 border border-border-subtle rounded-2xl p-8 hover:border-border-medium transition-colors duration-300"
          >
            <Store className="w-6 h-6 text-omniprise-500 mb-4" />
            <h3 className="font-display font-bold text-sm uppercase tracking-[0.1em] text-text-primary mb-3">
              {t('presenceModel')}
            </h3>
            <p className="text-[14px] text-text-secondary leading-relaxed mb-4">
              {brand.model}
            </p>
            <span className="inline-flex text-[10px] tracking-[0.12em] uppercase text-omniprise-400 border border-omniprise-500/20 bg-omniprise-500/5 px-3 py-1 rounded-full">
              {brand.model}
            </span>
          </motion.div>

          {/* Delivery platforms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-surface-800 border border-border-subtle rounded-2xl p-8 hover:border-border-medium transition-colors duration-300"
          >
            <Truck className="w-6 h-6 text-omniprise-500 mb-4" />
            <h3 className="font-display font-bold text-sm uppercase tracking-[0.1em] text-text-primary mb-3">
              {t('presenceDelivery')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {brand.deliveryPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="text-[11px] tracking-[0.1em] uppercase text-text-hint border border-border-subtle px-3 py-1.5 rounded-full"
                >
                  {platform}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Expansion note */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex items-center gap-3 justify-center text-[13px] text-text-hint"
        >
          <TrendingUp className="w-4 h-4 text-success-500" />
          <span>
            {t('presenceExpansion')}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
