'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { useReveal } from '@/lib/use-reveal';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { ContactForm } from './ContactForm';

export function PartnersSection() {
  const { ref, isVisible } = useReveal();
  const t = useTranslations('partners');

  return (
    <section id="contacto" className="py-24 md:py-36 px-6 md:px-12 bg-surface-900 border-t border-border-subtle">
      <div ref={ref} className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-start">
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

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-8"
          >
            <Link
              href="/proveedores"
              className="group inline-flex items-center gap-2 h-11 px-6 rounded-full text-sm text-text-secondary hover:text-text-primary border border-border-medium hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5"
            >
              {t('supplierCta')}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </motion.div>
        </div>

        {/* Right — Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="rounded-card border border-border-subtle bg-surface-800 p-6 md:p-7"
        >
          <ContactForm />
        </motion.div>
      </div>
    </section>
  );
}
