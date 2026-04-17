# Bejerman (ERP Griffo) — documentación de la API

Fuente oficial: `reference/bejerman/Documentación API ERP Griffo v2.pdf`
(subido por la cliente el 2026-04-17).

**Proveedor del middleware:** Promotive (presumido por el email del usuario
de ejemplo `mpinero@promotive.la`). Falta confirmar con la cliente.

---

## Conexión

- **Base URL:** `http://griffo.stidns.net:86/api`
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

---

## 🚨 Gaps vs lo que pidió la cliente

Lo que pidió y **NO está en la API**:

| Feature pedida | Endpoint necesario | Estado |
|---|---|---|
| Descarga de **facturas** | `GET /ERP/invoices` + `GET /ERP/invoices/{id}/pdf` | ❌ no existe |
| **Cuenta corriente** (saldo + movimientos) | `GET /ERP/clients/{id}/account` | ❌ no existe |
| **Lista de precios privada** descargable (PDF/XLSX) | `GET /ERP/clients/{id}/price-list` | ❌ no existe |
| **Crear cliente** desde admin | `POST /ERP/clients` | ❌ no existe |
| **Actualizar datos** de cliente | `PUT /ERP/clients/{id}` | ❌ no existe |

Preguntar al proveedor si se pueden agregar. Sin esto, `/cuenta/facturas`
y `/cuenta/cuenta-corriente` no son implementables.

## Preguntas abiertas (para el proveedor / la cliente)

1. **HTTPS:** ¿el middleware va a tener HTTPS antes de producción? Si no,
   cualquier tráfico que pase por internet va en claro.

2. **`productCode`:** los códigos de producto de Bejerman, ¿son los
   mismos que los de SpecParts (ej. `076-35`, `950-32B`, `AB 25-40`)?
   Necesitamos un ejemplo real de payload de `/ERP/prices` para confirmar.
   Si no coinciden, hay que armar tabla de mapeo.

3. **`clientId` format:** ¿qué formato tiene? ¿Es número, código
   alfanumérico, CUIT? Hace falta un ejemplo real del `GET /ERP/Clients`.

4. **Email del cliente:** ¿todos los clientes tienen email cargado en
   Bejerman? Si un cliente no tiene email, el matcheo por email en el
   alta autoservicio no sirve para ese cliente. Alternativa: matchear
   por **CUIT** — pero el endpoint no devuelve CUIT. Sería valioso que
   el proveedor lo incluya.

5. **Depósito en el pedido:** `POST /ERP/order` NO pide `warehouseId`.
   Si un cliente tiene varios depósitos, ¿cómo sabe el ERP dónde enviar?
   ¿Agarra el depósito por default? Confirmar con proveedor.

6. **`orderStatus` al crear pedido:** ¿qué valores acepta? ¿Se puede
   mandar "Pendiente aprobación" para que quede en cola antes de pasar
   a "En preparación"?

7. **`platformOrderId`:** asumo que es un ID nuestro (UUID generado en
   la web) para trackear el pedido. Confirmar.

8. **Estados de pedido (`Status`):** ¿qué valores devuelve
   `GET /ERP/orders/{id}`? Muestra `"Confirmado"` — lista completa?

9. **Webhooks:** ¿el middleware soporta avisar cambios (estado de pedido,
   nueva factura, nuevo pago)? Si no, vamos a hacer polling.

10. **Rate limits:** ¿cuántos req/seg tolera? Esto define cuán agresivo
    podemos ser cacheando y cuántos códigos podemos pedir en batch a
    `/ERP/prices`.

---

## Env vars

```
BEJERMAN_API_URL=http://griffo.stidns.net:86/api
BEJERMAN_EMAIL=           # usuario de la API de Griffo
BEJERMAN_PASSWORD=        # contraseña del usuario de la API
```

Las credenciales reales las carga la cliente en Vercel → Environment
Variables (Production + Preview + Development). **No subir a git.**
