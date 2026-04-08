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
  /** Logo color determines when to invert: 'light' = white logo, 'dark' = black logo */
  logoColor?: 'light' | 'dark';
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
    logoColor: 'light',
    story:
      'UFO nació con una ambición radical: crear un espacio donde la gastronomía y el entretenimiento convergen en una experiencia inolvidable. Con 1.600 m² de superficie y una capacidad para 250 personas, UFO no es solo un restaurante — es un destino.\n\nDesde su diseño conceptual hasta cada detalle de la ambientación inmersiva, cada elemento fue pensado para maximizar la experiencia del comensal. La carta gráfica. la iluminación y la disposición espacial crean una atmósfera que trasciende lo convencional.\n\nComo marca insignia de Omniprise. UFO representa el estándar de innovación y ambición que define al grupo. Su éxito demuestra que en Paraguay hay espacio para conceptos gastronómicos de escala internacional.',
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
    galleryCount: 5,
    galleryImages: ['/brands/gallery/ufo/1.jpeg', '/brands/gallery/ufo/2.jpeg', '/brands/gallery/ufo/3.jpeg', '/brands/gallery/ufo/4.jpeg', '/brands/gallery/ufo/5.jpeg'],
    instagram: 'ufo.py',
  },
  {
    slug: 'los-condenados',
    name: 'Los Condenados',
    logo: '/brands/El Club De Los Condenados.webp',
    tag: 'Marca propia — Dic. 2025',
    tagline: 'Pizza bar · actitud y entretenimiento',
    description:
      'Pizza bar que combina pizzas de alta calidad, ambiente descontracturado y tragos innovadores. Pensada para consumo frecuente, Plan de expansión 2026: 8 dark-kitchens para cobertura total del Gran Asunción.',
    badge: '8 dark-kitchens proyectadas 2026',
    logoColor: 'light',
    story:
      'El Club de Los Condenados arrivó para romper con el formato tradicional de pizzería. Nació como un concepto que mezcla pizza de alta calidad con un ambiente nocturno vibrante y tragos innovadores. rápidamente se convirtió en un punto de encuentro para quienes buscan algo más que una simple salida a comer.\n\nSu modelo de negocio combina el consumo presencial con una fuerte apuesta por el delivery, logrando alta rotación en ambos canales. La marca está diseñada para generar recurrencia: clientes que vuelven semana tras semana.\n\nComo parte de Omniprise, Los Condenados escalará bajo el modelo de dark-kitchen en 2026, llevando su propuesta a 8 puntos estratégicos del Gran Asunción sin la inversión de locales físicos tradicionales.',
    stats: [
      { label: 'Modelo', value: 'Pizza bar + delivery' },
      { label: 'Expansión 2026', value: '8 dark-kitchens' },
      { label: 'Canal', value: 'Presencial + delivery' },
      { label: 'Foco', value: 'Alta rotación nocturna' },
    ],
    milestones: [
      { date: 'Dic 2025', event: 'Lanzamiento de Los Condenados como marca propia' },
      { date: '2026', event: 'Apertura de 8 dark-kitchens en Gran Asunción' },
    ],
    locations: '1 local físico + 8 dark-kitchens proyectadas en Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis'],
    model: 'Pizza bar + dark-kitchen',
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
      'Pasta bar contemporáneo iniciado en el centro de Asunción. Foco en calidad, rapidez y eficiencia operativa. Plan 2026: 8 dark-kitchens y posible apertura en Shopping Multiplaza.',
    badge: '8 dark-kitchens proyectadas 2026',
    story:
      'Rocco nació de una observación simple: la pasta fresca podía ser mucho más accesible en Paraguay. Un pasta bar contemporáneo en el centro de Asunción que prioriza la calidad del producto, la rapidez del servicio y la eficiencia operativa.\n\nEl concepto fue diseñado desde el primer día para escalar. Los procesos estandarizados y el modelo operativo lean permiten replicar sin perder calidad. Cada nuevo punto de venta replica la misma experiencia.\n\nEn 2026, Rocco buscará expandirse con 8 dark-kitchens estratégicamente ubicadas y una posible apertura en Shopping Multiplaza, consolidándose como referente en el segmento de pasta rápida en el país.',
    stats: [
      { label: 'Segmento', value: 'Pasta bar' },
      { label: 'Expansión 2026', value: '8 dark-kitchens' },
      { label: 'Proyección', value: 'Shopping Multiplaza' },
      { label: 'Modelo', value: 'Alta replicabilidad' },
    ],
    milestones: [
      { date: 'Oct 2025', event: 'Apertura del primer Rocco en el centro de Asunción' },
      { date: '2026', event: 'Expansión a 8 dark-kitchens y posible local en Multiplaza' },
    ],
    locations: '1 local en centro de Asunción + 8 dark-kitchens proyectadas',
    deliveryPlatforms: ['PedidosYa', 'Monchis', 'Uber Eats'],
    model: 'Pasta bar + dark-kitchen',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/rocco/1.jpeg', '/brands/gallery/rocco/2.jpeg', '/brands/gallery/rocco/3.jpeg', '/brands/gallery/rocco/4.jpeg', '/brands/gallery/rocco/5.jpeg'],
    instagram: 'rocco.com.py',
  },
  {
    slug: 'sammys',
    name: "Sammy's",
    logo: "/brands/Sammy's Express Pizza.webp",
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Express Pizza · 11 años de trayectoria',
    description:
      "Segunda cadena de pizza más grande del país, con 15 locales activos en el Gran Asunción. Integrada al portafolio de Omniprise el 1 de enero de 2026 bajo una estructura orientada a expansión, estandarización y crecimiento acelerado.",
    badge: '15 locales activos',
    story:
      "Sammy's Express Pizza no es una startup — es una institución. Con 11 años de trayectoria y 15 locales activos, se consolidó como la segunda cadena de pizza más grande de Paraguay antes de integrarse a Omniprise.\n\nEl 1 de enero de 2026, Sammy's fue adquirida e integrada al ecosistema operativo de Omniprise. La estrategia no es cambiar lo que funciona, sino potenciarlo: estandarizar procesos, optimizar supply chain, y acelerar la expansión hacia nuevas ciudades.\n\nLa integración trae lo mejor de ambos mundos: la trayectoria y el reconocimiento de marca de Sammy's, sumado a la tecnología, know-how operativo y red de proveedores de Omniprise.",
    stats: [
      { label: 'Trayectoria', value: '11 años' },
      { label: 'Locales activos', value: '15' },
      { label: 'Cobertura', value: 'Gran Asunción' },
      { label: 'Posición', value: '2ª cadena del país' },
    ],
    milestones: [
      { date: '2015', event: 'Fundación de Sammy\'s Express Pizza' },
      { date: 'Ene 2026', event: 'Adquisición e integración a Omniprise' },
      { date: '2026', event: 'Expansión a nuevas ciudades del interior' },
    ],
    locations: '15 locales físicos en el Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis', 'WhatsApp Directo'],
    model: 'Express pizza — locales físicos',
    galleryCount: 5,
    galleryImages: ['/brands/gallery/sammys/1.jpeg', '/brands/gallery/sammys/2.jpeg', '/brands/gallery/sammys/3.jpeg', '/brands/gallery/sammys/4.jpeg', '/brands/gallery/sammys/5.jpeg'],
    instagram: 'sammysexpresspizza',
  },
  {
    slug: 'pastabox',
    name: 'PastaBox',
    logo: '/brands/PastaBox.webp',
    tag: 'Adquirida e integrada — Ene. 2026',
    tagline: 'Cocina oculta · en operación desde 2021',
    description:
      'Opera desde 2021 bajo el modelo de dark-kitchen, con 8 cocinas activas. Adquirida e integrada al ecosistema operativo de Omniprise el 01/01/2026. Durante 2026 continuará bajo su formato actual, evaluando una posible fusión estratégica con Rocco.',
    badge: '8 cocinas activas',
    story:
      'PastaBox opera desde 2021 bajo el modelo de dark-kitchen, demostrando que un modelo 100% delivery puede ser rentable y escalable en Paraguay. Con 8 cocinas activas, construyó una operación eficiente con márgenes ajustados y alta rotación.\n\nIntegrada a Omniprise el 1 de enero de 2026, PastaBox aporta volumen operativo, conocimiento del canal delivery y una base de clientes recurrente. Su fortaleza está en la eficiencia operativa y la cobertura geográfica.\n\nDurante 2026, PastaBox continuará operando bajo su formato actual mientras se evalúa una posible fusión estratégica con Rocco, que combinaria la fuerza de ambas marcas en el segmento de pasta.',
    stats: [
      { label: 'Operando desde', value: '2021' },
      { label: 'Cocinas activas', value: '8' },
      { label: 'Modelo', value: '100% delivery' },
      { label: 'Evaluación', value: 'Posible fusión con Rocco' },
    ],
    milestones: [
      { date: '2021', event: 'Inicio de operaciones como dark-kitchen' },
      { date: 'Ene 2026', event: 'Adquisición e integración a Omniprise' },
      { date: 'Fin 2026', event: 'Evaluación de fusión estratégica con Rocco' },
    ],
    locations: '8 dark-kitchens activas en Gran Asunción',
    deliveryPlatforms: ['PedidosYa', 'Monchis', 'Uber Eats'],
    model: 'Dark-kitchen — 100% delivery',
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
      'Opera con 1 dark-kitchen en Mburucuyá y 1 local en Shopping Multiplaza. Plan 2026: 4 nuevas dark-kitchens y 2 locales físicos en Asunción.',
    badge: 'Expansión 2026: 4 nuevas cocinas',
    logoColor: 'dark',
    story:
      'Mr. Chow trae la gastronomía oriental al mercado paraguayo con una propuesta que mezcla tradición y accesibilidad. Operando desde 2021, construyó una base de clientes fiel que busca algo diferente en el menú habitual.\n\nCon 1 dark-kitchen en Mburucuyá y 1 local en Shopping Multiplaza, Mr. Chow tiene presencia dual: delivery y presencial. Incorporado a Omniprise el 1 de enero de 2026, la marca tiene todo el potencial para escalar rápidamente.\n\nEl plan 2026 es ambicioso: 4 nuevas dark-kitchens y 2 locales físicos en Asunción, llevando la cocina oriental a más puntos de la ciudad con el respaldo operativo completo de Omniprise.',
    stats: [
      { label: 'Operando desde', value: '2021' },
      { label: 'Locales actuales', value: '2' },
      { label: 'Expansión 2026', value: '4 dark-kitchens + 2 locales' },
      { label: 'Segmento', value: 'Oriental fusión' },
    ],
    milestones: [
      { date: '2021', event: 'Inicio de operaciones en Mburucuyá' },
      { date: '2024', event: 'Apertura de local en Shopping Multiplaza' },
      { date: 'Ene 2026', event: 'Integración a Omniprise' },
      { date: '2026', event: 'Expansión a 6 puntos de venta' },
    ],
    locations: '1 dark-kitchen (Mburucuyá) + 1 local (Shopping Multiplaza)',
    deliveryPlatforms: ['PedidosYa', 'Monchis'],
    model: 'Híbrido — dark-kitchen + local físico',
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
      'Barrio Pizzero es la marca que cierra el círculo en el segmento pizza de Omniprise. Mientras Sammy\'s cubre el segmento express y Los Condenados el segmento premium nocturno, Barrio Pizzero se posiciona en el corazón de los barrios: accesible, cercano y con alta frecuencia de pedido.\n\nIncorporada al portafolio el 1 de enero de 2026, su fortaleza está en la penetración territorial y el volumen recurrente. Es la marca que llega donde las demás no llegan, cubriendo zonas residenciales de todo el Gran Asunción con precios competitivos y un modelo optimizado para delivery.\n\nBarrio Pizzero genera el volumen que alimenta la operación. Su enfoque en envío a domicilio y segmentos de precio accesible la convierte en un motor de recurrencia para todo el ecosistema.',
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
