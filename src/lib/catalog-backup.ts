/**
 * Backup del catálogo SpecParts: snapshot diario del JSON crudo + un
 * Excel human-readable. Propósito:
 *
 *   1. Backup histórico — si el proveedor se cae, cambia condiciones o
 *      cierra, tenemos la data. El JSON preserva fidelidad 100%
 *      (attributes, vehicles con años, pictures con URLs).
 *   2. Exportación para la cliente — el Excel se puede abrir con
 *      Excel/Sheets para auditorías, listas, o para pasárselo a terceros
 *      (distribuidores, contadores).
 *   3. Fallback de runtime — si `listCatalog()` falla en producción,
 *      servimos el último snapshot exitoso desde Blob (ver
 *      `listCatalogWithFallback` en `src/lib/api/specparts.ts`).
 *
 * Storage:
 *   - Archivos: Vercel Blob público, paths
 *     `catalog-backup/griffo-catalog-YYYY-MM-DD.{json,xlsx}`
 *   - Metadata: Redis key `catalog-backup:snapshots` = array JSON
 *     ordenado descendente por fecha. Máximo 30 entradas (retención
 *     ~1 mes).
 *
 * Flujos que disparan una regeneración:
 *   - Manual: botón "Regenerar" en /admin/catalogo-backup.
 *   - Automático: cron diario a las 4am UTC (`/api/cron/catalog-backup`,
 *     schedule en `vercel.json`).
 *
 * Idempotencia: si hoy ya hay un snapshot, se sobreescribe. La entrada
 * en el array se actualiza en lugar de agregarse.
 *
 * Nota: este módulo es server-only de hecho (depende de @vercel/blob y
 * exceljs, que no corren en browser). Antes tenía `import "server-only"`
 * explícito, pero Turbopack seguía el dynamic import desde specparts.ts
 * aunque el bundler de cliente no lo iba a cargar en runtime, y tiraba
 * error al compilar. Lo removimos — si algún día alguien lo importa de
 * un client component, va a romper igual por las deps nativas.
 */

import { del, put } from "@vercel/blob";
import ExcelJS from "exceljs";

import { listCatalog } from "@/lib/api/specparts";
import { getDisplayApplication } from "@/lib/catalog/display";
import { getRedis } from "@/lib/kv";
import type { CatalogProduct } from "@/types/specparts";

const META_KEY = "catalog-backup:snapshots";
const MAX_SNAPSHOTS = 30;

export type CatalogSnapshot = {
  /** YYYY-MM-DD, clave primaria. */
  date: string;
  /** ISO date-time de la generación exacta. */
  generatedAt: string;
  jsonUrl: string;
  jsonBytes: number;
  xlsxUrl: string;
  xlsxBytes: number;
  productCount: number;
};

export async function readSnapshots(): Promise<CatalogSnapshot[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.get<CatalogSnapshot[] | string>(META_KEY);
    if (!raw) return [];
    const arr = typeof raw === "string" ? (JSON.parse(raw) as CatalogSnapshot[]) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

async function writeSnapshots(list: CatalogSnapshot[]): Promise<void> {
  const redis = getRedis();
  if (!redis) throw new Error("Redis no configurado");
  await redis.set(META_KEY, JSON.stringify(list));
}

export async function readLatestSnapshot(): Promise<CatalogSnapshot | null> {
  const list = await readSnapshots();
  return list[0] ?? null;
}

/**
 * Genera un snapshot nuevo del catálogo. Lee SpecParts, sube JSON +
 * Excel a Blob, y actualiza la metadata en Redis. Si hoy ya hay snapshot,
 * lo sobreescribe (tanto los Blobs como la entrada del array).
 *
 * Devuelve el snapshot recién creado.
 */
export async function regenerateCatalogSnapshot(): Promise<CatalogSnapshot> {
  const products = await listCatalog({ skipFallback: true });
  if (!products.length) {
    throw new Error("SpecParts devolvió 0 productos — no se genera snapshot vacío");
  }

  const today = new Date().toISOString().slice(0, 10);
  const generatedAt = new Date().toISOString();

  const jsonBlob = JSON.stringify(products);
  const xlsxBuffer = await buildXlsx(products);

  // Overwrite cualquier snapshot del mismo día — así el cron diario no
  // acumula duplicados si corre dos veces por retry.
  const [jsonUpload, xlsxUpload] = await Promise.all([
    put(`catalog-backup/griffo-catalog-${today}.json`, jsonBlob, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    }),
    put(`catalog-backup/griffo-catalog-${today}.xlsx`, xlsxBuffer, {
      access: "public",
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      addRandomSuffix: false,
      allowOverwrite: true,
    }),
  ]);

  const snapshot: CatalogSnapshot = {
    date: today,
    generatedAt,
    jsonUrl: jsonUpload.url,
    jsonBytes: Buffer.byteLength(jsonBlob, "utf8"),
    xlsxUrl: xlsxUpload.url,
    xlsxBytes: xlsxBuffer.byteLength,
    productCount: products.length,
  };

  const existing = await readSnapshots();
  const merged = [
    snapshot,
    ...existing.filter((s) => s.date !== today),
  ].slice(0, MAX_SNAPSHOTS);

  // Antes de persistir, borramos del Blob los snapshots que quedaron
  // fuera de la ventana — evita acumular MB indefinidamente. Fallos
  // silenciosos (si un Blob ya no existe, no es grave).
  const dropped = existing.filter(
    (s) => !merged.some((m) => m.date === s.date),
  );
  await Promise.all(
    dropped.flatMap((s) => [
      del(s.jsonUrl).catch(() => undefined),
      del(s.xlsxUrl).catch(() => undefined),
    ]),
  );

  await writeSnapshots(merged);
  return snapshot;
}

/* -------------------------------------------------------------------------- */
/*  Excel builder                                                              */
/* -------------------------------------------------------------------------- */

/**
 * 3 hojas denormalizadas para que el Excel sea útil:
 *   - Productos: 1 fila por producto (core fields + conteos).
 *   - Vehículos: 1 fila por par producto×vehículo compatible.
 *   - Atributos: 1 fila por par producto×atributo.
 *
 * Cualquiera de las tres basta para re-importar el catálogo en otro
 * sistema si el proveedor original deja de funcionar.
 */
async function buildXlsx(products: CatalogProduct[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Griffo web";
  wb.created = new Date();

  /* --- Sheet 1: Productos --- */
  const productSheet = wb.addWorksheet("Productos");
  productSheet.columns = [
    { header: "Código", key: "code", width: 14 },
    { header: "Línea", key: "category", width: 14 },
    { header: "Producto", key: "product", width: 28 },
    { header: "Kit", key: "isKit", width: 6 },
    { header: "Descripción", key: "description", width: 40 },
    { header: "Ubicación", key: "ubicacion", width: 22 },
    { header: "Lado", key: "lado", width: 22 },
    { header: "Vehículos", key: "vehicleCount", width: 12 },
    { header: "Fotos", key: "pictureCount", width: 8 },
    { header: "Discontinuado", key: "discontinued", width: 14 },
    { header: "Habilitado", key: "enabled", width: 12 },
    { header: "Slug", key: "slug", width: 40 },
    { header: "Actualizado", key: "updatedAt", width: 22 },
  ];
  for (const p of products) {
    const { ubicaciones, lados } = getDisplayApplication(p);
    productSheet.addRow({
      code: p.code,
      category: p.category,
      product: p.product,
      isKit: p.is_kit ? "Sí" : "No",
      description: p.description,
      ubicacion: ubicaciones.join(", "),
      lado: lados.join(", "),
      vehicleCount: p.vehicles?.length ?? 0,
      pictureCount: p.pictures?.length ?? 0,
      discontinued: p.discontinued ? "Sí" : "No",
      enabled: p.enabled ? "Sí" : "No",
      slug: p.slug,
      updatedAt: p.updated_at,
    });
  }
  styleHeader(productSheet);
  productSheet.views = [{ state: "frozen", ySplit: 1 }];
  productSheet.autoFilter = { from: "A1", to: "M1" };

  /* --- Sheet 2: Vehículos --- */
  const vehicleSheet = wb.addWorksheet("Vehículos");
  vehicleSheet.columns = [
    { header: "Código producto", key: "code", width: 14 },
    { header: "Marca", key: "brand", width: 16 },
    { header: "Modelo base", key: "masterModel", width: 20 },
    { header: "Modelo", key: "model", width: 24 },
    { header: "Versión", key: "version", width: 18 },
    { header: "Año desde", key: "from", width: 12 },
    { header: "Año hasta", key: "until", width: 12 },
  ];
  for (const p of products) {
    for (const v of p.vehicles ?? []) {
      vehicleSheet.addRow({
        code: p.code,
        brand: v.brand,
        masterModel: v.master_model,
        model: v.model,
        version: v.version,
        from: v.sold_from_year,
        until: v.sold_until_year,
      });
    }
  }
  styleHeader(vehicleSheet);
  vehicleSheet.views = [{ state: "frozen", ySplit: 1 }];
  vehicleSheet.autoFilter = { from: "A1", to: "G1" };

  /* --- Sheet 3: Atributos --- */
  const attrSheet = wb.addWorksheet("Atributos");
  attrSheet.columns = [
    { header: "Código producto", key: "code", width: 14 },
    { header: "Atributo", key: "name", width: 28 },
    { header: "Valor", key: "value", width: 20 },
    { header: "Unidad", key: "unit", width: 10 },
  ];
  for (const p of products) {
    for (const a of p.attributes ?? []) {
      attrSheet.addRow({
        code: p.code,
        name: a.name,
        value: a.value,
        unit: a.unit,
      });
    }
  }
  styleHeader(attrSheet);
  attrSheet.views = [{ state: "frozen", ySplit: 1 }];
  attrSheet.autoFilter = { from: "A1", to: "D1" };

  const arrayBuffer = await wb.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

function styleHeader(sheet: ExcelJS.Worksheet): void {
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF00549F" },
  };
  header.alignment = { vertical: "middle" };
  header.height = 20;
}
