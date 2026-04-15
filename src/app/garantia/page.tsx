import type { Metadata } from "next";
import { AssetImage } from "@/components/AssetImage";
import { GarantiaForm } from "@/components/GarantiaForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Garantía",
  description:
    "Garantía de la montadora de fuelles Griffo. Todos los productos Griffo cuentan con 2 años de garantía.",
  keywords: [
    "Griffo",
    "Garantía",
    "piezas de caucho",
    "industria automotriz",
    "industria industrial",
  ],
  openGraph: {
    title: "Garantía",
    description:
      "Todos los productos Griffo cuentan con 2 años de garantía.",
  },
};

export default function GarantiaPage() {
  return (
    <>
      {/* INTRO — 2 años de garantía */}
      <section className="container mx-auto max-w-6xl px-5 py-10">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 items-center">
          <div className="space-y-3 font-bold">
            <p className="text-lg text-[#0a2b3d]">
              Todos los productos Griffo cuentan con 2 años de garantía.
            </p>
            <a
              href="/pdfs/garantia.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline inline-block"
            >
              Ver bases y condiciones
            </a>
          </div>
          <div className="flex justify-center lg:justify-start">
            <AssetImage
              src="/images/garantia/img-griffo2y.png"
              alt="2 años de garantía Griffo"
              bare
              className="w-full max-w-[250px] h-auto"
            />
          </div>
        </div>
      </section>

      {/* MONTADORA — CTA para registrar la máquina */}
      <section className="bg-primary/10">
        <div className="container mx-auto max-w-6xl px-5 py-12">
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 items-center">
            <div className="flex justify-center lg:justify-start">
              <AssetImage
                src="/images/garantia/img-montadora.png"
                alt="Montadora de Fuelles Griffo"
                bare
                className="w-full max-w-[500px] h-auto"
              />
            </div>
            <div className="space-y-5 font-bold">
              <p className="text-lg text-[#0a2b3d]">
                Si usted adquirió la Montadora de Fuelles Griffo.
              </p>
              <a
                href="#guarantee"
                className="inline-flex items-center justify-center gap-5 px-10 py-2.5 uppercase bg-primary text-white font-bold rounded-full border border-primary hover:bg-white hover:text-primary transition-all duration-300"
              >
                Registre su máquina
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULARIO de registro */}
      <section className="container mx-auto max-w-6xl px-5 py-14">
        <h2 className="font-bold text-2xl lg:text-3xl text-center text-[#0a2b3d]">
          Registro de Garantía de máquina montadora de fuelles
        </h2>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 mt-10">
          {/* Contacto a la izquierda */}
          <div className="space-y-5">
            <h3 className="font-bold text-lg text-primary uppercase tracking-wide">
              Contáctenos
            </h3>
            <ul className="space-y-4 text-gray-800">
              <li className="flex gap-3 items-start">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-primary shrink-0 mt-0.5"
                  aria-hidden
                >
                  <path d="M12 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5ZM12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
                </svg>
                <span>
                  {siteConfig.address.street}, {siteConfig.address.postalCode}
                  <br />
                  {siteConfig.address.locality}, Provincia de{" "}
                  {siteConfig.address.region}
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-primary shrink-0"
                  aria-hidden
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
                </svg>
                <a href={siteConfig.phoneHref} className="hover:underline">
                  {siteConfig.phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Formulario a la derecha */}
          <GarantiaForm />
        </div>
      </section>
    </>
  );
}
