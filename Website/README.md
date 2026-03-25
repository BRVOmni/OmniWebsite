# Omniprise — Website Documentation
**Versión 1.2 | Marzo 2026**

---

## Registro de cambios

### v1.2 — Ajustes finales pre-producción
- **Logo real de Omniprise:** Imagen PNG oficial embebida como base64 en el nav y el footer. No depende de ningún servidor externo.
- **Email de contacto corregido:** `hola@omniprise.com.py` → `info@omniprise.com.py` en todos los lugares.
- **Modal "Trabajemos juntos":** Al hacer clic en el botón del nav se abre un modal con instrucciones para enviar el currículum a `rrhh@omniprise.com.py`. Se cierra con Escape, clic fuera, o botón "Entendido".
- **Botón "Empleados":** Agregado en el nav. La URL del portal se configura con `data-href` en el elemento (ver Mantenimiento).
- **Visión corregida:** "CONSTRUIR UNO DE LOS ECOSISTEMAS GASTRONÓMICOS MÁS RELEVANTES DEL PAÍS" en mayúsculas.

### v1.1 — Revisión de diseño
- **Tarjetas de marcas reparadas:** Grid rediseñado a 2 columnas con altura natural.
- **Logos SVG agregados:** Los 7 logos representativos de cada marca.
- **Todo el texto en español:** Eliminado todo texto en inglés.

---

## Índice
1. [Resumen del Proyecto](#resumen)
2. [Decisiones de Diseño](#diseño)
3. [Estructura del Sitio](#estructura)
4. [Sistema de Diseño](#sistema)
5. [Despliegue en Vercel](#vercel)
6. [Conexión de Dominio Propio](#dominio)
7. [Mantenimiento y Actualizaciones](#mantenimiento)
8. [Próximos Pasos Recomendados](#proximos)

---

## 1. Resumen del Proyecto {#resumen}

### Objetivo
Sitio web informacional para Omniprise — plataforma de marcas gastronómicas con sede en Asunción, Paraguay. Diseñado para comunicar la identidad corporativa, presentar el portafolio de marcas y establecer credibilidad frente a proveedores, socios estratégicos e inversores.

### Referencia de Diseño
**Apple.com** — estructura de secciones narrativas, tipografía oversized, uso agresivo del espacio negativo, animaciones sutiles de scroll-reveal, paleta monocromática.

### Audiencia Primaria
- Proveedores y socios comerciales potenciales
- Inversores y perfiles institucionales
- Medios y prensa

### Stack Técnico
- **HTML5** puro — sin frameworks ni dependencias de build
- **CSS3** con variables custom (design tokens)
- **JavaScript** vanilla (scroll animations, counters)
- **Google Fonts** — Barlow Condensed + Barlow
- **Vercel** para hosting estático

---

## 2. Decisiones de Diseño {#diseño}

### Paleta de Colores

| Token | Valor | Uso |
|---|---|---|
| `--black` | `#111110` | Secciones oscuras alternadas |
| `--off-black` | `#161614` | Background principal |
| `--dark` | `#1c1c1a` | Hover states en cards |
| `--white` | `#f5f4f0` | Texto principal |
| `--white-dim` | `rgba(245,244,240,0.6)` | Texto secundario |
| `--white-hint` | `rgba(245,244,240,0.25)` | Labels, eyebrows |
| `--border` | `rgba(255,255,255,0.08)` | Bordes sutiles |
| `--border-strong` | `rgba(255,255,255,0.15)` | Bordes enfatizados |

**Decisión:** Paleta 100% monocromática negro/blanco, fiel a la identidad visual de la presentación corporativa de Omniprise. Sin colores de acento — proyecta autoridad, seriedad y alta calidad.

### Tipografía

| Familia | Pesos | Uso |
|---|---|---|
| **Barlow Condensed** | 700, 800, 900 | Títulos, brand names, stats, hero |
| **Barlow** | 300, 400, 500 | Cuerpo de texto, nav, etiquetas |

**Decisión:** Barlow Condensed replica el espíritu tipográfico ultra-bold de la presentación de Omniprise. Condensed permite tamaños muy grandes sin ocupar demasiado espacio horizontal — efecto "impacto" al estilo Apple/Nike.

### Principios de Layout
- **Espacio negativo generoso** — mínimo 140px de padding vertical en secciones principales
- **Grid de 1px de borde** — las cards se separan con líneas de 1px en lugar de gaps, creando una cuadrícula limpia y editorial
- **Tipografía oversized** — los títulos son intencionalmente más grandes de lo convencional
- **Sin imágenes externas** — el diseño no depende de fotos que el cliente aún no tenga disponibles; puede agregarse en la v2

### Animaciones
- **Scroll reveal:** cada elemento entra con `opacity: 0 → 1` + `translateY(24px → 0)` al entrar al viewport
- **Contadores:** los números en la sección de stats animan de 0 al valor final con easing cubic
- **Nav sticky:** el header se oscurece progresivamente al hacer scroll
- **Hover states:** todas las cards y botones tienen transiciones de 200-300ms

---

## 3. Estructura del Sitio {#estructura}

```
index.html          ← Página única (single page)
vercel.json         ← Configuración de despliegue
README.md           ← Esta documentación
```

### Secciones (en orden)

| # | Sección | Anchor | Descripción |
|---|---|---|---|
| 1 | **Nav** | — | Sticky, logo + links + CTA |
| 2 | **Hero** | — | Frase de impacto + subtítulo + CTAs |
| 3 | **Statement** | `#nosotros` | Quiénes somos, texto editorial grande |
| 4 | **Stats** | — | 4 números clave con counter animado |
| 5 | **Pillars** | — | 6 pilares de crecimiento en grid |
| 6 | **Brands** | `#marcas` | Las 7 marcas del portafolio |
| 7 | **Vision** | `#vision` | Visión 2026-2027 |
| 8 | **Partners** | `#contacto` | CTA para socios + datos de contacto |
| 9 | **Footer** | — | Links + copyright |

---

## 4. Sistema de Diseño {#sistema}

### Clases CSS Reutilizables

```css
/* Títulos de sección */
.section-label     /* Eyebrow: 10px, uppercase, espaciado */
.section-title     /* H2 oversized, Barlow Condensed 900 */

/* Botones */
.btn-primary       /* Fondo blanco, texto negro, pill */
.btn-secondary     /* Borde sutil, texto gris, pill */

/* Cards */
.brand-card        /* Card de marca con hover state */
.pillar            /* Card de pilar estratégico */
.stat-item         /* Card de estadística */

/* Animaciones */
.reveal            /* Elemento oculto esperando IntersectionObserver */
.reveal.visible    /* Estado animado: visible */
```

### Para Agregar una Nueva Marca

Copiar este bloque dentro de `.brands-grid`:

```html
<div class="brand-card reveal">
  <div class="brand-tag">Adquirida — [Fecha]</div>
  <div class="brand-name">[NOMBRE]</div>
  <div class="brand-tagline">[Tagline corto]</div>
  <p class="brand-detail">[Descripción 2-3 oraciones]</p>
  <span class="brand-badge">[Badge: e.g. "5 locales"]</span>
</div>
```

### Para Actualizar un Número de Stat

En la sección `.stats`, cada número tiene `data-target`:

```html
<span class="stat-number" data-target="17">0</span>
```

Cambiar el valor de `data-target` para actualizar el número animado.

---

## 5. Despliegue en Vercel {#vercel}

### Primera vez (desde cero)

**Opción A — Via GitHub (recomendado)**

1. Crear repositorio en GitHub: `omniprise-website`
2. Subir los archivos (`index.html`, `vercel.json`)
3. Ir a [vercel.com](https://vercel.com) → **Add New Project**
4. Importar el repositorio de GitHub
5. Vercel detecta automáticamente que es HTML estático
6. Click en **Deploy**

Desde ese momento, cada push a `main` hace un redeploy automático.

**Opción B — Via Vercel CLI**

```bash
# Instalar CLI
npm install -g vercel

# Desde la carpeta del proyecto
vercel

# Para producción
vercel --prod
```

### Para actualizaciones futuras

```bash
# Con GitHub: simplemente hacer push
git add .
git commit -m "Actualizar texto de marcas"
git push

# Con CLI directamente
vercel --prod
```

---

## 6. Conexión del Dominio Propio {#dominio}

1. En Vercel: ir a **Project Settings → Domains**
2. Click en **Add Domain**
3. Ingresar tu dominio (ej: `omniprise.com.py`)
4. Vercel te dará dos opciones:
   - **CNAME record** (para subdominios como `www`)
   - **A record** (para dominio raíz)
5. En tu registrador de dominio (NIC.py u otro), agregar los registros DNS:

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

6. Esperar propagación DNS: 5 minutos a 48 horas (generalmente < 30 min)
7. Vercel activa SSL automáticamente (HTTPS gratis)

---

## 7. Mantenimiento y Actualizaciones
### Configurar la URL del portal de Empleados

En `index.html` buscar el botón:
```html
<a href="#" class="nav-empleados" id="nav-empleados-btn">Empleados</a>
```
Agregar el atributo `data-href` con la URL del dashboard:
```html
<a href="#" class="nav-empleados" id="nav-empleados-btn" data-href="https://tu-dashboard.vercel.app">Empleados</a>
```
 {#mantenimiento}

### Actualizaciones Frecuentes

**Cambiar datos de contacto:**
Buscar en `index.html`:
```html
href="mailto:hola@omniprise.com.py"
```
Y las líneas del bloque `.contact-block`.

**Actualizar estadísticas:**
Buscar `data-target` para números animados. La stat con `%` no tiene `data-target` porque su sufijo la hace especial — editar directamente el `textContent`.

**Agregar/quitar marca:**
Ver sección "Para Agregar una Nueva Marca" arriba.

**Cambiar el email de contacto:**
Buscar todas las ocurrencias de `hola@omniprise.com.py` en el HTML.

### Checklist de QA antes de cada despliegue

- [ ] Revisar en mobile (Chrome DevTools → iPhone 14)
- [ ] Revisar en tablet (iPad landscape y portrait)
- [ ] Testear todos los links de navegación
- [ ] Verificar que el email de contacto sea correcto
- [ ] Confirmar que las estadísticas están actualizadas

---

## 8. Próximos Pasos Recomendados (V2) {#proximos}

### Corto plazo (1-2 meses)
- [ ] **Agregar fotos reales** de los locales (hero con imagen de fondo, sección de marcas con fotos)
- [ ] **Logo SVG oficial** de Omniprise en el nav (reemplazar el texto)
- [ ] **Formulario de contacto** real (Formspree o similar, sin backend)
- [ ] **Google Analytics 4** para tracking de visitas

### Mediano plazo (3-6 meses)
- [ ] **Páginas individuales por marca** (`/ufo`, `/sammy`, etc.)
- [ ] **Sección de prensa/noticias** para comunicados
- [ ] **Open Graph tags** para preview en WhatsApp/redes sociales
- [ ] **Favicon** con el ícono de Omniprise

### Largo plazo
- [ ] **Migrar a Next.js** si se necesita CMS o blog
- [ ] **Versión en inglés** para audiencias internacionales
- [ ] **Portal de franquicias** con formulario de interés

---

## Notas Finales

Este sitio fue diseñado con un principio claro: **menos es más**. La identidad de Omniprise es poderosa precisamente porque no necesita decoración excesiva. El espacio negativo, la tipografía bold y la narrativa directa ("No somos un restaurante") son las herramientas más potentes.

El sitio es 100% funcional sin JavaScript habilitado (las animaciones son progressive enhancement — la información es legible siempre).

---

*Documentación preparada para Omniprise — Marzo 2026*
