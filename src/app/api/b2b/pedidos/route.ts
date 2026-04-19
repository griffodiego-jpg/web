import { NextResponse } from "next/server";
import { createPedido } from "@/lib/pedidos";
import type { PedidoItem } from "@/types/pedido";
import {
  sendPedidoCreadoAGriffo,
  sendPedidoCreadoAlCliente,
} from "@/lib/emails/pedidos";

/**
 * `POST /api/b2b/pedidos` — crea un pedido desde el carrito del cliente.
 *
 * Body esperado:
 *
 *   {
 *     clientId: string,      // del /ERP/Clients (hoy viene de mock-b2b)
 *     clientName: string,
 *     clientEmail: string,
 *     items: Array<{
 *       productCode, slug, name,
 *       quantity, unitPrice,
 *       image?
 *     }>
 *   }
 *
 * Acciones:
 *  1. Guarda el pedido en Redis con estado "procesando".
 *  2. Manda email al cliente (confirmación).
 *  3. Manda email al admin de Griffo (operador lo carga a mano).
 *  4. Devuelve el pedido creado con su id `web-YYYYMMDD-NNNN`.
 *
 * Cuando Firebase Auth esté activo: validar que el email del body
 * coincide con el del token. Hoy confiamos en lo que manda el cliente
 * (modo demo).
 */

// Force dynamic — no caching, cada pedido se escribe en Redis.
export const dynamic = "force-dynamic";

interface BodyItem {
  productCode: unknown;
  slug: unknown;
  name: unknown;
  quantity: unknown;
  unitPrice: unknown;
  image?: unknown;
}

interface Body {
  clientId: unknown;
  clientName: unknown;
  clientEmail: unknown;
  items: unknown;
}

function parseItems(items: unknown): Omit<PedidoItem, "subtotal">[] {
  if (!Array.isArray(items)) throw new Error("items debe ser un array");
  if (items.length === 0) throw new Error("El carrito está vacío");
  return items.map((raw, idx) => {
    const it = raw as BodyItem;
    const productCode = String(it.productCode ?? "").trim();
    const slug = String(it.slug ?? "").trim();
    const name = String(it.name ?? "").trim();
    const quantity = Math.max(1, Math.floor(Number(it.quantity) || 0));
    const unitPrice = Math.max(0, Number(it.unitPrice) || 0);
    if (!productCode) throw new Error(`Item ${idx + 1} sin productCode`);
    if (!slug) throw new Error(`Item ${idx + 1} sin slug`);
    if (!name) throw new Error(`Item ${idx + 1} sin nombre`);
    return {
      productCode,
      slug,
      name,
      quantity,
      unitPrice,
      image: typeof it.image === "string" ? it.image : undefined,
    };
  });
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const clientId = String(body.clientId ?? "").trim();
  const clientName = String(body.clientName ?? "").trim();
  const clientEmail = String(body.clientEmail ?? "").trim();

  if (!clientId) {
    return NextResponse.json({ error: "Falta clientId" }, { status: 400 });
  }
  if (!clientName) {
    return NextResponse.json({ error: "Falta clientName" }, { status: 400 });
  }
  if (!clientEmail || !clientEmail.includes("@")) {
    return NextResponse.json({ error: "Email inválido" }, { status: 400 });
  }

  let items: Omit<PedidoItem, "subtotal">[];
  try {
    items = parseItems(body.items);
  } catch (e) {
    const message = e instanceof Error ? e.message : "items inválidos";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const pedido = await createPedido({
      clientId,
      clientName,
      clientEmail,
      items,
    });
    // Mails en paralelo, no bloqueamos la respuesta si uno falla (ya está
    // envuelto en try/catch internamente).
    await Promise.all([
      sendPedidoCreadoAlCliente(pedido),
      sendPedidoCreadoAGriffo(pedido),
    ]);
    return NextResponse.json({ ok: true, pedido }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error creando pedido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
