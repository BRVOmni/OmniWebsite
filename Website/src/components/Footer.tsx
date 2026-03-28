'use client';

import Image from 'next/image';

const FOOTER_LINKS = [
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Marcas', href: '#marcas' },
  { label: 'Visión', href: '#vision' },
  { label: 'Franquicia', href: '/franchise', highlight: true },
  { label: 'Contacto', href: '#contacto' },
];

export function Footer() {
  return (
    <footer className="px-6 md:px-12 py-12 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
      <a href="#" className="flex items-center">
        <Image
          src="/omniprise-logo.png"
          alt="Omniprise"
          width={120}
          height={34}
          className="h-5 w-auto"
        />
      </a>

      <ul className="flex flex-wrap justify-center gap-8">
        {FOOTER_LINKS.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className={`text-xs tracking-[0.05em] transition-colors duration-200 ${
                link.highlight ? 'text-text-primary' : 'text-text-hint hover:text-text-primary'
              }`}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>

      <span className="text-xs text-text-hint tracking-[0.05em]">
        © 2026 Omniprise. Asunción, Paraguay.
      </span>
    </footer>
  );
}
