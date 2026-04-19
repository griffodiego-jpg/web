# Borrador de mail al proveedor del middleware de Bejerman

Copy/paste y editá los campos entre `<<...>>` antes de mandar.

---

**Asunto:** Integración de Bejerman con web griffo.com.ar — documentación técnica

Hola <<NOMBRE DEL CONTACTO>>,

¿Cómo andás? Te escribo desde Griffo SA. Estamos desarrollando la
nueva web institucional en **griffo.com.ar** y queremos sumar un
portal para nuestros ~80 clientes mayoristas donde puedan:

- Ver su cuenta corriente y saldo.
- Descargar sus facturas.
- Descargar su lista de precios privada.
- Armar pedidos que vayan a su cuenta corriente.

Para esto queremos consumir el middleware de Bejerman que tenemos
contratado con ustedes. El equipo de desarrollo necesita la
siguiente información técnica para avanzar:

### 1. Conexión

- URL base (producción).
- ¿Existe entorno de sandbox/desarrollo? Si es sí, URL y credenciales
  separadas.
- Método de autenticación (API key, OAuth, usuario+password).
- Headers requeridos (ejemplo de un request autenticado).
- Rate limits y política de reintentos recomendada.

### 2. Credenciales

- Credenciales de desarrollo/sandbox para testear sin tocar datos
  reales.
- Credenciales de producción (las guardamos cifradas en Vercel).

### 3. Endpoints

Necesitamos confirmar qué endpoints tiene disponibles el middleware
para lo siguiente (los nombres son tentativos, usen los que tengan):

1. Listado y búsqueda de clientes (por código, CUIT o email).
2. Detalle de un cliente.
3. Lista de precios particular de un cliente (en JSON o como
   descarga de PDF/Excel).
4. Cuenta corriente de un cliente: saldo actual + movimientos
   (filtrable por rango de fechas).
5. Facturas de un cliente: listado + descarga del PDF.
6. Pedidos: creación (con ítems, cantidades, cliente), consulta
   por ID, listado por cliente, estado.
7. Artículos / productos: listado con código y stock (si lo manejan).

Para cada endpoint, necesitamos:

- URL y método (GET/POST).
- Parámetros de entrada.
- **Un JSON de ejemplo de la respuesta real** (con 1 ó 2 registros
  alcanza). Esto nos ahorra muchísimo tiempo del lado del
  desarrollo.

### 4. Preguntas de diseño

1. ¿Cuál es el identificador primario de cliente en Bejerman que
   ustedes exponen (código interno numérico, CUIT, email, UUID)?
2. ¿Los códigos de producto de Bejerman coinciden con los códigos
   SpecParts que usamos en el catálogo público (ej. `076-35`,
   `950-32B`, `AB 25-40`)? Si no, ¿hay tabla de correspondencia?
3. Cuando creamos un pedido vía API, ¿queda en estado "pendiente"
   esperando aprobación interna de Griffo, o pasa directo a "en
   preparación"? ¿Se puede elegir?
4. ¿Qué estados de pedido maneja Bejerman? (Pendiente, Aprobado,
   En preparación, Despachado, Entregado, Cancelado, etc.)
5. ¿El middleware soporta **webhooks** para avisar cambios (pedido
   cambia de estado, se emite factura, se registra pago)? Si no,
   haremos polling.
6. ¿Hay algún tope por request (ej. máximo de ítems por pedido,
   máximo de facturas devueltas en un listado)?

### 5. Documentación formal

Si tienen PDF técnico, Postman collection, Swagger/OpenAPI, o
cualquier link a un portal de desarrollador, por favor compartilo.
Con eso arrancamos mucho más rápido.

---

Cualquier duda sobre el proyecto o el scope, avisame y coordinamos
una call corta.

Gracias,
<<TU NOMBRE>>
Griffo SA
