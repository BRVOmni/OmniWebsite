'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useReveal } from '@/lib/use-reveal';
import { cn } from '@/lib/utils';
import { BRANDS, whatsappOrderUrl } from '@/lib/brands';
import type { Brand } from '@/lib/brands';

interface BrandCardProps {
  brand: Brand;
  index: number;
  isVisible: boolean;
  featured?: boolean;
  orderLabel: string;
  orderShortLabel: string;
}

function BrandCard({ brand, index, isVisible, featured = false, orderLabel, orderShortLabel }: BrandCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex', featured && 'lg:col-span-2')}
    >
      <Link
        href={`/marcas/${brand.slug}`}
        className="group relative flex flex-col w-full overflow-hidden rounded-card border border-border-subtle bg-surface-800 transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:border-omniprise-500/35 hover:shadow-lift"
      >
        {/* Photo */}
        <div
          className={cn(
            'relative overflow-hidden bg-surface-700',
            featured ? 'aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-[340px]' : 'aspect-[4/3]',
          )}
        >
          <Image
            src={brand.heroImage}
            alt={brand.name}
            fill
            sizes={featured ? '(max-width: 1024px) 100vw, 66vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
            className={cn(
              'object-cover transition-transform duration-1000 ease-out-expo group-hover:scale-105',
              featured && 'lg:object-[50%_27%]',
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-800/60" aria-hidden="true" />
          <span className="absolute top-3.5 left-3.5 rounded-md border border-border-medium bg-surface-950/60 backdrop-blur-md px-2.5 py-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-text-primary">
            {brand.tag}
          </span>
        </div>

        {/* Body */}
        <div className={cn('flex flex-col gap-2 p-5', featured && 'lg:p-6')}>
          <div className={cn('flex items-center', featured ? 'h-14 lg:h-[72px]' : 'h-14')}>
            <Image
              src={brand.logo}
              alt={`Logo ${brand.name}`}
              width={220}
              height={90}
              className={cn(
                'w-auto h-auto max-w-[170px] max-h-14 object-contain object-left',
                featured && 'lg:max-w-[220px] lg:max-h-[72px]',
                brand.logoColor === 'dark' && 'logo-invert',
              )}
            />
          </div>
          <h3 className={cn('font-display font-bold uppercase tracking-[0.02em] leading-none group-hover:text-omniprise-400 transition-colors', featured ? 'text-[28px] lg:text-[34px]' : 'text-2xl')}>
            {brand.name}
          </h3>
          <p className="text-sm text-text-secondary leading-snug">
            {featured ? brand.description : brand.tagline}
          </p>
          <div className="mt-auto pt-3.5 flex items-center justify-between gap-3 flex-wrap">
            <span className="inline-flex items-center rounded-full border border-omniprise-500/20 bg-omniprise-500/10 px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-omniprise-400">
              {brand.badge}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(whatsappOrderUrl(brand.name), '_blank', 'noopener,noreferrer');
              }}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-green-400 hover:text-green-300 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" aria-hidden="true" />
              {featured ? orderLabel : orderShortLabel}
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function BrandsSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('brands');

  return (
    <section id="marcas" className="py-24 md:py-36 px-6 md:px-12 bg-surface-950 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-8 items-end mb-12 md:mb-16">
          <div>
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
              className="font-display font-black text-[clamp(42px,6vw,80px)] leading-[0.94] uppercase tracking-wide"
            >
              {t('heading1')} <span className="text-omniprise-500">{t('heading2')}</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-[15px] text-text-secondary max-w-[36ch] leading-relaxed"
          >
            {t('description')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRANDS.map((brand, i) => (
            <BrandCard
              key={brand.slug}
              brand={brand}
              index={i}
              isVisible={isVisible}
              featured={i === 0}
              orderLabel={t('orderWhatsApp')}
              orderShortLabel={t('order')}
            />
          ))}

          {/* Next brand tile */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center rounded-card border border-dashed border-omniprise-500/35 bg-[linear-gradient(160deg,rgba(14,165,233,0.10),transparent_60%)] bg-surface-900 p-7"
          >
            <span className="inline-flex items-center gap-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-text-hint mb-4">
              <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
              {t('nextEyebrow')}
            </span>
            <span className="flex gap-1.5 mb-5" aria-hidden="true">
              <i className="w-2.5 h-2.5 rounded-full bg-omniprise-500 animate-pulse" />
              <i className="w-2.5 h-2.5 rounded-full bg-omniprise-500 animate-pulse [animation-delay:0.4s]" />
              <i className="w-2.5 h-2.5 rounded-full bg-omniprise-500 animate-pulse [animation-delay:0.8s]" />
            </span>
            <h3 className="font-display font-black text-[34px] leading-[0.95] uppercase mb-2.5">
              {t('nextHeading1')} <span className="text-omniprise-500">{t('nextHeading2')}</span>
            </h3>
            <p className="text-sm text-text-secondary leading-snug max-w-[30ch] mb-5">{t('nextText')}</p>
            <span className="self-start inline-flex items-center rounded-full border border-omniprise-500/20 bg-omniprise-500/10 px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.1em] uppercase text-omniprise-400">
              {t('nextBadge')}
            </span>
          </motion.div>

          {/* Acquisitions band */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-full flex flex-col md:flex-row md:items-center md:justify-between gap-6 rounded-card border border-border-subtle bg-surface-800 px-7 py-7 md:px-8"
          >
            <div>
              <span className="inline-flex items-center gap-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-text-hint mb-3">
                <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
                {t('acqEyebrow')}
              </span>
              <h3 className="font-display font-black text-[30px] leading-none uppercase mb-2">
                {t('acqHeading1')} <span className="text-omniprise-500">{t('acqHeading2')}</span>
              </h3>
              <p className="text-sm text-text-secondary max-w-[60ch]">{t('acqText')}</p>
            </div>
            <a
              href="#contacto"
              className="group inline-flex items-center gap-2 self-start md:self-auto h-12 px-7 rounded-full text-[15px] text-text-secondary hover:text-text-primary border border-border-medium hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
            >
              {t('acqCta')}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
