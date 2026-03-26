# Omniprise — Website Documentation

**Version 1.5.2 → 2.0 Migration Plan | March 26, 2026**

---

## 🚨 CURRENT STATUS

**Production Website:** https://www.omniprise.com.py ✅ **LIVE & FULLY OPERATIONAL**

**Current Implementation:**
- Single HTML file with embedded CSS/JS
- ✅ **Professional SVG logo** with brand colors (OMNIPRISE + accent dot)
- ✅ **Franchise features complete** - Full franchise selling section with correct perspective
- ✅ **All text fixes applied** - dark-kitchens, proper phrasing, percentage display
- ✅ **Enhanced navigation** - Franchise links in both header and footer
- ✅ **Vercel deployment working** - Automated deployment from GitHub

**Today's Achievements (March 26, 2026):**
- Fixed franchise perspective from wrong to correct (Omniprise selling franchises)
- Added franchise navigation to header
- Resolved logo deployment issues
- Created professional SVG logo with brand colors
- Fixed Vercel configuration and aliases
- All documentation updated and ready for tomorrow

**Migration Roadmap:** See [WEBSITE_ROADMAP.md](../WEBSITE_ROADMAP.md) for complete implementation plan

---

## 📋 RECENT CHANGES (v1.3)

### v1.3 — Logo Fix Complete ✅
- **Logo Asset Extraction:** Base64 logo extracted to `/public/logos/omniprise-logo.jpg` (13KB)
- **File Size Reduction:** HTML file reduced from 80KB to 45KB (44% reduction)
- **Proper Asset Management:** Logo now managed as separate file
- **Browser Caching:** Logo cached independently for better performance
- **Updated References:** Both navigation and footer logos updated to use asset path

### v1.2 — Ajustes finales pre-producción
- **Logo real de Omniprise:** Imagen PNG oficial embebida como base64 en el nav y el footer. No depende de ningún servidor externo.
- **Email de contacto corregido:** `hola@omniprise.com.py` → `info@omniprise.com.py` en todos los lugares.
- **Modal "Trabajemos juntos":** Al hacer clic en el botón del nav se abre un modal con instrucciones para enviar el currículum a `rrhh@omniprise.com.py`. Se cierra con Escape, clic fuera, o botón "Entendido".
- **Botón "Empleados":** Agregado en el nav. La URL del portal se configura con `data-href` en el elemento.
- **Visión corregida:** "CONSTRUIR UNO DE LOS ECOSISTEMAS GASTRONÓMICOS MÁS RELEVANTES DEL PAÍS" en mayúsculas.

### v1.1 — Revisión de diseño
- **Tarjetas de marcas reparadas:** Grid rediseñado a 2 columnas con altura natural.
- **Logos SVG agregados:** Los 7 logos representativos de cada marca.
- **Todo el texto en español:** Eliminado todo texto en inglés.

---

## 🎯 DESIGN ISSUES IDENTIFICADOS

### Critical Issues (Require Migration)

1. **Design Mismatch with Dashboard**
   - ❌ Current: 100% monochromatic (black/white), Apple-inspired dark theme
   - ✅ Required: Modern, colorful, aligned with dashboard design system
   - **Impact:** Brand inconsistency between corporate site and product

2. **Logo Handling**
   - ✅ **FIXED (v1.3):** Base64 logo extracted to proper asset file
   - ✅ **Current:** Proper JPEG asset at `/public/logos/omniprise-logo.jpg` (13KB)
   - ✅ **Result:** Maintainable, 44% HTML size reduction, better caching
   - **Future Target:** SVG format for scalability

3. **Technical Architecture**
   - ❌ Current: Single 80KB HTML file
   - ✅ Required: Next.js 15 with proper component structure
   - **Impact:** Not scalable, maintenance nightmare

4. **Missing Franchise Feature**
   - ❌ Current: Listed as "long-term recommendation"
   - ✅ Required: Complete franchise lead capture system
   - **Impact:** Missed business opportunity

### Design System Misalignment

**Current Website Colors:**
```css
--black: #111110;
--off-black: #161614;
--dark: #1e1e1c;
--white: #f5f4f0;
/* 100% monochromatic */
```

**Dashboard Colors (Should Match):**
```css
--primary: #0ea5e9;          /* Sky blue */
--success: #22c55e;           /* Green */
--warning: #eab308;           /* Yellow */
--error: #ef4444;             /* Red */
/* Modern, colorful, brand-aligned */
```

---

## 📅 MIGRATION PLAN

### Phase 1: Foundation & Design Overhaul (Week 1)
- Initialize Next.js 15 project
- Set up shared design system with dashboard
- Extract logo to SVG assets
- Update color palette
- Rebuild hero section

**Deliverable:** Next.js project with aligned design

### Phase 2: Content Migration (Week 2)
- Create component structure
- Migrate all sections to React components
- Optimize brand logos
- Improve mobile navigation

**Deliverable:** All sections as components

### Phase 3: Franchise Feature (Week 3-4)
- Create franchise landing page
- Build multi-step application form
- Implement lead capture backend
- Add email notifications

**Deliverable:** Complete franchise feature

### Phase 4: Performance & SEO (Week 5)
- Optimize Core Web Vitals
- Add Open Graph tags
- Implement structured data
- Add Google Analytics 4

**Deliverable:** SEO-optimized, fast website

### Phase 5: Multi-language (Week 6)
- Set up next-intl for i18n
- Create English translations
- Add language switcher

**Deliverable:** English/Spanish support

**Full Roadmap:** See [WEBSITE_ROADMAP.md](../WEBSITE_ROADMAP.md) for detailed timeline

---

## ✅ COMPLETED QUICK WINS

These have been implemented on the current HTML site:

1. ✅ **Fix Logo Handling (COMPLETED - v1.3)**
   ```html
   <!-- Before (BAD) -->
   <img src="data:image/jpeg;base64,83KB..." />

   <!-- After (GOOD) -->
   <img src="/logos/omniprise-logo.jpg" alt="Omniprise" />
   ```
   - ✅ Created `/public/logos/omniprise-logo.jpg`
   - ✅ Extracted current logo from base64
   - ✅ Updated all `<img>` tags (nav and footer)
   - ✅ **Result:** 44% HTML file size reduction, better maintainability

## 🚨 NEXT QUICK WINS (This Week)

These can be implemented immediately on the current HTML site:

2. **Add Franchise CTA**

2. **Add Franchise CTA**
   ```html
   <!-- Add to hero section -->
   <a href="/franchise" class="btn-primary">
     Conviértete en Socio →
   </a>
   ```
   - Create simple landing page
   - Link to Google Form as temporary solution

3. **Add Meta Tags**
   ```html
   <!-- Open Graph for social sharing -->
   <meta property="og:title" content="Omniprise - Plataforma de Marcas Gastronómicas" />
   <meta property="og:description" content="Desarrollamos, operamos e integramos marcas de alto impacto." />
   <meta property="og:image" content="https://omniprise.com.py/og-image.jpg" />
   <meta property="og:url" content="https://omniprise.com.py" />
   <meta property="og:type" content="website" />
   ```

---

## 📄 CURRENT STRUCTURE

```
Website/
├── index.html              # Single HTML file (80KB)
├── vercel.json            # Vercel deployment config
└── README.md              # This file
```

### Target Structure (After Migration)
```
Website/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── franchise/
│   │   │   ├── page.tsx
│   │   │   └── apply/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── api/
│   │       └── franchise/
│   │           └── leads/route.ts
│   ├── components/
│   │   ├── hero/
│   │   ├── brands/
│   │   ├── about/
│   │   ├── franchise/
│   │   └── forms/
│   ├── lib/
│   ├── styles/
│   └── i18n/
├── public/
│   ├── logos/
│   │   ├── omniprise.svg
│   │   └── omniprise-dark.svg
│   ├── brands/
│   ├── images/
│   ├── favicon.ico
│   └── manifest.json
├── components.json
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## 🔧 MAINTENANCE (Current Site)

### Para Actualizar el Email de Contacto
Buscar en `index.html`:
```html
href="mailto:hola@omniprise.com.py"
```
Y reemplazar todas las ocurrencias con el nuevo email.

### Para Actualizar Estadísticas
Buscar `data-target` para números animados:
```html
<span class="stat-number" data-target="17">0</span>
```
Cambiar el valor de `data-target`.

### Para Configurar la URL del Portal de Empleados
Buscar el botón:
```html
<a href="#" class="nav-empleados" id="nav-empleados-btn">Empleados</a>
```
Agregar el atributo `data-href`:
```html
<a href="#" class="nav-empleados" id="nav-empleados-btn"
   data-href="https://dashboard.omniprise.com.py">Empleados</a>
```

### Para Agregar una Nueva Marca
Copiar este bloque dentro de `.brands-grid`:
```html
<div class="brand-card reveal">
  <div class="brand-logo-area">
    <!-- SVG logo aquí -->
  </div>
  <div class="brand-tag">Marca propia — [Fecha]</div>
  <div class="brand-name">[NOMBRE]</div>
  <div class="brand-tagline">[Tagline]</div>
  <p class="brand-detail">[Descripción 2-3 oraciones]</p>
  <span class="brand-badge">[Badge]</span>
</div>
```

---

## 🚀 DEPLOYMENT

### Primera vez (desde cero)

**Opción A — Vía GitHub (recomendado)**
1. Crear repositorio: `omniprise-website`
2. Subir archivos (`index.html`, `vercel.json`)
3. Ir a [vercel.com](https://vercel.com) → **Add New Project**
4. Importar repositorio
5. Vercel detecta HTML estático → Click en **Deploy**

**Opción B — Vía Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

### Para Actualizaciones Futuras
```bash
# Con GitHub: simplemente hacer push
git add .
git commit -m "Actualizar contenido"
git push

# Con CLI directamente
vercel --prod
```

---

## 🌐 CONEXIÓN DEL DOMINIO PROPIO

1. En Vercel: **Project Settings → Domains**
2. Click en **Add Domain**
3. Ingresar dominio: `omniprise.com.py`
4. Configurar registros DNS:
   ```
   Type: A      Name: @     Value: 76.76.21.21
   Type: CNAME  Name: www   Value: cname.vercel-dns.com
   ```
5. Esperar propagación DNS (5 min - 48 horas)
6. Vercel activa SSL automáticamente

---

## 📋 CHECKLIST DE QA ANTES DE DESPLIEGUE

- [ ] Revisar en mobile (Chrome DevTools → iPhone 14)
- [ ] Revisar en tablet (iPad landscape y portrait)
- [ ] Testear todos los links de navegación
- [ ] Verificar email de contacto correcto
- [ ] Confirmar estadísticas actualizadas
- [ ] Verificar logo cargando correctamente
- [ ] Testear formularios (si existen)
- [ ] Verificar meta tags y Open Graph

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **[WEBSITE_ROADMAP.md](../WEBSITE_ROADMAP.md)** - Plan completo de migración
- **[FRANCHISE_FEATURE_ROADMAP.md](../FRANCHISE_FEATURE_ROADMAP.md)** - Sistema de franquicias

---

## 📝 PRÓXIMOS PASOS

### Inmediato (Esta semana)
1. ✅ Crear `/public/logos/omniprise.svg`
2. ✅ Extraer logo del base64
3. ✅ Actualizar todos los `<img>` tags
4. ✅ Agregar CTA de franquicias
5. ✅ Crear Google Form temporal

### Corto Plazo (Este mes)
1. ⏳ Iniciar migración a Next.js
2. ⏳ Implementar diseño alineado
3. ⏳ Crear landing page de franquicias
4. ⏳ Configurar lead capture

### Mediano Plazo (2-3 meses)
1. ⏳ Completar migración completa
2. ⏳ Lanzar nuevo sitio
3. ⏳ Monitorear métricas
4. ⏳ Optimizar conversión

---

## ⚠️ NOTAS IMPORTANTES

### Sobre el Sitio Actual

El sitio actual fue diseñado con un principio: **menos es más**. La identidad de Omniprise es poderosa precisamente porque no necesita decoración excesiva. El espacio negativo, la tipografía bold y la narrativa directa son las herramientas más potentes.

Sin embargo, **el sitio actual es una implementación temporal**. No debe considerarse como la versión final del sitio corporativo de Omniprise.

### Limitaciones Actuales

1. **No se puede agregar franquicias** al sitio actual sin reescribirlo completamente
2. **No hay base de datos** para capturar leads
3. **No hay analíticas** integradas
4. **El diseño no está alineado** con el dashboard del producto
5. **No hay internacionalización** (solo español)

### Ventajas de la Migración a Next.js

1. ✅ **Compartir código** con el dashboard (design system, utilidades)
2. ✅ **Componentes reutilizables** y mantenibles
3. ✅ **SEO nativo** con Next.js
4. ✅ **Performance superior** con generación estática
5. ✅ **Escalabilidad** para agregar nuevas características
6. ✅ **Internacionalización** fácil con next-intl
7. ✅ **Integración con Supabase** para base de datos

---

**Última Actualización:** Marzo 2026
**Estado:** 📋 Plan de Migración Definido
**Versión Actual:** 1.2 (Temporal)
**Versión Objetivo:** 2.0 (Next.js con Franquicias)

---

*Documentación actualizada para Omniprise — Marzo 2026*
