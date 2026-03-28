'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';

export function StatementSection() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="nosotros" className="py-24 md:py-36 px-6 md:px-12 max-w-[1200px] mx-auto">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-bold text-[clamp(32px,5vw,64px)] leading-[1.1] uppercase tracking-wide"
        >
          <div className="text-text-hint">Omniprise es un operador</div>
          <div className="text-text-hint">gastronómico creado para</div>
          <div className="text-text-primary">desarrollar, operar</div>
          <div className="text-text-primary">e integrar marcas de</div>
          <div className="text-text-primary">
            alto <span className="text-omniprise-500">impacto.</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 flex flex-col sm:flex-row gap-6 sm:gap-20 items-start border-t border-border-subtle pt-12"
        >
          <span className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium whitespace-nowrap min-w-[100px] pt-1">
            Nacida en 2024
          </span>
          <p className="text-base text-text-secondary max-w-[440px] leading-relaxed">
            Combinando restaurantes físicos, dark-kitchens, delivery y canales de consumo masivo. Nacida a
            finales de 2024, Omniprise aceleró su desarrollo durante 2025 y dio un{' '}
            <strong className="text-text-primary font-medium">
              salto estratégico el 1 de enero de 2026
            </strong>
            , incorporando marcas con mucha trayectoria en el mercado a su portafolio mediante adquisición —
            consolidándose como un{' '}
            <strong className="text-text-primary font-medium">grupo en expansión activa.</strong>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
