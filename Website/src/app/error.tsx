'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-800 flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        {/* Error icon */}
        <span className="font-display font-black text-[clamp(100px,18vw,180px)] leading-none text-omniprise-500/20 block mb-2">
          !
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
          Algo salió mal.
        </h1>

        {/* Description */}
        <p className="text-[15px] text-text-secondary leading-relaxed mb-10">
          Ocurrió un error inesperado. Intentá de nuevo o escribinos a info@omniprise.com.py
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={reset}
            className="text-[14px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-8 py-3.5 rounded-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,165,233,0.25)] cursor-pointer"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="text-[14px] font-normal text-text-secondary hover:text-text-primary px-8 py-3.5 rounded-full border border-border-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
