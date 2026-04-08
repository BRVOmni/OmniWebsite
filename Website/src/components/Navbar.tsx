'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { track } from '@vercel/analytics';
import { Menu, X, ExternalLink, MessageCircle,  } from 'lucide-react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { WorkModal } from './WorkModal';
import { ThemeToggle } from './ThemeToggle';
import { whatsappOrderUrl } from '@/lib/brands';

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
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
          'fixed top-0 left-0 right-0 z-50 flex items-center justify-between',
          'px-6 md:px-12 h-16',
          'border-b transition-all duration-300',
          scrolled
            ? 'bg-surface-900/97 border-border-subtle backdrop-blur-xl'
            : 'bg-surface-800/88 border-transparent backdrop-blur-lg'
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/omniprise-logo.png"
            alt="Omniprise"
            width={140}
            height={40}
            className="h-7 w-auto logo-invert-light"
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINK_KEYS.map((link) => (
            <li key={link.key}>
              <Link
                href={link.href}
                className="text-[13px] font-normal tracking-wider text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                {t(link.key)}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <a
            href="https://dashboard.omniprise.com.py"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-normal text-text-secondary hover:text-text-primary px-5 py-2 rounded-full border border-border-medium tracking-wider transition-all duration-200"
          >
            {t('employees')}
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={whatsappOrderUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('whatsapp_order', { source: 'navbar' })}
            className="hidden sm:inline-flex items-center gap-1.5 text-[13px] font-medium text-green-950 bg-green-500 hover:bg-green-400 px-5 py-2 rounded-full tracking-wider transition-all duration-200"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {t('whatsappCta')}
          </a>
          <button
            onClick={() => { track('work_modal_opened'); setModalOpen(true); }}
            className="hidden sm:inline-flex text-[13px] font-medium text-surface-900 bg-text-primary hover:bg-omniprise-50 px-5 py-2 rounded-full tracking-wider transition-all duration-200 cursor-pointer"
          >
            {t('workTogether')}
          </button>

          <LanguageSwitcher />
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
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
                    className="block text-2xl font-display font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary py-3 border-b border-border-subtle transition-colors"
                  >
                    {t(link.key)}
                  </Link>
                </motion.div>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <a
                  href="https://dashboard.omniprise.com.py"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-sm text-text-secondary border border-border-medium py-3 rounded-full"
                >
                  {t('employees')}
                </a>
                <a
                  href={whatsappOrderUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => { setMobileOpen(false); track('whatsapp_order', { source: 'navbar_mobile' }); }}
                  className="text-center text-sm font-medium text-green-950 bg-green-500 hover:bg-green-400 py-3 rounded-full inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  {t('whatsappCta')}
                </a>
                <button
                  onClick={() => { setMobileOpen(false); track('work_modal_opened'); setModalOpen(true); }}
                  className="text-center text-sm font-medium text-surface-900 bg-text-primary py-3 rounded-full"
                >
                  {t('workTogether')}
                </button>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <LanguageSwitcher />
                  <ThemeToggle />
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
