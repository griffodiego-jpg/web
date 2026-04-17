import type { Metadata } from "next";
import { NovedadesHub } from "@/components/novedades/NovedadesHub";
import { listNovedades } from "@/lib/novedades";

export const metadata: Metadata = {
  title: "Lanzamientos",
  description:
    "Lanzamientos de nuevos productos Griffo para la industria automotriz.",
  alternates: { canonical: "/novedades/lanzamientos" },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LanzamientosPage() {
  const novedades = await listNovedades();
  return <NovedadesHub novedades={novedades} initialTipo="lanzamiento" />;
}
