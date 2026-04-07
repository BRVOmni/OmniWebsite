'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, ArrowLeft, MessageCircle } from 'lucide-react';
import { track } from '@vercel/analytics';
import { useReveal } from '@/lib/use-reveal';
import { whatsappOrderUrl } from '@/lib/brands';
import type { Brand } from '@/lib/brands';

interface BrandCTAProps {
  brand: Brand;
}

export function BrandCTA({ brand }: BrandCTAProps) {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('brandDetail');

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[800px] mx-auto">
        {/* CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="bg-surface-900 border border-border-subtle rounded-2xl p-10 md:p-14 text-center hover:border-omniprise-500/20 transition-colors duration-500"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-[10px] tracking-[0.2em] uppercase text-omniprise-500 font-medium mb-6"
          >
            {t('ctaEyebrow')}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display font-black text-[clamp(28px,4vw,44px)] leading-[0.95] uppercase tracking-wide mb-4"
          >
            {t('ctaHeading')}<br />
            <span className="text-omniprise-500">{brand.name}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-[15px] text-text-secondary leading-relaxed mb-10 max-w-[480px] mx-auto"
          >
            {t('ctaDescription', { brandName: brand.name })}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href={whatsappOrderUrl(brand.name)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('whatsapp_order', { source: 'brand_page', brand: brand.slug })}
              className="inline-flex items-center gap-3 text-[15px] font-medium text-green-950 bg-green-500 hover:bg-green-400 px-9 py-4 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(34,197,94,0.25)]"
            >
              <MessageCircle className="w-4 h-4" />
              {t('ctaWhatsApp')}
            </a>
            <Link
              href={`/franchise/apply?brand=${brand.slug}`}
              onClick={() => track('franchise_cta', { source: 'brand_page', action: 'apply', brand: brand.slug })}
              className="text-[14px] text-text-secondary hover:text-text-primary px-8 py-3.5 rounded-full border border-border-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              {t('ctaFranchise')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <Link
            href="/#marcas"
            className="inline-flex items-center gap-2 text-[13px] text-text-hint hover:text-text-secondary tracking-wide transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('ctaBackToBrands')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
