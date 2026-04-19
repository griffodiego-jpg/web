import ExcelJS from "exceljs";
import { listCatalog } from "@/lib/api/specparts";
import { getDisplayApplication } from "@/lib/catalog/display";
import { getMockCompraPrice } from "@/lib/mock-prices";
import type { CatalogProduct } from "@/types/specparts";

/**
 * Genera el Excel modelo para que el cliente lo baje, complete la
 * columna "Cantidad" y lo suba de vuelta.
 *
 * Columnas (A..K):
 *   A  Código
 *   B  Línea            (SUSPENSIÓN / DIRECCIÓN / TRANSMISIÓN)
 *   C  Tipo             (Kit / Fuelle / Tope / Otro)
 *   D  Kit              (Sí / No)
 *   E  Producto         (product.product)
 *   F  Descripción      (product.description)
 *   G  Ubicación        (DELANTERO / TRASERO / LADO RUEDA / ...)
 *   H  Lado             (IZQUIERDO / DERECHO / —)
 *   I  Vehículos        (resumen por marca, truncado si es largo)
 *   J  Precio compra    (ref, neto sin IVA)
 *   K  CANTIDAD (editable)
 *
 * Autofilter en todo el header. Columna K con fondo amarillo suave
 * para indicar que es la única editable. Freeze del header y de la
 * columna A.
 */

type Row = {
  code: string;
  linea: string;
  tipo: string;
  isKit: string;
  producto: string;
  descripcion: string;
  ubicacion: string;
  lado: string;
  vehiculos: string;
  precio: number;
};

function classifyTipo(p: CatalogProduct): string {
  if (p.is_kit === 1) return "Kit";
  const prod = (p.product ?? "").toUpperCase();
  if (prod.includes("FUELLE")) return "Fuelle";
  if (prod.includes("TOPE")) return "Tope";
  if (prod.includes("MONTADORA")) return "Máquina";
  if (prod.includes("EXTRACTOR")) return "Herramienta";
  if (prod.includes("PINZA")) return "Herramienta";
  if (prod.includes("ABRAZADERA")) return "Accesorio";
  return "Otro";
}

function vehiclesSummary(p: CatalogProduct): string {
  const byBrand = new Map<string, Set<string>>();
  for (const v of p.vehicles ?? []) {
    if (!v.brand) continue;
    if (!byBrand.has(v.brand)) byBrand.set(v.brand, new Set());
    if (v.master_model) byBrand.get(v.brand)!.add(v.master_model);
  }
  const parts = [...byBrand.entries()].map(([brand, models]) => {
    const modelList = [...models].join(" / ");
    return modelList ? `${brand} (${modelList})` : brand;
  });
  const text = parts.join(", ");
  // Evitamos celdas enormes — máx 180 chars, truncamos con "…"
  if (text.length <= 180) return text;
  return text.slice(0, 177) + "…";
}

function buildRows(products: CatalogProduct[]): Row[] {
  return products
    .filter((p) => p.enabled === 1 && !p.discontinued)
    .map((p) => {
      const disp = getDisplayApplication(p);
      return {
        code: p.code,
        linea: (p.category ?? "").toString(),
        tipo: classifyTipo(p),
        isKit: p.is_kit === 1 ? "Sí" : "No",
        producto: (p.product ?? "").toString(),
        descripcion: (p.description ?? "").toString(),
        ubicacion: disp.ubicaciones.join(" · "),
        lado: disp.lados.join(" · ") || "—",
        vehiculos: vehiclesSummary(p),
        precio: getMockCompraPrice(p.code),
      };
    })
    .sort((a, b) => {
      // Ordenamos por Línea → Tipo → Código para que el cliente
      // pueda revisar todo lo de una categoría junto.
      return (
        a.linea.localeCompare(b.linea, "es") ||
        a.tipo.localeCompare(b.tipo, "es") ||
        a.code.localeCompare(b.code, "es")
      );
    });
}

export async function generatePedidoTemplateXlsx(): Promise<Buffer> {
  const products = await listCatalog();
  const rows = buildRows(products);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Griffo SA";
  wb.created = new Date();

  // Hoja 1: Pedido
  const ws = wb.addWorksheet("Pedido", {
    views: [{ state: "frozen", ySplit: 1, xSplit: 1 }],
  });

  const COLS = [
    { header: "Código", key: "code", width: 16 },
    { header: "Línea", key: "linea", width: 14 },
    { header: "Tipo", key: "tipo", width: 14 },
    { header: "Kit", key: "isKit", width: 8 },
    { header: "Producto", key: "producto", width: 30 },
    { header: "Descripción", key: "descripcion", width: 36 },
    { header: "Ubicación", key: "ubicacion", width: 20 },
    { header: "Lado", key: "lado", width: 14 },
    { header: "Vehículos compatibles", key: "vehiculos", width: 50 },
    { header: "Precio compra ref. (sin IVA)", key: "precio", width: 18 },
    { header: "CANTIDAD", key: "cantidad", width: 12 },
  ];
  ws.columns = COLS;

  // Header con estilo
  const header = ws.getRow(1);
  header.height = 24;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF00549F" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    cell.border = {
      top: { style: "thin", color: { argb: "FF00549F" } },
      left: { style: "thin", color: { argb: "FF00549F" } },
      bottom: { style: "thin", color: { argb: "FF00549F" } },
      right: { style: "thin", color: { argb: "FF00549F" } },
    };
  });

  // Pintamos la cabecera de la columna CANTIDAD en amarillo para destacar
  const cantHeader = ws.getCell(1, 11);
  cantHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFBBF24" },
  };
  cantHeader.font = { bold: true, color: { argb: "FF0A2B3D" }, size: 11 };

  // Filas de datos
  for (const r of rows) {
    ws.addRow({
      code: r.code,
      linea: r.linea,
      tipo: r.tipo,
      isKit: r.isKit,
      producto: r.producto,
      descripcion: r.descripcion,
      ubicacion: r.ubicacion,
      lado: r.lado,
      vehiculos: r.vehiculos,
      precio: r.precio,
      cantidad: null,
    });
  }

  // Formato de la columna Precio como número con separador de miles
  ws.getColumn("precio").numFmt = '"$"#,##0';
  ws.getColumn("precio").alignment = { horizontal: "right" };

  // Columna cantidad: fondo amarillo claro + validación numérica
  const lastRow = ws.rowCount;
  for (let r = 2; r <= lastRow; r++) {
    const cell = ws.getCell(r, 11);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFEF9C3" },
    };
    cell.alignment = { horizontal: "right" };
    cell.dataValidation = {
      type: "whole",
      operator: "greaterThanOrEqual",
      allowBlank: true,
      formulae: [0],
      errorTitle: "Cantidad inválida",
      error: "Ingresá un número entero mayor o igual a 0.",
    };
  }

  // Auto-filter sobre todo el header
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 11 } };

  // Hoja 2: Instrucciones
  const help = wb.addWorksheet("Instrucciones");
  help.columns = [{ width: 100 }];
  const helpRows: Array<[string, "title" | "body" | "bullet"]> = [
    ["Cómo usar este Excel", "title"],
    ["", "body"],
    [
      "1. Completá la columna amarilla CANTIDAD con la cantidad que querés pedir de cada producto.",
      "bullet",
    ],
    ["2. Dejá en 0 o en blanco los que no querés pedir.", "bullet"],
    [
      "3. Podés filtrar u ordenar por Línea, Tipo, Kit, etc. usando el autofiltro en la cabecera.",
      "bullet",
    ],
    ["4. Guardá el archivo (Excel o CSV) y subílo en el portal.", "bullet"],
    ["", "body"],
    [
      "El precio es de referencia y sin IVA. El precio final lo confirma Griffo al facturar.",
      "body",
    ],
    [
      "Los códigos que agregues que no existan en el catálogo se van a marcar como inválidos al subir el archivo — podés continuar con los válidos.",
      "body",
    ],
  ];
  for (const [text, kind] of helpRows) {
    const row = help.addRow([text]);
    const cell = row.getCell(1);
    if (kind === "title") {
      cell.font = { bold: true, size: 16, color: { argb: "FF00549F" } };
      row.height = 28;
    } else if (kind === "bullet") {
      cell.font = { size: 11 };
      cell.alignment = { wrapText: true };
    } else {
      cell.font = { size: 11, italic: true, color: { argb: "FF64748B" } };
      cell.alignment = { wrapText: true };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
