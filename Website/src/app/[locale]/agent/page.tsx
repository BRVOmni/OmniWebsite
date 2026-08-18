import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BRANDS, whatsappOrderUrl } from '@/lib/brands';

interface AgentPageProps {
  params: Promise<{ locale: string }>;
}

const BASE_URL = 'https://www.omniprise.com.py';

export async function generateMetadata({ params }: AgentPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'agentPage' });
  const isEn = locale === 'en';
  const url = isEn ? `${BASE_URL}/en/agent` : `${BASE_URL}/agent`;
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
    alternates: { canonical: url, languages: { es: `${BASE_URL}/agent`, en: `${BASE_URL}/en/agent` } },
    robots: { index: true, follow: true },
  };
}

/**
 * Static, informational reference page for people, search engines and AI assistants.
 * Deliberately: no forms, no scripts beyond Next.js itself, no user input, no data
 * that is not already public elsewhere on the site.
 */
export default async function AgentPage({ params }: AgentPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'agentPage' });
  const isEn = locale === 'en';
  const prefix = isEn ? '/en' : '';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Omniprise',
        url: BASE_URL,
        logo: `${BASE_URL}/omniprise-logo.png`,
        description: t('aboutBody'),
        foundingDate: '2024',
        areaServed: { '@type': 'Country', name: 'Paraguay' },
        address: { '@type': 'PostalAddress', addressLocality: 'Asunción', addressCountry: 'PY' },
        contactPoint: [
          { '@type': 'ContactPoint', contactType: 'sales', email: 'franquicias@omniprise.com.py', availableLanguage: ['es', 'en'] },
          { '@type': 'ContactPoint', contactType: 'customer service', email: 'info@omniprise.com.py', availableLanguage: ['es', 'en'] },
        ],
        brand: BRANDS.map((b) => ({ '@type': 'Brand', name: b.name, url: `${BASE_URL}${prefix}/marcas/${b.slug}` })),
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'Omniprise',
        publisher: { '@id': `${BASE_URL}/#organization` },
        inLanguage: ['es', 'en'],
      },
      {
        '@type': 'WebPage',
        url: `${BASE_URL}${prefix}/agent`,
        name: t('metaTitle'),
        description: t('metaDescription'),
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${BASE_URL}/#organization` },
        inLanguage: isEn ? 'en' : 'es',
      },
    ],
  };

  const FACTS = [1, 2, 3, 4, 5, 6] as const;
  const INVEST = [1, 2, 3, 4] as const;

  return (
    <div className="min-h-screen bg-surface-800 pt-28 pb-24 px-6 md:px-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-[860px] mx-auto">
        <header className="mb-14">
          <p className="text-[11px] tracking-[0.22em] uppercase text-text-hint font-semibold mb-5">{t('eyebrow')}</p>
          <h1 className="font-display font-black text-[clamp(40px,6vw,72px)] leading-[0.95] uppercase tracking-wide mb-6">
            {t('heading')}
          </h1>
          <p className="text-[17px] text-text-secondary leading-relaxed">{t('intro')}</p>
          <p className="text-sm text-text-hint mt-4">{t('updated')}</p>
        </header>

        <div className="space-y-14 text-[15.5px] text-text-secondary leading-relaxed">
          <section aria-labelledby="about">
            <h2 id="about" className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-4">{t('aboutHeading')}</h2>
            <p>{t('aboutBody')}</p>
          </section>

          <section aria-labelledby="brands">
            <h2 id="brands" className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-4">{t('brandsHeading')}</h2>
            <p className="mb-6">{t('brandsIntro')}</p>
            <ul className="space-y-4">
              {BRANDS.map((b) => (
                <li key={b.slug} className="rounded-tile border border-border-subtle bg-surface-900 p-5">
                  <h3 className="font-display font-bold text-xl uppercase tracking-[0.02em] text-text-primary mb-2">{b.name}</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-[130px_1fr] gap-x-4 gap-y-1 text-sm">
                    <dt className="text-text-hint">{t('brandCuisine')}</dt><dd>{b.cuisine}</dd>
                    <dt className="text-text-hint">{t('brandModel')}</dt><dd>{b.model}</dd>
                    <dt className="text-text-hint">{t('brandPresence')}</dt><dd>{b.locations}</dd>
                    <dt className="text-text-hint">{t('brandDelivery')}</dt><dd>{b.deliveryPlatforms.join(' · ')}</dd>
                  </dl>
                  <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <a href={whatsappOrderUrl(b.name)} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">{t('brandOrder')} →</a>
                    <a href={`${prefix}/marcas/${b.slug}`} className="text-omniprise-400 hover:text-omniprise-300 transition-colors">{t('brandPage')} →</a>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="invest">
            <h2 id="invest" className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-4">{t('investHeading')}</h2>
            <p className="mb-6">{t('investIntro')}</p>
            <ul className="space-y-3 mb-6">
              {INVEST.map((n) => (
                <li key={n} className="rounded-tile border border-border-subtle bg-surface-900 p-4">
                  <span className="block font-semibold text-text-primary mb-1">{t(`invest${n}Title`)}</span>
                  <span className="text-sm">{t(`invest${n}Text`)}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-text-hint mb-6">{t('investNote')}</p>
            <p className="flex flex-wrap items-center gap-4">
              <a
                href={`${prefix}/franchise/apply`}
                className="inline-flex items-center h-11 px-6 rounded-full text-sm font-medium text-surface-950 bg-omniprise-500 hover:bg-omniprise-400 transition-all duration-200 hover:-translate-y-0.5"
              >
                {t('investCta')}
              </a>
              <span className="text-sm text-text-hint">{t('investEmail')}</span>
            </p>
          </section>

          <section aria-labelledby="other">
            <h2 id="other" className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-4">{t('otherHeading')}</h2>
            <ul className="space-y-2 text-sm">
              <li><span className="font-semibold text-text-primary">{t('suppliersTitle')}:</span> {t('suppliersText')} <a href={`${prefix}/proveedores`} className="text-omniprise-400 hover:text-omniprise-300">omniprise.com.py{prefix}/proveedores</a></li>
              <li><span className="font-semibold text-text-primary">{t('pressTitle')}:</span> {t('pressText')} <a href={`${prefix}/prensa`} className="text-omniprise-400 hover:text-omniprise-300">omniprise.com.py{prefix}/prensa</a></li>
              <li><span className="font-semibold text-text-primary">{t('contactTitle')}:</span> <a href="mailto:info@omniprise.com.py" className="text-omniprise-400 hover:text-omniprise-300">{t('contactText')}</a></li>
            </ul>
          </section>

          <section aria-labelledby="facts">
            <h2 id="facts" className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-4">{t('factsHeading')}</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {FACTS.map((n) => (
                <div key={n} className="rounded-tile border border-border-subtle bg-surface-900 p-4">
                  <dt className="text-[11px] tracking-[0.14em] uppercase text-text-hint font-semibold">{t(`fact${n}Label`)}</dt>
                  <dd className="font-display font-black text-2xl text-text-primary mt-1">{t(`fact${n}Value`)}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="policy" className="border-t border-border-subtle pt-10">
            <h2 id="policy" className="font-display font-bold text-2xl uppercase tracking-wide text-text-primary mb-4">{t('policyHeading')}</h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm">
              <li>{t('policy1')}</li>
              <li>{t('policy2')}</li>
              <li>{t('policy3')}</li>
              <li>{t('policy4')}</li>
            </ol>
          </section>
        </div>
      </article>
    </div>
  );
}
