'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';
import type { Brand } from '@/lib/brands';

interface BrandStatsProps {
  brand: Brand;
}

export function BrandStats({ brand }: BrandStatsProps) {
  const { ref, isVisible } = useReveal();

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          En números
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          Datos <span className="text-omniprise-500">clave</span>
        </motion.h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {brand.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
              className="bg-surface-800 border border-border-subtle rounded-2xl p-8 text-center hover:border-border-medium transition-colors duration-300"
            >
              <div className="font-display font-black text-[clamp(28px,4vw,42px)] text-omniprise-500 leading-none mb-3">
                {stat.value}
              </div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-text-hint font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
