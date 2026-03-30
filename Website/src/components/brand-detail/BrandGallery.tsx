'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Instagram, X } from 'lucide-react';
import { useReveal } from '@/lib/use-reveal';
import type { Brand } from '@/lib/brands';

interface BrandGalleryProps {
  brand: Brand;
}

/* Brand-specific gradient palettes — intentionally artistic, not generic */
const BRAND_PALETTES: Record<string, { gradient: string; accent: string; glow: string }> = {
  ufo: {
    gradient: 'from-violet-950/60 via-indigo-950/40 to-sky-950/60',
    accent: 'text-violet-300',
    glow: 'bg-violet-500/8',
  },
  'los-condenados': {
    gradient: 'from-red-950/60 via-rose-950/40 to-orange-950/60',
    accent: 'text-red-300',
    glow: 'bg-red-500/8',
  },
  rocco: {
    gradient: 'from-emerald-950/60 via-green-950/40 to-teal-950/60',
    accent: 'text-emerald-300',
    glow: 'bg-emerald-500/8',
  },
  sammys: {
    gradient: 'from-amber-950/60 via-yellow-950/40 to-orange-950/60',
    accent: 'text-amber-300',
    glow: 'bg-amber-500/8',
  },
  pastabox: {
    gradient: 'from-orange-950/60 via-red-950/40 to-amber-950/60',
    accent: 'text-orange-300',
    glow: 'bg-orange-500/8',
  },
  'mr-chow': {
    gradient: 'from-rose-950/60 via-pink-950/40 to-fuchsia-950/60',
    accent: 'text-rose-300',
    glow: 'bg-rose-500/8',
  },
  'barrio-pizzero': {
    gradient: 'from-sky-950/60 via-blue-950/40 to-cyan-950/60',
    accent: 'text-sky-300',
    glow: 'bg-sky-500/8',
  },
};

const DEFAULT_PALETTE = {
  gradient: 'from-slate-950/60 via-gray-950/40 to-zinc-950/60',
  accent: 'text-slate-300',
  glow: 'bg-slate-500/8',
};

/**
 * Masonry-style layout pattern.
 * Index maps to a card size: some span 2 cols, some are tall.
 * This creates an editorial, magazine-like feel.
 */
function getCardStyle(index: number, total: number): string {
  // For 3 items: [wide, tall, standard]
  // For 4 items: [wide, standard, tall, standard]
  // For 5 items: [tall, standard, wide, standard, tall]
  const patterns: Record<number, string[]> = {
    3: ['sm:col-span-2 aspect-[16/9]', 'sm:row-span-2 aspect-[3/4]', 'aspect-[4/3]'],
    4: ['sm:col-span-2 aspect-[16/9]', 'aspect-[4/3]', 'sm:row-span-2 aspect-[3/4]', 'aspect-[4/3]'],
    5: ['sm:row-span-2 aspect-[3/4]', 'aspect-[4/3]', 'sm:col-span-2 aspect-[16/9]', 'aspect-[4/3]', 'sm:row-span-2 aspect-[3/4]'],
  };

  const pattern = patterns[total] || patterns[4];
  return pattern[index % pattern.length] || 'aspect-[4/3]';
}

export function BrandGallery({ brand }: BrandGalleryProps) {
  const { ref, isVisible } = useReveal();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const touchStartX = useRef<number>(0);
  const palette = BRAND_PALETTES[brand.slug] || DEFAULT_PALETTE;
  const hasImages = brand.galleryImages && brand.galleryImages.length > 0;
  const total = hasImages ? brand.galleryImages!.length : brand.galleryCount;
  const maxIndex = hasImages ? brand.galleryImages!.length - 1 : 0;

  const handleImageError = useCallback((index: number) => {
    setFailedImages((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const handleImageLoaded = useCallback((index: number) => {
    setLoadedImages((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) < 50) return; // ignore short swipes
    if (deltaX < 0) {
      // swiped left → next
      setLightboxIndex((prev) => prev !== null ? (prev >= maxIndex ? 0 : prev + 1) : null);
    } else {
      // swiped right → previous
      setLightboxIndex((prev) => prev !== null ? (prev <= 0 ? maxIndex : prev - 1) : null);
    }
  }, [maxIndex]);

  // Lightbox keyboard navigation
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => prev !== null ? (prev >= maxIndex ? 0 : prev + 1) : null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => prev !== null ? (prev <= 0 ? maxIndex : prev - 1) : null);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxIndex, maxIndex]);

  return (
    <>
      <section className="py-24 md:py-32 px-6 md:px-12 border-t border-border-subtle">
        <div ref={ref} className="max-w-[1100px] mx-auto">
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-16">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 24 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4"
              >
                Galeria
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide"
              >
                {hasImages ? (
                  <>
                    Mir&aacute; <span className="text-omniprise-500">{brand.name}</span>
                  </>
                ) : (
                  <>
                    <span className="text-omniprise-500">{brand.name}</span> en im&aacute;genes
                  </>
                )}
              </motion.h2>
            </div>

            {/* Instagram reference — not a link, just the handle for searching */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="flex items-center gap-3 bg-surface-900 border border-border-subtle rounded-xl px-5 py-3.5 shrink-0"
            >
              <Instagram className="w-4 h-4 text-text-hint" />
              <div className="flex flex-col">
                <span className="text-[10px] tracking-[0.15em] uppercase text-text-hint font-medium leading-none mb-1">
                  Buscanos en Instagram
                </span>
                <span className="text-[14px] font-medium text-text-primary tracking-wide">
                  @{brand.instagram}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Gallery grid — asymmetric masonry layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 auto-rows-auto">
            {Array.from({ length: total }).map((_, i) => {
              const imageSrc = hasImages ? brand.galleryImages![i] : null;
              const hasFailed = failedImages.has(i);
              const showPlaceholder = !imageSrc || hasFailed;
              const cardClass = getCardStyle(i, total);

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
                  className={`relative rounded-2xl overflow-hidden border border-border-subtle group cursor-pointer ${cardClass}`}
                  onClick={() => (hasImages && !hasFailed) ? setLightboxIndex(i) : undefined}
                >
                  {showPlaceholder ? (
                    /* Artistic placeholder */
                    <div className={`absolute inset-0 bg-gradient-to-br ${palette.gradient}`}>
                      {/* Subtle radial glow */}
                      <div className={`absolute inset-0 ${palette.glow}`} style={{ background: `radial-gradient(ellipse 70% 60% at 50% 40%, var(--color-omniprise-500), transparent 70%)` }} />
                      {/* Large brand initial watermark */}
                      <span className="absolute inset-0 flex items-center justify-center font-display font-black text-[clamp(80px,12vw,180px)] text-white/[0.04] uppercase select-none leading-none">
                        {brand.name.split(' ').map(w => w[0]).join('')}
                      </span>
                      {/* Subtle bottom gradient overlay */}
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-surface-950/40 to-transparent" />
                    </div>
                  ) : (
                    /* Real image */
                    <>
                      {/* Skeleton behind image */}
                      {!loadedImages.has(i) && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${palette.gradient} animate-pulse`} />
                      )}
                      <Image
                        src={imageSrc!}
                        alt={`${brand.name} — foto ${i + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
                        className={`object-cover transition-all duration-700 group-hover:scale-[1.04] ${
                          loadedImages.has(i) ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => handleImageLoaded(i)}
                        onError={() => handleImageError(i)}
                      />
                      <div className="absolute inset-0 bg-surface-950/0 group-hover:bg-surface-950/20 transition-colors duration-300" />
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Coming soon note for brands without real images */}
          {!hasImages && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-center text-[12px] tracking-[0.1em] uppercase text-text-hint mt-10"
            >
              Fotografias profesionales próximamente — mientras tanto, buscá @{brand.instagram} en Instagram
            </motion.p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && hasImages && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Galería de ${brand.name} — foto ${lightboxIndex + 1} de ${brand.galleryImages!.length}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-surface-950/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setLightboxIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-surface-800/80 border border-border-subtle text-text-secondary hover:text-text-primary transition-colors cursor-pointer z-10"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image counter */}
            <div className="absolute top-6 left-6 text-[11px] tracking-[0.15em] uppercase text-text-hint font-medium">
              {lightboxIndex + 1} / {brand.galleryImages!.length}
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-[900px] aspect-[4/3] rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={brand.galleryImages![lightboxIndex]}
                alt={`${brand.name} — foto ${lightboxIndex + 1}`}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </motion.div>

            {/* Navigation — arrows + dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex <= 0 ? maxIndex : lightboxIndex - 1); }}
                className="p-2 rounded-full bg-surface-800/80 border border-border-subtle text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Foto anterior"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
              </button>

              <div className="flex items-center gap-2">
                {brand.galleryImages!.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                    className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                      i === lightboxIndex ? 'bg-omniprise-500 w-6' : 'bg-white/20 hover:bg-white/40'
                    }`}
                    aria-label={`Ir a foto ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex >= maxIndex ? 0 : lightboxIndex + 1); }}
                className="p-2 rounded-full bg-surface-800/80 border border-border-subtle text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                aria-label="Foto siguiente"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
