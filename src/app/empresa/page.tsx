import type { Metadata } from "next";
import { PageHero, ComingSoon } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Empresa",
  description:
    "Griffo, empresa argentina fundada en 1968, líder en la fabricación de piezas de caucho moldeado para la industria automotriz e industrial.",
};

export default function EmpresaPage() {
  return (
    <>
      <PageHero
        title="Empresa"
        lead="Desde 1968 fabricamos piezas de caucho moldeado para la industria automotriz e industrial."
        breadcrumb={[{ label: "Empresa" }]}
      />
      <ComingSoon title="Historia y valores de Griffo" />
    </>
  );
}
