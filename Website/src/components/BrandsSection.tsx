'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useReveal } from '@/lib/use-reveal';

interface Brand {
  name: string;
  logo: string;
  tag: string;
  tagline: string;
  description: string;
  badge: string;
  wide?: boolean;
  invertLogo?: boolean;
}

const BRANDS: Brand[] = [
  {
    name: 'UFO',
    logo: '/brands/UFO.png',
    tag: 'Marca propia — Marzo 2025',
    tagline: 'Experiencia gastronómica temática de alto impacto',
    description:
      'Restaurante temático único en su clase con 1.600 m² y capacidad para 250 personas. La propuesta combina gastronomía, entretenimiento y ambientación inmersiva, logrando una fuerte recordación de marca. Diseñado para escala, visibilidad y alto volumen operativo.',
    badge: 'Marca insignia',
  },
  {
    name: 'Los Condenados',
    logo: '/brands/El Club De Los Condenados.png',
    tag: 'Marca propia — Dic. 2025',
    tagline: 'Pizza bar · actitud y entretenimiento',
    description:
      'Pizza bar que combina pizzas de alta calidad, ambiente descontracturado y tragos innovadores. Pensada para consumo frecuente, con fuerte presencia nocturna y alta rotación en delivery. Plan de expansión 2026: 8 dark-kitchens para cobertura total del Gran Asunción.',
    badge: '8 dark-kitchens proyectadas 2026',
    invertLogo: true,
  },
  {
    name: 'Rocco',
    logo: '/brands/Rocco.png',
    tag: 'Marca propia — Oct. 2025',
    tagline: 'Pasta Bar · moderno, rápido y escalable',
    description:
      'Pasta bar contemporáneo iniciado en el centro de Asunción. Foco en calidad, rapidez y eficiencia operativa. Pensada para potenciar el consumo vía plataformas y crecer bajo un modelo altamente replicable. Plan 2026: 8 dark-kitchens y posible apertura en Shopping Multiplaza.',
    badge: '8 dark-kitchens proyectadas 2026',
  },
  {
    name: "Sammy's",
    logo: "/brands/Sammy's Express Pizza.png",
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Express Pizza · 11 años de trayectoria',
    description:
      "Segunda cadena de pizza más grande del país, con 15 locales activos en el Gran Asunción. Integrada al portafolio de Omniprise el 1 de enero de 2026 bajo una estructura orientada a expansión, estandarización y crecimiento acelerado.",
    badge: '15 locales activos',
  },
  {
    name: 'PastaBox',
    logo: '/brands/PastaBox.png',
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Cocina oculta · en operación desde 2021',
    description:
      'Opera desde 2021 bajo el modelo de dark-kitchen, con 8 cocinas activas. Adquirida e integrada al ecosistema operativo de Omniprise el 01/01/2026. Durante 2026 continuará bajo su formato actual, evaluando hacia fin de año una posible fusión estratégica con Rocco.',
    badge: '8 cocinas activas',
  },
  {
    name: 'Mr. Chow',
    logo: '/brands/Mr. Chow.png',
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Gastronomía oriental · en operación desde 2021',
    description:
      'Opera con 1 dark-kitchen en Mburucuyá y 1 local en Shopping Multiplaza. Incorporada a Omniprise el 01/01/2026, integrada a una plataforma preparada para escalar y profesionalizar su crecimiento. Plan 2026: 4 nuevas dark-kitchens y 2 locales físicos en Asunción.',
    badge: 'Expansión 2026: 4 nuevas cocinas',
    invertLogo: true,
  },
  {
    name: 'Barrio Pizzero',
    logo: '/brands/Barrio Pizzero.png',
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Enfoque barrial · alta rotación en envío a domicilio',
    description:
      'Incorporada al portafolio de Omniprise el 01/01/2026, Barrio Pizzero complementa el segmento pizza con un enfoque barrial, accesible y de alta rotación. Especialmente orientada al envío a domicilio para cubrir los segmentos de precio que las otras marcas no alcanzan, generando volumen recurrente en zonas residenciales de todo el Gran Asunción.',
    badge: 'Orientada al envío a domicilio',
    wide: true,
  },
];

function BrandCard({ brand, index, isVisible }: { brand: Brand; index: number; isVisible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isVisible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08 }}
      className={`bg-surface-900 p-10 md:p-12 flex flex-col hover:bg-surface-700 transition-colors duration-300 group ${
        brand.wide ? 'md:col-span-2' : ''
      }`}
    >
      {brand.wide ? (
        <div className="grid md:grid-cols-[300px_1fr] gap-10 md:gap-16 items-start">
          <div>
            <div className="h-24 flex items-center mb-8">
              <Image
                src={brand.logo}
                alt={brand.name}
                width={280}
                height={120}
                className="max-h-[96px] w-auto object-contain"
                style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
              />
            </div>
            <div className="text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-3">
              {brand.tag}
            </div>
            <div className="font-display font-black text-[clamp(24px,2.8vw,36px)] uppercase tracking-wide text-text-primary leading-none mb-2.5">
              {brand.name}
            </div>
            <div className="text-[13px] text-text-secondary italic leading-relaxed mb-5">
              {brand.tagline}
            </div>
            <span className="inline-flex text-[10px] tracking-[0.12em] uppercase text-text-hint border border-border-medium px-3.5 py-1.5 rounded-full">
              {brand.badge}
            </span>
          </div>
          <div className="pt-0 md:pt-10">
            <p className="text-[15px] text-text-hint leading-relaxed">{brand.description}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="h-24 flex items-center mb-8 shrink-0">
            <Image
              src={brand.logo}
              alt={brand.name}
              width={210}
              height={80}
              className="max-h-[80px] w-auto object-contain"
                style={brand.invertLogo ? { filter: 'invert(1) brightness(0.9)' } : undefined}
            />
          </div>
          <div className="text-[10px] tracking-[0.18em] uppercase text-text-hint font-medium mb-3 shrink-0">
            {brand.tag}
          </div>
          <div className="font-display font-black text-[clamp(24px,2.8vw,36px)] uppercase tracking-wide text-text-primary leading-none mb-2.5 shrink-0">
            {brand.name}
          </div>
          <div className="text-[13px] text-text-secondary italic leading-relaxed mb-5 shrink-0">
            {brand.tagline}
          </div>
          <p className="text-sm text-text-hint leading-relaxed flex-1">{brand.description}</p>
          <span className="inline-flex mt-7 self-start text-[10px] tracking-[0.12em] uppercase text-text-hint border border-border-medium px-3.5 py-1.5 rounded-full shrink-0">
            {brand.badge}
          </span>
        </>
      )}
    </motion.div>
  );
}

export function BrandsSection() {
  const { ref, isVisible } = useReveal();

  return (
    <section id="marcas" className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div className="max-w-[1200px] mx-auto">
        <div ref={ref}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-20">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8 }}
                className="flex items-center gap-4 mb-14"
              >
                <span className="w-8 h-px bg-border-strong" />
                <span className="text-[10px] tracking-[0.22em] uppercase text-text-hint font-medium">
                  Portafolio
                </span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={isVisible ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="font-display font-black text-[clamp(40px,6vw,76px)] leading-[0.95] uppercase tracking-wide"
              >
                Nuestras<br />
                <span className="text-omniprise-500">Marcas.</span>
              </motion.h2>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-sm text-text-secondary max-w-[320px] leading-relaxed"
            >
              7 marcas activas en 6 ciudades. Desde experiencias temáticas de alto impacto hasta cocinas de alta rotación.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border-subtle border border-border-subtle">
            {BRANDS.map((brand, i) => (
              <BrandCard key={brand.name} brand={brand} index={i} isVisible={isVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
