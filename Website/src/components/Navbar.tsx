'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { WorkModal } from './WorkModal';
import { whatsappOrderUrl } from '@/lib/brands';
import { useActiveLink } from '@/lib/use-active-link';

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = () => {
    const next = locale === 'es' ? 'en' : 'es';
    router.replace(pathname, { locale: next });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface-700 transition-colors duration-200 cursor-pointer text-[11px] font-bold tracking-wider uppercase"
      aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      {locale === 'es' ? 'EN' : 'ES'}
    </button>
  );
}

const NAV_LINK_KEYS = [
  { key: 'nosotros', href: '/#nosotros' },
  { key: 'marcas', href: '/#marcas' },
  { key: 'franquicia', href: '/franchise' },
  { key: 'vision', href: '/#vision' },
  { key: 'contacto', href: '/#contacto' },
] as const;

export function Navbar() {
  const t = useTranslations('nav');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const isActive = useActiveLink(['nosotros', 'marcas', 'vision', 'contacto']);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 flex items-center justify-between 2xl:grid 2xl:grid-cols-[1fr_auto_1fr]',
          'px-6 md:px-12 h-16 md:h-[68px]',
          'border-b transition-all duration-300',
          scrolled || mobileOpen
            ? 'bg-surface-950/80 border-border-subtle backdrop-blur-xl'
            : 'bg-transparent border-transparent'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/omniprise-logo.png"
            alt="Omniprise"
            width={140}
            height={40}
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden lg:flex items-center justify-center gap-5 xl:gap-8">
          {NAV_LINK_KEYS.map((link) => (
            <li key={link.key}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={cn(
                  'relative text-[12.5px] xl:text-[13px] font-normal tracking-wider transition-colors duration-200 py-1',
                  'after:absolute after:left-0 after:-bottom-0.5 after:h-px after:bg-omniprise-500 after:transition-[width] after:duration-300',
                  isActive(link.href)
                    ? 'text-text-primary after:w-full'
                    : 'text-text-secondary hover:text-text-primary after:w-0',
                )}
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-2 xl:gap-2.5">
          <a
            href={whatsappOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-green-950 bg-green-500 hover:bg-green-400 px-4 xl:px-5 py-2 rounded-full tracking-wider transition-all duration-200"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {t('whatsappCta')}
          </a>
          <button
            onClick={() => setModalOpen(true)}
            className="hidden sm:inline-flex whitespace-nowrap text-[13px] font-medium text-surface-900 bg-text-primary hover:bg-omniprise-50 px-4 xl:px-5 py-2 rounded-full tracking-wider transition-all duration-200 cursor-pointer"
          >
            {t('workTogether')}
          </button>

          <LanguageSwitcher />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-surface-950/95 backdrop-blur-xl pt-20 px-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex flex-col gap-1"
            >
              {NAV_LINK_KEYS.map((link, i) => (
                <motion.div
                  key={link.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className={cn(
                      'block text-2xl font-display font-bold uppercase tracking-wider py-3 border-b border-border-subtle transition-colors',
                      isActive(link.href) ? 'text-omniprise-400' : 'text-text-secondary hover:text-text-primary',
                    )}
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <a
                  href={whatsappOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="text-center text-sm font-medium text-green-950 bg-green-500 hover:bg-green-400 py-3 rounded-full inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('whatsappCta')}
                </a>
                <button
                  onClick={() => { setMobileOpen(false); setModalOpen(true); }}
                  className="text-center text-sm font-medium text-surface-900 bg-text-primary py-3 rounded-full"
                >
                  {t('workTogether')}
                </button>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <LanguageSwitcher />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
