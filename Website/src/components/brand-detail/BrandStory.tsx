'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';
import type { Brand } from '@/lib/brands';

interface BrandStoryProps {
  brand: Brand;
}

export function BrandStory({ brand }: BrandStoryProps) {
  const { ref, isVisible } = useReveal();

  const paragraphs = brand.story.split('\n\n').filter(Boolean);

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4"
        >
          Historia
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16"
        >
          Sobre <span className="text-omniprise-500">{brand.name}</span>
        </motion.h2>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-16 items-start">
          {/* Story text */}
          <div className="space-y-6">
            {paragraphs.map((p, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                className="text-[15px] text-text-secondary leading-relaxed"
              >
                {p}
              </motion.p>
            ))}
          </div>

          {/* Sidebar: Milestones */}
          {brand.milestones.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="bg-surface-900 border border-border-subtle rounded-2xl p-8"
            >
              <h3 className="font-display font-bold text-sm uppercase tracking-[0.1em] text-text-primary mb-6">
                Hitos
              </h3>
              <div className="space-y-5">
                {brand.milestones.map((m, i) => (
                  <div key={i} className="relative pl-5 border-l border-omniprise-500/30">
                    <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-omniprise-500 -translate-x-[4.5px]" />
                    <div className="text-[11px] tracking-[0.1em] uppercase text-omniprise-500 font-medium mb-1">
                      {m.date}
                    </div>
                    <div className="text-[13px] text-text-secondary leading-relaxed">
                      {m.event}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
