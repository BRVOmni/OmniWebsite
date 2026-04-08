'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('footer');

  const FOOTER_LINKS = [
    { label: t('nosotros'), href: '/#nosotros' },
    { label: t('marcas'), href: '/#marcas' },
    { label: t('vision'), href: '/#vision' },
    { label: t('franquicia'), href: '/franchise', highlight: true },
    { label: t('contacto'), href: '/#contacto' },
  ];

  return (
    <footer className="px-6 md:px-12 py-12 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
      <Link href="/" className="flex items-center">
        <Image
          src="/omniprise-logo.png"
          alt="Omniprise"
          width={120}
          height={34}
          className="h-5 w-auto logo-invert-light"
        />
      </Link>

      <ul className="flex flex-wrap justify-center gap-8">
        {FOOTER_LINKS.map((link) => (
          <li key={link.href}>
            {link.href.startsWith('/') ? (
              <Link
                href={link.href}
                className={`text-xs tracking-[0.05em] transition-colors duration-200 ${
                  link.highlight ? 'text-text-primary' : 'text-text-hint hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className={`text-xs tracking-[0.05em] transition-colors duration-200 ${
                  link.highlight ? 'text-text-primary' : 'text-text-hint hover:text-text-primary'
                }`}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <span className="text-xs text-text-hint tracking-[0.05em]">
        {t('copyright')}{' · '}
        <Link href="/privacidad" className="hover:text-text-primary transition-colors">
          {t('privacy')}
        </Link>
      </span>
    </footer>
  );
}
