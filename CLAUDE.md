@AGENTS.md

# Griffo — réplica y mejora del sitio institucional

Cliente: **Griffo SA** (griffodiego-jpg en GitHub), fabricante argentino de
piezas de caucho moldeado desde 1968. La cliente se comunica en **español
argentino** — respondele en el mismo registro.

**Objetivo del proyecto**: replicar el sitio público actual
(`app-griffo.n0mupxh3sq-zqy3j8n516kg.p.temp-site.link`) y mejorarlo. **NO** se
replica `Novedades` ni `Catálogo` (éste último vive en `griffo.specparts.shop`,
externo). El resto sí.

## Entorno

- **Branch de desarrollo**: `claude/rebuild-web-platform-WwmFb` (todos los
  commits van acá, nunca a main).
- **Deploy staging**: Vercel auto-deploya cada push → https://web-omega-wheat-25.vercel.app
- **Dominio final**: `https://www.griffo.com.ar` (migración pendiente,
  ver `MIGRATION.md` en la raíz del repo para el plan completo).
- **Registrador del dominio**: **NIC Argentina**.
- **Email corporativo**: **Zoho Mail** (⚠️ al cambiar DNS para la
  migración, NO TOCAR los registros MX ni los TXT de SPF/DKIM/DMARC
  de Zoho — solo cambiar los A/CNAME para apuntar a Vercel).
- **Google Search Console**: la cliente tiene acceso al del sitio
  actual — usarlo para inventariar URLs antes del switch y armar el
  mapa de redirects 301 en `next.config.ts`.
- **`SITE_URL`** se controla con la env var `NEXT_PUBLIC_SITE_URL`
  (default: staging). En el día del switch: definir la variable en Vercel
  (Production scope) apuntando a `https://www.griffo.com.ar` y todo
  (sitemap, robots, JSON-LD, canonicals, OpenGraph) se actualiza solo
  sin cambios de código. Ver `src/lib/site-url.ts`.
- **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + pnpm.
- **Fuente**: **Montserrat** (Google Fonts, cargada vía `<link>` en
  `layout.tsx`, no `next/font/google` porque el sandbox bloquea Google Fonts
  durante el build). Montserrat es el sustituto libre de **Gotham**, que es la
  tipografía oficial del catálogo impreso pero es comercial/paga. Si en el
  futuro compra la licencia de Gotham, los `.woff2` van en `/public/fonts/` y
  se declaran con `@font-face` en `globals.css`.

## Paleta corporativa (Pantone oficial)

- Primary: **#00549F** (Pantone 2945 C) — azul principal, el del logo
- Accent: **#00ADD0** (Pantone 312 C) — celeste claro, para detalles/divisores
- Dark: **#005B82** (Pantone 308 C) — azul oscuro, hover/footer

Definidas en `globals.css` como `--color-primary-value`, `--color-accent-value`,
`--color-primary-dark`. Exportadas a Tailwind como `bg-primary`, `text-accent`,
`bg-primary-dark`, etc.

## Convenciones de diseño

1. **Sin título de página en el body**. El navbar destaca el item activo con
   `border-b-2 border-accent font-black` — eso sustituye al título tradicional.
   Usa `usePathname()` + `isItemActive()` en `components/Header.tsx`.
2. **Header sticky**, no fixed. No hay TopBar — se sacó porque la garantía ya
   aparece en el TrustStrip de la home.
3. **Logo + tagline** forman una unidad. El SVG real (`public/header-icon.svg`)
   va al lado del texto "IMPULSAMOS / SOLUCIONES" con border-l separador.
   `components/Logo.tsx` intenta `/header-icon.svg` y cae a un SVG reconstruido
   si falla.
4. **Textos negros corporativos**: `#0a2b3d` (navy muy oscuro) en vez de `#000`
   puro para los headings.
5. **Breadcrumbs** solo donde importa (ej. `/productos/[slug]`) — eyebrow
   pequeño `text-xs uppercase tracking-wide text-gray-500`.

## Componentes clave

- `components/Header.tsx` — sticky, nav con dropdowns, estado activo.
- `components/Footer.tsx` — 3 columnas de nav + dirección + redes.
- `components/Logo.tsx` — real SVG con fallback.
- `components/TopBar.tsx` — existe pero **no se usa** en layout actual (sacada
  a pedido de la cliente).
- `components/TrustStrip.tsx` — franja de 4 credenciales (Garantía, ISO 1968,
  50+). Usa inline SVG icons. Se muestra en la home entre el banner y las cards.
- `components/BuscadorPatenteBanner.tsx` — banner principal de la home, SVG
  puro (no imagen), responsive por CSS. Reconstrucción del banner del sitio
  original.
- `components/AssetImage.tsx` — `<img>` con fallback a placeholder si 404.
  Modos: default (w-full h-auto), `fill` (absolute inset-0 object-cover),
  `bare` (sin clases default — para iconos y logos con tamaño fijo).
- `components/AssetVideo.tsx` — `<video>` con fallback a placeholder con botón
  de play.
- `components/Newsletter.tsx` — form con estado idle/loading/ok/error.
- `components/WhatsappFloat.tsx` — botón flotante con panel desplegable.
- `components/ContactForm.tsx` — form de contacto (client).
- `components/PageHero.tsx` — ya solo exporta `ComingSoon` (el hero original
  fue removido). Se usa en páginas stub.

## Datos

- `src/lib/site-config.ts` — nav, contacto, redes, URLs externas. Fuente única.
- `src/lib/assets.ts` — paths de assets agrupados por página. Cambiar acá para
  mover archivos.
- `src/data/distribuidores.ts` — base de distribuidores. Se regenera del
  CSV `src/data/Distribuidores.csv` con el script Python que parsé una vez.
  Schema: `{ nombre, telefono, email, provincia, provinciasFiltro[] }`. El
  filtro de provincia usa `provinciasFiltro.includes(...)` porque un
  distribuidor entrega a varias provincias.

## Estado de las páginas

- `/` home: **completa**. Banner vectorial + TrustStrip + 3 cards destacadas.
- `/empresa`: **completa** con contenido real del sitio original. Hero 2 cols,
  sticky nav interna, 5 secciones (Historia, Segmentos, Misión, Comercio,
  Compromiso). Assets locales en `public/images/empresa/`.
- `/desarrollo-a-medida`: **completa** estructura. Faltan assets reales (21
  archivos en `public/images/desarrollo-a-medida/`, `public/videos/`,
  `public/clientes/`). Mientras no estén, placeholders.
- `/distribuidores`: **completa y funcional**. Selector de provincia con
  auto-filter, tabla ordenable por columna (localeCompare 'es'), contador
  arriba. 24 distribuidores únicos con 25 provincias de filtro.
- `/contacto`: **funcional** (form + datos). Endpoint stub en
  `/api/contacto/route.ts`. TODO: conectar con email real (Brevo/Mailgun/SMTP).
- `/productos`: grilla básica con 7 productos destacados del siteConfig.
  `/productos/[slug]`: stub con breadcrumb.
- `/garantia`, `/catalogo/download` (Descargas), `/novedades/*`: **stubs**
  con ComingSoon. Esperan HTML del sitio original.

## Assets subidos al repo (situación actual)

- `public/header-icon.svg` — logo real.
- `public/images/empresa/*` — 6 archivos reales.
- `public/products/*` — 3 cards del home (producto/catalogo/lanzamiento).
- `public/images/desarrollo-a-medida/.gitkeep` — carpeta lista, sin archivos.
- `public/videos/.gitkeep` — carpeta lista, sin archivos (tecnologia.mp4,
  medida.mp4 pendientes).
- `public/clientes/.gitkeep` — carpeta lista, sin archivos (7 logos pendientes).

## Flujo de trabajo

- La cliente sube archivos (imágenes, Excel, logos) **via GitHub web UI**
  directamente a la rama. No usa terminal.
- Para Excel/CSV de datos: se parsea con Python (latin-1 → UTF-8), se
  deduplica, y se genera el `.ts` correspondiente. El CSV queda en el repo
  como fuente de verdad.
- El sandbox de Claude **no puede acceder al servidor viejo**
  (`app-griffo.n0mupxh3sq-zqy3j8n516kg.p.temp-site.link`) por firewall de
  egress. Cualquier asset se baja manualmente del sitio por la cliente y se
  sube al repo. Hotlinks al sitio viejo tampoco funcionan en el navegador
  por mixed content (HTTP → HTTPS).
- **Google Fonts** sí se puede usar vía `<link>` (carga en el navegador del
  usuario, no en el build). `next/font/google` falla.

## SEO / Performance / a11y (estado actual)

- **Sitemap**: `app/sitemap.ts` dinámico (home + todas las institucionales
  + los 7 productos destacados expandidos del nav).
- **Robots**: `app/robots.ts` apunta al sitemap, bloquea /api/.
- **JSON-LD estructurado (Schema.org)**: componentes en
  `components/StructuredData.tsx`. Se usan así:
  * `OrganizationJsonLd` + `WebSiteJsonLd` en layout (globales)
  * `LocalBusinessJsonLd` en /contacto
  * `ManufacturerJsonLd` en /empresa
  * `ProductJsonLd` + `BreadcrumbJsonLd` en /productos/[slug]
- **Imágenes**: las pesadas se comprimieron con sharp (mozjpeg q82 +
  png palette + resize max 1600px). Reducción total ~11 MB. Para
  optimizar nuevas subidas: pedirme que corra el mismo script.
- **A11y**: skip link en layout (`#main-content`), :focus-visible con
  outline accent, scroll-margin-top global, prefers-reduced-motion.
- **Pendiente**: video `comercio-exterior.mp4` (9 MB) — necesita ffmpeg
  o compresión desde HandBrake por la cliente. Forms reales (Resend),
  Analytics, Search Console — requieren input de la cliente.

## Pendientes y decisiones abiertas

1. **🚨 Login / cuenta corriente / descarga de facturas**: en la primera
   conversación la cliente dijo que quería replicar estas features, pero el
   sitio público no las tiene. **Sigue sin aclarar si están en
   `griffo.specparts.shop` (catálogo externo, fuera de alcance) o si son una
   feature nueva a construir**. Si vuelve a pedir "seguimos con la plata del
   proyecto", preguntar primero.
2. **Conectar `/api/contacto` y `/api/newsletter`** a un proveedor real (Brevo,
   Mailgun, SMTP) cuando la cliente tenga una cuenta.
3. **Optimizar imágenes**: varios archivos de empresa pesan 2-9 MB. En algún
   momento pasarlos por compresor (TinyPNG, squoosh) y bajar el peso.
4. **Página de Garantía, Descargas, Novedades**: esperan HTML del sitio viejo.
5. **Data del Excel de distribuidores**: hay 7 filas con `Provincia para filtro
   = "Distribuidores"` que se reasignaron heurísticamente a Tucumán. Verificar.

## Git / commits

- Siempre commit y push al final de cada cambio funcional. Vercel auto-deploya.
- Commit messages en español, primera línea < 72 chars, descriptivos del
  "por qué" más que el "qué".
- Nunca `--no-verify`, nunca `--amend`, nunca force-push.
- Para regenerar `distribuidores.ts`: correr el script Python desde memoria
  (está documentado arriba) o pedírselo a Claude con el CSV actualizado.
