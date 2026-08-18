'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

const MOSAIC = [
  { src: '/brands/gallery/mr-chow/4.jpeg', altKey: 'mosaicAlt1', caption: 'Mr. Chow', big: true },
  { src: '/brands/gallery/los-condenados/3.jpeg', altKey: 'mosaicAlt2', caption: 'El Club de los Condenados', big: false },
  { src: '/brands/gallery/ufo/3.jpeg', altKey: 'mosaicAlt3', caption: 'UFO', big: false },
] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
});

export function HeroSection() {
  const t = useTranslations('hero');

  return (
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-950 to-surface-800" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-[radial-gradient(60%_50%_at_70%_30%,rgba(14,165,233,0.12),transparent_70%),radial-gradient(40%_40%_at_10%_90%,rgba(14,165,233,0.06),transparent_60%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <div>
          <motion.p {...fadeUp(0.1)} className="inline-flex items-center gap-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-text-hint">
            <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
            {t('eyebrow')}
          </motion.p>

          <motion.h1
            {...fadeUp(0.2)}
            className="font-display font-black text-[clamp(54px,6.2vw,100px)] leading-[0.9] tracking-tight uppercase text-text-primary mt-6 mb-7"
          >
            {t('titleLine1')}<br />
            <span className="text-text-hint">{t('titleLine2Prefix')}</span>{t('titleLine2Suffix')}
          </motion.h1>

          <motion.p {...fadeUp(0.3)} className="text-[clamp(15px,1.4vw,18px)] font-light text-text-secondary max-w-[52ch] leading-relaxed mb-9">
            {t('subtitlePrefix')}
            <strong className="text-text-primary font-medium">{t('subtitleBold')}</strong>
            {t('subtitleSuffix')}
          </motion.p>

          <motion.div {...fadeUp(0.4)} className="flex flex-wrap items-center gap-3">
            <a
              href="#marcas"
              className="inline-flex items-center h-12 px-7 rounded-full text-[15px] font-medium text-surface-950 bg-omniprise-500 hover:bg-omniprise-400 tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow"
            >
              {t('ctaBrands')}
            </a>
            <Link
              href="/franchise"
              className="inline-flex items-center h-12 px-7 rounded-full text-[15px] font-normal text-text-secondary hover:text-text-primary border border-border-medium hover:border-border-strong tracking-wide transition-all duration-200 hover:-translate-y-0.5"
            >
              {t('ctaFranchise')}
            </Link>
          </motion.div>
        </div>

        {/* Photo mosaic */}
        <motion.div
          {...fadeUp(0.35)}
          role="group"
          aria-label={t('mosaicLabel')}
          className="relative grid grid-cols-1 sm:grid-cols-[1.6fr_1fr] sm:grid-rows-2 gap-3 sm:aspect-[1.05] sm:max-h-[620px]"
        >
          {MOSAIC.map((item) => (
            <figure
              key={item.src}
              className={
                item.big
                  ? 'relative overflow-hidden rounded-card border border-border-subtle bg-surface-800 aspect-[4/3] sm:aspect-auto sm:row-span-2 group'
                  : 'relative hidden sm:block overflow-hidden rounded-card border border-border-subtle bg-surface-800 group'
              }
            >
              <Image
                src={item.src}
                alt={t(item.altKey)}
                fill
                priority={item.big}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 40vw"
                className="object-cover transition-transform duration-[1200ms] ease-out-expo group-hover:scale-[1.04]"
              />
              <figcaption className="absolute left-3.5 bottom-3 font-display font-bold text-[13px] tracking-[0.14em] uppercase text-white/85 bg-surface-950/55 backdrop-blur-md px-2.5 py-1.5 rounded-md">
                {item.caption}
              </figcaption>
            </figure>
          ))}

          {/* Stat chips */}
          <div className="absolute z-[2] left-2 sm:-left-5 bottom-[14%] flex items-center gap-3 rounded-tile border border-border-medium bg-surface-900/85 backdrop-blur-xl px-4 py-3 shadow-lift">
            <span className="font-display font-black text-[34px] leading-none text-omniprise-500">{t('chipLocationsValue')}</span>
            <span className="text-xs text-text-secondary leading-tight max-w-[12ch]">{t('chipLocationsLabel')}</span>
          </div>
          <div className="absolute z-[2] right-2 sm:-right-3.5 top-[9%] flex items-center gap-3 rounded-tile border border-border-medium bg-surface-900/85 backdrop-blur-xl px-4 py-3 shadow-lift">
            <span className="font-display font-black text-[34px] leading-none text-omniprise-500">{t('chipBrandsValue')}</span>
            <span className="text-xs text-text-secondary leading-tight max-w-[12ch]">{t('chipBrandsLabel')}</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
