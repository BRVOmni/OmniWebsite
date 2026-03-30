'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useReveal } from '@/lib/use-reveal';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { BRANDS as CANONICAL_BRANDS } from '@/lib/brands';

const FRANCHISE_BRANDS = CANONICAL_BRANDS.map((b) => ({
  name: b.name,
  desc: b.tagline,
}));

const BENEFITS = [
  {
    icon: '🏗️',
    title: 'Modelo Probado',
    desc: 'Cada marca ya opera con éxito. No estás experimentando, estás replicando un sistema que funciona.',
  },
  {
    icon: '📊',
    title: 'Data-Driven',
    desc: 'Acceso a nuestro dashboard con métricas en tiempo real. Decisiones basadas en datos, no intuición.',
  },
  {
    icon: '🎓',
    title: 'Capacitación Total',
    desc: 'Entrenamiento operativo, gastronómico y de servicio. Tu equipo arranca con conocimiento real.',
  },
  {
    icon: '🛒',
    title: 'Supply Chain',
    desc: 'Red de proveedores optimizada. Mejores precios, mejor calidad, sin dolores de cabeza.',
  },
  {
    icon: '📱',
    title: 'Tecnología',
    desc: 'POS, inventario, reporting y más. Todo integrado desde el día uno.',
  },
  {
    icon: '📣',
    title: 'Marketing',
    desc: 'Estrategia de marketing centralizada con contenido, campañas y presencia digital incluidos.',
  },
];

const FAQ_ITEMS = [
  {
    q: '¿Qué tipo de marcas ofrecen en franquicia?',
    a: 'Ofrecemos 7 marcas gastronómicas probadas: UFO, Mr. Chow, Rocco, PastaBox, Sammy\'s Express Pizza, Barrio Pizzero y Los Condenados. Cada una tiene un concepto único y un modelo operativo validado.',
  },
  {
    q: '¿Cuál es la inversión inicial?',
    a: 'La inversión varía según la marca y la ubicación. Incluye fee de franquicia, equipamiento, capacitación y capital de trabajo. Te presentamos proyecciones detalladas durante el proceso de evaluación.',
  },
  {
    q: '¿Necesito experiencia en gastronomía?',
    a: 'No es obligatorio. Nuestro programa de capacitación cubre todo lo necesario. Lo que sí buscamos son perfiles emprendedores, comprometidos con la excelencia operativa.',
  },
  {
    q: '¿Cuánto tiempo toma abrir un local?',
    a: 'Desde la firma del acuerdo, el proceso toma entre 60 y 90 días. Incluye capacitación, adecuación del local y lanzamiento operativo.',
  },
  {
    q: '¿Qué soporte recibo como franquiciado?',
    a: 'Soporte integral: capacitación continua, tecnología (POS, dashboard, inventario), marketing, supply chain, y un equipo dedicado de supervisión operativa.',
  },
  {
    q: '¿Puedo operar más de una marca?',
    a: 'Sí. Muchos de nuestros socios operan múltiples marcas. Evaluamos cada caso para asegurar la viabilidad y el enfoque necesario.',
  },
];

const STATS = [
  { value: '7', label: 'Marcas' },
  { value: '17', label: 'Locales' },
  { value: '135', label: 'Colaboradores' },
  { value: '6', label: 'Ciudades' },
];

function FranchiseHero() {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 md:px-12 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-surface-900 via-surface-800 to-surface-800" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(14,165,233,0.08)_0%,transparent_70%)]" />

      <div className="relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-[11px] font-medium tracking-[0.2em] uppercase text-omniprise-500 mb-8"
        >
          Franquicias Omniprise
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.9 }}
          className="font-display font-black text-[clamp(48px,10vw,120px)] leading-[0.92] tracking-tight uppercase text-text-primary mb-8"
        >
          Tu propio
          <br />
          <span className="text-omniprise-500">Negocio.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="text-[clamp(16px,2vw,20px)] font-light text-text-secondary max-w-[580px] mx-auto leading-relaxed mb-12"
        >
          Opera una marca gastronómica probada con respaldo total en operaciones, tecnología y marketing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <Link
            href="/franchise/apply"
            className="text-[15px] font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-9 py-4 rounded-full tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(14,165,233,0.25)] inline-flex items-center gap-2"
          >
            Solicitar Franquicia
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#beneficios"
            className="text-[15px] font-normal text-text-secondary hover:text-text-primary px-8 py-3.5 rounded-full border border-border-medium tracking-wide transition-all duration-200 hover:-translate-y-0.5"
          >
            Conocer más
          </a>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.8 }}
          className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-6"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display font-black text-4xl text-omniprise-500">{s.value}</div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-text-hint mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  const { ref, isVisible } = useReveal();
  return (
    <section id="beneficios" className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1100px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          ¿Por qué Omniprise?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          Todo lo que <span className="text-omniprise-500">necesitas</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.08 }}
              className="bg-surface-900 border border-border-subtle rounded-2xl p-8 hover:border-border-medium transition-colors duration-300"
            >
              <span className="text-3xl mb-4 block">{b.icon}</span>
              <h3 className="font-display font-bold text-base uppercase tracking-[0.04em] text-text-primary mb-3">
                {b.title}
              </h3>
              <p className="text-[13px] text-text-secondary leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BrandsSection() {
  const { ref, isVisible } = useReveal();
  return (
    <section className="py-24 md:py-32 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1000px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          Nuestro Portafolio
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          7 <span className="text-omniprise-500">marcas</span> probadas
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FRANCHISE_BRANDS.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              className="bg-surface-800 border border-border-subtle rounded-xl p-6 hover:border-omniprise-500/30 transition-colors duration-300 group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-omniprise-500/10 flex items-center justify-center text-omniprise-500 font-display font-bold text-sm">
                  {b.name.charAt(0)}
                </div>
                <h3 className="font-display font-bold text-sm uppercase tracking-[0.04em] text-text-primary group-hover:text-omniprise-400 transition-colors">
                  {b.name}
                </h3>
              </div>
              <p className="text-[13px] text-text-secondary leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const { ref, isVisible } = useReveal();
  const steps = [
    { num: '01', title: 'Postulación', desc: 'Complete el formulario con su información y preferencias de marca.', time: '5 min' },
    { num: '02', title: 'Evaluación', desc: 'Analizamos su perfil, ubicación y compatibilidad con nuestras marcas.', time: '72 hrs' },
    { num: '03', title: 'Propuesta', desc: 'Reciba opciones de marcas, condiciones comerciales y proyecciones financieras.', time: '1 semana' },
    { num: '04', title: 'Apertura', desc: 'Lanzamiento del local con capacitación completa, tecnología y soporte operativo.', time: '60-90 días' },
  ];

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1000px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          El Camino
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          De idea a <span className="text-omniprise-500">operación</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
              className="relative bg-surface-900 border border-border-subtle rounded-2xl p-8 hover:border-border-medium transition-colors duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-black text-3xl text-omniprise-500">{step.num}</span>
                <span className="text-[11px] tracking-[0.12em] uppercase text-text-hint bg-surface-800 px-3 py-1 rounded-full">
                  {step.time}
                </span>
              </div>
              <h3 className="font-display font-bold text-lg uppercase tracking-[0.04em] text-text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-[14px] text-text-secondary leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const { ref, isVisible } = useReveal();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[800px] mx-auto">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4 text-center"
        >
          Preguntas Frecuentes
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-16 text-center"
        >
          Todo lo que <span className="text-omniprise-500">preguntan</span>
        </motion.h2>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
              className="border border-border-subtle rounded-xl overflow-hidden"
            >
              <button
                id={`faq-button-${i}`}
                aria-expanded={openIndex === i}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-800/50 transition-colors cursor-pointer"
              >
                <span className="font-display font-semibold text-[15px] uppercase tracking-[0.02em] text-text-primary pr-4">
                  {item.q}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-text-hint shrink-0 transition-transform duration-300 ${
                    openIndex === i ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-button-${i}`}
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? 'max-h-60 pb-6' : 'max-h-0'
                }`}
              >
                <p className="px-6 text-[14px] text-text-secondary leading-relaxed">{item.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const { ref, isVisible } = useReveal();
  return (
    <section className="py-24 md:py-36 px-6 md:px-12 border-t border-border-subtle">
      <div ref={ref} className="max-w-[700px] mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-6"
        >
          ¿Listo para <span className="text-omniprise-500">empezar</span>?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-base text-text-secondary leading-relaxed mb-10"
        >
          Completa la solicitud en menos de 5 minutos. Nuestro equipo te contactará en 24 horas hábiles.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link
            href="/franchise/apply"
            className="inline-flex items-center gap-3 text-base font-medium text-surface-900 bg-omniprise-500 hover:bg-omniprise-400 px-10 py-4 rounded-full tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(14,165,233,0.3)]"
          >
            Comenzar Solicitud
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default function FranchisePage() {
  return (
    <main id="main-content">
      <FranchiseHero />
      <BenefitsSection />
      <BrandsSection />
      <ProcessSection />
      <FAQSection />
      <CTASection />
    </main>
  );
}
