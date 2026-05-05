# Flujograma y resumen del proyecto Griffo

> **Cómo leer este documento**: es el mapa del proyecto. Si mañana hay que
> cambiar algo, empezá por la sección **1. Mapa "quiero tocar X → archivo Y"**.
> Si algo se rompe, andá a **3. Troubleshooting**. Si no entendés por qué algo
> está hecho de cierta manera, revisá **4. Decisiones y por qué**.
>
> **Cómo mantenerlo al día**: cada tanto, al final de una sesión con Claude,
> pedir: *"actualizá `FLUJOGRAMA.md` con lo que charlamos hoy"*. Claude lo va
> reescribiendo y queda versionado en git.

---

## 0. Resumen por punto de cómo funciona el sitio

1. **Stack**: Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + pnpm.
   Deploy automático en Vercel cada push a `main`.
2. **Rama de desarrollo**: `main` — **única** rama. Todas las sesiones
   de Claude commitean y pushean directo acá. NO se crean ramas de
   task ni de feature, ni siquiera si el harness sugiere una. Ver
   REGLA #1 en `CLAUDE.md`.
3. **Producción**: `https://griffoweb.vercel.app` (auto-deploy de `main`).
4. **Producción futura**: `https://www.griffo.com.ar` (migración pendiente,
   ver `MIGRATION.md`). El dominio está en NIC Argentina, mail en Zoho.
5. **Estructura del código**:
   - `src/app/` → páginas (App Router). Cada carpeta = una ruta.
   - `src/app/api/` → endpoints (forms, pedidos, admin, catálogo, B2B).
   - `src/components/` → componentes reusables.
   - `src/lib/` → config + helpers + clientes HTTP (SpecParts, Bejerman).
   - `src/data/` → datos estáticos (distribuidores, productos, mocks B2B).
   - `public/` → assets estáticos.
6. **Identidad visual**: paleta Pantone del cliente, tipografía Montserrat
   (sustituto libre de Gotham). Ver `globals.css` y `CLAUDE.md`.
7. **Servicios externos conectados**:
   - **Resend** → emails (contacto, garantía, newsletter, pedidos B2B).
   - **Google Analytics 4** → `G-FR8KN76LQ2` en `layout.tsx`.
   - **Upstash Redis** → sesiones admin, leads, pedidos B2B,
     configuración de notificaciones, overrides de descargas.
   - **Vercel Blob** → archivos grandes subidos desde `/admin/descargas`.
   - **SpecParts API** → catálogo público (~370 productos Griffo).
   - **Bejerman (middleware ERP Griffo)** → escrita por técnico propio
     de Griffo. Expuesta para el portal B2B. URL:
     `http://intranet.remotogriffo.com.ar:86/api`. Credenciales reales
     pendientes (las del PDF devuelven 401).
8. **Admin panel** (`/admin`): sesiones reales en Redis, revocables.
   Rate limit en login, timingSafeEqual para password. Secciones:
   Dashboard, Banners, Distribuidores, Descargas, Productos, Cobertura,
   Cache de imágenes, Novedades, Leads, Clientes B2B, Pedidos B2B.
9. **Portal B2B** (`/cuenta/*`): portal para distribuidores mayoristas
   (~80 clientes) en **modo demo** hoy — auth mock + datos mock.
   Cuando lleguen credenciales ERP + Firebase Auth, swap en un punto.
   Ver sección 5 de este doc para detalle.
10. **Flujo de cambios**: la cliente sube archivos por GitHub web UI →
    Vercel auto-deploya → staging listo en 1-2 min.

---

## 1. Mapa "quiero tocar X → archivo Y"

### Contenido y textos

| Quiero cambiar… | Archivo |
|---|---|
| Teléfono, email, WhatsApp, redes sociales, dirección | `src/lib/site-config.ts` |
| Items del menú de navegación (links header/footer) | `src/lib/site-config.ts` |
| Lista de productos destacados del nav | `src/lib/site-config.ts` |
| Mensaje pre-cargado del botón de WhatsApp | `src/components/WhatsappFloat.tsx` |
| Texto de la home (banner, cards) | `src/app/page.tsx` + `src/components/BuscadorPatenteBanner.tsx` |
| Contenido de /empresa (historia, misión, etc) | `src/app/empresa/page.tsx` |
| Página de desarrollo a medida | `src/app/desarrollo-a-medida/page.tsx` |
| Footer (columnas, dirección, copyright) | `src/components/Footer.tsx` |

### Datos estructurados

| Quiero cambiar… | Archivo |
|---|---|
| Agregar/editar un distribuidor | `src/data/Distribuidores.csv` → regenerar `src/data/distribuidores.ts` con el script Python (documentado en `CLAUDE.md`) |
| Agregar/editar un producto | `src/data/productos.ts` |
| Descargas (catálogos, fichas técnicas) | `src/data/descargas.ts` |

### Estilos y diseño

| Quiero cambiar… | Archivo |
|---|---|
| Colores corporativos (Pantone) | `src/app/globals.css` (vars `--color-primary-value`, etc) |
| Tipografía | `src/app/layout.tsx` (`<link>` a Google Fonts) |
| Estilos globales / reset / accesibilidad | `src/app/globals.css` |
| Estado activo del nav, estilo del header | `src/components/Header.tsx` |
| Banner vectorial de la home | `src/components/BuscadorPatenteBanner.tsx` |
| Franja de credenciales (Garantía/ISO/50+) | `src/components/TrustStrip.tsx` |

### Forms y APIs

| Quiero cambiar… | Archivo |
|---|---|
| Form de contacto (UI) | `src/components/ContactForm.tsx` |
| Endpoint de contacto (envío mail) | `src/app/api/contacto/route.ts` |
| Form de garantía | `src/components/GarantiaForm.tsx` + `src/app/api/garantia/route.ts` |
| Form de desarrollo a medida | `src/components/DesarrolloForm.tsx` + `src/app/api/desarrollo/route.ts` |
| Newsletter | `src/components/Newsletter.tsx` + `src/app/api/newsletter/route.ts` |
| Registro antes de descargar catálogo | `src/components/RegistroDescargaForm.tsx` + `src/app/api/descargas/registro/route.ts` |
| Botón "¿Ves un error? Reportá" en la ficha | `src/components/catalog/ReportarErrorButton.tsx` + `src/components/catalog/ReportarErrorModal.tsx` + `src/app/api/reportes/route.ts` |
| Login del admin | `src/app/admin/login/page.tsx` + `src/app/api/admin/login/route.ts` + `src/lib/admin-auth.ts` |
| Verificación de sesión admin (defensa en profundidad) | `src/lib/admin-auth.ts` (`hasValidAdminSession`) — usado por `src/app/admin/(protected)/layout.tsx` además del proxy edge |
| Páginas admin protegidas | `src/app/admin/(protected)/*` — el route group obliga a pasar por el layout que valida sesión |
| Destinatarios de los emails | `src/lib/resend.ts` |

### SEO

| Quiero cambiar… | Archivo |
|---|---|
| Título/descripción global | `src/app/layout.tsx` (metadata) |
| Título/descripción por página | `page.tsx` de esa ruta (export `metadata`) |
| Sitemap | `src/app/sitemap.ts` |
| Robots.txt | `src/app/robots.ts` |
| JSON-LD estructurado | `src/components/StructuredData.tsx` |
| Redirects 301 (migración) | `next.config.ts` |
| Dominio canónico / OpenGraph base | env var `NEXT_PUBLIC_SITE_URL` en Vercel + `src/lib/site-url.ts` |

### Assets

| Quiero cambiar… | Archivo |
|---|---|
| Logo del header | `public/header-icon.svg` |
| Imágenes de empresa | `public/images/empresa/*` |
| Cards del home | `public/products/*` |
| Paths de assets por página | `src/lib/assets.ts` |

### Portal B2B (`/cuenta/*`) y pedidos

| Quiero cambiar… | Archivo |
|---|---|
| Estructura de las 7 tabs del portal | `src/components/cuenta/PortalNav.tsx` |
| Layout del portal (encabezado, "Modo demo", logout) | `src/app/cuenta/(portal)/layout.tsx` |
| Pantalla "Resumen" (dashboard con KPIs) | `src/app/cuenta/(portal)/page.tsx` |
| Pantalla "Armar pedido" (3 tabs) | `src/app/cuenta/(portal)/armar-pedido/page.tsx` + `src/components/cuenta/ArmarPedidoClient.tsx` |
| Grilla tipo Excel (tab "Por código") | `src/components/cuenta/armar-pedido/TabGrillaCodigo.tsx` |
| Subida de Excel (tab "Subir Excel") | `src/components/cuenta/armar-pedido/TabSubirExcel.tsx` |
| Panel "Ir al buscador" (tab del catálogo) | `src/components/cuenta/armar-pedido/TabIrAlCatalogo.tsx` |
| Preview antes de agregar al carrito | `src/components/cuenta/armar-pedido/PedidoParsePreview.tsx` |
| Mis pedidos (listado) | `src/app/cuenta/(portal)/pedidos/page.tsx` |
| Detalle de un pedido | `src/app/cuenta/(portal)/pedidos/[id]/page.tsx` |
| Botón cancelar del cliente | `src/components/cuenta/CancelarPedidoButton.tsx` |
| Formulario del perfil (email, password, margen, PVP/compra) | `src/components/cuenta/PerfilForm.tsx` |
| Hook preferencias B2B (margen + modo precio) | `src/lib/b2b-preferences.ts` |
| Hook carrito persistente | `src/lib/cart.ts` |
| Hook sesión mock (luego Firebase) | `src/lib/mock-session.ts` |
| Mocks del portal (cliente, pedidos, cuenta corriente) | `src/data/mock-b2b.ts` |
| Admin: lista de pedidos B2B | `src/app/admin/pedidos/page.tsx` |
| Admin: detalle pedido + acciones | `src/app/admin/pedidos/[id]/page.tsx` + `src/components/admin/AdminPedidoActions.tsx` |
| Admin: fila expandible con acciones inline | `src/components/admin/AdminPedidoRow.tsx` |
| Admin: email de notificación de pedidos nuevos | `src/components/admin/PedidosNotifEmailBox.tsx` (UI) + `src/lib/b2b-config.ts` (storage) |
| Storage de pedidos (Redis) | `src/lib/pedidos.ts` |
| Tipos de pedido (estados, ítems, factura) | `src/types/pedido.ts` |
| Templates de email transaccional | `src/lib/emails/pedidos.ts` |
| Generador del Excel modelo | `src/lib/excel/pedido-modelo.ts` |
| Parser de Excel/CSV subido | `src/lib/excel/parse-pedido.ts` |

### ERP (Bejerman) y catálogo (SpecParts)

| Quiero cambiar… | Archivo |
|---|---|
| Cliente HTTP de SpecParts (catálogo público) | `src/lib/api/specparts.ts` |
| Cliente HTTP del ERP Griffo (Bejerman) | `src/lib/api/bejerman.ts` |
| Tipos del ERP (cliente, precios, pedidos, factura) | `src/types/bejerman.ts` |
| Docs del ERP (endpoints disponibles + pendientes) | `reference/bejerman/README.md` + `Documentación API ERP Griffo v3.pdf` |
| Admin: listado de clientes del ERP | `src/app/admin/(protected)/clientes/page.tsx` |
| Admin: detalle del cliente B2B (datos + password + impersonar) | `src/app/admin/(protected)/clientes/[code]/page.tsx` |
| Admin: form para cambiar password de un cliente | `src/components/admin/ClientPasswordForm.tsx` + `src/app/api/admin/clientes/password/route.ts` |
| Admin: botón "Loguear como" un cliente | `src/components/admin/ImpersonateButton.tsx` + `src/app/api/admin/clientes/impersonate/route.ts` |
| Banner rojo "vista de admin" en el portal | `src/components/cuenta/ImpersonationBanner.tsx` |
| Login real del cliente B2B (valida pass override o GRIFFO+CUIT) | `src/app/api/b2b/login/route.ts` |
| Lib de credenciales del cliente B2B (scrypt en Redis) | `src/lib/b2b/credentials.ts` |
| Lib de impersonación (cookie httpOnly) | `src/lib/b2b/impersonation.ts` |
| Lib de carga de clientes (ERP + fallback mock) | `src/lib/b2b/client-loader.ts` |
| Lib de "cliente actual" (impersonación + fallback) | `src/lib/b2b/current-client.ts` |
| Cuenta corriente real desde el ERP | `src/lib/b2b/account-status.ts` |
| Banco de imágenes (ZIP auto-generado) | `src/lib/banco-imagenes.ts` + `src/app/admin/(protected)/banco-imagenes/page.tsx` + `src/app/api/admin/banco-imagenes/regenerar/route.ts` |
| Endpoint público del banco de imágenes (link estable) | `src/app/api/descargas/banco-imagenes/route.ts` |
| Cron semanal de banco de imágenes | `src/app/api/cron/banco-imagenes/route.ts` + `vercel.json` |

### Analytics del catálogo

| Quiero cambiar… | Archivo |
|---|---|
| Helpers de eventos GA4 (search, view_search_results, select_item, view_item) | `src/lib/analytics.ts` |
| Disparo de eventos GA4 desde el catálogo (debounce 700 ms) | `src/components/catalog/CatalogSearch.tsx` (useEffect con tracking) |
| Disparo de `select_item` al clickear card | `src/components/catalog/ProductCard.tsx` |
| Lib del log de búsquedas con CERO resultados (Redis) | `src/lib/search-log.ts` |
| Endpoint público del log (write-only) | `src/app/api/catalog/search-log/route.ts` |
| Endpoint admin para resolver/borrar | `src/app/api/admin/busquedas/route.ts` |
| Página admin con ranking + GA4 link | `src/app/admin/(protected)/busquedas/page.tsx` |
| Tabla del admin (acciones por fila) | `src/components/admin/BusquedasTable.tsx` |
| Toggle "ver resueltas" | `src/components/admin/BusquedasView.tsx` |
| Card del dashboard `/admin` | `src/app/admin/(protected)/page.tsx` (sección WIDGETS) |

---

## 2. Flujo de un request

```
Usuario entra a una URL
       │
       ▼
┌──────────────────────────────────────────┐
│ src/app/<ruta>/page.tsx                  │  ← Next.js App Router matchea la ruta
│  - importa componentes de /components    │
│  - importa datos de /lib o /data         │
│  - exporta metadata (SEO por página)     │
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ src/app/layout.tsx (wrapper global)      │  ← Header, Footer, WhatsappFloat,
│  - <link> Montserrat                     │    analytics, JSON-LD globales,
│  - Script GA4                            │    skip link a11y
│  - StructuredData global                 │
└──────────────────────────────────────────┘
       │
       ▼
 Render HTML → Browser
       │
       ▼  (si la página tiene un form)
┌──────────────────────────────────────────┐
│ components/<X>Form.tsx (client)          │  ← "use client", maneja state
│  - POST a /api/<endpoint>                │    (idle/loading/ok/error)
└──────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│ src/app/api/<endpoint>/route.ts          │  ← Valida input,
│  - import { resend } from '@/lib/resend' │    dispara email via Resend,
│  - devuelve { ok: true } o error         │    devuelve JSON al form
└──────────────────────────────────────────┘
```

### Flujo especial: distribuidores

```
CSV (fuente de verdad)                  Página (lo que ve el usuario)
src/data/Distribuidores.csv       →     src/app/distribuidores/page.tsx
        │                                      ▲
        │ (script Python manual)                │ filtra por provincia
        ▼                                       │ ordena por columna
src/data/distribuidores.ts  ──────────────────┘
  { nombre, telefono, email,
    provincia, provinciasFiltro[] }
```

### Flujo especial: admin

```
/admin/login → POST /api/admin/login (valida password, rate-limit por IP)
            → crea sesión en Redis → cookie httpOnly → /admin (dashboard)
            → proxy.ts valida la cookie contra Redis en cada request
```

### Flujo especial: pedido B2B (end-to-end)

```
1. CLIENTE arma pedido
   /catalogo (agrega al carrito)         ╮
   /cuenta/armar-pedido (grilla / Excel) ├─→ localStorage "griffo:cart"
   ╰─────────────────────────────────────╯
             │
             ▼
   /carrito → "Confirmar pedido" → POST /api/b2b/pedidos
                                   ├─→ Redis: pedido:<id> + zsets
                                   ├─→ Email al cliente (Resend)
                                   └─→ Email a ventas@griffo.com.ar
                                       (configurable en /admin/pedidos)
             │
             ▼
   ESTADO: procesando (Pendiente de carga)
   El cliente puede CANCELAR mientras esté en este estado.

2. OPERADOR carga pedido en Bejerman
   /admin/pedidos → filtra "Pendientes de carga"
                 → expande la fila
                 → descarga Excel (o CSV) del pedido
                 → lo tipea / importa en Bejerman
                 → Bejerman devuelve número de pedido (ej: PED-23900)
                 → operador pega el número + fecha despacho
                 → POST /api/admin/pedidos/{id}/marcar-cargado
                    ├─→ actualiza pedido en Redis
                    └─→ Email al cliente (Resend)
             │
             ▼
   ESTADO: en_preparacion (En preparación)

3. OPERADOR factura en Bejerman
   /admin/pedidos → detalle del pedido en preparación
                 → marcar como entregado con datos de FC
                 → POST /api/admin/pedidos/{id}/marcar-entregado
                    ├─→ guarda la factura en el pedido
                    └─→ Email al cliente con ref a factura
             │
             ▼
   ESTADO: entregado (Entregado)

[🔵 FUTURO cuando técnico extienda la API]
   Cron/polling cada 15min → GET /ERP/orders/{id}
                          → detecta invoice != null
                          → auto-marcar entregado + mail al cliente
```

### Flujo especial: modo de precios del cliente B2B

```
/cuenta/perfil → toggle [Precio de compra | PVP]
             → si PVP: input de margen %
             → guarda en localStorage "griffo:b2b:prefs"
                    │
                    ▼
ProductCard / CartContent / Detalle de pedido usan useB2BPreferences()
   si prefs.priceMode === "compra" → muestra precio neto
   si prefs.priceMode === "pvp"    → muestra compra × (1 + margen/100)
Siempre con "+ IVA" al final.
```

---

## 3. Troubleshooting ("si X no anda, mirá Y")

| Síntoma | Mirá… |
|---|---|
| Los forms no mandan mail | Env var `RESEND_API_KEY` en Vercel + dominio `griffo.com.ar` verificado en Resend. Sender actual: `Griffo <contacto@griffo.com.ar>`. Ver también `src/lib/resend.ts`. Para debug: dashboard de Resend → tab "Emails" muestra cada envío con status (delivered, bounced, etc.) |
| El build de Vercel falla por fuentes | No usar `next/font/google` — cargar Montserrat con `<link>` en `layout.tsx`. El sandbox/build bloquea Google Fonts |
| Imágenes rotas (404) | `AssetImage` cae a placeholder automático. Revisar path en `src/lib/assets.ts` vs archivo real en `public/` |
| Mixed content / imagen no carga del sitio viejo | No hotlinkear — bajar asset y subir a `public/`. El sitio viejo es HTTP, el nuevo HTTPS |
| El admin no loguea | Env var `ADMIN_PASSWORD` en Vercel. Ver `src/lib/admin-auth.ts` |
| El sitemap tiene URLs con dominio staging | Setear `NEXT_PUBLIC_SITE_URL=https://www.griffo.com.ar` en Vercel (Production scope) |
| Un distribuidor no aparece en una provincia | Revisar `provinciasFiltro[]` en `src/data/distribuidores.ts` — un distribuidor puede entregar a varias provincias |
| GA4 no trackea | Script en `layout.tsx`, ID `G-FR8KN76LQ2`. Probar con GA4 DebugView |
| El logo se ve mal / desalineado | Ver `src/components/Logo.tsx` — primero intenta `/header-icon.svg`, si falla cae al SVG reconstruido |
| Links rotos después de migrar | Agregar redirect 301 en `next.config.ts` |
| Un video pesa mucho y tarda en cargar | Comprimir con ffmpeg/HandBrake antes de subir. Ver sección "Pendientes" en `CLAUDE.md` |
| `/admin/clientes` tira `401 Credenciales inválidas` | Las env vars `BEJERMAN_EMAIL` / `BEJERMAN_PASSWORD` no coinciden con un usuario real de la API. Pedirle al técnico de Griffo credenciales válidas |
| `/cuenta/pedidos` no muestra los pedidos que carga directo en Bejerman | El endpoint `GET /ERP/clientes/{code}/pedidos` no existe todavía — hay que pedírselo al técnico. Mientras, solo se ven los armados desde la web. Ver `reference/bejerman/README.md` |
| El carrito se vacía al cambiar de dispositivo | Es esperado — hoy vive en `localStorage`. Cuando se conecte auth real y Firestore/Redis por user, persiste entre dispositivos |
| Un pedido quedó en "En preparación" pero ya se facturó | Hoy no se detecta automáticamente. El operador tiene que marcar entregado manualmente desde `/admin/pedidos`. Cuando el técnico extienda `GET /ERP/orders/{id}` con el campo `invoice`, se hace polling |
| El Excel modelo demora en bajar | Genera ~370 filas con metadata en vivo desde SpecParts. Primera descarga del día puede tardar 1-2s; después Vercel lo cachea |
| Un código del Excel subido no se agrega | El parser lo marca como "inválido" con el motivo (ej: código inexistente, cantidad 0). Revisar el preview antes de confirmar |

---

## 4. Decisiones y por qué (para no revertirlas sin contexto)

- **Montserrat en vez de Gotham**: Gotham es paga, Montserrat es la alternativa
  libre más cercana. Si en el futuro se compra la licencia de Gotham, los
  `.woff2` van en `public/fonts/` y se declaran con `@font-face` en
  `globals.css`.
- **Google Fonts vía `<link>` en vez de `next/font/google`**: el sandbox de
  build bloquea el acceso a Google Fonts, así que `next/font/google` hace
  fallar el build. El `<link>` carga en el navegador del usuario, no en build.
- **Header sticky, no fixed**: menos molesto en mobile, evita saltos de layout.
- **Sin TopBar**: la garantía ya aparece en el TrustStrip de la home, no hace
  falta duplicarla arriba.
- **Sin título de página en el body**: el navbar marca la sección activa con
  `border-b-2 border-accent font-black` y reemplaza al título tradicional.
  Más limpio y menos ruido visual.
- **Textos negros `#0a2b3d` en vez de `#000`**: navy muy oscuro, se ve más
  corporativo que el negro puro.
- **Breadcrumbs solo donde importan** (ej. `/productos/[slug]`): no
  contaminar cada página con breadcrumbs triviales.
- **CSV como fuente de verdad de distribuidores**: la cliente edita en Excel
  y sube el CSV por GitHub web UI. El `.ts` se regenera con script Python.
- **Hotlinks al sitio viejo no funcionan**: el viejo es HTTP, el nuevo HTTPS
  → mixed content. Todos los assets se bajan y se suben al repo.
- **No se replica `Novedades` ni `Catálogo`**: el catálogo vive en
  `griffo.specparts.shop` (externo, fuera de alcance).
- **Admin protegido en dos capas (proxy + layout server)**: el proxy
  edge solo no alcanza — Next docs lo dicen explícito ("Proxy should
  not be your only line of defense"). Los prefetches de `<Link>`,
  caché de CDN o errores silenciosos pueden dejar pasar requests. Por
  eso `(protected)/layout.tsx` valida la sesión en server con
  `hasValidAdminSession()` y redirige antes de renderizar nada.
- **Login B2B con default GRIFFO+CUIT**: la cliente quería que el
  alta de usuarios no requiera ningún paso técnico. Default
  predecible (`GRIFFO` + CUIT sin guiones, mayúsculas), admin puede
  cambiarlo desde `/admin/clientes/[code]`. Override se guarda
  hasheado scrypt en Redis. Si no hay override, valida contra el
  default computado.
- **Banco de imágenes regenerado vs vivo**: bajar 500+ fotos de
  SpecParts cada request es lento (30-60s). Por eso el ZIP se
  cachea en Blob; el cron semanal lo refresca y el admin puede
  forzar regeneración. El link público es estable — siempre apunta
  al último ZIP, así se manda al cliente una vez.
- **WhatsApp directo sin panel**: el panel intermedio "Consultas /
  Atención" forzaba dos clicks para algo que ya está claro por el
  ícono. Ahora un click → chat.
- **Catálogo card del home dice "Catálogo online"**: la foto de la
  card muestra el catálogo físico (PDF impreso) — el label aclara
  que el destino es el buscador digital, no el descargable. En el
  nav del header sigue siendo "Catálogo" porque "online" no entraba
  sin pisar el slogan del logo en laptops 1280-1440.
- **Site URL centralizado en `NEXT_PUBLIC_SITE_URL`**: sitemap, robots,
  JSON-LD, canonicals, OpenGraph — todo lee de la env var. El día del switch
  de dominio no hay cambios de código, solo se setea la env var en Vercel.
- **Sin MX/SPF/DKIM/DMARC en la migración DNS**: el mail es Zoho. Al cambiar
  DNS para apuntar a Vercel, solo se tocan A/CNAME. **No tocar los registros
  de mail** o se corta el email corporativo.
- **Los pedidos NO se cargan automáticamente en Bejerman**: la cliente pidió
  control humano. El cliente confirma → estado "procesando". El operador
  de Griffo descarga Excel, carga en Bejerman a mano, y recién ahí marca el
  pedido como "en preparación" con el nº devuelto por Bejerman. Evita
  pedidos duplicados, errores de precios, clientes con saldo vencido.
- **Estado inicial del pedido: "procesando" no "pendiente"**: la cliente
  quería el label "Pendiente de carga" — usamos ese string en el UI pero
  el ID interno sigue siendo `procesando` para no migrar pedidos viejos en
  Redis.
- **Cancelación solo mientras "procesando"**: una vez que Griffo lo cargó
  al ERP (ya invirtió trabajo), el cliente no puede cancelar desde la web.
  El admin sí puede seguir cancelando.
- **Precios son mock hasta que llegue `POST /ERP/prices`**: `getMockCompraPrice(code)`
  genera un precio determinístico por hash del código (entre $8k y $180k,
  redondeado a $100). Cuando haya precios reales, `ProductPrice` acepta
  `compraPrice` como prop y el mock se ignora.
- **Firebase nuevo, no reusar `griffo-app`**: decisión de la cliente —
  el proyecto Firebase de la app mobile (mecánicos) queda separado del
  portal B2B para que no se mezclen pools de usuarios.
- **Alta de usuarios B2B = autoservicio contra el ERP**: cuando el cliente
  quiera registrarse, validamos su email/CUIT contra `GET /ERP/Clients`
  para matchearlo con su `client_id` de Bejerman. Sin match, se rechaza.
- **Emails transaccionales toleran fallo de Resend**: si la API tira
  error, el pedido ya quedó en Redis y se puede ver desde admin. Los mails
  se loguean pero no bloquean la creación del pedido.
- **Docs API del ERP en `reference/bejerman/`**: la API es de Griffo (la
  hizo un técnico propio, NO Promotive que iba a ser el proveedor original).
  Cualquier cambio al schema se negocia con el técnico + se actualiza el
  PDF v3 + el README.

---

## 5. Portal B2B y pedidos — estado actual

### ✅ Listo (modo demo con datos mock)

- Portal `/cuenta/*` con 7 tabs (Resumen, Armar pedido, Mis pedidos,
  Facturas, Cuenta corriente, Lista de precios, Mi perfil).
- Login mock en `/cuenta/login` (setea sesión en `localStorage`).
- CTA verde en el header con nombre del cliente cuando está logueado.
- "Armar pedido" con 3 tabs: grilla Excel, subir archivo, link al catálogo.
- Excel modelo autogenerado con todos los códigos + autofilter.
- Parser de Excel/CSV + textarea libre con preview de válidos/inválidos.
- Carrito persistente en `localStorage` (accesible desde catálogo +
  armar-pedido + cualquier página).
- Creación de pedido → estado "procesando" + mails al cliente y al
  operador (ventas@griffo.com.ar, editable desde `/admin/pedidos`).
- Cancelación por el cliente mientras está en "procesando".
- Admin: listado de pedidos, fila expandible con Excel + acciones inline,
  marcar cargado (con nº Bejerman + fecha), marcar entregado (con nº FC),
  cancelar con motivo. Mails automáticos en cada cambio de estado.
- `/admin/clientes` lista clientes del ERP cuando hay credenciales.
- Pedidos locales + pedidos del ERP se mergen en `/cuenta/pedidos`
  (cuando el endpoint del ERP exista).

### 🟡 Pendiente del técnico del ERP Griffo

Ver `reference/bejerman/README.md` — lista completa con formato técnico.
Resumen:

1. **Credenciales reales** — las del PDF devuelven 401.
2. **HTTPS** antes de producción (hoy es `http://...`).
3. **Extender `GET /ERP/orders/{id}`** con `estimatedDispatchDate`,
   `dispatchedAt`, `invoice`. Habilita auto-detección de facturación.
4. **Nuevo `GET /ERP/clientes/{code}/pedidos`** para que el cliente vea
   los pedidos que Griffo cargó directo en Bejerman.
5. **Importación masiva de Excel en Bejerman** (confirmar si existe).
6. **Mapeo de códigos Bejerman ↔ SpecParts** (confirmar si son idénticos).

### 🟡 Pendiente de la cliente

- Crear **proyecto Firebase nuevo** (decisión: no reusar `griffo-app`).
  Cargar las env vars `NEXT_PUBLIC_FIREBASE_*` + `FIREBASE_ADMIN_CREDENTIALS`.
- Cargar `BEJERMAN_EMAIL` + `BEJERMAN_PASSWORD` en Vercel cuando las
  reciba del técnico.

### 🟢 Swap del día que todo llegue

Cuando haya creds + Firebase:
1. `useMockSession` → Firebase Auth (misma API pública del hook).
2. `mock-b2b.ts` → llamadas reales a `src/lib/api/bejerman.ts` en
   cada server component del portal.
3. Mock prices → resultados de `getPrices({clientId, warehouseId, items})`.
4. Carrito localStorage → Redis por user.
5. Botón "Confirmar pedido" → también dispara `createOrder(...)` (si la
   cliente quiere también cargarlo al ERP automáticamente).
6. Botón PDF de `/cuenta/facturas` → `getComprobantePdf(...)` streameado.

---

## 6. Otros TODOs

1. **Optimizar imágenes pesadas**
   Script sharp ya bajó ~11 MB. Nuevas subidas pasarlas por el mismo
   script.

3. **Comprimir `comercio-exterior.mp4`** (9 MB)
   ffmpeg o HandBrake.

4. **Desarrollo a medida — assets pendientes**
   Archivos en `public/images/desarrollo-a-medida/`, `public/videos/`
   y `public/clientes/`.

5. **Revisar distribuidores con `Provincia para filtro = "Distribuidores"`**
   7 filas se reasignaron heurísticamente a Tucumán.

6. **Mapa de redirects 301 para la migración**
   Usar Google Search Console para inventariar URLs del sitio viejo.

7. **Analytics de búsquedas con 0 resultados** (catálogo)
   Loguear queries que no matchean nada para detectar productos que
   faltan o códigos que la gente tipea mal.

---

## 6. Comandos útiles

```bash
# Levantar dev local
pnpm dev

# Build (como lo hace Vercel)
pnpm build

# Lint
pnpm lint

# Ver qué se va a deployar
git status
git diff

# Ver logs del deploy
# → Vercel dashboard
```

---

*Última actualización: ver `git log FLUJOGRAMA.md`. Para refrescar este
documento, pedirle a Claude: "actualizá `FLUJOGRAMA.md` con lo que charlamos".*
