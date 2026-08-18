import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Proveedores — Omniprise',
  description:
    'Sé proveedor de las marcas de Omniprise. Compras centralizadas para 7+ marcas y 17 locales en Paraguay.',
  openGraph: {
    title: 'Proveedores — Omniprise',
    description: 'Sé proveedor de las marcas de Omniprise. Compras centralizadas para 7+ marcas y 17 locales en Paraguay.',
    url: 'https://www.omniprise.com.py/proveedores',
    siteName: 'Omniprise',
    locale: 'es_PY',
    type: 'website',
  },
};

export default function ProveedoresLayout({ children }: { children: React.ReactNode }) {
  return children;
}
