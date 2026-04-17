import type { Metadata } from "next";
import { NovedadesAdmin } from "@/components/admin/NovedadesAdmin";
import { getRedis } from "@/lib/kv";
import { listNovedadesIncludingHidden } from "@/lib/novedades";

export const metadata: Metadata = {
  title: "Novedades",
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AdminNovedadesPage() {
  const redisAvailable = getRedis() !== null;
  let novedades: Awaited<ReturnType<typeof listNovedadesIncludingHidden>> = [];
  let error: string | null = null;

  try {
    novedades = await listNovedadesIncludingHidden();
  } catch (err) {
    error = err instanceof Error ? err.message : "Error al cargar el catálogo";
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0a2b3d]">Novedades</h1>
      <p className="mt-2 text-sm text-gray-500 max-w-3xl">
        Todos los productos actualizados en <strong>SpecParts</strong> en los
        últimos 12 meses aparecen automáticamente como novedades.
        Por defecto se muestran como <em>Nueva aplicación</em> — podés
        marcar las que sean lanzamientos nuevos, o ocultar las que no querés
        que aparezcan.
      </p>

      {!redisAvailable && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Persistencia no configurada</p>
          <p className="mt-1">
            Falta conectar Upstash Redis. Sin él, no se pueden guardar los
            overrides (cambios de tipo / ocultos).
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      <div className="mt-8">
        <NovedadesAdmin novedades={novedades} />
      </div>
    </div>
  );
}
