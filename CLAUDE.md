@AGENTS.md

# Griffo — réplica y mejora del sitio institucional

Cliente: **Griffo SA** (griffodiego-jpg en GitHub), fabricante argentino de
piezas de caucho moldeado desde 1968. La cliente se comunica en **español
argentino** — respondele en el mismo registro.

**Objetivo del proyecto**: replicar el sitio público actual
(`app-griffo.n0mupxh3sq-zqy3j8n516kg.p.temp-site.link`) y mejorarlo. `Novedades`
por ahora queda pendiente. **El catálogo se construyó nativo en `/catalogo`**
(reemplaza el externo `griffo.specparts.shop`), consumiendo la misma API de
SpecParts que ya usa `app.griffo.com.ar`. Ver sección "Catálogo de productos".

## Coordinación multi-sesión

Hay varias sesiones de Claude Code trabajando en paralelo sobre esta rama
(`claude/new-website-2026-g1UGd`). Pautas para evitar pisarse:

- **Siempre hacer `git pull --rebase origin claude/new-website-2026-g1UGd`
  antes de editar** y antes de cada push — así se detectan cambios de
  las otras sesiones.
- Los conflictos típicos son en `src/app/admin/layout.tsx` (sidebar),
  `CLAUDE.md` y `next.config.ts`. Resolver manteniendo ambos aportes.
- **La memoria canónica entre sesiones es este archivo (`CLAUDE.md`)**.
  Al cerrar una feature grande, actualizar la sección relevante acá
  para que la siguiente sesión arranque con el contexto correcto.
- Commit messages en español, primera línea < 72 chars. Ver sección
  "Git / commits".

## Entorno

- **Branch de desarrollo actual**: `claude/new-website-2026-g1UGd` (todos los
  commits van acá, nunca a main). La rama anterior `claude/rebuild-web-platform-WwmFb`
  sigue existiendo y es la que está en Production de Vercel por ahora.
- **Deploy staging Production** (rama vieja): https://web-omega-wheat-25.vercel.app
- **Deploy staging Preview** (rama actual, URL que se usa para testear):
  `https://web-git-claude-new-website-20-1a779f-griffodiego-8451s-projects.vercel.app`
  — se actualiza sola con cada push a la branch.
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

- `/` home: **completa**. Banner vectorial clickeable a /catalogo +
  TrustStrip + 3 cards destacadas.
- `/empresa`: **completa** con contenido real del sitio original.
- `/desarrollo-a-medida`: **completa + formulario de consulta**
  (DesarrolloForm → `/api/desarrollo`). Algunos assets pendientes.
- `/distribuidores`: **completa y funcional**.
- `/contacto`: **funcional + Resend conectado**. Endpoint
  `/api/contacto/route.ts` manda mail y persiste lead en Redis.
- `/productos`: grilla con 7 destacados. `/productos/[slug]`: landing
  rica con video/beneficios/presentación/CTA. Contenido en
  `src/data/productos.ts`.
- `/catalogo`: **funcional y completo**. Ver sección "Catálogo de productos".
- `/catalogo/download`: **funcional**. Descargas con scan de
  `/public/downloads` + override por Redis (subidas desde admin via
  Vercel Blob). Forms de Material para catalogar (banco imágenes,
  base de datos) capturan lead antes de dar URL.
- `/garantia`, `/novedades/*`: **stubs** con ComingSoon. Esperan HTML
  del sitio viejo.

## Catálogo de productos (SpecParts)

El catálogo vive en `/catalogo` y es una reimplementación nativa del sitio
externo `griffo.specparts.shop`. Consume la misma API que `app.griffo.com.ar`
(doc completa en `reference/arquitectura-app-griffo.md`).

### Infra de datos

- **API**: SpecParts (`external-api.specparts.ai`). Auth OAuth
  client_credentials (POST a `auth.specparts.ai/oauth`).
- **Env vars** (Vercel → Settings → Environment Variables, los 3 scopes):
  `SPECPARTS_CLIENT_ID`, `SPECPARTS_CLIENT_SECRET`. Sin esto, `/catalogo`
  renderiza un fallback amigable y el sitemap degrada a rutas estáticas.
- **Cliente HTTP**: `src/lib/api/specparts.ts` — server-only.

### ⚠️ Regla sagrada del proxy

Para GET a `/part/list` (con `brand[]=GRIFFO`) y otros endpoints con query
params con brackets, usar **`https` nativo de Node + `zlib.gunzip`**, NUNCA
`fetch()`. `fetch()` re-codifica `brand[]` → `brand%5B%5D` y SpecParts devuelve
~5 productos en lugar de ~370. `fetch()` sí se puede usar para el POST de auth
(no hay brackets en el body).

### Cache

- **Server**: cache en memoria del proceso (30 min) con dedup via
  promise in-flight. Persiste mientras la instancia Vercel esté warm.
- **CDN**: `next/image` + `remotePatterns` para el S3 de SpecParts.
  Vercel convierte JPG → AVIF/WebP y cachea 30 días. Pre-warming
  manual en `/admin/cache` (dispara requests a todas las imágenes).

### Páginas y rutas

- `/catalogo` — server component, precarga ~370 productos, ISR 30 min.
- `/catalogo/[slug]` — SSG on-demand (`dynamicParams = true`). Si el slug
  corresponde a un destacado, `redirect()` server-side a `/productos/[slug]`.
- `/api/catalog/products` — devuelve productos con `_searchText` pre-computado.
- `/api/catalog/plate?plate=XXX` — identifica vehículo por patente.

### Búsqueda — 5 tabs

1. **Palabra**: multi-word AND, accent-insensitive (`normalizeSearch`).
   Índice `_searchText` se construye **client-side** con `indexProducts()`
   al montar (ahorra ~150KB en el payload inicial). Concatena código,
   descripción, producto, categoría, slug, vehículos, atributos, etc.
2. **Patente**: llama `/api/catalog/plate` → filtra por `brand` + `master_model`
   o `model`.
3. **Vehículo**: selects cascada Marca → Modelo → Año. Excluye AGRALE, IVECO,
   UNIVERSAL (no se venden en AR).
4. **Código**: substring case-insensitive sobre `product.code`.
5. **Medidas**: tabla sorteable con 3 sub-tipos (Dirección = FUELLE CREMALLERA;
   Transmisión = KIT FUELLE SEMIEJE agrupado por código base; Tope = TOPE
   AMORTIGUADOR). Sin sidebar de filtros.

### Filtros facetados (sidebar)

6 grupos, estilo Mercado Libre:

| Grupo | Fuente | Notas |
|---|---|---|
| Línea | `product.category` | Suspensión / Dirección / Transmisión |
| Tipo | `product.product` + `is_kit` | Clasificado en Kit / Fuelle / Tope (prioridad: Kit > Fuelle > Tope). Productos que no matchean (ej. Máquina Montadora) no se filtran cuando hay tipo activo. |
| Ubicación | attribute cuyo name incluye "ubicaci" | Valores dinámicos (ej. LADO RUEDA, LADO CAJA). |
| Lado | attribute cuyo name incluye "lado" | "Izquierdo y/o Derecho (según vehículo)" NO aparece como opción — se expande para que Izquierdo y Derecho incluyan esos productos. |
| Marca | `vehicles[].brand` | Top 5 alfabético + "Ver N más" + buscador. Excluye AGRALE/IVECO/UNIVERSAL. |
| Modelo | `vehicles[].master_model` | Depende de Marca: solo aparece si hay marca(s) tildada(s). Top 5 + "Ver más" + buscador. |

**Comportamiento**:

- Multi-select con **OR interno** dentro de cada grupo, **AND entre grupos**.
- Contadores dinámicos con **exclusión de la propia facet**.
- Opciones con count 0 se muestran deshabilitadas (no se ocultan).
- **Estado persistente en URL** (`?linea=...&marca=FORD,CHEVROLET&tab=vehiculo`):
  shareable, back/forward del browser lo restaura. Debounce 200ms para
  text inputs. Ver `readStateFromParams`/`buildQueryString` en
  `CatalogSearch.tsx`.
- Tab Medidas: sidebar **oculto** (la tabla tiene su propia dinámica).
- Mobile: drawer con botón "Filtros" y badge del count activo.

### ProductCard

- Imagen cuadrada (`next/image`), código azul grande, producto uppercase.
- **Descripción** = vehículos agrupados por marca sin motor, marca en
  negrita: `**FORD** (KUGA - RANGER), **CHEVROLET** (S-10)`.
- Botón "Ver N vehículos compatibles" abre modal `VehiclesModal` con
  lista detallada (marca → modelo + versión + años).
- Ubicación y Lado con helper compartido `getDisplayApplication` —
  aplica reglas por línea (ver más abajo).
- Badge **DESTACADO** si el código matchea un destacado; el link va
  a `/productos/[slug-destacado]` en vez de `/catalogo/[slug]`.
- **Toda la card es clickeable** (navega al detalle). Los botones
  internos (modal, MercadoLibre) hacen `stopPropagation`.
- Pie: `Ver detalle →` a la izquierda + botón compacto amarillo
  `MercadoLibre ↗` a la derecha si hay link en `product.links[]`.

### Reglas por línea (helper `getDisplayApplication`)

`src/lib/catalog/display.ts`. Aplica tanto en ProductCard como en
detalle del producto:

- **Suspensión**: oculta "Lado IZQUIERDO/DERECHO" (no aporta — son
  simétricos). DELANTERO/TRASERO sí quedan.
- **Dirección**: promueve "Lado IZQUIERDO/DERECHO" a "Ubicación"
  (es el dato principal).
- **Transmisión**: en "Ubicación" sólo deja LADO CAJA / LADO RUEDA.

### Detalle de producto (`/catalogo/[slug]`)

Layout por prioridad de info (de más a menos relevante):

1. Breadcrumb + categoría (badge chico)
2. Código grande + producto
3. Pills compactos de Ubicación/Lado (con reglas por línea aplicadas)
4. CTA **MercadoLibre** (arriba del fold)
5. Tabla compacta de medidas (divide-y, no cajas grandes)
6. Componentes del kit (si aplica) — inline
7. Vehículos compatibles — **masonry CSS columns** (cada card
   ocupa solo el alto que necesita), ordenados por cantidad desc

### Productos destacados → landing rica

Los 7 destacados con landing propia en `/productos/[slug]` tienen su mapeo
con SpecParts en `src/data/featured-products.ts`:

| Código(s) SpecParts | Slug destacado |
|---|---|
| `54-122-03` | `maquina-montadora-de-fuelles` |
| `950-32B`, `950-32`, `951-32B`, `951-32` | `kit-de-fuelles-universales-para-homocineticas` |
| `54-225-00` | `extractor-de-juntas-homocineticas` |
| `54-224-05` | `pinza-para-abrazaderas` |
| `955-32` | `fuelle-universal-de-direccion` |
| `953-35` | `kit-de-proteccion-para-suspension-deportiva` |
| `AB 25-40`, `AB 40-122` | `abrazaderas-universales` |

Comparación normalizada (uppercase, sin espacios). Para agregar un destacado
nuevo: editás `productosDetalle` en `src/data/productos.ts` + el mapeo en
`src/data/featured-products.ts`.

`/catalogo/[slug]` y el sitemap **excluyen los destacados** para no duplicar
URLs indexables en Google (cada producto tiene una sola URL canónica).

### SEO / robustez

- Sitemap dinámico: home + institucionales + 7 destacados + todos los slugs
  del catálogo (menos destacados).
- `/catalogo/[slug]`: `ProductJsonLd` + `BreadcrumbJsonLd`.
- Todo degrada si SpecParts no responde: `/catalogo` muestra fallback,
  sitemap mantiene rutas estáticas, `generateStaticParams` devuelve [].

### Archivos clave

- `src/lib/api/specparts.ts` — cliente HTTP (https nativo + zlib + cache).
- `src/lib/catalog/utils.ts` — helpers puros (normalize, 5 búsquedas,
  buildVehicleTree, buildMeasureRows, getAttrValue, getMercadoLibreUrl).
- `src/lib/catalog/filters.ts` — tipos, matchesFilters, applyFilters,
  computeFacets (con exclusión de propia facet).
- `src/data/featured-products.ts` — mapeo SKU → slug destacado.
- `src/types/specparts.ts` — tipos TS del schema de la API.
- `src/components/catalog/CatalogSearch.tsx` — componente principal (tabs +
  sticky + sidebar + grid).
- `src/components/catalog/FiltersSidebar.tsx` — sidebar facetado.
- `src/components/catalog/ProductCard.tsx` — card con resumen + modal.
- `src/components/catalog/VehiclesModal.tsx` — modal de vehículos detallados.
- `src/components/catalog/ProductGallery.tsx` — galería del detalle.
- `src/app/catalogo/page.tsx` — página del catálogo.
- `src/app/catalogo/[slug]/page.tsx` — detalle de producto (SSG + redirect).
- `src/app/api/catalog/products/route.ts` — route handler JSON.
- `src/app/api/catalog/plate/route.ts` — route handler patente.
- `reference/arquitectura-app-griffo.md` — doc completa de la API SpecParts,
  el schema de producto, credenciales, y las decisiones de arquitectura.

## Admin (`/admin`)

Protegido por middleware (`src/middleware.ts`) con auth de cookie
`griffo-admin-token` + env var `ADMIN_PASSWORD`. El middleware corre
en Edge (Web Crypto), la auth de API corre en Node (`src/lib/admin-auth.ts`).

### Sidebar agrupado (`src/app/admin/layout.tsx`)

Grupos:
- **Diseño de web**: Banners, Distribuidores, Descargas
- **Administración de catálogo**: Productos destacados, Cobertura, Cache de imágenes
- **Formularios**: Leads capturados
- **Vista pública**: link externo a `/catalogo`

### Páginas

- `/admin` — Dashboard con stats.
- `/admin/distribuidores` — CRUD (lee CSV estático, edits futuros a Redis).
- `/admin/productos` — Editor de links externos de productos destacados.
- `/admin/banners` — Stub para banners del home (pendiente).
- `/admin/descargas` — Gestión de archivos de `/catalogo/download`.
  Subida directa cliente → Vercel Blob (evita el límite de 4.5 MB de
  serverless functions); URL se guarda en Redis (`downloads:urls`).
  Ver `src/lib/descargas-store.ts`.
- `/admin/leads` — Lista de leads capturados por los forms públicos
  (contacto, newsletter, descargas). Persistencia en Redis
  (`src/lib/leads.ts`). Export CSV disponible.
- `/admin/cobertura` — Matriz vehículo × tipo de producto (18 columnas
  agrupadas en Dirección/Suspensión/Transmisión). Detecta huecos del
  catálogo. Filter + sort + sticky headers. Export CSV **respeta el
  filtro activo** (ver `src/components/admin/CoverageTable.tsx`).
  Lógica en `src/lib/catalog/coverage.ts`.
- `/admin/cache` — Pre-warming del CDN de imágenes. Dispara N
  requests a `/_next/image?url=...&w=...&q=75` para que Vercel procese
  y cachee todas las fotos antes que las vean usuarios reales.

### API admin (`/api/admin/*`)

Protegido por el mismo middleware.

- `login/route.ts`, `logout/route.ts` — auth.
- `descargas/upload/route.ts` — firma de URL de upload a Vercel Blob.
- `leads/*` — listado y export.

## Descargas (`/catalogo/download`)

Cuatro secciones:

1. **Catálogo general PDF** — `/pdfs/catalogo-griffo.pdf`.
2. **Material por producto** — flyer + video redes por destacado.
   Config en `src/data/descargas.ts` (`materialPorProducto`).
3. **Banco de imágenes** — detrás de form de registro (lead va a Redis).
4. **Base de datos de productos** — detrás de form de registro.

Resolución de URLs (ver `src/lib/descargas-store.ts`):
1. Si hay override en Redis (`downloads:urls`) → usa esa URL (Blob).
2. Sino, escanea `/public/downloads` y `/public/pdfs` con
   `fs.readdirSync` y usa el primer archivo que matchea.
3. `next.config.ts` incluye esos directorios en
   `outputFileTracingIncludes` para que fs funcione en Vercel.

Si un archivo no existe, el link se oculta (no da 404 al usuario).

## Leads y forms

`src/lib/leads.ts` — guarda cada submit en una lista Redis (LPUSH).
Tipos: `contacto`, `newsletter`, `descarga`.

Cada form tiene su endpoint en `/api/*/route.ts`:
- `/api/contacto` → email con Resend + lead Redis.
- `/api/newsletter` → lead Redis.
- `/api/garantia` → email Resend.
- `/api/desarrollo` → email + lead.
- `/api/descargas/registro` → captura registro antes de dar link.

**Si Resend o Redis falla, el lead se guarda en el otro canal** (no
se pierde). Si ambos fallan, devuelve 500 al front.

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

## Servicios conectados

- **Resend** (email): `RESEND_API_KEY`. Sender `onboarding@resend.dev`
  (verificar dominio en Resend para mandar desde `@griffo.com.ar`).
  Los handlers toleran fallos (leads se siguen guardando en Redis).
- **Upstash Redis** (KV): conectado via `KV_REST_API_URL/TOKEN` o
  `UPSTASH_REDIS_REST_URL/TOKEN` (ambos soportados — ver
  `src/lib/kv.ts`). Se usa para leads y overrides de descargas.
- **Vercel Blob**: `BLOB_READ_WRITE_TOKEN`. Usado por
  `/admin/descargas` para subir archivos grandes (> 4.5 MB) desde
  cliente evitando el límite de serverless functions.
- **SpecParts API**: `SPECPARTS_CLIENT_ID/SECRET`. Cliente del catálogo.
- **Google Analytics 4**: `G-FR8KN76LQ2` (mismo que el sitio viejo).
- **Admin**: login con `ADMIN_PASSWORD`.
- **WhatsApp**: mensaje pre-cargado en todas las páginas.

## Pendientes y decisiones abiertas

1. **🚨 Login / cuenta corriente / descarga de facturas**: la cliente
   mencionó en la primera conversación replicar estas features, pero
   el sitio público no las tiene. Sin aclarar si están en
   `griffo.specparts.shop` (fuera de alcance) o si es feature nueva.
   Preguntar antes de implementar si lo vuelve a pedir.
2. **Parque automotor circulante** para `/admin/cobertura`: hoy solo
   detecta huecos en vehículos que Griffo YA cubre. Preguntarle a
   SpecParts si expone `/vehicle/list` o conseguir base externa
   (ADEFA, ACARA).
3. **Analytics de búsqueda**: loguear queries del catálogo que dan
   cero resultados. Complemento natural de la matriz de cobertura.
4. **Página de Garantía, Novedades**: esperan HTML del sitio viejo.
5. **Data del Excel de distribuidores**: 7 filas con `Provincia para
   filtro = "Distribuidores"` se reasignaron heurísticamente a
   Tucumán. Verificar con la cliente.
6. **Verificar dominio en Resend**: hoy manda desde
   `onboarding@resend.dev`. Cuando se verifique `griffo.com.ar`,
   cambiar el sender.

## Git / commits

- Siempre commit y push al final de cada cambio funcional. Vercel auto-deploya.
- Commit messages en español, primera línea < 72 chars, descriptivos del
  "por qué" más que el "qué".
- Nunca `--no-verify`, nunca `--amend`, nunca force-push.
- Para regenerar `distribuidores.ts`: correr el script Python desde memoria
  (está documentado arriba) o pedírselo a Claude con el CSV actualizado.
