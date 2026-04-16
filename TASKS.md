# Griffo — Tareas pendientes

Documento vivo con el estado de todo el proyecto. Marcar con `[x]` lo
que se va completando. Cuando una tarea tiene una etiqueta `(yo)` la
hago yo sin intervención; `(cliente)` necesita algo de vos.

Última actualización: mientras se desarrolla el sitio en la rama
`claude/rebuild-web-platform-WwmFb`, deploy en
`https://web-omega-wheat-25.vercel.app`. Destino final:
`https://www.griffo.com.ar`.

---

## 🔴 Bloqueantes — definiciones abiertas

- [ ] **Login / cuenta corriente / descarga de facturas**: ¿dónde viven?
  - Opción A: en `griffo.specparts.shop` (catálogo externo) → fuera de
    alcance, cerramos el tema.
  - Opción B: en el sitio principal → necesito URLs + screenshots para
    replicar.
  - **Sin esta definición no se puede avanzar en la parte "privada" del
    sitio.**

---

## 🟢 Completado

### Infraestructura base
- [x] Scaffold Next.js 16 + TypeScript + Tailwind 4 + pnpm
- [x] Branch `claude/rebuild-web-platform-WwmFb` conectada a Vercel
- [x] Auto-deploy en cada push
- [x] Paleta corporativa Pantone (#00549F / #00ADD0 / #005B82)
- [x] Tipografía Montserrat como alternativa libre a Gotham
- [x] Logo oficial SVG subido y conectado
- [x] Slogan "IMPULSAMOS SOLUCIONES" junto al logo en el header
- [x] `site-config.ts` como fuente única de nav/contacto/redes
- [x] `CLAUDE.md` como memoria del proyecto

### Páginas completas
- [x] `/` home con banner vectorial + TrustStrip + 3 cards destacadas
- [x] `/empresa` con todas las secciones y assets reales
- [x] `/desarrollo-a-medida` con todas las secciones + videos
- [x] `/distribuidores` con filtro por provincia + tabla ordenable +
      24 distribuidores reales del Excel
- [x] `/contacto` con form + datos + mapa de Google embebido + dirección
      clickeable
- [x] `/garantia` con intro + CTA montadora + formulario de registro
- [x] `/productos` grilla básica
- [x] `/productos/maquina-montadora-de-fuelles` completo con video
- [x] `/productos/kit-de-fuelles-universales-para-homocineticas`
      (Fuelle Universal de Transmisión + sección Presentación)
- [x] `/productos/extractor-de-juntas-homocineticas`
- [x] `/productos/pinza-para-abrazaderas`
- [x] `/productos/fuelle-universal-de-direccion` (+ kit contiene)
- [x] `/productos/kit-de-proteccion-para-suspension-deportiva`
      (Fuelle de Suspensión Deportiva + kit contiene)

### Componentes compartidos
- [x] `Header.tsx` con nav + dropdowns + estado activo + mobile
- [x] `Footer.tsx` con 3 columnas + contacto + redes
- [x] `Logo.tsx` con fallback SVG
- [x] `TrustStrip.tsx` con 4 credenciales
- [x] `BuscadorPatenteBanner.tsx` (reconstrucción vectorial del banner)
- [x] `AssetImage.tsx` con modos default/fill/bare y fallback a placeholder
- [x] `AssetVideo.tsx` con fallback a placeholder
- [x] `Newsletter.tsx` con estado idle/loading/ok/error
- [x] `ContactForm.tsx` (client)
- [x] `GarantiaForm.tsx` (client)
- [x] `WhatsappFloat.tsx` botón flotante
- [x] `BackToTop.tsx`
- [x] `YouTubeEmbed.tsx` click-to-load para mejor performance
- [x] `StructuredData.tsx` (JSON-LD Schema.org)

### SEO básico
- [x] `app/sitemap.ts` dinámico
- [x] `app/robots.ts`
- [x] JSON-LD: Organization + WebSite globales
- [x] JSON-LD: LocalBusiness en /contacto
- [x] JSON-LD: Manufacturer en /empresa
- [x] JSON-LD: Product + BreadcrumbList en /productos/[slug]
- [x] Canonical URLs por página
- [x] OpenGraph per página con imagen específica
- [x] Twitter cards con summary_large_image
- [x] robots.googleBot con max-image-preview: large

### Accesibilidad (WCAG 2.1 AA)
- [x] Skip link "Saltar al contenido principal"
- [x] `:focus-visible` con outline accent
- [x] `prefers-reduced-motion` respetado
- [x] `scroll-margin-top` para anchors con header sticky
- [x] `<main id="main-content">` como landmark

### Performance — optimización de assets
- [x] Imágenes pesadas comprimidas con sharp (~11 MB ahorrados)
- [x] `sharp` como devDependency para futuras optimizaciones
- [x] Archivo huérfano `abrazadera instalada.jpg` removido
- [x] Videos YouTube con click-to-load

### Migración — preparación
- [x] `src/lib/site-url.ts` con env var `NEXT_PUBLIC_SITE_URL`
- [x] `MIGRATION.md` con plan completo paso a paso
- [x] Datos del dominio confirmados: **NIC Argentina** + **Zoho Mail**
- [x] Acceso a Google Search Console confirmado

---

## 🟡 Pendientes — puedo hacer yo sin intervención

### SEO / Performance
- [ ] **Migrar `<img>` a `next/image` donde sea low-risk** (banner del home,
      imágenes de productos con tamaño conocido). Ganancia: WebP/AVIF
      automático, responsive srcset, blur placeholder, lazy loading,
      CLS protection.
- [ ] **Bundle analyzer** configurado para detectar código muerto.
- [ ] **Preload del LCP** del home (primera imagen visible).
- [ ] **Security headers** en `next.config.ts` (X-Content-Type-Options,
      X-Frame-Options, Referrer-Policy, Permissions-Policy).
- [ ] **Image formats** AVIF + WebP en `next.config.ts`.
- [ ] **PWA manifest** (`public/manifest.webmanifest`) con theme-color
      y iconos.
- [ ] **Meta theme-color** en `layout.tsx`.

### Accesibilidad
- [ ] Review de contrastes `text-gray-600` sobre `bg-white` (borderline WCAG AA).
- [ ] Alt texts: auditoría completa.
- [ ] ARIA labels en botones icon-only.
- [ ] Tab order en menú mobile / dropdowns.

### UX / Mejoras
- [ ] **WhatsApp contextual**: prefill del mensaje según la página
      (ej. en `/productos/maquina-montadora` → "Hola, quiero consultar
      por la Máquina Montadora").
- [ ] **Mejor página 404** con sugerencias de navegación.
- [ ] **Loading states** más consistentes en los forms.
- [ ] **Error boundary** para capturar errores client-side.

### Código
- [ ] `next.config.ts` con `redirects()` skeleton para la migración.
- [ ] `CLAUDE.md` actualizado con toda la info de migración.
- [ ] Revisar unused imports / dead code.

---

## 🔵 Pendientes — necesitan tu intervención

### Conexión de servicios externos
- [ ] **Resend** (o Brevo / Mailgun) — conectar los 3 forms a email real:
  - [ ] Crear cuenta en https://resend.com (3000 emails/mes gratis)
  - [ ] Generar API key
  - [ ] Pasármela para conectar `/api/contacto`, `/api/newsletter` y
        `/api/garantia`
  - [ ] Configurar dominio verificado en Resend (necesario para enviar
        desde `@griffo.com.ar` — requiere DNS TXT records, Zoho no se
        ve afectado)
- [ ] **reCAPTCHA v3** en los forms: el sitio viejo ya tenía la key
      `6Lcms9MrAAAAAKHK-bI1K_u2Coqp9oEAve3vrpRR`. Podemos reutilizarla
      o generar una nueva desde tu cuenta de Google.
- [ ] **Analytics**: elegir una opción y crearla:
  - [ ] **Plausible** (€9/mes, privacy-first, sin cookie banner)
  - [ ] **Google Analytics 4** (gratis, cookie banner obligatorio)
- [ ] **Google Search Console**: verificar `web-omega-wheat-25.vercel.app`
      para ver cómo va el staging (opcional). Lo importante es
      verificar `griffo.com.ar` después del switch.

### Assets faltantes
- [ ] Imagen `PinzaParaAbrazadera.webp` (producto Pinza)
- [ ] Imagen `FuelleUniversalDireccion.webp` (kit contiene del Fuelle Dirección)
- [ ] Imagen `FuelledeSuspensionDeportiva2.webp` (kit contiene Suspensión)
- [ ] Imágenes de presentación del Fuelle Transmisión
      (`presentation/fuelle-chico-universal.png`,
       `presentation/fuelle-universal-grande.jpg`,
       `presentation/kit2.png`,
       `presentation/kit6.png`)
- [ ] Video `comercio-exterior.mp4` comprimido (hoy son 9.3 MB; con
      HandBrake o similar debería quedar en 2-3 MB para 720p h264)

### Contenido
- [ ] HTML / contenido real de `/novedades`, `/novedades/lanzamientos`,
      `/novedades/aplicaciones`
- [ ] HTML / contenido real de `/catalogo/download` (Descargas)
- [ ] Verificar que las 7 filas del Excel de distribuidores que se
      reasignaron heurísticamente a Tucumán sean correctas
- [ ] **Testimonios reales** de clientes (nombre + empresa + foto + frase)
      para sumar prueba social en el home

### Decisiones de negocio
- [ ] **Gotham**: ¿vale la pena comprar la licencia? ($$$). Mientras
      tanto va Montserrat.
- [ ] **Login / cuenta corriente / facturas** (ver arriba).

---

## 🟣 Migración a `www.griffo.com.ar`

### Preparación (antes del switch)
- [x] Confirmar registrador del dominio: **NIC Argentina**
- [x] Confirmar proveedor de email: **Zoho Mail** (⚠️ MX + SPF + DKIM
      + DMARC en DNS — no tocar al cambiar los A/CNAME)
- [x] Confirmar acceso a Google Search Console
- [ ] **Inventariar URLs del sitio viejo**: exportar desde Google Search
      Console (Informe de cobertura → Páginas → Exportar)
- [ ] **Comparar URLs del viejo vs. nuevo** y armar el mapa de redirects 301
- [ ] **Backup del sitio viejo completo** (código + base de datos + archivos)
- [ ] **Revisar registros DNS actuales** en NIC Argentina:
  - Anotar los MX de Zoho (no tocar)
  - Anotar TXT de verificación (SPF, DKIM, DMARC — no tocar)
  - Anotar subdominios activos
- [ ] **Configurar redirects 301** en `next.config.ts` con el mapa
- [ ] **Crear env var `NEXT_PUBLIC_SITE_URL`** en Vercel (Production scope)
      con valor `https://www.griffo.com.ar` (sin aplicar todavía —
      aplicar el día del switch)

### Día del switch
- [ ] Agregar `griffo.com.ar` y `www.griffo.com.ar` en Vercel
      (Settings → Domains)
- [ ] Cambiar registros DNS en NIC Argentina:
  - [ ] Registro `A` del apex `griffo.com.ar` → IP de Vercel
  - [ ] Registro `CNAME` de `www` → `cname.vercel-dns.com`
  - [ ] ⚠️ **NO tocar** los MX de Zoho
  - [ ] ⚠️ **NO tocar** los TXT de SPF/DKIM/DMARC de Zoho
- [ ] Esperar propagación DNS (1-24 horas, verificar con `whatsmydns.net`)
- [ ] Verificar SSL activo (Vercel lo emite automáticamente)
- [ ] Verificar que email de Zoho sigue funcionando (test enviar + recibir)
- [ ] Verificar que todos los redirects 301 funcionen
- [ ] Aplicar env var `NEXT_PUBLIC_SITE_URL` → Production y redeploy

### Post-switch (primeras 48 hs)
- [ ] Agregar propiedad `https://www.griffo.com.ar` en Google Search
      Console
- [ ] Enviar sitemap: `https://www.griffo.com.ar/sitemap.xml`
- [ ] Agregar en Bing Webmaster Tools (importar desde GSC)
- [ ] Actualizar URL en redes sociales: Facebook, YouTube
- [ ] Actualizar enlaces en Mercado Libre

### Monitoreo (primeras 4 semanas)
- [ ] Revisar errores de crawl en Search Console cada 3 días
- [ ] Agregar redirects nuevos si aparecen 404s
- [ ] Monitorear caída de tráfico orgánico (meta: <10% caída temporal,
      recuperación en 2-4 semanas)
- [ ] Core Web Vitals en el dominio real (PageSpeed Insights)

### Rollback (plan B)
- [ ] Revertir DNS al server viejo si algo crítico sale mal
- [ ] Mantener el sitio viejo funcionando por 1-2 meses como respaldo

---

## 📊 Métricas objetivo (después del switch)

Estos son los números a los que apuntamos al estar en producción:

- **Lighthouse Performance**: ≥ 90
- **Lighthouse Accessibility**: ≥ 95
- **Lighthouse Best Practices**: ≥ 95
- **Lighthouse SEO**: 100
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1
- **INP** (Interaction to Next Paint): < 200ms
- **First Load JS**: < 200 KB por ruta
- **Tráfico orgánico**: no caer más del 10% en las 2 primeras semanas,
  recuperación completa en 4 semanas
