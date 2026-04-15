# Migración a `www.griffo.com.ar`

Plan y checklist para migrar el sitio de staging a producción sin perder
posicionamiento SEO ni historial.

## Estado actual

- **Staging**: `https://web-omega-wheat-25.vercel.app` (Vercel)
- **Producción (futuro)**: `https://www.griffo.com.ar`
- **SITE_URL** se controla con la variable `NEXT_PUBLIC_SITE_URL`
  (default: staging)

## Preparación — antes del switch

### 1. Inventario de URLs del sitio viejo

Necesitamos saber qué URLs tiene hoy indexadas Google para `griffo.com.ar`
y cuáles existen en el nuevo. Opciones para inventariar:

- **Google Search Console** del sitio viejo → Informe de cobertura
- **Screaming Frog** (gratis hasta 500 URLs) → crawlear `griffo.com.ar`
- Búsqueda en Google: `site:griffo.com.ar`
- Sitemap.xml del sitio viejo (si existe)

### 2. Verificar dominio y email

- [ ] **Registrador**: ¿dónde está registrado `griffo.com.ar`?
      (NIC Argentina, GoDaddy, Namecheap, otro)
- [ ] **Email corporativo**: ¿hay emails `@griffo.com.ar`?
      Si sí, identificar proveedor (Google Workspace, Microsoft 365,
      cPanel, otro) para **no tocar los registros MX**.
- [ ] **Subdominios**: identificar si hay otros subdominios activos
      (`griffo.specparts.shop` es externo, no nos afecta).
- [ ] **Backup** del sitio actual completo antes de tocar nada.

### 3. Mapa de redirects

Para URLs del sitio viejo que no existan en el nuevo, necesitamos
redirects 301 (permanentes) para que Google transfiera el ranking.

Los que sí coinciden se mantienen iguales para no perder nada.

#### URLs que se mantienen idénticas

```
/empresa
/productos
/productos/maquina-montadora-de-fuelles
/productos/kit-de-fuelles-universales-para-homocineticas
/productos/extractor-de-juntas-homocineticas
/productos/pinza-para-abrazaderas
/productos/fuelle-universal-de-direccion
/productos/kit-de-proteccion-para-suspension-deportiva
/distribuidores
/garantia
/desarrollo-a-medida
/contacto
/catalogo/download
/novedades
/novedades/lanzamientos
/novedades/aplicaciones
```

#### Redirects 301 (a completar con inventario real)

| Desde (URL vieja) | Hacia (URL nueva) | Motivo |
|---|---|---|
| _(pendiente del inventario)_ | | |

Cuando tengamos el listado, se codean en `next.config.ts`:

```ts
// next.config.ts
async redirects() {
  return [
    {
      source: "/vieja-url",
      destination: "/nueva-url",
      permanent: true, // 301
    },
    // ...
  ];
},
```

## Switch — día de la migración

### 1. Agregar dominio en Vercel (5 min)

- Dashboard de Vercel → proyecto → Settings → Domains
- Add `griffo.com.ar` y `www.griffo.com.ar`
- Vercel da los registros DNS (A record + CNAME)
- Definir una de las dos como primaria (recomendado: `www.griffo.com.ar`)
  y la otra como redirect automático

### 2. Cambiar DNS en el registrador

- Entrar al panel de administración del dominio
- **Tocar solo**:
  - Registro `A` del apex `griffo.com.ar` → IP de Vercel
  - Registro `CNAME` de `www` → `cname.vercel-dns.com`
- **NO tocar** los registros `MX` (email), ni los `TXT` de
  verificación de servicios, ni subdominios activos.
- Guardar y esperar propagación (1-24 hs).

### 3. Variables de entorno en Vercel (Production scope)

```
NEXT_PUBLIC_SITE_URL=https://www.griffo.com.ar
```

Esto hace que sitemap, robots, JSON-LD, OpenGraph, canonicals y
todo lo que usa `SITE_URL` apunte al dominio real sin cambios de
código.

### 4. Verificación post-switch

- [ ] `https://www.griffo.com.ar/` abre el sitio
- [ ] `https://griffo.com.ar/` (sin www) redirecciona a `www.`
- [ ] SSL funciona en ambas (certificado Let's Encrypt de Vercel)
- [ ] `/sitemap.xml` muestra URLs con el dominio nuevo
- [ ] `/robots.txt` muestra sitemap con el dominio nuevo
- [ ] Los `<script type="application/ld+json">` del header tienen
      URLs con el dominio nuevo
- [ ] Email corporativo sigue funcionando (enviar/recibir de prueba)
- [ ] Redirects 301 funcionan (probar con URLs viejas)

## Post-switch — dentro de 48 hs

### 1. Google Search Console

- Agregar propiedad nueva: `https://www.griffo.com.ar`
- Verificar con meta tag / DNS TXT / Google Analytics
- Enviar sitemap: `https://www.griffo.com.ar/sitemap.xml`
- Revisar "Cambio de dirección" solo si se cambió el dominio
  (en nuestro caso el dominio es el mismo, solo cambia el server).

### 2. Bing Webmaster Tools

- Agregar propiedad
- Importar desde Google Search Console (opción nativa)

### 3. Redes sociales y referencias externas

- Facebook: actualizar URL del sitio en la página oficial
- YouTube: actualizar descripción del canal
- Mercado Libre: actualizar enlaces en las descripciones
- Catálogos impresos: next update usa el nuevo URL (pero los
  redirects cubren los impresos viejos)

## Monitoreo — primeras 4 semanas

- [ ] Search Console: errores de crawl, páginas con 404
- [ ] Analytics (una vez conectado): caída del tráfico orgánico
- [ ] Rankings: comparar keywords antes/después
- [ ] Core Web Vitals: LCP, CLS, INP en el dominio real

Si aparecen problemas:
- 404s → agregar al mapa de redirects
- Caída de ranking → revisar errores en Search Console
- Hreflang/idiomas: no aplica por ahora

## Rollback (plan B)

Si algo sale muy mal, revertir los DNS al server viejo. La
propagación tarda otras 1-24 hs. Mientras tanto, el sitio viejo
sigue funcionando (nunca lo apagamos hasta estar seguros).
