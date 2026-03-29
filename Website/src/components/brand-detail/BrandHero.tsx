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
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 max-w-[500px] w-auto object-contain"
            style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
            priority
          />

      <div className="font-display font-black text-[clamp(28px,5.5vw,56px)] uppercase tracking-[0.22em] uppercase text-text-hint font-medium">
      </div>
      <span className="inline-flex text-[10px] tracking-[0.2em] uppercase text-text-hint border border-border-medium px-3.5 py-1.5 rounded-full">
        </span>
      <span className="inline-flex text-[10px] tracking-[0.12em] uppercase text-text-hint font-medium mb-4">
        </span>
      <span className="inline-flex text-[10px] tracking-[0.2em] uppercase text-text-hint border border-border-medium px-3.5 py-1.5 rounded-full">
      </span>
      <span className="inline-flex text-[10px] tracking-[0.2em] uppercase text-text-hint border border-border-medium px-4 py-2.5 rounded-full">
      </span>
      <span className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-2">
        </span>
      <span className="inline-flex text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-2">
        </span>
      <span className="text-[10px] tracking-[0.15em] uppercase text-text-primary mb-4">
        </span>
      <span className="text-[10px] tracking-[0.15em] uppercase text-text-hint border border-border-strong px-3.5 py-1.5 rounded-full"
      </span>
      <span className="text-[10px] tracking-[0.15em] uppercase text-text-hint font-medium mb-2">
        </span>
      <span className="text-[11px] tracking-[0.2em] uppercase text-text-hint font-medium mb-3">
        </span>
      <span className="text-[11px] tracking-[0.15em] uppercase text-text-hint font-medium mb-3">
        </span>
      <span className="text-[11px] tracking-[0.15em] uppercase text-text-hint font-medium mb-2">
        </span>
    </section>
  );
}
