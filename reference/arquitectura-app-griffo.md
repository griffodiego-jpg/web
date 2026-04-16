# GRIFFO APP — Documento de Arquitectura para reutilización en griffo.com.ar

**Versión:** 2.0
**Fecha:** 16 de abril de 2026
**Propósito:** Todo lo necesario para que Claude Code reutilice la lógica de GRIFFO APP (app.griffo.com.ar v2.11) en el desarrollo de la web griffo.com.ar.

---

## ÍNDICE
1. Visión general y stack
2. API SpecParts — Endpoints, Auth, Paginación, Rate Limits
3. Archivos API de Vercel (código fuente real)
4. Firebase — Config, Auth Providers, Firestore Schema, Security Rules
5. Regla crítica del proxy
6. Decisiones de arquitectura
7. Búsquedas implementadas
8. Sistema PDV
9. Calidad de datos — Campos confiables vs vacíos
10. Variables de entorno
11. Marca y diseño
12. Reglas NO negociables
13. DNS y dominios
14. Qué reutilizar
15. Contenido institucional disponible
16. Estructura propuesta para la web
17. API Bejerman (pendiente)
18. Instrucciones para Claude Code

---

## 1. VISIÓN GENERAL Y STACK

### GRIFFO APP (app.griffo.com.ar)
PWA mobile-first para mecánicos argentinos. Buscar productos GRIFFO (fuelles y topes de amortiguador), contactar proveedor por WhatsApp o comprar en MercadoLibre.

### Stack
- **Frontend:** Un solo archivo `index.html` (~1300+ líneas), vanilla HTML/CSS/JS. Sin frameworks, sin TypeScript, sin build tools.
- **Serverless API:** 4 archivos en `/api/` (Vercel serverless functions, Node.js)
- **Auth/DB:** Firebase Auth + Firestore (plan Spark/gratuito)
- **API catálogo:** SpecParts (`external-api.specparts.ai`)
- **Deploy:** Vercel (proyecto `griffo-app`)
- **Repo:** GitHub `josedgriffo-gif/GRIFFO-APP`, rama `main`
- **Versión producción:** v2.11

### Para la web griffo.com.ar se agrega:
- **ERP:** Bejerman (API bridge/middleware ya comprada y operativa)
- **Portal de clientes:** ~80 clientes (distribuidores y GPDVs)
- **CMS liviano:** Panel admin para novedades/lanzamientos/eventos

---

## 2. API SPECPARTS — ENDPOINTS, AUTH, PAGINACIÓN, RATE LIMITS

### Credenciales (las únicas válidas, ignorar PDFs)
```
Base URL: https://external-api.specparts.ai
Auth URL: https://auth.specparts.ai/oauth
Client ID: 7vb0Qd32iDQ3DKvTbtW4mGE2UU2rhgFO21QwEGjL2t7zWybNIW
Client Secret: gQMbSc8eLRsAwnZRWBUTvVaSoCEAKtixz8Ujp4H06Duq0XOuATBvuHwHWgJOAFpdwD1oK0
```

### Autenticación
```
POST https://auth.specparts.ai/oauth
Content-Type: application/json

{ "client_id": "...", "client_secret": "..." }
```
Devuelve `{ "access_token": "..." }`. Bearer token.

### Endpoint principal — Listar productos GRIFFO
```
GET /part/list?lang=1&limit=100&page={N}&brand[]=GRIFFO&output=v1
Authorization: Bearer {token}
```

### Paginación
- **Tipo:** offset/page (NO cursor)
- **Parámetros:** `limit` (max 100) + `page` (1-based)
- **Respuesta:** `{ data: [...], paging: { pages: N } }`
- **Total GRIFFO:** ~370 productos (~4 páginas de 100)
- **NO hay full-text search server-side para GRIFFO.** Filtrado client-side sobre los ~370.

### Endpoint patente
```
GET /vehicle/identification?plate={PATENTE}
Authorization: Bearer {token}
```

### Rate limits / Quotas
- No documentados oficialmente. No se han observado 429 en producción.
- Cachear 30 min en memoria del serverless.

### Schema de producto (respuesta real)
```json
{
  "id": 12345,
  "slug": "griffo_076-35-12345",
  "brand": "GRIFFO",
  "category": "SUSPENSIÓN",
  "product": "FUELLE SUSPENSIÓN",
  "code": "076-35",
  "safe_code": "07635",
  "description": "Fuelle Suspensión Delantero",
  "is_kit": 0,
  "enabled": 1,
  "updated_at": "2024-05-22T15:54:36.000Z",
  "pictures": [{ "is_blueprint": 0, "image_url": "https://...", "sort_order": 0 }],
  "components": [],
  "links": [{ "link": "https://articulo.mercadolibre.com.ar/...", "image": "..." }],
  "cross": [{ "brand": "OEM", "code": "1234567", "oem": 1 }],
  "attributes": [
    { "name": "Diámetro Menor", "value": "42", "unit": "mm" },
    { "name": "Diámetro Mayor", "value": "110", "unit": "mm" },
    { "name": "Largo", "value": "210", "unit": "mm" }
  ],
  "vehicles": [
    { "brand": "FORD", "master_model": "FOCUS", "model": "FOCUS II 4P/5P",
      "version": "1.6", "sold_from_year": 2008, "sold_until_year": 2013 }
  ],
  "ean": ["7798123456789"]
}
```

---

## 3. ARCHIVOS API DE VERCEL (código fuente real)

### `/api/products.js` — Carga todos los productos GRIFFO
```javascript
const https = require('https');
const zlib = require('zlib');

function specpartsGet(path, token) {
  return new Promise(function(resolve, reject) {
    https.get({
      hostname: 'external-api.specparts.ai',
      path: path,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip'
      }
    }, function(apiRes) {
      var chunks = [];
      apiRes.on('data', function(c) { chunks.push(c); });
      apiRes.on('end', function() {
        var buf = Buffer.concat(chunks);
        var encoding = apiRes.headers['content-encoding'];
        if (encoding === 'gzip') {
          zlib.gunzip(buf, function(err, result) {
            if (err) {
              try { resolve(JSON.parse(buf.toString('utf8'))); }
              catch(e) { reject(new Error('Decompress failed')); }
            } else {
              try { resolve(JSON.parse(result.toString('utf8'))); }
              catch(e) { reject(new Error('JSON parse failed')); }
            }
          });
        } else {
          try { resolve(JSON.parse(buf.toString('utf8'))); }
          catch(e) { reject(new Error('JSON parse failed')); }
        }
      });
    }).on('error', reject);
  });
}

var cachedProducts = null;
var cacheTime = 0;
var CACHE_DURATION = 30 * 60 * 1000;

async function loadProducts() {
  if (cachedProducts && (Date.now() - cacheTime) < CACHE_DURATION) {
    return cachedProducts;
  }

  var tokenResp = await fetch('https://auth.specparts.ai/oauth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SPECPARTS_CLIENT_ID,
      client_secret: process.env.SPECPARTS_CLIENT_SECRET
    })
  });
  if (!tokenResp.ok) throw new Error('Auth failed');
  var tokenData = await tokenResp.json();
  var token = tokenData.access_token;

  var allProducts = [];
  var page = 1;
  var totalPages = 1;

  while (page <= totalPages) {
    var path = '/part/list?lang=1&limit=100&page=' + page + '&brand[]=GRIFFO&output=v1';
    var data = await specpartsGet(path, token);
    if (data && data.data) {
      allProducts = allProducts.concat(data.data);
      if (data.paging) totalPages = data.paging.pages || 1;
    } else { break; }
    page++;
  }

  var filtered = allProducts.filter(function(p) {
    var prod = (p.product || '').toUpperCase();
    if (prod === 'FUELLE SEMIEJE') return false;
    return true;
  });

  cachedProducts = filtered;
  cacheTime = Date.now();
  return filtered;
}
```

**Notas clave:**
- `https` nativo (NO `fetch`) para GET a SpecParts — preserva `brand[]=GRIFFO` sin re-encoding
- `fetch` para auth (POST con body JSON) — está OK, no hay query params con brackets
- Caché 30 min
- Pagina automáticamente
- NOTA para la web nueva: NO se filtra `FUELLE SEMIEJE`. Todos los ~370 productos entran al catálogo.

### `/api/plate.js` — Identificación de vehículo por patente
Usa el mismo patrón `specpartsGet`. `GET /vehicle/identification?plate=...`

---

## 4. FIREBASE — CONFIG, AUTH PROVIDERS, FIRESTORE SCHEMA, SECURITY RULES

### Configuración
```javascript
firebase.initializeApp({
  apiKey: "AIzaSyBOvhsx73SX0WJDdz9fP0z9pcA-svsiVD8",
  authDomain: "griffo-app.firebaseapp.com",
  projectId: "griffo-app",
  storageBucket: "griffo-app.appspot.com",
  appId: "1:710468527470:web:f673ee218ee383b763cd7f"
});
```

### Auth Providers habilitados
1. Email/Password — con verificación de email obligatoria
2. Google Sign-In — via popup (fallback a redirect)

**NO hay custom claims.** Admin = email hardcodeado `josedgriffo@gmail.com`.

### Firestore Schema

#### `users` (doc ID = Firebase Auth UID)
```
{ displayName, email, createdAt, pdvId? }
```

#### `pdvs` (doc ID = auto)
```
{ nombre, contacto, celular, logoUrl?, ecommerceUrl?, activo, creadoEn }
```

#### `favorites` (doc ID = Firebase Auth UID)
```
{ codes: { "076-35": 1713300000000, ... } }
```

#### `analytics` (doc ID = auto)
```
{ event, timestamp, uid, userEmail, userName, pdvId?,
  type?, query?, results?, code?, product?, category?, link?, brand?, model?, year? }
```

### Security Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /analytics/{docId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && request.auth.token.email == 'josedgriffo@gmail.com';
    }
    match /favorites/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /pdvs/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.email == 'josedgriffo@gmail.com';
    }
  }
}
```

---

## 5. REGLA CRÍTICA DEL PROXY

### ⚠️ NUNCA usar `fetch()` para GET a SpecParts

`fetch()` re-codifica `brand[]=GRIFFO` a `brand%5B%5D=GRIFFO`, y SpecParts devuelve ~5 productos en vez de ~370. **Bug crítico confirmado en producción.**

Usar `https` nativo de Node.js + `zlib.gunzip`.

`fetch()` SÍ se puede usar para la auth (POST a `auth.specparts.ai/oauth`): no hay query params con brackets.

---

## 6. DECISIONES DE ARQUITECTURA

- Un solo archivo HTML porque José mantiene via GitHub web interface
- Sin WordPress/CMS por experiencia previa de breakage
- Vanilla JS sin framework para eliminar build step
- Catálogo en memoria local: no hay relación vehículo→producto directa
- Caché 30 min en serverless
- (App mobile) `FUELLE SEMIEJE` excluido del catálogo general. **En la web nueva NO se excluye** — todos los productos entran.
- 188 kits, 0 con componentes cargados

---

## 7. BÚSQUEDAS IMPLEMENTADAS

5 tipos: Patente, Vehículo (Marca→Modelo→Año), Código, Palabra libre, Por Medidas.

### Función `norm()`
```javascript
function norm(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
}
```

### Búsqueda por palabra — multi-word
```javascript
var words = raw.split(/\s+/).filter(function(w) { return w.length > 0; });
var matches = P.filter(function(p) {
  if (!p._searchText) return false;
  return words.every(function(w) { return p._searchText.indexOf(w) >= 0; });
});
```

### Índice `_searchText` (se construye al cargar)
Concatena: code, description, product, category, slug, vehicles (brand, master_model, model, version), attributes (name, value, unit), components, cross, reference, ean. Todo normalizado con `norm()`.

### Búsqueda Por Medidas — 3 sub-tipos
- **Fuelle Dirección:** `producto=FUELLE CREMALLERA`, attrs: "Diámetro Menor", "Diámetro Mayor", "LARGO"
- **Fuelle Transmisión:** `producto=KIT FUELLE SEMIEJE`, agrupados por código base, attrs: "boca mayor"/"boca menor", "LARGO"
- **Tope:** `producto=TOPE AMORTIGUADOR`, attrs: "Diámetro Menor", "Diámetro Mayor", "Largo"

---

## 8. SISTEMA PDV

Mecánico llega via `?ref={PDV_ID}` → banner "Gentileza de [PDV]" → WhatsApp va al número del PDV. Sin PDV: WPP sin número + MercadoLibre si hay link.

Panel Admin: CRUD PDVs, solo admin. Colección `pdvs`.

---

## 9. CALIDAD DE DATOS

### Confiables (siempre):
- `code`, `brand`, `product`, `category`, `description`, `slug`, `safe_code`, `id`
- `is_kit`, `oem`, `discontinued`, `enabled`, `updated_at`

### Parciales:
- `pictures` (mayoría tiene), `vehicles` (mayoría), `attributes` (mayoría), `cross`, `links` (NO todos; productos de dirección/transmisión suelen no tener)

### Siempre vacíos/null (no usar):
- `package_weight/length/width/height`, `observation`, `national_industry`, `seller`, `company_id`
- `components` — los 188 kits vienen vacíos

### NO hay stock ni precio en la API
SpecParts no devuelve stock ni precios. GRIFFO no vende directo; precios los maneja cada distribuidor.

---

## 10. VARIABLES DE ENTORNO

```
SPECPARTS_CLIENT_ID=7vb0Qd32iDQ3DKvTbtW4mGE2UU2rhgFO21QwEGjL2t7zWybNIW
SPECPARTS_CLIENT_SECRET=gQMbSc8eLRsAwnZRWBUTvVaSoCEAKtixz8Ujp4H06Duq0XOuATBvuHwHWgJOAFpdwD1oK0

FIREBASE_API_KEY=AIzaSyBOvhsx73SX0WJDdz9fP0z9pcA-svsiVD8
FIREBASE_AUTH_DOMAIN=griffo-app.firebaseapp.com
FIREBASE_PROJECT_ID=griffo-app
FIREBASE_APP_ID=1:710468527470:web:f673ee218ee383b763cd7f
```

---

## 11. MARCA Y DISEÑO

- Slogan: IMPULSAMOS SOLUCIONES
- Paleta: Primario `#00549F`, Acento `#00ADD0`, Oscuro `#005B82`
- Tipografía: Montserrat (sustituta de Gotham)
- Logo: NUNCA alterar colores del PNG
- CSS vars app: `:root { --p: #00549F; --a: #00ADD0; --d: #005B82; --bg: #F0F4F8; --c: #FFF; --t: #0D1B2A; --m: #4A6175 }`

---

## 12. REGLAS NO NEGOCIABLES

1. Proxy: `https` nativo, NUNCA `fetch()` para GET a SpecParts
2. Verificación de email obligatoria (Google y admin exentos) — aplica al portal B2B, no al catálogo público
3. Logo: no alterar colores
4. Credenciales de SpecParts: las de este documento
5. Proyecto Vercel `griffo-app-ar` corrupto — NO usar
6. `griffo-v2_4.html` obsoleto — NO usar como base
7. Nunca cambiar lo que funciona. Revertir al primer error.

---

## 13. DNS Y DOMINIOS

- `app.griffo.com.ar` → CNAME → `cname.vercel-dns.com` (mantener)
- `griffo.com.ar` → DonWeb → migrar a Vercel
- Web nueva = proyecto Vercel SEPARADO de `griffo-app`

---

## 14. QUÉ REUTILIZAR

### Completamente:
- Función `specpartsGet()` (patrón `https` + `zlib`)
- Lógica `products.js` y `plate.js`
- Firebase Auth (mismo proyecto `griffo-app`)
- Firestore collections
- Función `norm()`
- Lógica de las 5 búsquedas
- Patrón panel admin de PDVs (para CMS novedades)
- Paleta, tipografía

### Adaptar:
- Frontend completo (múltiples páginas)
- Sistema PDV no aplica a web institucional
- Portal de clientes con Bejerman (nuevo)

### NO reutilizar:
- `index.html` como base de código
- `griffo-v2_4.html` (obsoleto)

---

## 15. CONTENIDO INSTITUCIONAL DISPONIBLE

- **Historia:** 1968, Domingo Griffo. 50+ años. Tercera generación.
- **Segmentos:** Aftermarket autopartista + Industriales a medida.
- **Comercio Exterior:** Brasil, Bolivia, Chile, Uruguay.
- **Ambiental:** Reciclaje de scrap, paneles solares.
- **Dirección:** Mariquita Thompson 443, B1751AYI, La Tablada, Buenos Aires
- **Teléfono:** +(54 9) 11 4454 8401 | WhatsApp: 5491136408439

---

## 16. ESTRUCTURA PROPUESTA PARA LA WEB

### Públicas:
Home, Empresa, Catálogo (5 búsquedas), Productos Destacados, Novedades (CMS), Distribuidores, Descargas, Garantía, Desarrollo a Medida, Contacto

### Portal clientes (login Firebase):
Dashboard, Facturas, Recibos, Estado de cuenta, Pedidos (todo vía Bejerman)

### Panel Admin:
Gestión de novedades/lanzamientos/eventos

---

## 17. API BEJERMAN (PENDIENTE)

Necesita: URL base, auth, endpoints (facturas, recibos, cuenta corriente, pedidos), formato respuesta, cómo vincular usuario web con cliente Bejerman.

Web institucional + catálogo + admin se pueden desarrollar sin Bejerman.

---

## 18. INSTRUCCIONES PARA CLAUDE CODE

1. Leé este documento antes de escribir código.
2. El proxy es sagrado. Copiá `specpartsGet()` tal cual.
3. Firebase: mismo proyecto `griffo-app`.
4. El `index.html` adjunto tiene la UX real.
5. Preguntá antes de asumir.
6. Versioná siempre.
7. Deploy en Vercel, proyecto nuevo.
