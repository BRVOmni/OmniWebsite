'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Brand } from '@/lib/brands';

interface BrandHeroProps {
  brand: Brand;
}

export function BrandHero({ brand }: BrandHeroProps) {
  return (
    <section className="relative min-h-[70vh] flex flex-col items-center justify-center text-center px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800 to-surface-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10 w-full">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="flex items-center justify-center gap-2 text-[11px] tracking-[0.15em] uppercase text-text-hint mb-16"
        >
          <Link href="/" className="hover:text-text-secondary transition-colors">
            Omniprise
          </Link>
          <span>/</span>
          <Link href="/#marcas" className="hover:text-text-secondary transition-colors">
            Marcas
          </Link>
          <span>/</span>
          <span className="text-text-secondary">{brand.name}</span>
        </motion.nav>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="h-40 md:h-52 flex items-center justify-center mb-10"
        >
          <Image
            src={brand.logo}
            alt={brand.name}
            width={480}
            height={220}
            className="max-h-[200px] md:max-h-[260px] w-auto object-contain"
            style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
            priority
          />
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.8 }}
          className="font-display font-black text-[clamp(40px,7vw,80px)] leading-[0.92] uppercase tracking-tight text-text-primary mb-4"
        >
          {brand.name}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-[clamp(16px,2vw,20px)] font-light italic text-text-secondary max-w-[600px] mx-auto leading-relaxed mb-8"
        >
          {brand.tagline}
        </motion.p>

        {/* Badge + Tag */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="flex flex-col items-center gap-3"
        >
          <span className="inline-flex text-[10px] tracking-[0.12em] uppercase text-text-hint border border-border-medium px-4 py-1.5 rounded-full">
            {brand.badge}
          </span>
          <span className="text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium">
            {brand.tag}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
