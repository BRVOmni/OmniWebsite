'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/lib/use-reveal';
import { ContactForm } from './ContactForm';

export function PartnersSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('partners');

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
              {t('eyebrow')}
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display font-black text-[clamp(40px,5.5vw,68px)] leading-[0.95] uppercase tracking-wide mb-8"
          >
            {t('heading1')}<br />
            {t('heading2')}<br />
            <span className="text-omniprise-500">{t('heading3')}</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-base text-text-secondary leading-relaxed mb-4"
          >
            {t('paragraphPrefix')}
            <strong className="text-text-primary font-medium">
              {t('paragraphBold')}
            </strong>
            {t('paragraphSuffix')}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-sm text-text-hint leading-relaxed"
          >
            {t('emailPrefix')}{' '}
            <a href="mailto:info@omniprise.com.py" className="text-text-secondary hover:text-text-primary transition-colors">
              info@omniprise.com.py
            </a>
          </motion.p>
        </div>

        {/* Right — Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="md:border-l md:border-border-subtle md:pl-16"
        >
          <ContactForm />
        </motion.div>
      </div>
    </section>
  );
}
