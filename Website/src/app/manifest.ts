import type { MetadataRoute } from 'next';
import { COMPANY } from '@/lib/company';

/** Web app manifest, generated so the figures stay in sync with `company.ts`. Served at /manifest.webmanifest. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Omniprise — Plataforma de Marcas Gastronómicas',
    short_name: COMPANY.name,
    description: `Operador gastronómico con ${COMPANY.brandsLabel} marcas, ${COMPANY.locations} locales y presencia en ${COMPANY.cities} ciudades en Paraguay.`,
    start_url: '/',
    display: 'standalone',
    background_color: '#14181d',
    theme_color: '#0ea5e9',
    lang: 'es',
    categories: ['food', 'business'],
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
