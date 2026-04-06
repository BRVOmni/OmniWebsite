'use client';

import { useTranslations } from 'next-intl';
import { useAnimatedCounter, useReveal } from '@/lib/use-reveal';

interface StatData {
  target: number;
  suffix: string;
  label: string;
  isStatic?: boolean;
}

function StatItem({ stat }: { stat: StatData }) {
  if (stat.isStatic) {
    return (
      <div className="bg-surface-900 p-10 md:p-12 text-center group">
        <span className="font-display font-black text-[clamp(48px,6vw,80px)] leading-none text-omniprise-500 tracking-tight block mb-3">
          {stat.target}{stat.suffix}
        </span>
        <span className="text-xs font-normal tracking-[0.1em] uppercase text-text-hint">
          {stat.label}
        </span>
      </div>
    );
  }

  return <AnimatedStat stat={stat} />;
}

function AnimatedStat({ stat }: { stat: StatData }) {
  const { ref, value } = useAnimatedCounter(stat.target);

  return (
    <div className="bg-surface-900 p-10 md:p-12 text-center">
      <span
        ref={ref}
        className="font-display font-black text-[clamp(48px,6vw,80px)] leading-none text-text-primary tracking-tight block mb-3"
      >
        {value}{stat.suffix}
      </span>
      <span className="text-xs font-normal tracking-[0.1em] uppercase text-text-hint">
        {stat.label}
      </span>
    </div>
  );
}

export function StatsSection() {
  const { ref } = useReveal();
  const t = useTranslations('stats');

  const STATS: StatData[] = [
    { target: 7, suffix: '', label: t('brands') },
    { target: 17, suffix: '', label: t('locations') },
    { target: 135, suffix: '', label: t('team') },
    { target: 30, suffix: '%', label: t('growth'), isStatic: true },
  ];

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 px-6 md:px-12 border-t border-b border-border-subtle bg-surface-900"
    >
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-border-subtle">
        {STATS.map((stat) => (
          <StatItem key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}
