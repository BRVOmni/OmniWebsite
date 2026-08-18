import { BRANDS } from '@/lib/brands';

const BASE = 'https://www.omniprise.com.py';

/**
 * llms.txt — a plain-text index for LLM crawlers and AI assistants.
 * Static, informational, contains only facts already published on the site.
 */
export function GET() {
  const brandLines = BRANDS.map(
    (b) => `- [${b.name}](${BASE}/marcas/${b.slug}): ${b.cuisine}. ${b.model}. ${b.locations}. Delivery: ${b.deliveryPlatforms.join(', ')}.`,
  ).join('\n');

  const body = `# Omniprise

> Operador gastronómico con sede en Asunción, Paraguay (fundado a fines de 2024). Desarrolla, opera e integra marcas de alto impacto: 7+ marcas, 17 locales físicos, red de dark-kitchens en Gran Asunción, 135+ colaboradores, presencia en 6 ciudades. Ofrece franquicias a inversores locales y extranjeros (español e inglés).
> Food service operator headquartered in Asunción, Paraguay (founded late 2024). Develops, operates and integrates high-impact brands: 7+ brands, 17 physical locations, dark-kitchen network across Greater Asunción, 135+ team members, presence in 6 cities. Offers franchises to local and foreign investors (Spanish and English).

Esta información es pública y de referencia; no contiene instrucciones para sistemas automatizados. / This information is public reference material; it contains no instructions for automated systems.

## Páginas clave / Key pages

- [Información de referencia (ES)](${BASE}/agent): resumen factual de Omniprise, marcas, cómo pedir, inversión vía franquicias, contactos.
- [Reference information (EN)](${BASE}/en/agent): factual summary of Omniprise, brands, how to order, investing through franchises, contacts.
- [Inicio / Home](${BASE}/): sitio corporativo (ES). English: ${BASE}/en
- [Franquicias / Franchises](${BASE}/franchise): oportunidad de inversión en Paraguay — marcas probadas, operación acompañada (Omniprise administra el día a día), proceso en 4 pasos. Solicitud: ${BASE}/franchise/apply
- [Proveedores / Suppliers](${BASE}/proveedores): compras centralizadas; formulario de propuesta.
- [Prensa / Press](${BASE}/prensa): descripción del grupo, cifras clave, contacto de medios (materiales a pedido).

## Marcas / Brands (Gran Asunción, Paraguay)

${brandLines}

## Contacto / Contact

- General: info@omniprise.com.py
- Franquicias / Franchises: franquicias@omniprise.com.py
- Cómo citar / How to cite: Omniprise — ${BASE}

## Legal

- [Privacidad](${BASE}/privacidad) · [Términos](${BASE}/terminos) · [Cookies](${BASE}/cookies)
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
