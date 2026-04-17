import type { Metadata } from "next";
import { NovedadesHub } from "@/components/novedades/NovedadesHub";
import { listNovedades } from "@/lib/novedades";

export const metadata: Metadata = {
  title: "Novedades",
  description:
    "Lanzamientos y nuevas aplicaciones de productos Griffo para la industria automotriz.",
  alternates: { canonical: "/novedades" },
};

// Dynamic: las novedades vienen de Redis + SpecParts y pueden cambiar
// en cualquier momento desde el admin.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function NovedadesPage() {
  const novedades = await listNovedades();
  return <NovedadesHub novedades={novedades} initialTipo="todas" />;
}
