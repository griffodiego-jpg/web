import { NextResponse } from "next/server";
import { escapeCsvCell } from "@/lib/escape";
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
  lines.push(`Pedido;${escapeCsvCell(pedido.id)}`);
  lines.push(`Fecha;${escapeCsvCell(new Date(pedido.createdAt).toLocaleString("es-AR"))}`);
  lines.push(`Cliente;${escapeCsvCell(pedido.clientName)}`);
  lines.push(`Código cliente;${escapeCsvCell(pedido.clientId)}`);
  lines.push(`Email;${escapeCsvCell(pedido.clientEmail)}`);
  lines.push(
    `Sucursal;${escapeCsvCell(pedido.warehouseDescription || "—")} (${escapeCsvCell(pedido.warehouseId || "—")})`,
  );
  lines.push(`Estado;${escapeCsvCell(pedido.status)}`);
  if (pedido.erpOrderNumber) {
    lines.push(`Nº nota ERP;${escapeCsvCell(pedido.erpOrderNumber)}`);
  }
  lines.push("");
  // Tabla de ítems
  lines.push("Código;Producto;Cantidad;Unitario;Subtotal");
  for (const it of pedido.items) {
    lines.push(
      [
        escapeCsvCell(it.productCode),
        escapeCsvCell(it.name),
        escapeCsvCell(it.quantity),
        escapeCsvCell(it.unitPrice.toFixed(2)),
        escapeCsvCell(it.subtotal.toFixed(2)),
      ].join(";"),
    );
  }
  lines.push("");
  lines.push(`Total (+ IVA);${escapeCsvCell(pedido.total.toFixed(2))}`);

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
