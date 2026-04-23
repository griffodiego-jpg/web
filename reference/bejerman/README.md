# Bejerman (ERP Griffo) — documentación de la API

Fuente oficial unificada:
- `reference/bejerman/Documentación API ERP Griffo v4.pdf` — contiene
  auth, clientes, precios, pedidos, cuenta corriente y descarga de
  comprobantes. Reemplaza las versiones anteriores (v2 + docx de
  cuentas corrientes).

**Proveedor de la API:** técnico propio de Griffo (la API pertenece a
Griffo, no a un tercero). En origen iba a consumirla Promotive como
proveedor de front, pero el desarrollo lo hacemos nosotros.

**Credencial provisionada (2026-04-20):**
- Usuario: `WebGriffo` (va en el campo `email` del login por
  retrocompatibilidad del schema).
- Password: ver env var `BEJERMAN_PASSWORD` en Vercel.

---

## Conexión

- **Base URL:** `http://intranet.remotogriffo.com.ar:86/api`
- ⚠️ **HTTP, no HTTPS.** El middleware no expone TLS. Implicancias:
  - Desde el navegador (código cliente) **NO se puede llamar** por mixed
    content (Vercel sirve HTTPS). Todas las llamadas van **server-side**
    desde Next.js API routes.
  - Credenciales viajan en claro en la red pública. **Pedir al proveedor
    que habilite HTTPS** antes de ir a producción. Mientras tanto, es
    aceptable para desarrollo.
- **Autenticación:** JWT Bearer. Login con email + password, devuelve
  token. 2FA opcional (`twoFactorCode` / `twoFactorRecoveryCode`).

### Login

```
POST /Auth/login
Content-Type: application/json

{
  "email": "...",
  "password": "...",
  "twoFactorCode": "",
  "twoFactorRecoveryCode": ""
}

→ { "token": "eyJ..." }
```

Usar el token en `Authorization: Bearer <token>` para el resto.

### Cambiar contraseña (del usuario API)

```
POST /Auth/change_password
{ "currentPassword": "...", "newPassword": "..." }
```

**Importante:** este endpoint cambia la contraseña **del usuario de la
API de Griffo** (o sea, de la cuenta técnica que usa la web para
consumir el ERP). **NO sirve para cambiarle la contraseña a un cliente
B2B** — la contraseña de los clientes se maneja en nuestro Firebase.

---

## Endpoints disponibles

### 1. `GET /ERP/Clients` — listar clientes del ERP

Devuelve todos los clientes registrados en Bejerman con sus depósitos
asociados.

```json
[
  {
    "client_id": "string",
    "email": "string",
    "name": "string",
    "warehouses": [
      { "warehouse_id": "string", "description": "string" }
    ]
  }
]
```

**Usos en la web:**
- Admin → `/admin/clientes`: lista completa de clientes del ERP.
- Autoservicio: al registrarse, matchear email del formulario contra
  este listado para vincular `user_web ↔ client_id`.

### 2. `POST /ERP/prices` — precios + stock por cliente + depósito

Body:
```json
{
  "clientId": "string",
  "warehouseId": "string",
  "items": [ { "productCode": "string", "quantityRequested": 0 } ]
}
```

Response:
```json
[
  {
    "productCode": "string",
    "price": 0,
    "discountedPrice": 0,
    "discountApplied": 0,
    "stock": 0
  }
]
```

**Usos:**
- Catálogo con precios B2B: al visitar `/catalogo` logueado, batchear
  códigos visibles y pedir precios.
- Carrito: cotizar al momento de agregar.
- Checkout: validar precios antes de crear el pedido.

### 3. `POST /ERP/order` — crear pedido

Body:
```json
{
  "clientId": "string",
  "products": [
    { "productId": "string", "quantity": 0, "unitPrice": 0 }
  ],
  "platformOrderId": "string",
  "orderStatus": "string"
}
```

Response:
```json
{ "erpOrderId": "string", "success": true, "message": "string" }
```

### 4. `GET /ERP/orders/{erp_order_id}` — estado del pedido

```json
{ "ErpOrderId": "12345", "Status": "Confirmado" }
```

### 5. `GET /ERP/ClientAccountStatus/{client_code}` — cuenta corriente

Estado de cuenta del cliente: lista de comprobantes con debe/haber.
De acá sale **la cuenta corriente Y el listado de facturas** (una sola
llamada).

Path param: `client_code` (string, obligatorio, sin espacios).

```json
[
  {
    "cliCod": "000001",
    "razonSocial": "ASIR S.A.",
    "emision": "2007-02-01T00:00:00.000Z",
    "comp": "FC",
    "compLetra": "A",
    "puntoVenta": "0001",
    "compNro": "00017176",
    "vencimiento": "2007-02-08T00:00:00.000Z",
    "debe": 130.28,
    "haber": 0
  }
]
```

**Usos:**
- `/cuenta/cuenta-corriente`: mostrar todos los movimientos, saldo =
  `sum(debe) - sum(haber)`.
- `/cuenta/facturas`: filtrar por `comp = "FC"` (facturas).

### 6. `GET /ERP/GetComprobante` — descargar PDF de un comprobante

Query params (todos strings): `Comp` (FC/ND/NC), `CompLetra` (A/B/…),
`PuntoVenta` (0001), `CompNro` (00012345), `CodCliente` (000001).

```
GET /ERP/GetComprobante?Comp=FC&CompLetra=A&PuntoVenta=0001&CompNro=00012345&CodCliente=000001
Content-Type: application/pdf
```

- 200 → PDF binario.
- 404 → `{ "error": "El PDF no existe." }` (silenciar en la UI con un
  "Factura aún no disponible").

Los 5 params vienen 1:1 de un item de `ClientAccountStatus` — o sea,
listamos con `ClientAccountStatus` y cada fila linkea a `GetComprobante`.

---

## 🚨 Gaps restantes vs lo que pidió la cliente

| Feature pedida | Estado | Workaround |
|---|---|---|
| Descarga de facturas | ✅ `GetComprobante` | — |
| Cuenta corriente (saldo + movimientos) | ✅ `ClientAccountStatus` | — |
| Lista de precios privada descargable | ❌ no existe | Generar PDF/XLSX nosotros iterando `/ERP/prices` con todos los códigos del catálogo. |
| Crear cliente desde admin | ❌ no existe | Alta manual en Bejerman por Griffo. La web sólo matchea contra `/ERP/Clients`. |
| Actualizar datos de cliente | ❌ no existe | Idem, editar en Bejerman. |
| Recibos (ND / NC / pagos) | ✅ `ClientAccountStatus` devuelve todos los comprobantes (FC, ND, NC, etc.), `GetComprobante` baja el PDF. | — |

## Endpoint pendiente de agregar

### 🔴 Pagos/Recibos faltantes en ClientAccountStatus (2026-04-21)

`GET /ERP/ClientAccountStatus/{client_code}` **no está devolviendo los
pagos del cliente**. Ejemplo real observado: cliente con 450
movimientos devueltos: 413 FC + 37 NC + **0 RE**.

Consecuencias:
- El "Total haber" se calcula como la suma de `haber` de NCs. En el
  caso observado dio **negativo** (-$647.947,84), lo que sugiere que
  algunas NC llegan con `haber < 0` (también un bug).
- El saldo mostrado al cliente es incorrecto — refleja casi la suma
  bruta de facturas sin descontar pagos.

**Qué pedirle al técnico**:

1. Verificar que el endpoint `/ERP/ClientAccountStatus` incluya los
   comprobantes de cobranza/recibos. Qué códigos `comp` usa para
   pagos en Bejerman (RE, RB, COB, PA, CBR, etc.)?
2. Verificar que el campo `haber` venga siempre en positivo para
   NCs y RE (convención contable estándar: pagos+créditos en haber,
   facturas+débitos en debe).

**Workarounds del lado web** (ya implementados):
- `src/lib/b2b/movement-classifier.ts`: matchea múltiples patrones
  de `comp` para detectar pagos (`RE|RB|RC|COB|PA|CBR|CX|REC`).
- Heurística extra: si `comp` no matchea y `haber > 0` con `debe == 0`,
  lo clasificamos como pago igual.
- La pantalla de cuenta corriente muestra un banner amarillo si hay
  movimientos pero 0 pagos detectados.
- `/admin/clientes/{code}/debug-cuenta` lista todos los `comp` únicos
  que el ERP devuelve para ese cliente — sirve para identificar
  códigos nuevos y extenderlos en `movement-classifier.ts`.

### Sucursal en comprobantes

✅ **Descartado (2026-04-21):** la cliente confirmó que la cuenta
corriente se muestra unificada por cliente (sin desglosar por
sucursal). No hace falta pedirle nada al técnico.

### Endpoint confirmado

**`GET /ERP/clientes/{clientCode}/pedidos`** ✅ Activo.

Lista los pedidos pendientes de entrega de un cliente — los cargados
directamente en Bejerman **y** los que llegaron por web que después
fueron cargados en el ERP. Respuesta real (ejemplo verificado con el
técnico el 2026-04-21):

```json
[
  {
    "erpOrderId": "00030824",
    "createdAt": "2026-04-09T00:00:00",
    "estimatedDispatchDate": "2026-06-01T00:00:00",
    "status": "Pendiente",
    "itemCount": 47,
    "total": 2428124
  }
]
```

Notas:
- Las fechas vienen sin TZ (`...T00:00:00` sin Z). JavaScript las
  interpreta como hora local — OK para este caso.
- El `status` sólo tiene 2 valores posibles: `Pendiente` / `Facturado`.
- Incluye pedidos viejos (vimos ejemplos de 2023/2024 en `Pendiente`).
  Habría que confirmar con la cliente si se muestran todos o sólo
  los de los últimos N meses.

Se usa en `/cuenta/pedidos` para mostrar al cliente **todos** sus
pedidos vivos, no sólo los armados desde la web.
`getPendingOrdersForClient()` en `src/lib/api/bejerman.ts` ya está
preparada: hoy devuelve `[]` cuando el endpoint tira 404; el día que
el técnico lo habilite, empieza a aparecer la info sin cambios de
código.

## Preguntas abiertas (para el proveedor / la cliente)

1. **HTTPS:** ¿el middleware va a tener HTTPS antes de producción? Si no,
   cualquier tráfico que pase por internet va en claro.

2. **`productCode`:**
   ✅ **Resuelto (2026-04-21):** Los códigos de producto de Bejerman
   son **iguales** a los de SpecParts (ej. `076-35`, `950-32B`,
   `AB 25-40`). Se pueden usar directo sin tabla de mapeo.

3. **`clientId` format:**
   ✅ **Resuelto (2026-04-21):** `client_id` es **alfanumérico** con
   zero-padding (ej. `"000001"`). Es string, no numérico.

4. **CUIT / Email del cliente:**
   ✅ **Resuelto (2026-04-21):** `GET /ERP/Clients` ahora devuelve
   `tax_id` (CUIT sin guiones, ej. `"30701532933"`). La web lo mapea
   a `cuit` al leer la respuesta (ver `getClients()` en
   `src/lib/api/bejerman.ts`). Los emails vienen en `email` — no todos
   los clientes tienen uno, así que el matcheo puede ser por CUIT
   también.

   ✅ **Resuelto (2026-04-21):** `GET /ERP/Clients.client_id` y
   `ClientAccountStatus.client_code`/`cliCod` son el **mismo valor**.
   Sin cambios necesarios del lado web.

5. **Depósito en el pedido (`warehouse_id`):**
   ✅ **Resuelto (2026-04-21):** El `warehouses[]` que viene en
   `/ERP/Clients` NO son las sucursales del cliente — son los
   **depósitos de Griffo** (Thompson = TH, Cochabamba = DCO) asignados
   a esa sucursal del cliente. Cada fila del response es una
   sucursal distinta del cliente, y el warehouse es el depósito de
   Griffo que la abastece.

   Implicancia para la web: cuando armamos un pedido, el
   `warehouseId` que mandamos a `/ERP/prices` y `/ERP/order` es el
   depósito Griffo correspondiente a la sucursal del cliente que
   elegimos. No es una elección del cliente — está pre-asignado.

   Para la UX del portal, el selector "Sucursal" debe mostrar las
   **sucursales del cliente** (Paraná / Rosario / Villa María) y
   al seleccionar, internamente se usa el warehouse_id Griffo
   asociado (DCO, TH, etc.).

6. **`orderStatus` al crear pedido:** ¿qué valores acepta? ¿Se puede
   mandar "Pendiente aprobación" para que quede en cola antes de pasar
   a "En preparación"?

7. **`platformOrderId`:** asumo que es un ID nuestro (UUID generado en
   la web) para trackear el pedido. Confirmar.

8. **Estados de pedido (`Status`):**
   ✅ **Resuelto (2026-04-21):** El ERP sólo maneja **2 estados**:
   - `"Pendiente"` → pedido cargado en Bejerman pero no facturado.
   - `"Facturado"` → pedido facturado (podemos considerar "entregado"
     del lado del cliente cuando pasa a este estado).

   Para el portal web mantenemos nuestros 4 estados propios
   (`procesando` / `en_preparacion` / `entregado` / `cancelado`)
   y el polling cuando esté `Facturado` → web pasa a `entregado`
   automáticamente.

9. **Webhooks:**
   ✅ **Resuelto (2026-04-21):** El técnico implementó webhooks.
   Dispara POST al endpoint configurado con este payload:

   ```json
   {
     "event": "order.invoiced",
     "occurredAt": "2026-04-22T10:00:00Z",
     "order": { "ErpOrderId": "...", "Status": "...", "invoice": {...} }
   }
   ```

   Eventos: `order.invoiced` (aparece factura nueva) y
   `order.status_changed` (cualquier otro cambio de estado).

   La web tiene el receptor en **`POST /api/webhooks/bejerman`** con
   auth por secret header. Al técnico le pasamos la URL + header +
   secret. Cuando llega `order.invoiced`, la web busca el pedido local
   por `erpOrderNumber`, lo marca como `entregado` y manda mail al
   cliente. Si no matchea (pedido directo del ERP), se loguea.

   **Esto resuelve también el ítem 4** (extender `GET /ERP/orders/{id}`):
   no hace falta polling, el webhook nos avisa en tiempo real.

10. **Rate limits:** ¿cuántos req/seg tolera? Esto define cuán agresivo
    podemos ser cacheando y cuántos códigos podemos pedir en batch a
    `/ERP/prices`.

---

## Env vars

```
BEJERMAN_API_URL=http://intranet.remotogriffo.com.ar:86/api
BEJERMAN_EMAIL=           # usuario de la API de Griffo
BEJERMAN_PASSWORD=        # contraseña del usuario de la API
```

Las credenciales reales las carga la cliente en Vercel → Environment
Variables (Production + Preview + Development). **No subir a git.**
