'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';
import type { Brand } from '@/lib/brands';

interface BrandGalleryProps {
  brand: Brand;
}

const BRAND_COLORS: Record<string, string> = {
  ufo: 'from-purple-900/40 to-blue-900/40',
  'los-condenados': 'from-red-900/40 to-orange-900/40',
  rocco: 'from-green-900/40 to-emerald-900/40',
  sammys: 'from-yellow-900/40 to-amber-900/40',
  pastabox: 'from-orange-900/40 to-red-900/40',
  'mr-chow': 'from-rose-900/40 to-pink-900/40',
  'barrio-pizzero': 'from-blue-900/40 to-cyan-900/40',
};

export function BrandGallery({ brand }: BrandGalleryProps) {
  const { ref, isVisible } = useReveal();
  const gradient = BRAND_COLORS[brand.slug] || 'from-slate-900/40 to-slate-800/40';

  return (
    <section className="py-24 md:py-32 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4"
        >
          Galería
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16"
        >
          <span className="text-omniprise-500">Imágenes</span> próximamente
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: brand.galleryCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${gradient} border border-border-subtle flex items-center justify-center overflow-hidden relative`}
            >
              <span className="font-display font-black text-[clamp(48px,8vw,96px)] text-white/[0.06] uppercase select-none">
                {brand.name.charAt(0)}
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[11px] tracking-[0.15em] uppercase text-white/20 font-medium">
                  Foto {i + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
