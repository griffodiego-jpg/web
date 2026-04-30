# Runbook — Día del switch a `www.griffo.com.ar`

Protocolo paso a paso. Pensado para seguir aunque haya nervios. Cada
paso tiene comando exacto, verificación, y plan B si algo falla.

> **Antes de arrancar: hora del switch sugerida**
> Martes 5 de mayo, **9:00 AM hora Argentina**. Tenés todo el día
> hábil + miércoles + jueves antes del finde para estabilizar.
> Evitar lunes (riesgo de tráfico alto post-fin-de-semana) y viernes
> (riesgo de quedar caída todo el sábado-domingo si algo sale mal).

---

## Pre-flight (24-48 hs antes del switch)

### 0.1 — Verificar que Cloudflare ya está activo

- En NIC.ar → Mis dominios → `griffo.com.ar` → debe mostrar los
  nameservers de Cloudflare (algo tipo `xena.ns.cloudflare.com`)
- En Cloudflare → griffo.com.ar → Overview → debe decir **Active**
  con luz verde

Si NO está activo: **abortar**. Cloudflare debe estar resolviendo el
sitio viejo antes de continuar.

### 0.2 — Verificar que mail Zoho funciona desde Cloudflare

```bash
# Verificar registros MX desde el browser/cli:
dig MX griffo.com.ar +short
# Debe responder: mx.zoho.com / mx2.zoho.com / mx3.zoho.com
```

Mandar 1 mail desde tu casilla y recibir 1 mail externo. Si no
funciona, no avanzar.

### 0.3 — Verificar Resend con dominio verificado

- Resend → Domains → `griffo.com.ar` → debe decir **Verified**
- API key creada y guardada como env var en Vercel

### 0.4 — Backup del sitio viejo

- Tener copia local del HTML/CSS/JS, las imágenes, los PDFs
- Anotar la IP del server viejo (66.97.33.85 según los DNS) por si
  hay rollback

### 0.5 — Verificar el repo

```bash
git -C /ruta/al/repo status   # debe estar limpio
git -C /ruta/al/repo log --oneline -5   # último commit con redirects
```

### 0.6 — Verificar env vars en Vercel

Settings → Environment Variables, scope **Production**. Debe estar:
- `NEXT_PUBLIC_SITE_URL` = `https://www.griffo.com.ar`
- `RESEND_API_KEY` = `re_...`
- `ADMIN_PASSWORD` = (la que pusiste para /admin)

**Si `NEXT_PUBLIC_SITE_URL` aún no está**, agregalo ahora — pero NO
redeployes hasta el momento del switch (paso 3).

### 0.7 — Confirmar separación de proyectos en Vercel

- Proyecto del **sitio principal** (donde van `griffo.com.ar` y
  `www.griffo.com.ar`)
- Proyecto de la **app de mecánicos** (donde queda
  `app.griffo.com.ar`)

Son dos proyectos distintos. Verificar que están separados.

---

## Día del switch

> Tiempo estimado: 30-90 minutos para los pasos críticos, +12-24 hs
> de propagación final.

### 1. Agregar dominios en Vercel (5 min)

- Vercel → proyecto del sitio nuevo → Settings → Domains
- Add Domain → escribir `griffo.com.ar` → Add
- Vercel detecta que el DNS no apunta a ellos todavía (correcto)
- Vercel te pide elegir cómo configurar — elegir **`www`** como
  primario y `griffo.com.ar` redirect a `www`
- Add Domain → escribir `www.griffo.com.ar` → Add
- Vercel te muestra los registros DNS necesarios:
  - **A** del apex `griffo.com.ar` → IP que muestra Vercel
    (típicamente `76.76.21.21`)
  - **CNAME** de `www` → `cname.vercel-dns.com`

**Anotar en un papel** la IP que te dé Vercel para el A record.

### 2. Cambiar registros DNS en Cloudflare (5 min)

- Cloudflare → griffo.com.ar → DNS → Records
- Buscar el record **A** del apex `griffo.com.ar` (hoy apunta a
  `66.97.33.85`)
- Click **Edit** → cambiar Content a la IP de Vercel del paso 1
- Mantener **DNS only (gris)**, NO Proxied
- Save
- Buscar el record **CNAME `www`** (hoy apunta a `griffo.com.ar`)
- Click **Edit** → cambiar Content a `cname.vercel-dns.com`
- Mantener **DNS only (gris)**
- Save

> ⚠️ NO TOCAR los demás records (MX Zoho, TXT SPF/DKIM/DMARC, app,
> bypass, etc.). Solo apex A y www CNAME.

### 3. Configurar SITE_URL y redeploy (3 min)

- Vercel → proyecto sitio → Settings → Environment Variables
- Verificar / crear `NEXT_PUBLIC_SITE_URL` = `https://www.griffo.com.ar`
  con scope **Production** activado
- Vercel → Deployments → último → click `⋯` → **Redeploy**
- Esperar 1-2 min hasta que termine

### 4. Esperar propagación inicial (5-30 min)

```bash
# En la terminal:
dig +short A griffo.com.ar @1.1.1.1
# Debe devolver la IP de Vercel (no la 66.97.33.85)

dig +short CNAME www.griffo.com.ar @1.1.1.1
# Debe devolver cname.vercel-dns.com
```

O entrar a [whatsmydns.net](https://whatsmydns.net) y buscar
`griffo.com.ar` tipo A — debe estar en verde en la mayoría de las
ubicaciones.

### 5. Verificar SSL (Vercel lo emite solo, 1-5 min)

- Vercel → Settings → Domains → debe haber un check verde al lado
  de cada dominio (significa "SSL emitido y válido")
- Si dice "Pending validation" después de 10 minutos: revisar que
  los DNS apunten a Vercel (paso 2)
- Probar en browser: `https://www.griffo.com.ar/` debe abrir el
  sitio nuevo con candado verde

### 6. Verificar redirect apex → www

```bash
curl -sI https://griffo.com.ar/ | grep -i location
# Debe responder: location: https://www.griffo.com.ar/
```

### 7. Verificar sitemap y robots con dominio nuevo

```bash
curl -s https://www.griffo.com.ar/sitemap.xml | head -20
# Debe mostrar URLs con https://www.griffo.com.ar/

curl -s https://www.griffo.com.ar/robots.txt
# Debe apuntar a sitemap https://www.griffo.com.ar/sitemap.xml
```

### 8. Verificar 5 redirects 301 al azar

```bash
curl -sI https://www.griffo.com.ar/maquina-montadora-de-fuelles | grep -iE 'HTTP|location'
# HTTP/2 308 + location: /productos/maquina-montadora-de-fuelles

curl -sI https://www.griffo.com.ar/noticias | grep -iE 'HTTP|location'
# HTTP/2 308 + location: /novedades

curl -sI https://www.griffo.com.ar/quienes-somos | grep -iE 'HTTP|location'
# HTTP/2 308 + location: /empresa

curl -sI https://www.griffo.com.ar/bundles/appfrontend/pdf/Catalogo_Griffo_2022_v1.pdf | grep -iE 'HTTP|location'
# HTTP/2 308 + location: /catalogo/download

curl -sI https://www.griffo.com.ar/wp-admin | grep -iE 'HTTP|location'
# HTTP/2 308 + location: /
```

### 9. Verificar email Zoho sigue funcionando

- Mandar 1 mail desde tu casilla `@griffo.com.ar` a un mail externo
- Recibir 1 mail externo en tu casilla
- Si falla: **NO ABORTAR el switch web**, pero abrir ticket urgente
  con Zoho. El email es independiente del web.

### 10. Probar formularios en producción

- Abrir [https://www.griffo.com.ar/contacto](https://www.griffo.com.ar/contacto)
- Completar el form con un mail tuyo, enviar
- Verificar que llega a `contacto@griffo.com.ar`
- Repetir con `/garantia` y newsletter del footer

Si los forms no envían: revisar que `RESEND_API_KEY` esté seteado en
Vercel Production y que el dominio esté Verified en Resend.

---

## Post-switch (primeras 4 horas)

### 11. Subir el sitemap a Search Console

- [search.google.com/search-console](https://search.google.com/search-console)
- Propiedad `griffo.com.ar` (la que ya tenés) — no es necesario crear
  una nueva porque el dominio no cambió, solo el server
- Sidebar → Sitemaps → ingresar `https://www.griffo.com.ar/sitemap.xml`
  → Enviar
- Status debe pasar a **Correcto** en algunos minutos/horas

### 12. Pedir indexación de las páginas principales

- Search Console → buscar URL → ingresar `https://www.griffo.com.ar/`
- → Solicitar indexación (acelera el crawl)
- Repetir para `/empresa`, `/productos`, `/distribuidores`,
  `/contacto`, `/desarrollo-a-medida`

### 13. Bing Webmaster Tools

- [bing.com/webmasters](https://www.bing.com/webmasters/)
- Si no tenés cuenta: crear con tu Google → te ofrece importar
  desde Search Console (1 click)
- Si tenés: agregar `https://www.griffo.com.ar` y enviar sitemap

### 14. Actualizar links externos

- Facebook → página de Griffo → about → website → cambiar a
  `https://www.griffo.com.ar`
- YouTube → canal → about → links → idem
- Mercado Libre → en cada anuncio, en la descripción si menciona
  el sitio

### 15. PageSpeed Insights baseline

- [pagespeed.web.dev](https://pagespeed.web.dev/) → ingresar
  `https://www.griffo.com.ar/`
- Tomar screenshot del resultado (Performance, Accessibility, Best
  Practices, SEO scores) — sirve como baseline para comparar después

#### Baseline esperado (medido en local pre-switch, mobile)

| Página | Performance | A11y | Best Practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| `/` | 99 | 96 | 96 | 100 | 1.4s | 0 |
| `/productos/[slug]` | 97 | 97 | 96 | 100 | 2.4s | 0 |
| `/distribuidores` | 99 | 91 | 96 | 100 | 1.8s | 0 |

> En producción los números deberían igualar o superar este baseline
> gracias al CDN de Vercel. Si bajan más de 10 puntos, investigar.

---

## Monitoreo (primeras 4 semanas)

### Cada 3 días

- Search Console → Indexación → Páginas → revisar errores
- Search Console → Rendimiento → comparar clicks/impresiones vs.
  antes del switch
- Si aparecen 404s nuevos:
  1. Tomar la lista
  2. Mapear cada uno al destino correcto en el sitio nuevo
  3. Agregar redirect en `next.config.ts`
  4. Commit + push → Vercel deploya solo

### Métricas objetivo (primeras 4 semanas)

- Tráfico orgánico: caer máx. 10%, recuperar en 2-4 semanas
- Errores de crawl: 0 nuevos por semana
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- 404s: < 5 por día (lo normal son crawlers buscando paths que no
  existen — solo acción si suman > 20/día o vienen de URLs reales)

---

## Rollback (plan B)

Si algo crítico se rompe en los primeros 30 minutos del switch:

### Caso A — El sitio nuevo no carga (SSL, 500, etc.)

1. Cloudflare → DNS → record A apex → cambiar Content de vuelta a
   `66.97.33.85` (server viejo)
2. Cloudflare → DNS → record CNAME `www` → cambiar Content de
   vuelta a `griffo.com.ar`
3. Esperar 1-15 min de propagación
4. Sitio viejo vuelve a responder
5. Investigar el problema sin presión, reintentar otro día

### Caso B — Email Zoho deja de funcionar

(Esto **no debería pasar** si seguiste el runbook — los MX no se
tocan en ningún paso.)

1. Cloudflare → DNS → buscar registros MX
2. Verificar que están: `mx.zoho.com`, `mx2.zoho.com`, `mx3.zoho.com`
3. Verificar TXT SPF/DKIM/DMARC de Zoho intactos
4. Si todo está OK, esperar 30 min (puede ser propagación residual)
5. Si después de 30 min sigue mal, abrir ticket urgente con Zoho

### Caso C — Resend no envía mails

1. Verificar `RESEND_API_KEY` en Vercel Production
2. Resend → Domains → griffo.com.ar → debe decir **Verified**
3. Resend → Logs → ver si los intentos llegan y qué error tiran
4. Si el SPF de Cloudflare se rompió por intentar mergear con el de
   Zoho, restaurar el SPF original (`v=spf1 include:zoho.com ~all`)
   y agregar Resend en otro intento

---

## Limpieza (1-2 semanas post-switch, cuando ya esté estable)

- Cloudflare → borrar records que ya no se usan: Microsoft 365
  obsoletos (`sip`, `lyncdiscover`, `msoid`, `enterpriseregistration`,
  `enterpriseenrollment`)
- Vercel → en el proyecto sitio → Settings → Domains → eliminar
  cualquier dominio de staging que no se use más
- DonWeb (de la agencia) — pedirles que borren la zona DNS de
  griffo.com.ar (ya no la usan)
- Cuenta de Resend / Zoho / Google: verificar que no haya usuarios
  de la agencia con acceso

---

## Contactos clave para el día D

- **Cloudflare support**: [dash.cloudflare.com/support](https://dash.cloudflare.com/support)
  (chat en plan free es lento, pero existe)
- **Vercel support**: vía dashboard (rápido, +24/7 en plan Pro)
- **Zoho Mail support**: [mail.zoho.com/support](https://www.zoho.com/mail/support)
- **NIC Argentina**: [nic.ar/contacto](https://nic.ar/contacto)
  (lento, solo lo usás si los nameservers se rompen — no debería)
- **Resend support**: [resend.com/support](https://resend.com/support)
