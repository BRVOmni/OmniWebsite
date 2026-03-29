'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useReveal } from '@/lib/use-reveal';
import type { Brand } from '@/lib/brands';

interface BrandHeroProps {
  brand: Brand;
}

export function BrandHero({ brand }: BrandHeroProps) {
  const { ref, isVisible } = useReveal();

  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800 to-surface-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.08)0%,transparent_70%)]" />

      <div ref={ref} className="relative z-10 flex flex-col items-center gap-10">
        {/* Brand logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[420px] w-full flex items-center justify-center"
        >
          <Image
            src={brand.logo}
            alt={brand.name}
            width={420}
            height={180}
            className="max-h-[160px] w-auto object-contain"
            style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
            priority
          />
        </motion.div>

        {/* Tag line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="font-display font-black text-[clamp(42px,7vw,60px)] uppercase tracking-[0.22em] text-text-primary"
        >
          {brand.tag}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary max-w-[600px] leading-relaxed"
        >
          {brand.tagline}
        </motion.p>
      </div>
    </section>
  );
}
