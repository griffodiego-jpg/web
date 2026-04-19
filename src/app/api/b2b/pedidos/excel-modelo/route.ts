import { generatePedidoTemplateXlsx } from "@/lib/excel/pedido-modelo";

/**
 * `GET /api/b2b/pedidos/excel-modelo`
 *
 * Genera y devuelve el Excel modelo de pedido con todos los códigos
 * activos del catálogo. El cliente lo baja, completa la columna
 * CANTIDAD y lo sube de vuelta.
 */

export const dynamic = "force-dynamic";
// 30 min de revalidate si alguien lo pega — pero force-dynamic gana.
export const revalidate = 0;

export async function GET() {
  try {
    const buffer = await generatePedidoTemplateXlsx();
    return new Response(buffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="pedido-griffo-modelo.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error generando Excel";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
