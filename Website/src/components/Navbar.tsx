'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ExternalLink } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { WorkModal } from './WorkModal';

const NAV_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Marcas', href: '#marcas' },
  { label: 'Franquicia', href: '/franchise' },
  { label: 'Visión', href: '#vision' },
  { label: 'Contacto', href: '#contacto' },
] as const;

export function Navbar() {
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
            className="h-7 w-auto"
            priority
          />
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              {link.href.startsWith('/') ? (
                <Link
                  href={link.href}
                  className="text-[13px] font-normal tracking-wider text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  href={link.href}
                  className="text-[13px] font-normal tracking-wider text-text-secondary hover:text-text-primary transition-colors duration-200"
                >
                  {link.label}
                </a>
              )}
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
            Empleados
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setModalOpen(true)}
            className="hidden sm:inline-flex text-[13px] font-medium text-surface-900 bg-text-primary hover:bg-omniprise-50 px-5 py-2 rounded-full tracking-wider transition-all duration-200 cursor-pointer"
          >
            Trabajemos juntos
          </button>

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
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-2xl font-display font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary py-3 border-b border-border-subtle transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="flex flex-col gap-3 mt-6">
                <a
                  href="https://dashboard.omniprise.com.py"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-sm text-text-secondary border border-border-medium py-3 rounded-full"
                >
                  Empleados
                </a>
                <button
                  onClick={() => { setMobileOpen(false); setModalOpen(true); }}
                  className="text-center text-sm font-medium text-surface-900 bg-text-primary py-3 rounded-full"
                >
                  Trabajemos juntos
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <WorkModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
