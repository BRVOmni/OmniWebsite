'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { Brand } from '@/lib/brands';

interface BrandHeroProps {
  brand: Brand;
}

export function BrandHero({ brand }: BrandHeroProps) {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 md:px-12 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800 to-surface-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.08)0%,transparent_70%)]" />
      <div className="relative z-10 max-w-[500px] w-auto object-contain"
            style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
            priority
          />
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="font-display font-black text-[clamp(42px,7vw,60px)] uppercase tracking-[0.22em] uppercase text-text-primary mb-10"
        >
          {brand.tag}
        </motion.div>
      </div>
    </section>
  );
}
