export interface BrandStat {
  label: string;
  value: string;
}

export interface BrandMilestone {
  date: string;
  event: string;
}

export interface Brand {
  slug: string;
  name: string;
  logo: string;
  tag: string;
  tagline: string;
  description: string;
  badge: string;
  wide?: boolean;
  /** 'dark' = dark-on-transparent logo that must be inverted to read on the dark UI */
  logoColor?: 'dark';
  story: string;
  stats: BrandStat[];
  milestones: BrandMilestone[];
  locations: string;
  deliveryPlatforms: string[];
  model: string;
  galleryCount: number;
  /** @handle without the @ — displayed as reference for users to search */
  instagram: string;
  /** Relative paths under /public — e.g. /brands/gallery/ufo/1.jpeg */
  galleryImages?: string[];
  /** Photo used on the homepage brand card and the brand page hero (under /public) */
  heroImage: string;
}

export const BRANDS: Brand[] = [
  {
    slug: 'ufo',
    name: 'UFO',
    logo: '/brands/UFO.webp',
    tag: 'Marca propia — Marzo 2025',
    tagline: 'Experiencia gastronómica temática de alto impacto',
    description:
      'Restaurante temático único en su clase con 1.600 m² y capacidad para 250 personas. La propuesta combina gastronomía, entretenimiento y ambientación inmersiva, Diseñado para escala, visibilidad y alto volumen operativo.',
    badge: 'Marca insignia',
    story:
      'UFO nació con una ambición radical: crear un espacio donde la gastronomía y el entretenimiento convergen en una experiencia inolvidable. Con 1.600 m² de superficie y capacidad para 250 personas, UFO no es solo un restaurante — es un destino donde la experiencia es central al concepto.\n\nDesde su diseño conceptual hasta cada detalle de la ambientación inmersiva, cada elemento fue pensado para maximizar la experiencia dentro de UFO. La carta gráfica, la iluminación y la disposición espacial construyen una atmósfera que va más allá de lo convencional.\n\nComo marca insignia de Omniprise, UFO representa el estándar de innovación y ambición que define al grupo, demostrando que en Paraguay hay espacio para conceptos gastronómicos de escala internacional.',
    stats: [
      { label: 'Superficie', value: '1.600 m²' },
      { label: 'Capacidad', value: '250 personas' },
      { label: 'Locales', value: '1' },
      { label: 'Categoría', value: 'Marca insignia' },
    ],
    milestones: [
      { date: 'Mar 2025', event: 'Apertura del primer local UFO' },
      { date: '2026', event: 'Evaluación de expansión a ciudades clave del país' },
    ],
    locations: '1 local físico en Asunción',
    deliveryPlatforms: ['Presencial directa'],
    model: 'Restaurante temático',
    heroImage: '/brands/gallery/ufo/1.jpeg',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/ufo/1.jpeg', '/brands/gallery/ufo/2.jpeg', '/brands/gallery/ufo/3.jpeg', '/brands/gallery/ufo/4.jpeg', '/brands/gallery/ufo/5.jpeg'],
    instagram: 'ufo.py',
  },
  {
    slug: 'los-condenados',
    name: 'El Club de los Condenados',
    logo: '/brands/El Club De Los Condenados.webp',
    tag: 'Marca propia — Dic. 2025',
    tagline: 'Pizza bar · actitud y entretenimiento. Presencial + delivery, con 11 dark-kitchens ya operando en Gran Asunción.',
    description:
      'Pizza bar que combina pizzas de alta calidad, ambiente descontracturado y tragos innovadores. Pensada para consumo frecuente, con 11 dark-kitchens ya operando para cobertura total de Gran Asunción.',
    badge: '11 dark-kitchens activas',
    story:
      'El Club de los Condenados llegó para romper con el formato tradicional de pizzería, combinando pizza de alta calidad con un ambiente nocturno vibrante y una propuesta de coctelería innovadora.\n\nRápidamente se posicionó como un punto de encuentro para quienes buscan algo más que una salida a comer: una experiencia donde la energía del lugar es tan importante como el producto.\n\nSu modelo de negocio integra el consumo presencial con una fuerte apuesta en delivery, logrando alta rotación en ambos canales. La marca está diseñada para generar recurrencia, con clientes que vuelven semana tras semana.\n\nComo parte de Omniprise, El Club de los Condenados escaló bajo el modelo de dark-kitchen y ya opera con 11 dark-kitchens en Gran Asunción, llevando su propuesta a toda el área metropolitana sin la inversión de locales físicos tradicionales.',
    stats: [
      { label: 'Modelo', value: 'Pizza bar + delivery' },
      { label: 'Dark-kitchens', value: '11 activas' },
      { label: 'Canal', value: 'Presencial + delivery' },
      { label: 'Foco', value: 'Alta rotación nocturna' },
    ],
    milestones: [
      { date: 'Dic 2025', event: 'Lanzamiento de El Club de los Condenados como marca propia' },
      { date: '2026', event: '11 dark-kitchens operando en Gran Asunción' },
    ],
    locations: '1 local físico + 11 dark-kitchens activas en Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis'],
    model: 'Pizza bar + dark-kitchen',
    heroImage: '/brands/gallery/los-condenados/4.jpeg',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/los-condenados/1.jpeg', '/brands/gallery/los-condenados/2.jpeg', '/brands/gallery/los-condenados/3.jpeg', '/brands/gallery/los-condenados/4.jpeg', '/brands/gallery/los-condenados/5.jpeg'],
    instagram: 'elclubdeloscondenados',
  },
  {
    slug: 'rocco',
    name: 'Rocco',
    logo: '/brands/Rocco.webp',
    tag: 'Marca propia — Oct. 2025',
    tagline: 'Pasta Bar · moderno, rápido y escalable',
    description:
      'Pasta bar contemporáneo iniciado en el centro de Asunción. Foco en calidad, rapidez y eficiencia operativa. Plan 2026: 8 dark-kitchens y expansión a locales en shoppings.',
    badge: '8 dark-kitchens proyectadas 2026',
    story:
      'Rocco nació de una observación simple: la pasta fresca podía ser mucho más accesible en Paraguay. Un pasta bar contemporáneo en el centro de Asunción que prioriza la calidad del producto, la rapidez del servicio y la eficiencia operativa.\n\nEl concepto fue diseñado desde el primer día para escalar. Los procesos estandarizados y el modelo operativo lean permiten replicar sin perder calidad, asegurando una experiencia consistente en cada punto de venta.\n\nEn 2026, Rocco proyecta expandirse con 8 dark-kitchens estratégicamente ubicadas y la apertura de locales en shoppings, consolidándose como referente en el segmento de pasta rápida en el país.',
    stats: [
      { label: 'Segmento', value: 'Pasta bar' },
      { label: 'Expansión 2026', value: '8 dark-kitchens' },
      { label: 'Proyección', value: 'Locales en shoppings' },
      { label: 'Modelo', value: 'Alta replicabilidad' },
    ],
    milestones: [
      { date: 'Oct 2025', event: 'Apertura del primer Rocco en el centro de Asunción' },
      { date: '2026', event: 'Expansión a 8 dark-kitchens y locales en shoppings' },
    ],
    locations: '1 local en centro de Asunción + 8 dark-kitchens proyectadas',
    deliveryPlatforms: ['PedidosYa', 'Monchis', 'Uber Eats'],
    model: 'Pasta bar + dark-kitchen',
    heroImage: '/brands/gallery/rocco/3.jpeg',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/rocco/1.jpeg', '/brands/gallery/rocco/2.jpeg', '/brands/gallery/rocco/3.jpeg', '/brands/gallery/rocco/4.jpeg', '/brands/gallery/rocco/5.jpeg'],
    instagram: 'rocco.com.py',
  },
  {
    slug: 'sammys',
    name: "Sammy's",
    logo: "/brands/Sammy's Express Pizza.webp",
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Express Pizza, estilo New York, con más de 12 años de trayectoria',
    description:
      "Segunda cadena de pizza más grande del país, con 15 locales activos en el Gran Asunción. Integrada al portafolio de Omniprise el 1 de enero de 2026 bajo una estructura orientada a expansión, estandarización y crecimiento acelerado.",
    badge: '15 locales activos',
    story:
      "Sammy's Express Pizza no es una startup — es una marca consolidada. Con más de 12 años de trayectoria, estilo New York y 15 locales activos, se posicionó como la segunda cadena de pizza más grande de Paraguay antes de integrarse a Omniprise.\n\nEl 1 de enero de 2026, Sammy's fue adquirida e integrada al ecosistema operativo de Omniprise. La estrategia no es cambiar lo que funciona, sino potenciarlo: estandarizar procesos, optimizar el supply chain y acelerar la expansión hacia nuevas ciudades.\n\nLa integración combina lo mejor de ambos mundos: la trayectoria y el reconocimiento de marca de Sammy's, junto con la tecnología, el know-how operativo y la red de proveedores de Omniprise.",
    stats: [
      { label: 'Trayectoria', value: '+12 años' },
      { label: 'Locales activos', value: '15' },
      { label: 'Cobertura', value: 'Gran Asunción' },
      { label: 'Posición', value: '2ª cadena del país' },
    ],
    milestones: [
      { date: '2014', event: 'Fundación de Sammy\'s Express Pizza' },
      { date: 'Ene 2026', event: 'Adquisición e integración a Omniprise' },
      { date: '2026', event: 'Expansión a nuevas ciudades del interior' },
    ],
    locations: '15 locales físicos en el Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis', 'WhatsApp Directo'],
    model: 'Express pizza — locales físicos',
    heroImage: '/brands/gallery/sammys/5.jpeg',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/sammys/1.jpeg', '/brands/gallery/sammys/2.jpeg', '/brands/gallery/sammys/3.jpeg', '/brands/gallery/sammys/4.jpeg', '/brands/gallery/sammys/5.jpeg'],
    instagram: 'sammysexpresspizza',
  },
  {
    slug: 'pastabox',
    name: 'PastaBox',
    logo: '/brands/PastaBox.webp',
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Dark-kitchens + local físico · en operación desde 2021',
    description:
      'Opera desde 2021 con un modelo híbrido: 8 dark-kitchens activas y un local físico en Gran Asunción. Adquirida e integrada al ecosistema operativo de Omniprise el 01/01/2026, aporta volumen operativo, conocimiento del canal delivery y una base de clientes recurrente.',
    badge: '8 cocinas activas',
    story:
      'PastaBox opera desde 2021 con un modelo híbrido que combina dark kitchens con presencia física, integrando ambos canales dentro de una misma lógica operativa.\n\nCon 8 cocinas activas, la marca construyó una estructura eficiente, con márgenes ajustados y alta rotación, logrando escala a través de su cobertura geográfica y su fuerte presencia en delivery.\n\nIntegrada a Omniprise el 1 de enero de 2026, PastaBox aporta volumen operativo, conocimiento del canal delivery y una base de clientes recurrente. Su fortaleza está en la eficiencia y la capacidad de adaptación a distintos formatos.\n\nDurante 2026, PastaBox continuará creciendo bajo este esquema híbrido, sumando cobertura en Gran Asunción y potenciando su local con la tecnología y el supply chain del grupo.',
    stats: [
      { label: 'Operando desde', value: '2021' },
      { label: 'Cocinas activas', value: '8' },
      { label: 'Local físico', value: '1' },
      { label: 'Modelo', value: 'Híbrido' },
    ],
    milestones: [
      { date: '2021', event: 'Inicio de operaciones como dark-kitchen' },
      { date: 'Ene 2026', event: 'Adquisición e integración a Omniprise' },
      { date: '2026', event: 'Crecimiento del modelo híbrido en Gran Asunción' },
    ],
    locations: '8 dark-kitchens activas + 1 local físico en Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis', 'Uber Eats'],
    model: 'Híbrido — dark-kitchens + local físico',
    heroImage: '/brands/gallery/pastabox/2.jpeg',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/pastabox/1.jpeg', '/brands/gallery/pastabox/2.jpeg', '/brands/gallery/pastabox/3.jpeg', '/brands/gallery/pastabox/4.jpeg', '/brands/gallery/pastabox/5.jpeg'],
    instagram: 'pastaboxpy',
  },
  {
    slug: 'mr-chow',
    name: 'Mr. Chow',
    logo: '/brands/Mr. Chow.webp',
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Gastronomía oriental · en operación desde 2021',
    description:
      'Gastronomía oriental con un local en Shopping Multiplaza y 4 dark-kitchens en Gran Asunción. Formato dual que integra delivery y canal presencial, en operación desde 2021 e integrada a Omniprise el 01/01/2026.',
    badge: '1 local + 4 dark-kitchens',
    logoColor: 'dark',
    story:
      'Mr. Chow introduce la gastronomía oriental en el mercado paraguayo a través de una propuesta que combina tradición y accesibilidad. Operando desde 2021, la marca construyó una base de clientes fiel que busca opciones diferentes dentro de la oferta gastronómica habitual.\n\nCon un local en Shopping Multiplaza y una red de dark-kitchens, Mr. Chow opera bajo un formato dual que integra el canal delivery con el canal presencial.\n\nIncorporado a Omniprise el 1 de enero de 2026, la marca cuenta con el potencial para escalar rápidamente, con el soporte operativo de Omniprise.\n\nHoy Mr. Chow opera con un local en Shopping Multiplaza y 4 dark-kitchens en Gran Asunción, ampliando su cobertura de delivery y consolidando su posicionamiento en el segmento de cocina oriental.',
    stats: [
      { label: 'Operando desde', value: '2021' },
      { label: 'Local físico', value: '1 (Multiplaza)' },
      { label: 'Dark-kitchens', value: '4 activas' },
      { label: 'Segmento', value: 'Oriental fusión' },
    ],
    milestones: [
      { date: '2021', event: 'Inicio de operaciones en Mburucuyá' },
      { date: '2024', event: 'Apertura de local en Shopping Multiplaza' },
      { date: 'Ene 2026', event: 'Integración a Omniprise' },
      { date: '2026', event: 'Red de 4 dark-kitchens en Gran Asunción' },
    ],
    locations: '1 local (Shopping Multiplaza) + 4 dark-kitchens en Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis'],
    model: 'Híbrido — dark-kitchen + local físico',
    heroImage: '/brands/gallery/mr-chow/2.jpeg',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/mr-chow/1.jpeg', '/brands/gallery/mr-chow/2.jpeg', '/brands/gallery/mr-chow/3.jpeg', '/brands/gallery/mr-chow/4.jpeg', '/brands/gallery/mr-chow/5.jpeg'],
    instagram: 'mrchowpy',
  },
  {
    slug: 'barrio-pizzero',
    name: 'Barrio Pizzero',
    logo: '/brands/Barrio Pizzero.webp',
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Enfoque barrial · alta rotación en envío a domicilio',
    description:
      'Complementa el segmento pizza con un enfoque barrial, accesible y de alta rotación. Especialmente orientada al envío a domicilio para cubrir segmentos de precio que las otras marcas no alcanzan.',
    badge: 'Orientada al envío a domicilio',
    wide: true,
    story:
      "Barrio Pizzero es la marca que cierra el círculo en el segmento pizza de Omniprise. Mientras Sammy's cubre el formato express y El Club de los Condenados el segmento premium nocturno, Barrio Pizzero se posiciona en el corazón de los barrios: accesible, cercano y con alta frecuencia de pedido.\n\nIncorporada al portafolio el 1 de enero de 2026, su fortaleza está en la penetración territorial y el volumen recurrente. Es la marca que llega donde las demás no llegan, cubriendo zonas residenciales con un modelo optimizado para delivery y precios competitivos.\n\nBarrio Pizzero genera el volumen que sostiene la operación. Su enfoque en el envío a domicilio y en segmentos de precio accesible la convierte en un motor de recurrencia para todo el ecosistema.",
    stats: [
      { label: 'Segmento', value: 'Pizza barrial' },
      { label: 'Canal principal', value: 'Delivery' },
      { label: 'Cobertura', value: 'Gran Asunción' },
      { label: 'Estrategia', value: 'Precio accesible + volumen' },
    ],
    milestones: [
      { date: 'Ene 2026', event: 'Adquisición e integración a Omniprise' },
      { date: '2026', event: 'Optimización de cobertura territorial' },
    ],
    locations: 'Cobertura de envío a domicilio en todo el Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis', 'WhatsApp Directo'],
    model: 'Delivery-first — cocina centralizada',
    heroImage: '/brands/gallery/barrio-pizzero/4.jpeg',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/barrio-pizzero/1.jpeg', '/brands/gallery/barrio-pizzero/2.jpeg', '/brands/gallery/barrio-pizzero/3.jpeg', '/brands/gallery/barrio-pizzero/4.jpeg', '/brands/gallery/barrio-pizzero/5.jpeg'],
    instagram: 'barriopizzero',
  },
];

export function getBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function whatsappOrderUrl(brandName?: string): string {
  const phone = '595992035000';
  const text = brandName
    ? `Hola! Me interesa ordenar de ${brandName}`
    : 'Hola! Me interesa hacer un pedido';
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function getAllBrandSlugs(): string[] {
  return BRANDS.map((b) => b.slug);
}
