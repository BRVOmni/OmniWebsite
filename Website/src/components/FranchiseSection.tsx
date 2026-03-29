'use client';

import { motion } from 'framer-motion';
import { useReveal } from '@/lib/use-reveal';

const BENEFITS = [
  { icon: '🏆', title: 'Marcas Probadas', desc: 'Conceptos gastronómicos con tracción comprobada y éxito en el mercado' },
  { icon: '🔧', title: 'Soporte Integral', desc: 'Operaciones, tecnología, marketing y capacitación incluidos' },
  { icon: '💰', title: 'Modelo Rentable', desc: 'Estructura de costos optimizada y márgenes de utilidad saludables' },
];

const STEPS = [
  { num: '1', title: 'Postulación', desc: 'Complete el formulario con información y preferencias' },
  { num: '2', title: 'Evaluación', desc: 'Revisamos su perfil y compatibilidad con nuestras marcas' },
  { num: '3', title: 'Propuesta', desc: 'Presentamos opciones de marcas, condiciones y proyecciones' },
  { num: '4', title: 'Apertura', desc: 'Lanzamiento del negocio con capacitación y soporte continuo' },
];

export function FranchiseSection() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="franquicia" className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
        {/* Content */}
        <div>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-6"
          >
            Conviértete en Franquiciado
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-[clamp(40px,6vw,64px)] leading-[0.95] uppercase tracking-wide mb-8"
          >
            Dueño de una
            <br />
            <span className="text-text-hint">Marca </span>
            <span className="text-omniprise-500">Omniprise</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-base text-text-secondary leading-relaxed mb-12 max-w-[520px]"
          >
            Tienes marcas gastronómicas establecidas y probadas. Ofrecemos oportunidades de franquicia para
            emprendedores que quieren operar negocios exitosos con nuestro respaldo operativo, tecnológico y de
            marca.
          </motion.p>

          {/* Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
          >
            {BENEFITS.map((b) => (
              <div key={b.title} className="flex flex-col items-start gap-4">
                <span className="text-3xl leading-none">{b.icon}</span>
                <h3 className="font-display font-bold text-base uppercase tracking-[0.04em] text-text-primary">
                  {b.title}
                </h3>
                <p className="text-[13px] text-text-secondary leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="flex flex-col items-start gap-4"
          >
            <a
              href="/franchise/apply"
              className="inline-flex items-center gap-3 text-base font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-9 py-4 rounded-full tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,165,233,0.25)]"
            >
              <span>Solicitar Franquicia</span>
              <span className="text-lg transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <p className="text-[13px] text-text-hint leading-relaxed">
              Complete el formulario en menos de 5 minutos. Responderemos en 24 horas.
            </p>
          </motion.div>
        </div>

        {/* Process card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center lg:justify-end"
        >
          <div className="bg-surface-800 border border-border-medium rounded-3xl p-10 md:p-12 max-w-[480px] w-full">
            <div className="mb-8">
              <h4 className="font-display font-bold text-lg uppercase tracking-[0.04em] text-text-primary">
                Proceso de Franquicia
              </h4>
            </div>
            <div className="flex flex-col gap-8">
              {STEPS.map((step) => (
                <div key={step.num} className="flex gap-5 items-start">
                  <div className="flex items-center justify-center w-11 h-11 bg-omniprise-500 text-surface-900 font-display font-black text-lg rounded-full shrink-0">
                    {step.num}
                  </div>
                  <div>
                    <h5 className="font-display font-bold text-[15px] uppercase tracking-[0.04em] text-text-primary mb-2">
                      {step.title}
                    </h5>
                    <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
