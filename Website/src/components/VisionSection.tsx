'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/lib/use-reveal';

const STRIP = [
  { src: '/brands/gallery/sammys/4.jpeg', alt: "Sammy's Express Pizza" },
  { src: '/brands/gallery/rocco/4.jpeg', alt: 'Rocco Pasta Bar' },
  { src: '/brands/gallery/pastabox/5.jpeg', alt: 'PastaBox' },
  { src: '/brands/gallery/los-condenados/5.jpeg', alt: 'El Club de los Condenados' },
  { src: '/brands/gallery/ufo/3.jpeg', alt: 'UFO' },
  { src: '/brands/gallery/barrio-pizzero/1.jpeg', alt: 'Barrio Pizzero' },
];

export function VisionSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('vision');

  return (
    <section id="vision" className="relative pt-24 md:pt-36 pb-0 text-center overflow-hidden border-t border-border-subtle">
      <div ref={ref} className="max-w-[900px] mx-auto relative z-10 px-6 md:px-12">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-[11px] font-semibold tracking-[0.22em] uppercase text-text-hint mb-6"
        >
          {t('eyebrow')}
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display font-black text-[clamp(38px,5.5vw,76px)] leading-[0.98] uppercase tracking-wide mb-6 mx-auto max-w-[16ch]"
        >
          {t('heading1')} <span className="text-omniprise-500">{t('heading2')}</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-[clamp(15px,1.4vw,18px)] font-light text-text-secondary leading-relaxed max-w-[58ch] mx-auto mb-14"
        >
          {t('paragraphPrefix')}
          <strong className="text-text-primary font-medium">{t('paragraphBold')}</strong>{' '}
          {t('paragraphSuffix')}
        </motion.p>
      </div>

      {/* Photo strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={isVisible ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
        aria-hidden="true"
        className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
      >
        <div className="flex gap-3.5 w-max animate-marquee motion-reduce:animate-none">
          {[...STRIP, ...STRIP].map((item, i) => (
            <Image
              key={`${item.src}-${i}`}
              src={item.src}
              alt={item.alt}
              width={330}
              height={220}
              sizes="330px"
              className="h-[150px] md:h-[220px] w-auto rounded-tile border border-border-subtle object-cover"
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
