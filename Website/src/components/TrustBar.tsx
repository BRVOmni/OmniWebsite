'use client';

import { useTranslations } from 'next-intl';
import { useAnimatedCounter } from '@/lib/use-reveal';
import { cn } from '@/lib/utils';

interface TrustStat {
  target: number;
  suffix: string;
  label: string;
  note?: string;
  accent?: boolean;
}

function TrustItem({ stat }: { stat: TrustStat }) {
  const { ref, value } = useAnimatedCounter(stat.target);

  return (
    <div className="px-6 py-8 md:py-9 text-center border-r border-border-subtle last:border-r-0 max-md:[&:nth-child(2)]:border-r-0 max-md:[&:nth-child(-n+2)]:border-b max-md:[&:nth-child(-n+2)]:border-border-subtle">
      <span
        ref={ref}
        className={cn(
          'font-display font-black text-[clamp(44px,5vw,64px)] leading-none tracking-tight block tabular-nums',
          stat.accent ? 'text-omniprise-500' : 'text-text-primary',
        )}
      >
        {value}
        {stat.suffix}
      </span>
      <span className="block mt-2 text-[11px] font-semibold tracking-[0.16em] uppercase text-text-hint">
        {stat.label}
      </span>
      {stat.note && (
        <span className="block mt-1 text-[11.5px] font-medium text-omniprise-400">{stat.note}</span>
      )}
    </div>
  );
}

export function TrustBar() {
  const t = useTranslations('stats');

  const STATS: TrustStat[] = [
    { target: 7, suffix: '+', label: t('brands'), note: t('brandsNote') },
    { target: 17, suffix: '', label: t('locations') },
    { target: 135, suffix: '+', label: t('team') },
    { target: 30, suffix: '%', label: t('growth'), accent: true },
  ];

  return (
    <section
      aria-label={t('brands')}
      className="relative border-t border-b border-border-subtle bg-gradient-to-b from-omniprise-500/[0.04] to-transparent"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4">
        {STATS.map((stat) => (
          <TrustItem key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
