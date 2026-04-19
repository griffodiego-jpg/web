import { NextResponse } from "next/server";
import {
  parsePedidoBulkText,
  parsePedidoFile,
  type ParsedPedido,
} from "@/lib/excel/parse-pedido";

/**
 * `POST /api/b2b/pedidos/parse`
 *
 * Dos modos:
 *   1. multipart con `file` (xlsx/csv) → parsea el archivo.
 *   2. JSON con `{ text: "..." }` → parsea texto libre (tab "pegar
 *      varios códigos").
 *
 * Devuelve preview con items válidos e inválidos. NO agrega al carrito
 * — eso lo hace el cliente después de confirmar el preview.
 */

export const dynamic = "force-dynamic";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request): Promise<Response> {
  const contentType = req.headers.get("content-type") ?? "";

  try {
    let result: ParsedPedido;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "No se recibió ningún archivo" },
          { status: 400 },
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "Archivo demasiado grande (máx 5 MB)" },
          { status: 400 },
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      result = await parsePedidoFile(buffer, file.name);
    } else {
      const body = (await req.json()) as { text?: unknown };
      const text = String(body.text ?? "").trim();
      if (!text) {
        return NextResponse.json(
          { error: "Pegá los códigos + cantidades" },
          { status: 400 },
        );
      }
      result = await parsePedidoBulkText(text);
    }

    return NextResponse.json({ ok: true, result });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Error al parsear";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
