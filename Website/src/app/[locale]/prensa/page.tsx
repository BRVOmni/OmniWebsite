import type { Metadata } from 'next';
import { PressKit } from '@/components/PressKit';

export const metadata: Metadata = {
  title: 'Prensa — Omniprise',
  description: 'Prensa — Omniprise: descripción del grupo, cifras clave y contacto para medios. Materiales gráficos a pedido.',
};

export default function PrensaPage() {
  return <PressKit />;
}
