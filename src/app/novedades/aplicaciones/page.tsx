import type { Metadata } from "next";
import { NovedadesHub } from "@/components/novedades/NovedadesHub";
import { listNovedades } from "@/lib/novedades";

export const metadata: Metadata = {
  title: "Nuevas aplicaciones",
  description:
    "Nuevas aplicaciones de productos Griffo sobre vehículos existentes.",
  alternates: { canonical: "/novedades/aplicaciones" },
};

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function AplicacionesPage() {
  const novedades = await listNovedades();
  return <NovedadesHub novedades={novedades} initialTipo="aplicacion" />;
}
