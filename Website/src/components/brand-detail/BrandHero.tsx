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
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800 to-surface-800" />
 />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-[220px] md:max-w-[220px] flex items-center justify-center mb-16">
        >
            <div className="flex items-center gap-2">
              <span className="inline-flex text-[10px] tracking-[0.2em] uppercase text-text-hint border border-border-medium px-3.5 py-1.5 rounded-full">
                {brand.badge}
              </span>
            <span className="text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-4">
            </span>
          <span className="inline-flex text-[10px] tracking-[0.2em] uppercase text-text-hint border border-border-medium px-3.5 py-1.5 rounded-full">
                {brand.tag}
              </span>
            <span className="text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium">
                </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
