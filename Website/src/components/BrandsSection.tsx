'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { track } from '@vercel/analytics';
import { useReveal } from '@/lib/use-reveal';
import { BRANDS, whatsappOrderUrl } from '@/lib/brands';
import type { Brand } from '@/lib/brands';
import { MessageCircle } from 'lucide-react';

function BrandCard({ brand, index, isVisible, orderLabel }: { brand: Brand; index: number; isVisible: boolean; orderLabel: string }) {
  const [logoError, setLogoError] = useState(false);

  return (
    <Link href={`/marcas/${brand.slug}`} onClick={() => track('brand_card_clicked', { brand: brand.slug })} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.08 }}
        className="bg-surface-900 border border-border-subtle rounded-xl p-8 hover:border-omniprise-500/30 hover:bg-surface-700 transition-all duration-300 flex flex-col"
      >
        <div className="h-16 flex items-center mb-4 shrink-0">
          {logoError ? (
            <span className="font-display font-bold text-2xl uppercase text-text-primary tracking-wide">
              {brand.name}
            </span>
          ) : (
            <Image
              src={brand.logo}
              alt={brand.name}
              width={160}
              height={60}
              className="max-h-[56px] w-auto object-contain"
              style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
              onError={() => setLogoError(true)}
            />
          )}
        </div>
        <p className="text-[10px] tracking-[0.15em] uppercase text-text-hint font-medium mb-2">{brand.tag}</p>
        <h3 className="font-display font-bold text-lg uppercase tracking-wide group-hover:text-omniprise-500 transition-colors mb-2">{brand.name}</h3>
        <p className="text-[13px] text-text-secondary leading-relaxed flex-1">{brand.tagline}</p>
        <div className="mt-auto pt-4 flex items-center justify-between gap-3">
          <span className="text-[10px] tracking-[0.12em] uppercase font-medium text-omniprise-500 bg-omniprise-500/10 px-3 py-1 rounded-full">{brand.badge}</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              track('whatsapp_order', { source: 'homepage', brand: brand.slug });
              window.open(whatsappOrderUrl(brand.name), '_blank', 'noopener,noreferrer');
            }}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-green-400 hover:text-green-300 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {orderLabel}
          </button>
        </div>
      </motion.div>
    </Link>
  );
}

export function BrandsSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('brands');

  return (
    <section id="marcas" className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4 mb-14"
            >
              <span className="w-8 h-px bg-border-strong" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-text-hint font-medium">{t('eyebrow')}</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-black text-[clamp(40px,6vw,76px)] leading-[0.95] uppercase tracking-wide"
            >
              {t('heading1')}<br />
              <span className="text-omniprise-500">{t('heading2')}</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm text-text-secondary max-w-[320px] leading-relaxed"
          >
            {t('description')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRANDS.map((brand, i) => (
            <BrandCard key={brand.name} brand={brand} index={i} isVisible={isVisible} orderLabel={t('orderWhatsApp')} />
          ))}
        </div>
      </div>
    </section>
  );
}
