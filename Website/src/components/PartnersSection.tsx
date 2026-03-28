'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';

const CONTACT_BLOCKS = [
  { label: 'Correo electrónico', value: 'info@omniprise.com.py' },
  { label: 'Sede', value: 'Asunción, Paraguay' },
  { label: 'Fundación', value: '2024' },
  { label: 'Operaciones en', value: '6 ciudades' },
];

export function PartnersSection() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="contacto" className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-28 items-center">
        {/* Left */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="w-8 h-px bg-border-strong" />
            <span className="text-[10px] tracking-[0.22em] uppercase text-text-hint font-medium">
              Socios y proveedores
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-[clamp(40px,5.5vw,68px)] leading-[0.95] uppercase tracking-wide mb-8"
          >
            Socios<br />
            que crecen<br />
            <span className="text-omniprise-500">con nosotros.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-base text-text-secondary leading-relaxed mb-12"
          >
            Omniprise no busca proveedores transaccionales. Busca{' '}
            <strong className="text-text-primary font-medium">
              socios que crezcan junto a una plataforma en expansión
            </strong>
            , con volumen creciente, visibilidad constante y proyección real.
          </motion.p>

          <motion.a
            href="mailto:info@omniprise.com.py"
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex text-[15px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-8 py-3.5 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            Contactar ahora
          </motion.a>
        </div>

        {/* Right */}
        <div className="md:border-l md:border-border-subtle md:pl-20">
          {CONTACT_BLOCKS.map((block, i) => (
            <motion.div
              key={block.label}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
              className="mb-12 last:mb-0"
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-2">
                {block.label}
              </p>
              <p className="font-display font-bold text-xl uppercase tracking-[0.05em] text-text-primary">
                {block.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
