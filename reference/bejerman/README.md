# Bejerman — documentación de la API / middleware

Carpeta para guardar toda la información del proveedor del middleware
de Bejerman que vamos a consumir desde la web para el portal B2B
(`/cuenta/*`).

El objetivo de esta carpeta es que cualquier sesión de Claude Code
que arranque encuentre acá todo lo necesario para construir el
cliente HTTP de Bejerman (`src/lib/api/bejerman.ts`) sin tener que
preguntar nada más.

## Qué va en esta carpeta

- `README.md` — este archivo. Resumen de conexión + índice.
- `mail-al-proveedor.md` — borrador del pedido de información
  que la cliente le puede mandar al proveedor del middleware.
- `samples/` — JSON de ejemplo de cada endpoint (uno por archivo).
- Cualquier PDF / Postman collection / Swagger YAML que mande el
  proveedor — subirlo acá directo.

## Plantilla de datos a completar

Cuando el proveedor responda, editar este README con los valores
reales. Los campos en `TBD` son los que hoy faltan.

### Proveedor del middleware

- **Empresa:** TBD
- **Contacto:** TBD
- **Mail:** TBD
- **Teléfono:** TBD
- **Fecha de contratación del servicio:** TBD

### Conexión

- **URL base producción:** `TBD`
- **URL base sandbox/desarrollo:** `TBD` (si no hay, aclarar acá)
- **Autenticación:** `TBD` (API key en header / OAuth client_credentials /
  usuario+password / token fijo / otro)
- **Header de auth:** `TBD` (ej. `Authorization: Bearer <token>` o
  `X-API-Key: <key>`)
- **Rate limits:** `TBD`
- **Paginación:** `TBD` (limit+offset / cursor / page / sin paginación)

### Credenciales

**No pegar credenciales reales acá.** Van a Vercel → Environment
Variables. En el repo sólo van los placeholders en `.env.example`:

```
BEJERMAN_API_URL=
BEJERMAN_API_KEY=
BEJERMAN_API_SECRET=     # solo si la auth es OAuth client_credentials
```

Cuando el proveedor mande credenciales, la cliente las carga en
Vercel en los 3 scopes (Production, Preview, Development) y avisa a
Claude Code que ya están. Nunca pegar credenciales en commits.

### Endpoints mínimos que necesitamos

| Función | Endpoint esperado | Necesario para |
|---|---|---|
| Listar clientes | `GET /clientes` | Admin alta B2B (buscar por CUIT/código). |
| Detalle cliente | `GET /clientes/{id}` | Matchear user logueado con Bejerman. |
| Lista de precios del cliente | `GET /clientes/{id}/precios` | Catálogo con precios B2B + descarga lista privada. |
| Cuenta corriente | `GET /clientes/{id}/cuenta-corriente` | `/cuenta/cuenta-corriente`. |
| Saldo del cliente | `GET /clientes/{id}/saldo` (opcional) | Dashboard `/cuenta`. |
| Listar facturas | `GET /clientes/{id}/facturas?desde=YYYY-MM-DD` | `/cuenta/facturas`. |
| PDF de factura | `GET /facturas/{id}/pdf` | Descarga desde `/cuenta/facturas`. |
| Crear pedido | `POST /pedidos` | Checkout B2B. |
| Consultar pedido | `GET /pedidos/{id}` | Seguimiento desde `/cuenta/pedidos`. |
| Listar pedidos del cliente | `GET /clientes/{id}/pedidos` | `/cuenta/pedidos`. |
| Artículos / stock | `GET /articulos` (opcional) | Cruzar código SpecParts ↔ código Bejerman. |

Si el proveedor ofrece endpoints con otros nombres / estructura,
pegar acá la lista real que mande él.

### Samples

Para cada endpoint que confirme el proveedor, pedirle al menos un
ejemplo de respuesta real (con 1 ó 2 registros). Guardarlos en
`samples/` con nombres descriptivos:

```
samples/
├── clientes-list.json
├── cliente-detalle.json
├── cliente-precios.json
├── cliente-cuenta-corriente.json
├── facturas-list.json
├── factura-detalle.json
├── pedido-create-request.json
├── pedido-create-response.json
└── pedido-detalle.json
```

### Decisiones abiertas que el proveedor nos tiene que responder

1. ¿La lista de precios por cliente vuelve como JSON (precio por
   código) o como descarga de PDF/Excel?
2. ¿Qué identificador usa Bejerman como clave primaria de cliente
   (código interno, CUIT, email)?
3. ¿Los códigos de producto de Bejerman son los mismos que los de
   SpecParts (ej. `076-35`, `950-32B`)? Si no, ¿hay forma de cruzarlos?
4. Cuando creamos un pedido vía API, ¿queda en estado "pendiente"
   en Bejerman esperando aprobación interna de Griffo, o pasa
   directo a "en preparación"?
5. ¿Los estados de pedido que maneja Bejerman son los que podemos
   mostrarle al cliente tal cual, o hay que mapearlos?
6. ¿Hay webhooks desde Bejerman cuando cambia el estado de un
   pedido / se emite una factura / se registra un pago? Si no,
   vamos a hacer polling.

## Próximos pasos una vez completada la info

1. Completar este README con los datos reales.
2. Subir los JSON de ejemplo a `samples/`.
3. Avisar a Claude Code ("subí lo de Bejerman").
4. Claude Code va a:
   - Generar los tipos TS en `src/types/bejerman.ts` a partir de
     los samples.
   - Construir el cliente HTTP en `src/lib/api/bejerman.ts` con
     auth, retry y cache.
   - Escribir tests contra los samples (mocks).
