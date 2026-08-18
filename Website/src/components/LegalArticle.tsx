'use client';

import { useTranslations } from 'next-intl';

interface LegalSection {
  heading: string;
  body?: string;
  items?: string[];
  after?: string;
}

interface LegalArticleProps {
  namespace: string;
  sections: LegalSection[];
}

/** Shared layout for legal pages (Términos, Cookies, Privacidad-style). Copy comes from `namespace`. */
export function LegalArticle({ namespace, sections }: LegalArticleProps) {
  const t = useTranslations(namespace);

  return (
    <div className="min-h-screen bg-surface-800 pt-28 pb-20 px-6 md:px-12">
      <article className="max-w-[760px] mx-auto">
        <header className="mb-16">
          <p className="text-[10px] tracking-[0.2em] uppercase text-text-hint font-medium mb-4">{t('eyebrow')}</p>
          <h1 className="font-display font-black text-[clamp(36px,5vw,56px)] leading-[0.95] uppercase tracking-wide mb-6">
            {t('headingPrefix')} <span className="text-omniprise-500">{t('headingHighlight')}</span>
          </h1>
          <p className="text-sm text-text-hint">{t('lastUpdated')}</p>
        </header>

        <div className="space-y-12 text-[15px] text-text-secondary leading-relaxed">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display font-bold text-xl uppercase tracking-wide text-text-primary mb-4">{t(s.heading)}</h2>
              {s.body && <p className={s.items ? 'mb-4' : undefined}>{t(s.body)}</p>}
              {s.items && (
                <ul className="list-disc pl-6 space-y-2">
                  {s.items.map((k) => (
                    <li key={k}>{t(k)}</li>
                  ))}
                </ul>
              )}
              {s.after && <p className="mt-4">{t(s.after)}</p>}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}
