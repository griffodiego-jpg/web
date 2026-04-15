import type { Metadata } from "next";
import Link from "next/link";
import { AssetImage } from "@/components/AssetImage";
import { AssetVideo } from "@/components/AssetVideo";

export const metadata: Metadata = {
  title: "Desarrollo a medida",
  description:
    "Desarrollo a medida de piezas de caucho moldeado bajo demanda para industrias diversas.",
  keywords: ["desarrollo a medida", "piezas de caucho"],
  openGraph: {
    title: "Desarrollo a medida",
    description: "Desarrollo a medida de piezas de caucho moldeado.",
  },
};

// 11 piezas numeradas 1.png a 11.png
const PIEZAS = Array.from({ length: 11 }, (_, i) => i + 1);
// 7 logos de clientes
const CLIENTES = Array.from({ length: 7 }, (_, i) => i + 1);

export default function DesarrolloAMedidaPage() {
  return (
    <>
      {/* HERO */}
      <section className="container mx-auto max-w-6xl px-5 py-10 lg:py-16">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl text-primary font-medium leading-tight">
              Desarrollos a medida de piezas de caucho moldeado
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 leading-relaxed font-medium">
              Proveemos piezas de caucho moldeado bajo demanda a empresas de la
              industria alimenticia, de petróleo, de electrodomésticos,
              autopartistas, entre otros. Donde nos caracterizamos por entender
              la necesidad de nuestros clientes y ofrecerle soluciones.
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <AssetImage
              src="/images/desarrollo-a-medida/header.png"
              alt="Piezas de caucho desarrollo a medida"
              caption="Piezas header"
              bare
              className="max-h-[350px] w-auto object-contain"
              fallbackAspect="aspect-[4/3]"
            />
          </div>
        </div>
      </section>

      {/* TECNOLOGÍA — texto + video */}
      <section className="grid lg:grid-cols-2 grid-cols-1 bg-gray-100">
        <div className="flex flex-col justify-center p-10 lg:pl-16 xl:pl-24 lg:pr-10">
          <div className="flex gap-6 items-start">
            <AssetImage
              src="/images/desarrollo-a-medida/ico1.svg"
              alt="Icono Tecnología"
              bare
              className="w-16 h-16 object-contain flex-shrink-0 mt-1"
            />
            <div className="space-y-4">
              <h2 className="text-3xl text-primary font-bold">Tecnología</h2>
              <h3 className="text-primary text-lg font-medium leading-snug">
                Contamos con todo el equipamiento necesario para producir
                piezas moldeadas asegurando calidad.
              </h3>
              <p className="text-black text-sm leading-relaxed">
                Disponemos de equipos de diferentes tamaños que nos permiten
                cubrir diversas necesidades, para piezas de uso frecuente de
                alta/media/baja producción y/o de grandes dimensiones.
              </p>
            </div>
          </div>
        </div>
        <div className="h-full min-h-[300px] lg:min-h-[400px]">
          <AssetVideo
            src="/videos/tecnologia.mp4"
            poster="/images/desarrollo-a-medida/tecnologia.png"
            label="Video: Tecnología"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* LABORATORIO PROPIO — texto + video */}
      <section className="grid lg:grid-cols-2 grid-cols-1 bg-[#FBFBFB]">
        <div className="flex flex-col justify-center p-10 lg:pl-16 xl:pl-24 lg:pr-10">
          <div className="flex gap-6 items-start">
            <AssetImage
              src="/images/desarrollo-a-medida/ico2.svg"
              alt="Icono Laboratorio"
              bare
              className="w-16 h-16 object-contain flex-shrink-0 mt-1"
            />
            <div className="space-y-4">
              <h2 className="text-3xl text-primary font-bold">
                Laboratorio Propio
              </h2>
              <h3 className="text-primary text-lg font-medium leading-snug">
                Nos permite desarrollar y asegurar homogeneidad en compuestos
                según las necesidades del cliente.
              </h3>
              <p className="text-black text-sm leading-relaxed">
                Contamos con Reómetro, cámara de ozono, estufa, cicladora,
                entre otros importantes elementos necesarios para asegurar la
                calidad. Además de laboratorios externos para complementar
                según requerimiento.
              </p>
            </div>
          </div>
        </div>
        <div className="h-full min-h-[300px] lg:min-h-[400px]">
          <AssetVideo
            src="/videos/medida.mp4"
            poster="/images/desarrollo-a-medida/laboratorio.png"
            label="Video: Laboratorio"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* PIEZAS + ISO 9001 */}
      <aside className="bg-primary/10 py-16">
        <div className="container mx-auto max-w-6xl px-5">
          <h2 className="text-2xl font-bold text-center text-black mb-12">
            Además, desde hace más de 20 años la empresa cuenta con la
            certificación ISO 9001.
          </h2>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 items-end">
            {PIEZAS.map((n) => (
              <div key={n} className="flex justify-center items-center p-2">
                <AssetImage
                  src={`/images/desarrollo-a-medida/${n}.png`}
                  alt={`Pieza ${n}`}
                  bare
                  className="max-h-[100px] w-auto object-contain hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* CLIENTES */}
      <aside className="py-16 container mx-auto max-w-6xl px-5">
        <h2 className="text-3xl font-bold text-center text-primary mb-12">
          Algunos de nuestros clientes
        </h2>
        <ul className="flex flex-wrap justify-center gap-12 items-center grayscale hover:grayscale-0 transition-all duration-500">
          {CLIENTES.map((n) => (
            <li key={n}>
              <AssetImage
                src={`/clientes/cliente${n}.png`}
                alt={`Cliente ${n}`}
                bare
                className="h-16 w-auto object-contain"
              />
            </li>
          ))}
        </ul>
      </aside>

      {/* CTA FINAL */}
      <aside className="bg-black py-12 px-5 grid place-items-center gap-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-center text-white">
          ¿Necesitás un desarrollo en caucho?
        </h2>
        <Link
          href="/contacto"
          className="inline-flex items-center justify-center gap-5 px-10 py-2.5 uppercase bg-primary text-white text-center font-bold rounded-full border border-primary hover:bg-white hover:text-primary transition-all duration-300"
        >
          Contactanos
        </Link>
      </aside>
    </>
  );
}
