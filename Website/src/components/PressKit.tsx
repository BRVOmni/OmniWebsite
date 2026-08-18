'use client';

import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';

const FACTS = ['fact1', 'fact2', 'fact3', 'fact4'] as const;
const PRESS_MAIL = 'mailto:info@omniprise.com.py?subject=Prensa';

export function PressKit() {
  const t = useTranslations('prensaPage');

  return (
    <div className="min-h-screen pt-32 md:pt-40 pb-24 px-6 md:px-12">
      <div className="max-w-[1200px] mx-auto">
        <header className="max-w-[760px] mb-14">
          <p className="inline-flex items-center gap-3.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-text-hint">
            <span className="w-7 h-px bg-border-strong" aria-hidden="true" />
            {t('eyebrow')}
          </p>
          <h1 className="font-display font-black text-[clamp(44px,6vw,80px)] leading-[0.94] uppercase tracking-wide mt-6 mb-6">
            {t('headingPrefix')} <span className="text-omniprise-500">{t('headingHighlight')}</span>
          </h1>
          <p className="text-[clamp(15px,1.4vw,18px)] font-light text-text-secondary leading-relaxed">{t('intro')}</p>
        </header>

        {/* Boilerplate + facts */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-6 mb-6">
          <div className="rounded-card border border-border-subtle bg-surface-800 p-6 md:p-8">
            <h2 className="font-display font-bold text-2xl uppercase tracking-[0.02em] mb-4">{t('boilerplateHeading')}</h2>
            <p className="text-[15px] text-text-secondary leading-relaxed">{t('boilerplate')}</p>
          </div>
          <div className="rounded-card border border-border-subtle bg-surface-800 p-6 md:p-8">
            <h2 className="font-display font-bold text-2xl uppercase tracking-[0.02em] mb-4">{t('factsHeading')}</h2>
            <ul className="grid grid-cols-2 gap-4">
              {FACTS.map((k) => (
                <li key={k}>
                  <span className="block font-display font-black text-[40px] leading-none text-omniprise-500">{t(`${k}Value`)}</span>
                  <span className="block mt-1 text-[11px] font-semibold tracking-[0.14em] uppercase text-text-hint">{t(`${k}Label`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Materials on request */}
        <section className="rounded-card border border-border-subtle bg-surface-800 p-6 md:p-8 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-[0.02em] mb-1.5">{t('materialsHeading')}</h2>
            <p className="text-sm text-text-secondary max-w-[64ch]">{t('materialsText')}</p>
          </div>
          <a
            href={PRESS_MAIL}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 rounded-full text-[15px] text-text-secondary hover:text-text-primary border border-border-medium hover:border-border-strong transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
          >
            <Mail className="w-4 h-4" aria-hidden="true" />
            {t('materialsCta')}
          </a>
        </section>

        {/* Contact */}
        <section className="rounded-card border border-omniprise-500/25 bg-[linear-gradient(160deg,rgba(14,165,233,0.10),transparent_55%)] bg-surface-800 p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="font-display font-bold text-2xl uppercase tracking-[0.02em] mb-1.5">{t('contactHeading')}</h2>
            <p className="text-sm text-text-secondary max-w-[56ch]">{t('contactText')}</p>
          </div>
          <a
            href={PRESS_MAIL}
            className="inline-flex items-center justify-center h-12 px-7 rounded-full text-[15px] font-medium text-surface-950 bg-omniprise-500 hover:bg-omniprise-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glow whitespace-nowrap"
          >
            info@omniprise.com.py
          </a>
        </section>
      </div>
    </div>
  );
}
