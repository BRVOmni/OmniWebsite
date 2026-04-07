'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-800 flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-lg"
      >
        {/* 404 number */}
        <span className="font-display font-black text-[clamp(100px,18vw,180px)] leading-none text-omniprise-500/20 block mb-2">
          404
        </span>

        {/* Eyebrow */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="w-6 h-px bg-border-strong" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium">
            Error
          </span>
          <span className="w-6 h-px bg-border-strong" />
        </div>

        {/* Headline */}
        <h1 className="font-display font-black text-[clamp(32px,5vw,52px)] uppercase tracking-wide leading-none text-text-primary mb-6">
          Página no<br />encontrada.
        </h1>

        {/* Description */}
        <p className="text-[15px] text-text-secondary leading-relaxed mb-10">
          Lo que buscás ya no existe o fue movido.
        </p>

        {/* CTA */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-8 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,165,233,0.25)]"
        >
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}
