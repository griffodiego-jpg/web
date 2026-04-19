import ExcelJS from "exceljs";
import { listCatalog } from "@/lib/api/specparts";
import { getMockCompraPrice } from "@/lib/mock-prices";
import type { CatalogProduct } from "@/types/specparts";

/**
 * Parsea un archivo XLSX / XLS / CSV subido por el cliente con códigos
 * + cantidades y devuelve un preview con productos válidos e inválidos.
 *
 * Reglas:
 * - Detecta automáticamente las columnas "Código" y "Cantidad" por
 *   nombre de header (case-insensitive). Si no hay headers reconocibles,
 *   asume que la primera columna es código y la última con números es
 *   cantidad.
 * - Ignora filas con cantidad 0, en blanco, negativa o no-numérica.
 * - Códigos case-insensitive, normalizando espacios.
 */

export interface ParsedValidItem {
  productCode: string;
  slug: string;
  name: string;
  image?: string;
  quantity: number;
  unitPrice: number;
}

export interface ParsedInvalidItem {
  row: number;
  rawCode: string;
  rawQuantity: string;
  reason: string;
}

export interface ParsedPedido {
  valid: ParsedValidItem[];
  invalid: ParsedInvalidItem[];
  totalRowsProcessed: number;
}

const CODE_HEADERS = ["código", "codigo", "code", "cod"];
const QTY_HEADERS = ["cantidad", "cant", "qty", "quantity", "unidades"];

function normalizeCode(raw: string): string {
  return raw.toString().trim().toUpperCase().replace(/\s+/g, " ");
}

function findColumnByHeader(
  headers: string[],
  candidates: string[],
): number {
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]?.toString().trim().toLowerCase() ?? "";
    if (candidates.some((c) => h === c || h.startsWith(c))) return i;
  }
  return -1;
}

/** Parsea un XLSX con ExcelJS. */
async function parseXlsx(
  buffer: Buffer,
): Promise<{ rows: string[][]; totalRows: number }> {
  const wb = new ExcelJS.Workbook();
  // ExcelJS pide ArrayBuffer — convertimos la vista Buffer de Node.
  const ab = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength,
  ) as ArrayBuffer;
  await wb.xlsx.load(ab);
  const ws = wb.worksheets[0];
  if (!ws) return { rows: [], totalRows: 0 };
  const rows: string[][] = [];
  ws.eachRow((row) => {
    const cells: string[] = [];
    row.eachCell({ includeEmpty: true }, (cell) => {
      let v: unknown = cell.value;
      if (v && typeof v === "object" && "text" in (v as object)) {
        v = (v as { text: string }).text;
      }
      if (v && typeof v === "object" && "result" in (v as object)) {
        v = (v as { result: unknown }).result;
      }
      cells.push(v == null ? "" : String(v));
    });
    rows.push(cells);
  });
  return { rows, totalRows: rows.length };
}

/** Parsea un CSV simple (separadores ; o , o tab). */
function parseCsv(text: string): { rows: string[][]; totalRows: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  const sep =
    text.includes(";") && !text.includes(",")
      ? ";"
      : text.includes("\t")
        ? "\t"
        : ",";
  const rows = lines.map((line) => {
    // Handler minimal con comillas:
    const out: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === sep && !inQuotes) {
        out.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    out.push(current);
    return out.map((c) => c.trim());
  });
  return { rows, totalRows: rows.length };
}

export async function parsePedidoFile(
  buffer: Buffer,
  filename: string,
): Promise<ParsedPedido> {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const { rows } = ext === "csv"
    ? parseCsv(buffer.toString("utf8").replace(/^\uFEFF/, ""))
    : await parseXlsx(buffer);

  if (rows.length === 0) {
    return { valid: [], invalid: [], totalRowsProcessed: 0 };
  }

  // Detectar si la primera fila es header
  const firstRow = rows[0] ?? [];
  const looksLikeHeader = firstRow.some((cell) => {
    const h = cell.toString().trim().toLowerCase();
    return CODE_HEADERS.includes(h) || QTY_HEADERS.includes(h);
  });

  let codeCol = 0;
  let qtyCol = firstRow.length - 1;
  let dataStart = 0;
  if (looksLikeHeader) {
    const byCode = findColumnByHeader(firstRow, CODE_HEADERS);
    const byQty = findColumnByHeader(firstRow, QTY_HEADERS);
    if (byCode !== -1) codeCol = byCode;
    if (byQty !== -1) qtyCol = byQty;
    dataStart = 1;
  }

  // Cargar catálogo una vez y construir mapa por código
  const catalog = await listCatalog();
  const byCode = new Map<string, CatalogProduct>();
  for (const p of catalog) byCode.set(normalizeCode(p.code), p);

  const valid: ParsedValidItem[] = [];
  const invalid: ParsedInvalidItem[] = [];
  const seen = new Map<string, number>(); // code → index en valid[]

  for (let i = dataStart; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c.toString().trim())) continue;

    const rawCode = (row[codeCol] ?? "").toString().trim();
    const rawQty = (row[qtyCol] ?? "").toString().trim();
    if (!rawCode) continue;

    const qty = Math.floor(Number(rawQty.replace(",", ".")));
    if (!rawQty || Number.isNaN(qty) || qty <= 0) {
      // En blanco / 0 / inválido: lo saltamos silenciosamente si es 0
      // o en blanco; si es NaN lo reportamos.
      if (rawQty && Number.isNaN(qty)) {
        invalid.push({
          row: i + 1,
          rawCode,
          rawQuantity: rawQty,
          reason: "Cantidad inválida (no es un número)",
        });
      }
      continue;
    }

    const prod = byCode.get(normalizeCode(rawCode));
    if (!prod) {
      invalid.push({
        row: i + 1,
        rawCode,
        rawQuantity: rawQty,
        reason: `Código "${rawCode}" no existe en el catálogo Griffo`,
      });
      continue;
    }

    // Si el mismo código aparece dos veces, acumulamos la cantidad
    const existingIdx = seen.get(prod.code);
    if (existingIdx != null) {
      valid[existingIdx].quantity += qty;
      continue;
    }
    const unitPrice = getMockCompraPrice(prod.code);
    valid.push({
      productCode: prod.code,
      slug: prod.slug,
      name: (prod.product ?? "").toString(),
      image: prod.pictures?.[0]?.image_url,
      quantity: qty,
      unitPrice,
    });
    seen.set(prod.code, valid.length - 1);
  }

  return {
    valid,
    invalid,
    totalRowsProcessed: rows.length - dataStart,
  };
}

/**
 * Parsea texto libre del estilo "codigo cantidad" (uno por línea) usado
 * por el tab de "pegar varios códigos". Separadores aceptados: tab,
 * espacio, coma, punto y coma.
 */
export async function parsePedidoBulkText(text: string): Promise<ParsedPedido> {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const catalog = await listCatalog();
  const byCode = new Map<string, CatalogProduct>();
  for (const p of catalog) byCode.set(normalizeCode(p.code), p);

  const valid: ParsedValidItem[] = [];
  const invalid: ParsedInvalidItem[] = [];
  const seen = new Map<string, number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Dividimos por separadores comunes. Tomamos el último token como
    // cantidad y todo lo de antes como código (soporta códigos con espacios
    // tipo "AB 25-40").
    const parts = line
      .split(/[;,\t]|\s{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);

    let rawCode = line;
    let rawQty = "";
    if (parts.length >= 2) {
      rawQty = parts[parts.length - 1];
      rawCode = parts.slice(0, -1).join(" ");
    } else {
      // Última chance: dividir por último espacio simple si el último
      // token es un número
      const m = line.match(/^(.+?)\s+(\d+)\s*$/);
      if (m) {
        rawCode = m[1].trim();
        rawQty = m[2].trim();
      } else {
        invalid.push({
          row: i + 1,
          rawCode: line,
          rawQuantity: "",
          reason: "No se detectó cantidad (esperado: código + cantidad)",
        });
        continue;
      }
    }

    const qty = Math.floor(Number(rawQty.replace(",", ".")));
    if (Number.isNaN(qty) || qty <= 0) {
      invalid.push({
        row: i + 1,
        rawCode,
        rawQuantity: rawQty,
        reason: "Cantidad inválida",
      });
      continue;
    }

    const prod = byCode.get(normalizeCode(rawCode));
    if (!prod) {
      invalid.push({
        row: i + 1,
        rawCode,
        rawQuantity: rawQty,
        reason: `Código "${rawCode}" no existe en el catálogo`,
      });
      continue;
    }
    const existingIdx = seen.get(prod.code);
    if (existingIdx != null) {
      valid[existingIdx].quantity += qty;
      continue;
    }
    valid.push({
      productCode: prod.code,
      slug: prod.slug,
      name: (prod.product ?? "").toString(),
      image: prod.pictures?.[0]?.image_url,
      quantity: qty,
      unitPrice: getMockCompraPrice(prod.code),
    });
    seen.set(prod.code, valid.length - 1);
  }

  return { valid, invalid, totalRowsProcessed: lines.length };
}
