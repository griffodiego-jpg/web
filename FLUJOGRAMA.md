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
   Deploy automático en Vercel cada push a la rama de desarrollo.
2. **Rama de desarrollo actual**: `claude/rebuild-web-platform-WwmFb` (o la
   que esté activa — ver `CLAUDE.md`). **Nunca** se pushea directo a `main`.
3. **Staging**: `https://web-omega-wheat-25.vercel.app` (Vercel).
4. **Producción futura**: `https://www.griffo.com.ar` (migración pendiente,
   ver `MIGRATION.md`). El dominio está en NIC Argentina, mail en Zoho.
5. **Estructura del código**:
   - `src/app/` → páginas (App Router). Cada carpeta = una ruta.
   - `src/app/api/` → endpoints (forms, login admin).
   - `src/components/` → componentes reusables (Header, Footer, forms, etc).
   - `src/lib/` → config + helpers (site-config, assets, resend, site-url).
   - `src/data/` → datos estáticos (distribuidores, productos, descargas).
   - `public/` → assets estáticos (imágenes, videos, logo, fonts si hubiera).
6. **Identidad visual**: paleta Pantone del cliente, tipografía Montserrat
   (sustituto libre de Gotham que es paga). Ver `globals.css` y `CLAUDE.md`.
7. **Servicios externos conectados**:
   - **Resend** → envío de emails (forms de contacto, garantía, newsletter).
   - **Google Analytics 4** → `G-FR8KN76LQ2` cargado en `layout.tsx`.
   - **Vercel KV / Upstash Redis** → creado por la cliente, todavía sin CRUD.
8. **Admin panel** (`/admin`): login con contraseña (`ADMIN_PASSWORD`).
   Dashboard + tabla distribuidores + editor links productos. CRUD pendiente.
9. **SEO**: sitemap y robots dinámicos, JSON-LD estructurado (Organization,
   WebSite, LocalBusiness, Manufacturer, Product, Breadcrumb), canonicals
   y OpenGraph controlados por `NEXT_PUBLIC_SITE_URL`.
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
| Login del admin | `src/app/admin/login/page.tsx` + `src/app/api/admin/login/route.ts` + `src/lib/admin-auth.ts` |
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
/admin/login → POST /api/admin/login (valida ADMIN_PASSWORD)
            → cookie de sesión → /admin (dashboard)
            → /admin/distribuidores, /admin/productos, /admin/banners
```

---

## 3. Troubleshooting ("si X no anda, mirá Y")

| Síntoma | Mirá… |
|---|---|
| Los forms no mandan mail | Env var `RESEND_API_KEY` en Vercel. Ver también `src/lib/resend.ts` (destinatarios) y verificar que `griffo.com.ar` esté verificado en Resend (si no, el sender es `onboarding@resend.dev`) |
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
- **Site URL centralizado en `NEXT_PUBLIC_SITE_URL`**: sitemap, robots,
  JSON-LD, canonicals, OpenGraph — todo lee de la env var. El día del switch
  de dominio no hay cambios de código, solo se setea la env var en Vercel.
- **Sin MX/SPF/DKIM/DMARC en la migración DNS**: el mail es Zoho. Al cambiar
  DNS para apuntar a Vercel, solo se tocan A/CNAME. **No tocar los registros
  de mail** o se corta el email corporativo.

---

## 5. TODOs con contexto (qué falta, qué bloquea, qué input hace falta)

1. **🚨 Login / cuenta corriente / descarga de facturas** *(ambiguo)*
   La cliente mencionó esto en la primera conversación pero el sitio público
   no lo tiene. No está claro si vive en `griffo.specparts.shop` (catálogo
   externo, fuera de alcance) o si es feature nueva. **Preguntar antes de
   empezar a construir.**

2. **Conectar forms a email real** *(parcial)*
   Resend ya está integrado. Falta **verificar el dominio `griffo.com.ar`
   en Resend** para que el sender sea `@griffo.com.ar` en vez de
   `onboarding@resend.dev`. Requiere acceso a DNS (NIC Argentina).

3. **Optimizar imágenes pesadas**
   Varios archivos de empresa pesan 2-9 MB. Script sharp (mozjpeg q82 + png
   palette + resize 1600px max) ya bajó ~11 MB. Pendiente: nuevas subidas
   pasarlas por el mismo script. Pedirle a Claude que lo corra.

4. **Comprimir `comercio-exterior.mp4`** (9 MB)
   Necesita ffmpeg o HandBrake. La cliente puede hacerlo local y subirlo.

5. **Páginas stub esperando HTML del sitio viejo**
   - `/garantia`
   - `/catalogo/download` (Descargas)
   - `/novedades/*`
   Están con `ComingSoon`. Cuando la cliente pase el HTML, reemplazar.

6. **Desarrollo a medida — assets pendientes**
   21 archivos en `public/images/desarrollo-a-medida/`, `public/videos/` y
   `public/clientes/`. Mientras no estén, placeholders.

7. **Revisar distribuidores con `Provincia para filtro = "Distribuidores"`**
   7 filas se reasignaron heurísticamente a Tucumán. La cliente debería
   confirmar.

8. **Admin CRUD real**
   Vercel KV / Upstash Redis ya está creado por la cliente. Falta conectar
   los endpoints del admin para que el CRUD persista en vez de ser solo UI.

9. **Mapa de redirects 301 para la migración**
   Usar Google Search Console (la cliente tiene acceso) para inventariar
   URLs del sitio viejo antes del switch y cargarlas en `next.config.ts`.

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
