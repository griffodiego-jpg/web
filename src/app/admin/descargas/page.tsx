import type { Metadata } from "next";
import {
  DescargasManager,
  type DescargasSection,
  type SlotRow,
} from "@/components/admin/DescargasManager";
import {
  materialPorProducto,
  recursosGated,
} from "@/data/descargas";
import { productosDetalle } from "@/data/productos";
import { getRedis } from "@/lib/kv";
import { navigation } from "@/lib/site-config";
import {
  readOverrides,
  resolveSlotUrl,
  slotKey,
  type DescargaSlot,
} from "@/lib/descargas-store";

export const metadata: Metadata = {
  title: "Descargas",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminDescargasPage() {
  const redisAvailable = getRedis() !== null;
  const blobAvailable = !!process.env.BLOB_READ_WRITE_TOKEN;
  const overrides = await readOverrides();

  const productosNav =
    navigation.find((i) => i.label === "Productos destacados")?.children ?? [];

  const makeRow = (
    slot: DescargaSlot,
    title: string,
    description?: string,
    accept?: string
  ): SlotRow => {
    const currentUrl = resolveSlotUrl(slot, overrides);
    const isDefault = overrides[slotKey(slot)] === undefined;
    return { slot, title, description, currentUrl, isDefault, accept };
  };

  const catalogoSection: DescargasSection = {
    id: "catalogo",
    title: "Catálogo de productos en PDF",
    rows: [
      makeRow(
        { kind: "catalogo-general" },
        "Catálogo general Griffo",
        "PDF con el listado completo de productos.",
        "application/pdf"
      ),
    ],
  };

  const materialSection: DescargasSection = {
    id: "material",
    title: "Material por producto",
    rows: materialPorProducto.flatMap((m) => {
      const navItem = productosNav.find((n) => n.href.endsWith(`/${m.slug}`));
      const label =
        navItem?.label ?? productosDetalle[m.slug]?.title ?? m.slug;
      return [
        makeRow(
          { kind: "material", slug: m.slug, type: "flyer" },
          `${label} — Flyer`,
          "PDF con la ficha del producto.",
          "application/pdf"
        ),
        makeRow(
          { kind: "material", slug: m.slug, type: "videoRrss" },
          `${label} — Video para redes`,
          "Video para compartir en redes sociales.",
          "video/*"
        ),
      ];
    }),
  };

  const gatedSection: DescargasSection = {
    id: "gated",
    title: "Material para catalogar",
    rows: recursosGated.map((r) =>
      makeRow(
        { kind: "gated", id: r.id },
        r.titulo,
        r.descripcion,
        r.id === "banco-imagenes"
          ? "application/zip,.zip"
          : ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
    ),
  };

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0a2b3d]">Descargas</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-3xl">
        Subí y reemplazá los archivos que aparecen en{" "}
        <code className="bg-gray-100 px-1 rounded">/catalogo/download</code>.
        Los archivos se guardan en Vercel Blob (URL público directo) y la URL
        efectiva se registra en Upstash Redis. El sitio se actualiza solo al
        siguiente request — sin necesidad de redeploy.
      </p>

      {(!redisAvailable || !blobAvailable) && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 space-y-1">
          <p className="font-bold">Configuración incompleta</p>
          {!redisAvailable && (
            <p>
              • Falta conectar <strong>Upstash Redis</strong> (env vars{" "}
              <code className="bg-amber-100 px-1 rounded">KV_REST_API_URL</code>{" "}
              /{" "}
              <code className="bg-amber-100 px-1 rounded">
                KV_REST_API_TOKEN
              </code>
              ).
            </p>
          )}
          {!blobAvailable && (
            <p>
              • Falta conectar <strong>Vercel Blob</strong> (env var{" "}
              <code className="bg-amber-100 px-1 rounded">
                BLOB_READ_WRITE_TOKEN
              </code>
              ). Vercel → Storage → Create → Blob, conectar al proyecto.
            </p>
          )}
        </div>
      )}

      <div className="mt-8">
        <DescargasManager
          sections={[catalogoSection, materialSection, gatedSection]}
        />
      </div>
    </div>
  );
}
