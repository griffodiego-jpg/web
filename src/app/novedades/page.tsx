import type { Metadata } from "next";
import { NovedadesHub } from "@/components/novedades/NovedadesHub";
import { listNovedades } from "@/lib/novedades";

export const metadata: Metadata = {
  title: "Novedades",
  description:
    "Lanzamientos y nuevas aplicaciones de productos Griffo para la industria automotriz.",
  alternates: { canonical: "/novedades" },
};

// ISR: la lista de novedades publicadas cambia poco en el día a día.
// Revalidamos cada 5 minutos — suficiente para reflejar publicaciones
// del admin razonablemente rápido sin pegarle a Redis/SpecParts en
// cada request. Si se necesita refresh inmediato, agregar
// `revalidateTag('novedades')` en el endpoint del admin que publica.
export const revalidate = 300;
export const runtime = "nodejs";

export default async function NovedadesPage() {
  const novedades = await listNovedades();
  return <NovedadesHub novedades={novedades} initialTipo="lanzamiento" />;
}
