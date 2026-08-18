'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { BadgeCheck } from 'lucide-react';

export function Testimonial() {
  const t = useTranslations('testimonial');

  return (
    <figure className="relative overflow-hidden rounded-card border border-omniprise-500/25 bg-[linear-gradient(160deg,rgba(14,165,233,0.10),transparent_55%)] bg-surface-800 p-6 md:p-7">
      <span
        aria-hidden="true"
        className="absolute right-5 top-0 font-display font-black text-[120px] leading-none text-omniprise-500/[0.14] pointer-events-none select-none"
      >
        “
      </span>
      <span className="inline-flex items-center gap-1.5 mb-3.5 rounded-full border border-omniprise-500/20 bg-omniprise-500/10 px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.12em] uppercase text-omniprise-400">
        <BadgeCheck className="w-3.5 h-3.5" aria-hidden="true" />
        {t('verified')}
      </span>
      <blockquote className="font-display text-[clamp(20px,2vw,26px)] leading-[1.25] text-text-primary max-w-[34ch]">
        {t('quote')}
      </blockquote>
      <figcaption className="mt-5 pt-4 border-t border-border-subtle flex items-center gap-3.5">
        <span className="flex-none w-[112px] h-16 rounded-tile bg-surface-700 border border-border-medium flex items-center justify-center px-2.5 py-2">
          <Image
            src="/brands/Rocco.webp"
            alt={t('logoAlt')}
            width={160}
            height={87}
            className="w-auto h-auto max-w-full max-h-full object-contain"
          />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-text-primary">{t('role')}</span>
          <span className="block text-xs text-text-hint mt-0.5">{t('meta')}</span>
        </span>
      </figcaption>
    </figure>
  );
}
