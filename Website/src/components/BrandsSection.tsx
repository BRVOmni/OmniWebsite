'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useReveal } from '@/lib/use-reveal';
import { BRANDS } from '@/lib/brands';
import type { Brand } from '@/lib/brands';

function BrandCard({ brand, index, isVisible }: { brand: Brand; index: number; isVisible: boolean }) {
  return (
    <Link href={`/marcas/${brand.slug}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: index * 0.08 }}
        className="bg-surface-900 rounded-xl border border-border-subtle p-8 flex flex-col hover:border-omniprise-500/30 hover:bg-surface-700 transition-all duration-300 cursor-pointer h-full"
      >
        <div className="h-16 flex items-center mb-6">
          <Image
            src={brand.logo}
            alt={brand.name}
            width={160}
            height={60}
            className="max-h-[56px] w-auto object-contain"
            style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
          />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] tracking-[0.15em] uppercase text-text-hint font-medium">{brand.tag}</span>
        </div>

        <h3 className="font-display font-bold text-lg uppercase tracking-wide mb-2 group-hover:text-omniprise-500 transition-colors">
          {brand.name}
        </h3>

        <p className="text-[13px] text-text-secondary italic leading-relaxed mb-4">{brand.tagline}</p>

        <p className="text-sm text-text-hint leading-relaxed flex-1 line-clamp-3">{brand.description}</p>

        <span className="inline-block self-start mt-5 text-[10px] tracking-[0.1em] uppercase font-medium text-omniprise-500 bg-omniprise-500/10 px-3 py-1 rounded-full">
          {brand.badge}
        </span>
      </motion.div>
    </Link>
  );
}

export function BrandsSection() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="marcas" className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-4 mb-14"
            >
              <span className="w-8 h-px bg-border-strong" />
              <span className="text-[10px] tracking-[0.22em] uppercase text-text-hint font-medium">
                Portafolio
              </span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-display font-black text-[clamp(40px,6vw,76px)] leading-[0.95] uppercase tracking-wide"
            >
              Nuestras<br />
              <span className="text-omniprise-500">Marcas.</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm text-text-secondary max-w-[320px] leading-relaxed"
          >
            7 marcas activas en 6 ciudades. Desde experiencias temáticas de alto impacto hasta cocinas de alta rotación.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BRANDS.map((brand, i) => (
            <BrandCard key={brand.name} brand={brand} index={i} isVisible={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
}
