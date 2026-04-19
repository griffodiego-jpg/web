import { NextResponse } from "next/server";
import { getPedido } from "@/lib/pedidos";

/**
 * `GET /api/admin/pedidos/{id}/excel`
 *
 * Stub: hasta que instalemos la lib de Excel (paso 7), devolvemos un
 * CSV simple con el mismo formato (encabezado cliente + tabla código,
 * cantidad). El operador lo abre en Excel sin problemas.
 *
 * Cuando se agregue `exceljs`/`xlsx`, este handler devuelve el .xlsx
 * real y el resto del flujo queda igual.
 */

export const dynamic = "force-dynamic";

function csvEscape(v: string | number): string {
  const s = String(v);
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const pedido = await getPedido(id);
  if (!pedido) {
    return NextResponse.json({ error: "Pedido no existe" }, { status: 404 });
  }

  const lines: string[] = [];
  // Encabezado con datos del cliente
  lines.push(`Pedido;${csvEscape(pedido.id)}`);
  lines.push(`Fecha;${csvEscape(new Date(pedido.createdAt).toLocaleString("es-AR"))}`);
  lines.push(`Cliente;${csvEscape(pedido.clientName)}`);
  lines.push(`Código cliente;${csvEscape(pedido.clientId)}`);
  lines.push(`Email;${csvEscape(pedido.clientEmail)}`);
  lines.push(`Estado;${csvEscape(pedido.status)}`);
  if (pedido.erpOrderNumber) {
    lines.push(`Nº nota ERP;${csvEscape(pedido.erpOrderNumber)}`);
  }
  lines.push("");
  // Tabla de ítems
  lines.push("Código;Producto;Cantidad;Unitario;Subtotal");
  for (const it of pedido.items) {
    lines.push(
      [
        csvEscape(it.productCode),
        csvEscape(it.name),
        csvEscape(it.quantity),
        csvEscape(it.unitPrice.toFixed(2)),
        csvEscape(it.subtotal.toFixed(2)),
      ].join(";"),
    );
  }
  lines.push("");
  lines.push(`Total (+ IVA);${csvEscape(pedido.total.toFixed(2))}`);

  // BOM para que Excel detecte UTF-8 y abra bien los acentos.
  const body = "\uFEFF" + lines.join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedido-${pedido.id}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
