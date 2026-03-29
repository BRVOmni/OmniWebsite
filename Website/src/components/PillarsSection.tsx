'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';

const PILLARS = [
  {
    num: '01',
    title: 'Marcas propias desde cero',
    desc: 'Desarrollamos conceptos gastronómicos con identidad fuerte, pensados para escalar desde el primer día.',
  },
  {
    num: '02',
    title: 'Adquisición e integración',
    desc: 'Incorporamos marcas con tracción comprobada y las integramos a nuestra plataforma operativa para acelerar su crecimiento.',
  },
  {
    num: '03',
    title: 'Expansión híbrida',
    desc: 'Crecemos con locales físicos y dark-kitchens, combinando presencia territorial y cobertura de entrega masiva.',
  },
  {
    num: '04',
    title: 'Entrega y consumo recurrente',
    desc: 'Fuerte orientación a plataformas digitales y consumo frecuente, generando volumen y previsibilidad.',
  },
  {
    num: '05',
    title: 'Comercio gastronómico masivo',
    desc: 'Proyección hacia canales de consumo masivo: supermercados, tiendas de conveniencia y locales deportivos.',
  },
  {
    num: '06',
    title: 'Operaciones centralizadas',
    desc: 'Centralización de compras, procesos y estándares para generar volumen, eficiencia y relaciones de largo plazo.',
  },
];

export function PillarsSection() {
  const { ref, isVisible } = useReveal();

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 max-w-[1200px] mx-auto">
      <div ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-14"
        >
          <span className="w-8 h-px bg-border-strong" />
          <span className="text-[10px] tracking-[0.22em] uppercase text-text-hint font-medium">
            Nuestra lógica
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(40px,6vw,76px)] leading-[0.95] uppercase tracking-wide mb-20"
        >
          Cómo<br />
          crece<br />
          <span className="text-omniprise-500">Omniprise.</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border-subtle border border-border-subtle">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
              className="bg-surface-800 p-10 md:p-12 hover:bg-surface-700 transition-colors duration-300 group"
            >
              <div className="font-display font-black text-[11px] tracking-[0.15em] text-text-hint mb-8">
                {pillar.num}
              </div>
              <h3 className="font-display font-bold text-[22px] uppercase tracking-[0.04em] text-text-primary mb-4 leading-tight group-hover:text-omniprise-400 transition-colors duration-300">
                {pillar.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
