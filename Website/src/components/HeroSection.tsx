'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 pt-28 pb-20 overflow-hidden">
      {/* Background gradient with sky blue accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800 to-surface-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_60%,rgba(14,165,233,0.06)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_20%_80%,rgba(14,165,233,0.03)_0%,transparent_60%)]" />

      <div className="relative z-10">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-[11px] font-medium tracking-[0.2em] uppercase text-text-hint mb-8"
        >
          Asunción, Paraguay — Est. 2024
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9 }}
          className="font-display font-black text-[clamp(64px,12vw,160px)] leading-[0.92] tracking-tight uppercase text-text-primary mb-10"
        >
          No somos<br />
          <span className="text-text-hint">un</span> restaurante.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="text-[clamp(16px,2.2vw,21px)] font-light text-text-secondary max-w-[640px] mx-auto leading-relaxed mb-14"
        >
          Somos una{' '}
          <strong className="text-text-primary font-medium">
            plataforma de marcas gastronómicas
          </strong>{' '}
          con foco en escala, eficiencia y crecimiento sostenido.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6"
        >
          <a
            href="#marcas"
            className="text-[15px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-8 py-3.5 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            Nuestras marcas
          </a>
          <Link
            href="/franchise"
            className="text-[15px] font-normal text-text-secondary hover:text-text-primary px-8 py-3.5 rounded-full border border-border-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            Conviértete en Franquiciado →
          </Link>
          <a
            href="#nosotros"
            className="hidden sm:inline-flex text-[15px] font-normal text-text-secondary hover:text-text-primary px-8 py-3.5 rounded-full border border-border-subtle tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            Conocer más
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.18em] uppercase text-text-hint">Bajar</span>
        <div className="w-px h-10 bg-gradient-to-b from-text-hint to-transparent animate-scroll-pulse" />
      </motion.div>
    </section>
  );
}
