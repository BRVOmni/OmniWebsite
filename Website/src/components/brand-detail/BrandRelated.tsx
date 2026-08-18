'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useReveal } from '@/lib/use-reveal';
import { cn } from '@/lib/utils';
import { BRANDS } from '@/lib/brands';
import type { Brand } from '@/lib/brands';

interface BrandRelatedProps {
  brand: Brand;
}

/** Picks the 3 brands that follow the current one in portfolio order (wraps around). */
function relatedTo(brand: Brand, count = 3): Brand[] {
  const idx = BRANDS.findIndex((b) => b.slug === brand.slug);
  return Array.from({ length: count }, (_, i) => BRANDS[(idx + 1 + i) % BRANDS.length]);
}

export function BrandRelated({ brand }: BrandRelatedProps) {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('brandDetail');
  const related = relatedTo(brand);

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface-950 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3.5 mb-6"
        >
          <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
          <span className="text-[11px] tracking-[0.22em] uppercase text-text-hint font-semibold">{t('relatedEyebrow')}</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,60px)] leading-[0.95] uppercase tracking-wide mb-10 md:mb-14"
        >
          {t('relatedHeadingPrefix')} <span className="text-omniprise-500">{t('relatedHeadingHighlight')}</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {related.map((b, i) => (
            <motion.div
              key={b.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
            >
              <Link
                href={`/marcas/${b.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-card border border-border-subtle bg-surface-800 transition-[transform,border-color,box-shadow] duration-500 ease-out-expo hover:-translate-y-1 hover:border-omniprise-500/35 hover:shadow-lift"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-700">
                  <Image
                    src={b.heroImage}
                    alt={b.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-1000 ease-out-expo group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-800/60" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-2 p-5">
                  <div className="h-11 flex items-center">
                    <Image
                      src={b.logo}
                      alt={`Logo ${b.name}`}
                      width={160}
                      height={64}
                      className={cn('w-auto h-auto max-w-[140px] max-h-11 object-contain object-left', b.logoColor === 'dark' && 'logo-invert')}
                    />
                  </div>
                  <h3 className="font-display font-bold text-xl uppercase tracking-[0.02em] leading-none group-hover:text-omniprise-400 transition-colors">
                    {b.name}
                  </h3>
                  <p className="text-sm text-text-secondary leading-snug">{b.tagline}</p>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-omniprise-400">
                    {t('relatedCta')}
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
