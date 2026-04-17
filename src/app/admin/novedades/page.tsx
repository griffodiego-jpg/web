import type { Metadata } from "next";
import { NovedadesAdmin } from "@/components/admin/NovedadesAdmin";
import { getRedis } from "@/lib/kv";
import {
  listCandidatosRecientes,
  listNovedades,
} from "@/lib/novedades";

export const metadata: Metadata = {
  title: "Novedades",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminNovedadesPage() {
  const redisAvailable = getRedis() !== null;
  let published: Awaited<ReturnType<typeof listNovedades>> = [];
  let candidates: Awaited<ReturnType<typeof listCandidatosRecientes>> = [];
  let error: string | null = null;

  try {
    [published, candidates] = await Promise.all([
      listNovedades(),
      listCandidatosRecientes(30),
    ]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar";
  }

  const publishedCodes = new Set(published.map((p) => p.code));

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0a2b3d]">Novedades</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-3xl">
        Publicá una novedad por código SKU — los datos del producto
        (vehículos, imagen, descripción) se leen automáticamente de SpecParts.
        El feed de abajo muestra los últimos productos actualizados en el
        catálogo como candidatos para publicar con un click.
      </p>

      {!redisAvailable && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Persistencia no configurada</p>
          <p className="mt-1">
            Falta conectar Upstash Redis. Las novedades se guardan ahí bajo la
            clave <code>novedades:publicadas</code>.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No se pudo cargar el catálogo: {error}
        </div>
      )}

      <div className="mt-8">
        <NovedadesAdmin
          initialPublished={published}
          candidates={candidates.map((p) => ({
            code: p.code,
            product: p.product,
            description: p.description,
            category: p.category,
            updated_at: p.updated_at,
            imagen:
              p.pictures.find((x) => !x.is_blueprint)?.image_url ??
              p.pictures[0]?.image_url ??
              null,
            vehicleCount: p.vehicles.length,
            alreadyPublished: publishedCodes.has(p.code),
          }))}
        />
      </div>
    </div>
  );
}
