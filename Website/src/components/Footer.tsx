'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useActiveLink } from '@/lib/use-active-link';

export function Footer() {
  const t = useTranslations('footer');

  const FOOTER_LINKS = [
    { label: t('nosotros'), href: '/#nosotros' },
    { label: t('marcas'), href: '/#marcas' },
    { label: t('vision'), href: '/#vision' },
    { label: t('franquicia'), href: '/franchise' },
    { label: t('proveedores'), href: '/proveedores' },
    { label: t('prensa'), href: '/prensa' },
    { label: t('contacto'), href: '/#contacto' },
  ];
  const isActive = useActiveLink(['nosotros', 'marcas', 'vision', 'contacto']);
  const linkClass = (href: string) =>
    cn(
      'text-xs tracking-[0.05em] transition-colors duration-200',
      isActive(href) ? 'text-text-primary' : 'text-text-hint hover:text-text-primary',
    );

  return (
    <footer className="px-6 md:px-12 py-12 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
      <Link href="/" className="flex items-center">
        <Image
          src="/omniprise-logo.png"
          alt="Omniprise"
          width={120}
          height={34}
          className="h-5 w-auto"
        />
      </Link>

      <ul className="flex flex-wrap justify-center gap-8">
        {FOOTER_LINKS.map((link) => (
          <li key={link.href}>
            {link.href.startsWith('/') ? (
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={linkClass(link.href)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={linkClass(link.href)}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-col items-center md:items-end gap-1 text-xs text-text-hint tracking-[0.05em] md:pr-14">
        <span>{t('copyright')}</span>
        <span className="flex gap-3">
          <Link href="/privacidad" aria-current={isActive('/privacidad') ? 'page' : undefined} className={cn('transition-colors', isActive('/privacidad') ? 'text-text-primary' : 'hover:text-text-primary')}>
            {t('privacy')}
          </Link>
          <Link href="/terminos" aria-current={isActive('/terminos') ? 'page' : undefined} className={cn('transition-colors', isActive('/terminos') ? 'text-text-primary' : 'hover:text-text-primary')}>
            {t('terms')}
          </Link>
          <Link href="/cookies" aria-current={isActive('/cookies') ? 'page' : undefined} className={cn('transition-colors', isActive('/cookies') ? 'text-text-primary' : 'hover:text-text-primary')}>
            {t('cookies')}
          </Link>
        </span>
      </div>
    </footer>
  );
}
