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
- `/catalogo/download`: **funcional**. Ver sección "Descargas".
- `/presentacion`: **hub moderno para QR de packaging**. Hero + 3
  acciones rápidas (Catálogo online, Catálogo PDF, WhatsApp) + grid
  de productos destacados (mismo card que `/productos`, linkea a
  `/productos/[slug]` — video y detalle viven ahí, no se duplica) +
  cards "Explorá el sitio" + CTA de contacto. Todo se sincroniza solo
  con `site-config.ts` y `productos.ts`. La URL `griffo.com.ar/presentacion`
  está impresa en packaging — los QRs viejos van a hitear esta página
  al migrar el dominio.
- `/garantia`: **completa**. Hero con "2 años de garantía" + link al PDF
  de bases y condiciones, sección de Montadora con CTA "Registrar máquina",
  formulario de registro de máquina (`GarantiaForm` → `/api/garantia`)
  con contacto al lado.
- `/novedades`: **funcional**. Auto-detección desde SpecParts (productos
  con `updated_at` dentro de los últimos 12 meses) como candidatos. Por
  default nada se publica — el admin marca explícitamente cada código
  como Lanzamiento o Nueva aplicación. Ver sección "Novedades".
- `/cuenta/*`: **portal B2B en modo demo** (datos mock). Ver sección
  "Portal B2B (/cuenta/*)" más abajo.

## Portal B2B (`/cuenta/*`) + carrito + integración con ERP

Portal para clientes mayoristas (~80 distribuidores). Consume la API
del ERP Griffo (middleware sobre Bejerman) documentada en
`reference/bejerman/`. Cliente HTTP en `src/lib/api/bejerman.ts`,
tipos en `src/types/bejerman.ts`.

### Resumen ejecutivo del estado (2026-04-17)

- **Scaffolding armado, auth real pendiente.** El portal se ve
  completo visualmente con datos mock. Al conectar auth + ERP,
  todo muestra datos reales.
- **API del ERP**: la hizo un técnico propio de Griffo (no
  Promotive, que originalmente iba a consumirla). Griffo es dueña
  del código. Si el técnico se va, hay que conseguir el repo antes.
- **URL base**: `http://intranet.remotogriffo.com.ar:86/api`
  (cambió desde `griffo.stidns.net:86` el 2026-04-17). HTTP sin TLS
  — el técnico debería habilitar HTTPS antes de producción.
- **Credenciales del PDF** (`mpinero@promotive.la` / `password`)
  devuelven 401 "Credenciales inválidas" — eran de ejemplo. La
  cliente lo pide al técnico el lunes siguiente.
- **Firebase**: decisión de la cliente fue **proyecto nuevo
  dedicado** (no reusar `griffo-app` de la app mobile). Pendiente
  de crear.
- **Alta de usuarios B2B**: autoservicio validando contra el ERP
  (opción C). Ver pendientes abajo para detalles.

### API del ERP Griffo (middleware sobre Bejerman)

Docs completas: `reference/bejerman/README.md` + PDF
`Documentación API ERP Griffo v3.pdf` (unificado por Claude, va a
estar en la carpeta `reference/bejerman/` incluso si la cliente
pide limpiar versiones viejas).

6 endpoints disponibles:

1. `POST /Auth/login` → JWT Bearer. Body `{email, password,
   twoFactorCode, twoFactorRecoveryCode}`.
2. `POST /Auth/change_password` — cambia la contraseña del usuario
   API (no la de clientes B2B).
3. `GET /ERP/Clients` — lista de clientes con depósitos.
4. `POST /ERP/prices` — cotiza precios + stock por
   cliente+depósito+códigos.
5. `POST /ERP/order` — crea pedido.
6. `GET /ERP/orders/{erp_order_id}` — estado del pedido.
7. `GET /ERP/ClientAccountStatus/{client_code}` — cuenta corriente
   (comprobantes con debe/haber, sale cuenta corriente Y lista de
   facturas filtrando por `comp === "FC"`).
8. `GET /ERP/GetComprobante?Comp=...&PuntoVenta=...&CompNro=...&CodCliente=...`
   — descarga PDF de un comprobante. Los params salen 1:1 de un
   item de ClientAccountStatus.

Cliente HTTP: `src/lib/api/bejerman.ts`. Server-only. JWT cacheado
55 min, re-auth automático en 401, dedup de logins en vuelo.
`getComprobantePdf()` devuelve `{buffer, contentType}` para
streamear el PDF al usuario.

**Env vars** (Vercel → los 3 scopes):
```
BEJERMAN_API_URL=http://intranet.remotogriffo.com.ar:86/api
BEJERMAN_EMAIL=           # usuario API provisto por el técnico
BEJERMAN_PASSWORD=        # password del usuario API
```

**Gaps de la API** (no existen endpoints, workarounds):
- Lista de precios descargable como PDF/XLSX → generamos nosotros
  iterando `/ERP/prices` con todos los códigos del catálogo.
- Crear/editar cliente desde la web → alta manual por Griffo en
  Bejerman, la web sólo lee.

### Estructura de rutas `/cuenta/*`

Uso de route groups para separar chrome del login vs chrome del
portal:

- `/cuenta/login/page.tsx` → URL `/cuenta/login`. Form con email +
  password, sin subtítulo (a pedido de la cliente). Submit hace
  login mock (setea `griffo:b2b:session` en localStorage con
  `{email, loggedAt}`) y redirige a `/cuenta`. Cuando Firebase
  esté activo, se reemplaza el submit por `signInWithEmailAndPassword`.
- `/cuenta/(portal)/layout.tsx` — encabezado con nombre del cliente +
  badge "🚧 Modo demo" + `CerrarSesionButton` + `PortalNav`.
- `/cuenta/(portal)/page.tsx` → URL `/cuenta` — **Resumen**
  (renombrado desde "Dashboard" el 2026-04-17). 3 KPI cards
  (saldo, facturas 12 meses, pedidos activos) + accesos rápidos +
  últimos 3 pedidos. Sin saludo "Hola, X" — fuera a pedido de la
  cliente.
- `/cuenta/(portal)/pedidos/page.tsx` — tabla con ERP ID, ref web,
  fecha, estado, ítems, total.
- `/cuenta/(portal)/facturas/page.tsx` — lista de FC con botón PDF
  deshabilitado (se habilita al conectar `/ERP/GetComprobante`).
- `/cuenta/(portal)/cuenta-corriente/page.tsx` — 3 KPIs (saldo /
  total debe / total haber) + tabla con saldo running.
- `/cuenta/(portal)/listas/page.tsx` — cards de descarga PDF/XLSX.
- `/cuenta/(portal)/perfil/page.tsx` — **3 secciones**:
  * **Datos de cuenta**: razón social + código readonly (los
    maneja Griffo), email editable.
  * **Cambiar contraseña**: actual + nueva + repetir, validación
    mínima 8 chars + match.
  * **Visualización de precios**: toggle `compra`/`PVP` + input
    de margen (deshabilitado en modo compra) + ejemplo vivo con
    "+ IVA" en los dos modos.
- `/carrito/page.tsx` → URL `/carrito`. Usa `CartContent`.

### Componentes clave del portal

- `components/cuenta/PortalNav.tsx` — tabs del sub-nav
  (Resumen / Mis pedidos / Facturas / Cuenta corriente / Lista de
  precios / Mi perfil).
- `components/cuenta/PerfilForm.tsx` — client component con las 3
  secciones del perfil.
- `components/cuenta/CerrarSesionButton.tsx` — logout del mock.
- `components/cart/CartIndicator.tsx` — ícono + badge con `count`
  del carrito. Siempre visible en el header (también en mobile,
  fuera del hamburger).
- `components/cart/CartContent.tsx` — tabla de items con precio
  unitario + subtotal + total + "+ IVA" + contador por modo.
- `components/catalog/AddToCartButton.tsx` — 3 estados:
  * Sin items: botón azul "Agregar".
  * Expandido: [− N +] + OK / ×.
  * Con items: badge verde "Agregado" (texto completo en detalle
    del producto, sólo tilde ● en la card compact) + `[− N +]`
    verde esmeralda.
- `components/catalog/ProductPrice.tsx` — muestra compra o PVP
  según `useB2BPreferences()`, siempre con "+ IVA". Acepta
  `compraPrice?: number` para cuando haya precios reales del
  ERP; por defecto usa `getMockCompraPrice()`.

### Hooks / libs del portal

- `src/lib/mock-session.ts` — `useMockSession()`. Persiste
  `{email, loggedAt}` en `localStorage["griffo:b2b:session"]`.
  Expone `login(email)`, `logout()`, `isLoggedIn`, `ready`.
  Dispara event `b2b-session-change` para sincronizar entre
  pestañas/componentes. **Se reemplaza por Firebase Auth cuando
  esté listo** — la API del hook queda igual.
- `src/lib/cart.ts` — `useCart()`. Persiste items en
  `localStorage["griffo:cart"]`. API: `items`, `count`, `ready`,
  `getQuantity`, `addItem`, `setQuantity`, `removeItem`, `clear`.
  Dispara `cart-change` para sincronizar. Cuando haya auth real,
  migrar a Redis por user.
- `src/lib/b2b-preferences.ts` — `useB2BPreferences()`. Persiste
  `{priceMode, marginPct}` en `localStorage["griffo:b2b:prefs"]`.
  Defaults: `compra`, 30%. El margen se aplica sólo en modo
  `pvp`. Helper `displayPrice(base, prefs)`. Dispara
  `b2b-prefs-change`.
- `src/lib/mock-prices.ts` — `getMockCompraPrice(code)` hash
  determinístico → precio en ARS entre $8k y $180k, redondeado a
  $100. `formatARSNeto(value)` → `"$12.345,00 + IVA"`. Cuando
  `/ERP/prices` esté activo, pasar `compraPrice` real como prop
  a `ProductPrice` y el mock se ignora.

### Datos mock para demo

`src/data/mock-b2b.ts` exporta:
- `mockCurrentClient: BejermanClient` (shape 1:1 con la API).
- `mockAccountStatus: BejermanAccountStatusItem[]` — 7
  comprobantes mezclados FC/NC/RE con fechas recientes.
- `mockOrders: MockOrder[]` — 5 pedidos en varios estados.
- `mockPriceLists` — 2 entradas (PDF + XLSX).
- Helpers: `computeSaldo`, `formatARS`, `formatDate`.

### Header — estado logueado vs no logueado

`components/Header.tsx` usa `useMockSession()`:

- **No logueado**: pill accent amarilla `Acceso clientes` →
  `/cuenta/login`.
- **Logueado**: pill verde esmeralda con ícono + `mockCurrentClient.name`
  arriba de "Entrar al portal" → `/cuenta`. Feedback visual
  inequívoco.

`CartIndicator` siempre visible, al lado de la hamburguesa en mobile
y al lado del CTA de cliente en desktop.

### Integración en el catálogo público

Cada `ProductCard` muestra:
- Precio (compra o PVP según prefs) + "+ IVA".
- `AddToCartButton compact` (siempre visible, sin
  depender de login — cualquiera puede armar un carrito).

El detalle `/catalogo/[slug]` tiene un panel arriba del fold con
precio grande + `AddToCartButton` no-compact + MercadoLibre como
CTA secundario si el producto lo tiene.

### Admin `/admin/clientes`

Server component que lee `getClients()` del ERP y los lista en una
tabla (código, razón social, email, nro de depósitos). Protegido
por el proxy admin estándar. Si faltan `BEJERMAN_EMAIL`/`PASSWORD`
renderiza un instructivo con los pasos para cargarlas en Vercel.

### Qué falta para activar end-to-end

1. Recibir credenciales API reales del técnico (mail ya redactado
   en `reference/bejerman/mail-al-proveedor.md`).
2. Crear proyecto Firebase nuevo + config + Authentication con
   Email/Password habilitado.
3. Cargar en Vercel las env vars:
   - `BEJERMAN_EMAIL`, `BEJERMAN_PASSWORD`
   - `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_ADMIN_CREDENTIALS`
4. Reemplazar:
   - `useMockSession` por Firebase Auth (misma API pública).
   - `mock-b2b.ts` por llamadas a `src/lib/api/bejerman.ts` en
     cada server component del portal.
   - Mock prices en `ProductPrice`/`CartContent` por resultados
     de `getPrices({clientId, warehouseId, items})`.
5. Mover carrito de localStorage a Redis por user.
6. Conectar `/api/b2b/checkout` → `createOrder(...)` en el botón
   "Confirmar pedido" de `CartContent`.
7. Conectar botón PDF de `/cuenta/facturas` →
   `getComprobantePdf(...)` y streamear al usuario.
8. Pedirle al técnico habilitar HTTPS antes de producción.

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

### Auth — sesiones reales con revocación

Diseño actual (`src/lib/admin-auth.ts`):

- **Cookie**: `griffo-admin-session`, httpOnly, secure, sameSite=lax,
  TTL 7 días. Contiene un **session ID random de 32 bytes hex** — no
  deriva del password.
- **Store**: key `admin:session:<id>` en Upstash Redis con TTL.
  Metadata: `createdAt`, `userAgent`, `ip`. Logout borra la entry →
  el cookie queda inútil aunque se lo roben.
- **Verificación de password**: `timingSafeEqual` de `node:crypto`
  (no `===`) para evitar side-channels.
- **Rate limit en `/api/admin/login`**: 5 intentos por IP por minuto
  (counter Redis con TTL). Al 6º → `429`. Fail-open si Redis está
  abajo (prefiero que funcione el login a lockear al admin).
- **Sin salt hardcodeado**: ADMIN_SALT del diseño anterior desaparece
  — los session IDs son random puros, no hay hash que saltear.

Proxy (`src/proxy.ts`, corre en **Edge** — antes `middleware.ts`,
renombrado por Next.js 16):

- Lista blanca de paths exentos: `/admin/login`, `/api/admin/login`,
  `/api/admin/descargas/upload` (último recibe webhooks firmados de
  Blob sin cookie — handleUpload verifica signature).
- Para todo lo demás: lookup del session ID en Redis. Si no existe o
  Redis no responde → reject.
- Rechazo diferenciado: páginas HTML → 307 redirect a `/admin/login`;
  APIs (`/api/*`) → 401 JSON (para que clients no parseen HTML como
  JSON silenciosamente).
- **Bug histórico corregido**: antes la condición
  `if (!pathname.startsWith("/admin"))` dejaba `/api/admin/*` sin
  auth (empieza con `/api`). Ahora está con whitelist explícita.

Si se sospecha de sesión comprometida: borrar las keys `admin:session:*`
desde el dashboard de Upstash → invalida todos los logins activos.

### Sidebar agrupado (`src/app/admin/layout.tsx`)

Grupos:
- **Diseño de web**: Banners, Distribuidores, Descargas
- **Administración de catálogo**: Productos destacados, Cobertura, Cache de imágenes
- **Formularios**: Leads capturados
- **Vista pública**: link externo a `/catalogo`
- Footer: `<LogoutButton />` (`components/admin/LogoutButton.tsx`) que
  hace POST a `/api/admin/logout` y redirige a `/admin/login`.

### Páginas

- `/admin` — **Dashboard operativo** (primera pantalla al entrar).
  Semáforos de servicios (SpecParts / Redis / Blob / Resend), alertas
  de configuración (env vars faltantes, dominio en preview, Resend sin
  verificar, destacados sin link ML, distribuidores sin email), widgets
  de leads (últimos 7 días por tipo), novedades (publicadas/sin publicar/
  ocultas), descargas (slots configurados), dashboard de SpecParts
  (breakdown por línea, productos sin foto/vehículos/atributos/descripción,
  discontinuados pero activos) con lista de los primeros 10 productos
  problemáticos, y log de errores (últimos 100 en Redis, botón "Limpiar").
  Helpers en `src/lib/admin-health.ts`, `admin-alerts.ts`,
  `admin-catalog-issues.ts`, `admin-log.ts`.
- `/admin/distribuidores` — CRUD (lee CSV estático, edits futuros a Redis).
- `/admin/productos` — Editor de links externos de productos destacados.
- `/admin/banners` — Stub para banners del home (pendiente).
- `/admin/descargas` — Gestión de archivos de `/catalogo/download`.
  Subida directa cliente → Vercel Blob (evita el límite de 4.5 MB de
  serverless functions); URL se guarda en Redis (`downloads:urls`).
  Ver `src/lib/descargas-store.ts`.
- `/admin/leads` — Lista de leads capturados por los forms públicos
  (contacto, newsletter, descargas). 3 tabs con contadores, buscador
  in-memory, export CSV por tab. Persistencia en Redis
  (`src/lib/leads.ts`).
- `/admin/cobertura` — Matriz vehículo × tipo de producto (18 columnas
  agrupadas en Dirección/Suspensión/Transmisión). Detecta huecos del
  catálogo. Filter + sort + sticky headers. Export CSV **respeta el
  filtro activo** (ver `src/components/admin/CoverageTable.tsx`).
  Lógica en `src/lib/catalog/coverage.ts`.
- `/admin/cache` — Pre-warming del CDN de imágenes.

### API admin (`/api/admin/*`)

Protegido por el proxy (excepto la whitelist descrita arriba).

- `login/route.ts` — valida password (timingSafeEqual), rate-limit por
  IP, `createSession()` → setea cookie.
- `logout/route.ts` — `destroySession()` → borra key Redis + cookie.
- `descargas/upload/route.ts` — flow handleUpload de `@vercel/blob/client`
  (client upload). Verifica sesión manualmente en `onBeforeGenerateToken`
  y guarda URL en Redis vía `onUploadCompleted` (webhook firmado).
- `descargas/save/route.ts` — fallback idempotente: el cliente también
  hace POST acá tras el upload por si el webhook de Blob no alcanza
  (previews con protección de Vercel).
- `descargas/clear/route.ts` — borra un override (vuelve al default
  escaneado de `/public`).
- `leads/export/route.ts` — CSV por kind (descarga/contacto/newsletter)
  con BOM para que Excel abra con encoding UTF-8 correcto.
- `cobertura/export/route.ts` — CSV de la matriz.

## Descargas (`/catalogo/download`)

Tres secciones:

1. **Catálogo de productos en PDF** — primer PDF en `/public/pdfs/`
   distinto de `garantia.pdf`.
2. **Material por producto** — por cada slug de destacado, escanea
   `/public/downloads/productos/<slug>/` y toma el primer PDF como
   "Flyer" y el primer MP4 como "Video para redes". El slug
   `abrazaderas-universales` y `kit-de-proteccion-para-suspension-deportiva`
   fueron removidos a pedido de la cliente.
3. **Material para catalogar** — **Banco de imágenes** (.zip) +
   **Base de datos de productos** (.xlsx) en `/public/downloads/`.
   Ambas detrás de un form de registro (nombre, empresa, email,
   teléfono, "a quién le compra Griffo"). **Los forms se muestran
   siempre** (aunque el archivo no esté subido) para capturar leads;
   si hay archivo se dispara la descarga, si no, muestra "te lo
   mandamos por email cuando esté listo".

Sticky anchor nav arriba (`bg-primary-dark`) con 3 anclas — avisa que
hay 3 bloques abajo sin obligar a scrollear.

### Resolución de URLs (`src/lib/descargas-store.ts`)

Por slot (`DescargaSlot`):
1. Si hay override en hash Redis `downloads:urls` → usa esa URL
   (típicamente Blob público, https://).
2. Sino, escanea el directorio de `/public/` con `fs.readdirSync` y
   devuelve el primer archivo que matchea la extensión (URL-encoded).
3. Si no hay nada → `undefined` (la página oculta el link).

**Por qué scan y no nombres fijos**: la cliente sube vía GitHub web UI
con nombres libres (ej. `Folleto Montadora Azul.pdf`, `8 Maquina
montadora.mp4`). Hardcodear `flyer.pdf` / `video-rrss.mp4` llevaba a
links 404.

**Next config** (`next.config.ts`): `outputFileTracingIncludes` incluye
`public/downloads/**/*` y `public/pdfs/**/*` en el bundle de
`/catalogo/download` y `/admin/descargas` — sin esto, la serverless
function no puede leer `/public/`.

### Admin de descargas (`/admin/descargas`)

UI con todos los slots (1 catálogo + 5×2 productos + 2 gated). Por
cada uno muestra el URL actual ("En Blob" vs "Default del código") +
botones **Subir/Reemplazar** y **Borrar** (borrar vuelve al default
escaneado).

Upload directo **cliente → Vercel Blob** usando `@vercel/blob/client`
(`upload()` + endpoint `/api/admin/descargas/upload` que corre
`handleUpload`). Evita el límite de 4.5 MB de serverless functions.
Fallback idempotente a `/api/admin/descargas/save` del cliente por si
el webhook de Blob no alcanza en previews con protección.

## Novedades (`/novedades`)

Reemplazo nativo de `/noticias/*` del sitio viejo. Dos tipos:
**Lanzamiento** (producto nuevo) y **Nueva aplicación** (se suma a
productos existentes).

### Data layer (`src/lib/novedades.ts`)

Fuente de candidatos: **SpecParts** (`listCatalog()`), filtrando
productos con `updated_at` dentro de los últimos 12 meses,
`enabled=1` y `discontinued=0`.

Nada se publica por defecto. El admin marca explícitamente:

| Key Redis | Qué guarda |
|---|---|
| `novedades:tipo:<code>` | "lanzamiento" o "aplicacion" — si existe = publicada |
| `novedades:hidden` (Set) | códigos ocultos (publicados pero no se muestran) |
| `novedades:nuevos:<code>` (Set) | claves `BRAND:MODELO` marcadas como "Nuevo" dentro de una aplicación |

`Novedad` enriquecida tiene `published: boolean` (true si tiene
override de tipo), `tipo`, `hidden`, `nuevosVehiculos[]`,
`ubicaciones` + `lados` (via `getDisplayApplication`), slug de
destacado si aplica, slug del catálogo.

**Migración legacy** (`migrateLegacyIfNeeded`): detecta si existe la
key vieja `novedades:publicadas` (del primer diseño, lista con JSON) y
la convierte al modelo nuevo (un `novedades:tipo:<code>` por entrada),
después elimina la key vieja. Idempotente. Cacheada en memoria con
flag `migrationDone` para no repetir el LRANGE.

### Páginas públicas

- `/novedades`: hub con tabs Todas / Lanzamientos / Nuevas aplicaciones
  + contadores. Default: **Lanzamientos**. Grid 1/2/3 columnas (mobile/
  md/xl) con `NovedadCard`.
- `/novedades/lanzamientos` y `/novedades/aplicaciones`: mismo hub con
  tab inicial distinto. Son los destinos de los redirects 301 desde
  `/noticias/categoria/*` del sitio viejo.
- `/novedades/[code]`: detalle individual (breadcrumb, imagen, descripción,
  CTA al catálogo o al producto destacado, grid de vehículos por marca).

El item del header "Novedades" es un link plano (sin dropdown) que va
directo a `/novedades`.

### `NovedadCard`

Compacta — 3 columnas en xl para que entren muchas por pantalla.
Header con badge de tipo + fecha. Imagen 96×96. Código en font-mono,
título uppercase, línea en accent. Ubicación/Lado inline con reglas
por línea.

Chips de marca agrupando modelos (hasta 4 marcas con 3 modelos
c/u). Si hay más, botón "Ver N más" o "Ver todos" abre
`VehiclesModal`. La card mantiene colores neutros siempre —
**ningún rojo en la card**.

### `VehiclesModal` (compartido con el catálogo, extendido)

Prop nueva opcional `nuevosKeys?: string[]`. Si un vehículo listado
matchea una de esas claves:
- Badge rojo **"NUEVO"** antes del modelo
- Modelo + versión + años pintados en rojo
- Cabecera de la marca se pinta en rojo si tiene al menos un nuevo

El catálogo no pasa `nuevosKeys` → render igual que antes.

### Admin (`/admin/novedades`, dentro del grupo "Diseño de web")

5 tabs: **Sin publicar** (default) / Publicadas / Lanzamientos /
Nuevas aplicaciones / Ocultas. Buscador por código/título/línea.

Por fila:
- **Si no está publicada**: badge gris "Sin publicar" + 2 botones
  grandes "Publicar Lanzamiento" (azul) / "Publicar Nueva aplicación"
  (accent).
- **Si está publicada**: badge del tipo + "Cambiar a ..." (toggle tipo)
  + "Despublicar" (amarillo, borra el override, vuelve a "Sin publicar").
- Para aplicaciones publicadas: botón adicional **"Vehículos nuevos (N)"**
  que expande un panel con checkboxes por cada brand+model único del
  producto. Guardar envía a `/api/admin/novedades/nuevos`.

### APIs

- `POST /api/admin/novedades/publicar` — `{ code, tipo }` → upsert
  `novedades:tipo:<code>`. Valida contra SpecParts que el código exista.
- `POST /api/admin/novedades/despublicar` — `{ code, action }` donde
  action ∈ `"hide" | "unhide" | "unpublish"`. `unpublish` borra el
  override de tipo.
- `POST /api/admin/novedades/nuevos` — `{ code, keys[] }` → reemplaza
  el set de vehículos marcados como nuevos.

### Limitaciones conocidas

- **Fecha de alta**: SpecParts solo expone `updated_at`. Si todas las
  novedades aparecen con la misma fecha, es porque su backend hizo un
  sync masivo reciente. La fecha real de alta (`created_at`) no está
  en la API actual — habría que pedirle a SpecParts que la exponga.

## Leads y forms

`src/lib/leads.ts` — guarda cada submit en una lista Redis (LPUSH).
Tipos: `contacto`, `newsletter`, `descarga`. `saveLead()` envuelve todo
en try/catch para no afectar la respuesta del form aunque Redis falle.

Cada form tiene su endpoint en `/api/*/route.ts`:
- `/api/contacto` → email con Resend + lead Redis.
- `/api/newsletter` → lead Redis + email.
- `/api/garantia` → email Resend.
- `/api/desarrollo` → email + lead.
- `/api/descargas/registro` → captura registro antes de dar link.

**Tolerancia a fallos**: los tres endpoints de leads públicos
(`contacto`, `newsletter`, `descargas/registro`) envuelven la llamada
a Resend en try/catch separado. Si el email falla (API key mal
configurada, sender no verificado, etc.) el lead igual quedó en
Redis, el endpoint devuelve `ok: true` y el usuario ve verde. El
admin ve el lead en `/admin/leads` aunque no haya recibido el email.

**Errores de validación** (ej. email sin punto) devuelven 400 con
`{ error: "Email inválido" }`. Los forms del front muestran el mensaje
exacto del servidor (no un genérico "Hubo un error") — ver
`ContactForm.tsx` y `RegistroDescargaForm.tsx`.

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

- **Sitemap**: `app/sitemap.ts` dinámico (home + institucionales +
  7 destacados + todos los slugs del catálogo excepto destacados +
  `/presentacion` + `/catalogo/download`).
- **Robots**: `app/robots.ts` apunta al sitemap, bloquea /api/.
- **Redirects 301** (`next.config.ts` → `redirects()`): slugs
  impresos en packaging (QRs físicos) apuntan a las landings sin
  prefix `/productos/`. Hoy:
  * `/maquina-montadora-de-fuelles` → `/productos/maquina-montadora-de-fuelles`
  * `/kit-de-fuelles-universales-para-homocineticas` → `/productos/...`
  * `/kit-de-proteccion-para-suspension-deportiva` → `/productos/...`
  * `/garantia` y `/presentacion` ya son rutas directas (sin redirect).

  ⚠️ Estos slugs están impresos en cajas — no cambiar nunca.
  Si llega un QR roto, agregar acá.
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
- **Header active state**: `isItemActive` prefiere el match más
  específico del nav cuando las rutas están anidadas. Ej. en
  `/catalogo/download` se prende "Descargas" y NO "Catálogo" (aunque
  `startsWith("/catalogo/")` match también).
- **Pendiente**: video `comercio-exterior.mp4` (9 MB) — necesita ffmpeg
  o compresión desde HandBrake por la cliente. Forms reales (Resend),
  Analytics, Search Console — requieren input de la cliente.

## Servicios conectados

- **Resend** (email): `RESEND_API_KEY`. Sender `onboarding@resend.dev`
  (verificar dominio en Resend para mandar desde `@griffo.com.ar`).
  Los handlers toleran fallos (leads se siguen guardando en Redis).
- **Upstash Redis** (KV): conectado via `KV_REST_API_URL/TOKEN` o
  `UPSTASH_REDIS_REST_URL/TOKEN` (ambos soportados — ver
  `src/lib/kv.ts`). Usado para: sesiones admin, rate-limit del login,
  leads (listas `leads:<kind>`), overrides de descargas (hash
  `downloads:urls`).
- **Vercel Blob**: `BLOB_READ_WRITE_TOKEN`. Public store. Usado por
  `/admin/descargas` para subir archivos grandes (> 4.5 MB) desde
  cliente evitando el límite de serverless functions.
- **SpecParts API**: `SPECPARTS_CLIENT_ID/SECRET`. Cliente del catálogo.
- **Google Analytics 4**: `G-FR8KN76LQ2` (mismo que el sitio viejo).
- **Admin**: login con `ADMIN_PASSWORD` (la env var es la contraseña
  en claro — Redis guarda las sesiones, no hay salt ni hash del
  password en el filesystem).
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
4. **Contenido histórico de Novedades**: el módulo está armado y
   conectado a SpecParts, pero si la cliente quiere preservar noticias
   puntuales del sitio viejo (ej. "Nuevo pack de grasa Molykote") hay
   que importarlas manual — SpecParts solo tiene productos.
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
