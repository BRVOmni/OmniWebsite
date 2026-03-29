'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';

export function VisionSection() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="vision" className="relative py-32 md:py-40 px-6 md:px-12 text-center overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display font-black text-[clamp(80px,16vw,220px)] uppercase text-text-primary/[0.02] whitespace-nowrap pointer-events-none tracking-[0.05em] select-none">
        OMNIPRISE
      </div>

      <div ref={ref} className="max-w-[900px] mx-auto relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-display font-black text-[13px] tracking-[0.2em] uppercase text-text-hint mb-10"
        >
          Visión 2026 — 2027
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-extrabold text-[clamp(36px,5.5vw,72px)] leading-[1.05] uppercase tracking-wide mb-10"
        >
          Construir uno de los ecosistemas gastronómicos
          <br />
          <span className="text-omniprise-500">más relevantes del país.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[clamp(16px,2vw,20px)] text-text-secondary leading-relaxed max-w-[680px] mx-auto"
        >
          Marcas líderes en sus categorías y una red operativa capaz de generar{' '}
          <strong className="text-text-primary font-medium">volumen, rotación y visibilidad constante</strong>{' '}
          para nuestros socios estratégicos.
        </motion.p>
      </div>
    </section>
  );
}
