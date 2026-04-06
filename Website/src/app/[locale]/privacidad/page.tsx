'use client';

import { useTranslations } from 'next-intl';

export default function PrivacidadPage() {
  const t = useTranslations('privacidadPage');

  return (
    <div className="min-h-screen bg-surface-800 pt-28 pb-20 px-6 md:px-12">
      <article className="max-w-[760px] mx-auto">
          {/* Header */}
          <header className="mb-16">
            <p className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4">
              {t('eyebrow')}
            </p>
            <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-6">
              {t('headingPrefix')} <span className="text-omniprise-500">{t('headingHighlight')}</span>
            </h1>
            <p className="text-sm text-text-hint">
              {t('lastUpdated')}
            </p>
          </header>

          {/* Content */}
          <div className="space-y-12 text-[15px] text-text-secondary leading-relaxed">
            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section1Heading')}
              </h2>
              <p>
                {t('section1Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section2Heading')}
              </h2>
              <p className="mb-4">{t('section2Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('section2Item1')}</li>
                <li>{t('section2Item2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section3Heading')}
              </h2>
              <p className="mb-4">{t('section3Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('section3Item1')}</li>
                <li>{t('section3Item2')}</li>
                <li>{t('section3Item3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section4Heading')}
              </h2>
              <p>
                {t('section4Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section5Heading')}
              </h2>
              <p>
                {t('section5Body1')}
              </p>
              <p className="mt-4">
                {t('section5Body2')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section6Heading')}
              </h2>
              <p>
                {t('section6Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section7Heading')}
              </h2>
              <p className="mb-4">{t('section7Intro')}</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>{t('section7Item1')}</li>
                <li>{t('section7Item2')}</li>
                <li>{t('section7Item3')}</li>
                <li>{t('section7Item4')}</li>
                <li>{t('section7Item5')}</li>
              </ul>
              <p className="mt-4">
                {t('section7Outro')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section8Heading')}
              </h2>
              <p>
                {t('section8Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section9Heading')}
              </h2>
              <p>
                {t('section9Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section10Heading')}
              </h2>
              <p>
                {t('section10Body')}
              </p>
            </section>

            <section>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">
                {t('section11Heading')}
              </h2>
              <p>
                {t('section11Intro')}
              </p>
              <div className="mt-4 bg-surface-900 border border-border-subtle rounded-xl p-6">
                <p className="text-text-primary font-medium mb-1">{t('section11Company')}</p>
                <p className="text-text-secondary">{t('section11Location')}</p>
                <p className="text-text-secondary">
                  {t('section11EmailLabel')}{' '}
                  <a href="mailto:info@omniprise.com.py" className="text-omniprise-500 hover:text-omniprise-400 transition-colors">
                    info@omniprise.com.py
                  </a>
                </p>
              </div>
            </section>
          </div>
        </article>
    </div>
  );
}
