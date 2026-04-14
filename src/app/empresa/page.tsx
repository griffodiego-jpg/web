/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { remoteAssets } from "@/lib/assets";

const a = remoteAssets.empresa;

export const metadata: Metadata = {
  title: "Empresa",
  description:
    "Conocé nuestra historia, misión y el compromiso que nos impulsa a ser líderes en innovación y calidad.",
  keywords: [
    "Empresa",
    "piezas de caucho",
    "industria automotriz",
    "industria industrial",
    "historia",
    "misión",
    "compromiso",
  ],
  openGraph: {
    title: "Empresa",
    description:
      "Conocé nuestra historia, misión y el compromiso que nos impulsa a ser líderes en innovación y calidad.",
  },
};

export default function EmpresaPage() {
  return (
    <>
      {/* Título de la página */}
      <div className="container mx-auto max-w-6xl px-5 py-10">
        <h1 className="text-2xl text-primary font-bold">Empresa</h1>
      </div>

      {/* Hero con imagen + texto superpuesto */}
      <section className="relative grid lg:grid-cols-2 grid-cols-1 lg:bg-primary bg-primary/70">
        <div className="absolute inset-0 lg:relative grid place-items-center px-5 z-10">
          <p className="text-xl lg:text-2xl text-white font-bold lg:max-w-md text-center lg:text-left">
            Conocé nuestra trayectoria, nuestros valores y el compromiso que
            nos impulsa a mejorar e innovar cada día.
          </p>
        </div>
        <div className="relative">
          <img
            src={a.historiaInicios}
            alt="Inicios de Griffo"
            className="w-full h-full object-cover mix-blend-multiply opacity-60 lg:opacity-100 lg:mix-blend-normal"
          />
        </div>
      </section>

      {/* Nav interna sticky con anchors */}
      <nav className="bg-gray py-3 sticky top-14 z-[5] overflow-x-auto shadow">
        <ul className="container mx-auto max-w-6xl px-5 flex lg:justify-center items-center gap-8 lg:gap-10 whitespace-nowrap text-sm">
          <li>
            <a
              href="#nuestra-historia"
              className="text-white hover:text-accent transition"
            >
              Nuestra Historia
            </a>
          </li>
          <li>
            <a
              href="#segmentos"
              className="text-white hover:text-accent transition"
            >
              Segmentos del Mercado
            </a>
          </li>
          <li>
            <a
              href="#mision"
              className="text-white hover:text-accent transition"
            >
              Misión & Visión
            </a>
          </li>
          <li>
            <a
              href="#comercio"
              className="text-white hover:text-accent transition"
            >
              Comercio Exterior
            </a>
          </li>
          <li>
            <a
              href="#compromiso"
              className="text-white hover:text-accent transition"
            >
              Compromiso Ambiental
            </a>
          </li>
        </ul>
      </nav>

      {/* NUESTRA HISTORIA */}
      <section
        id="nuestra-historia"
        className="container mx-auto max-w-6xl px-5 lg:px-20 py-16 scroll-mt-32"
      >
        <h2 className="text-2xl lg:text-3xl text-primary font-bold mb-6">
          Nuestra Historia
        </h2>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
          <div className="space-y-5 text-gray-800 leading-relaxed">
            <p>
              La historia de <b>Griffo</b> comienza en 1968, cuando{" "}
              <b>Domingo Griffo</b> dio sus primeros pasos como fabricante de
              piezas de caucho moldeado. Al igual que muchos emprendedores
              industriales de su época, inició su camino trabajando por
              encargo, fabricando piezas para terceros con una clara apuesta
              por la calidad y la dedicación artesanal.
            </p>
            <p>
              Esa combinación de <strong>compromiso y excelencia</strong> lo
              llevó rápidamente a convertirse en{" "}
              <strong>
                proveedor de las principales terminales automotrices del país
              </strong>
              . También extendió su alcance a empresas líderes de sectores
              como la construcción, los electrodomésticos y otras ramas de la
              industria nacional que confiaron en sus desarrollos.
            </p>
            <p>
              A lo largo de las décadas,{" "}
              <strong>
                Griffo fue consolidando su posicionamiento como una empresa de
                referencia en el mercado argentino de autopartes y componentes
                industriales
              </strong>
              . Con una evolución constante y la incorporación progresiva de
              nuevas tecnologías, la empresa logró adaptarse a las exigencias
              de un entorno productivo cambiante, sin perder su esencia:
              fabricar productos confiables, robustos y de excelente calidad.
            </p>
          </div>
          <div className="space-y-5 text-gray-800 leading-relaxed">
            <p>
              Hoy,{" "}
              <strong>
                más de 50 años después, Griffo continúa en manos de la familia
                fundadora
              </strong>
              . La tercera generación está al frente de la compañía, llevando
              adelante el legado de innovación, responsabilidad y cercanía con
              sus clientes. Actualmente,{" "}
              <strong>Griffo atiende dos grandes segmentos</strong>: el sector
              automotor, con piezas orientadas al mercado de reposición y
              terminales, y el sector industrial, con soluciones a medida para
              diversas aplicaciones técnicas.
            </p>
            <img
              src={a.historiaHoy}
              alt="Griffo hoy"
              className="w-full rounded"
            />
          </div>
        </div>
      </section>

      {/* SEGMENTOS DEL MERCADO */}
      <section id="segmentos" className="bg-primary py-16 scroll-mt-32">
        <div className="container mx-auto max-w-6xl px-5 lg:px-20">
          <h2 className="text-2xl lg:text-3xl text-white font-bold mb-6">
            Segmentos del Mercado
          </h2>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 items-center">
            <div className="space-y-3">
              <h3 className="text-xl text-white font-bold">
                Aftermarket Autopartista
              </h3>
              <p className="text-white leading-relaxed">
                Contamos con líneas de fuelles de suspensión, dirección y
                transmisión bajo catálogo. Desde sus inicios ha innovado en la
                manera de hacer las cosas en toda la cadena comercial. Hoy
                GRIFFO es el referente en esa línea de productos, y hasta
                trasciende las fronteras del país.
              </p>
            </div>
            <img
              src={a.familiaFuelle}
              alt="Familia de fuelles Griffo"
              className="w-full rounded"
            />
          </div>
        </div>
      </section>

      {/* DESARROLLO A MEDIDA */}
      <section className="container mx-auto max-w-6xl px-5 lg:px-20 py-16">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8 items-center">
          <img
            src={a.industriales}
            alt="Piezas industriales a medida"
            className="w-full rounded"
          />
          <div className="space-y-3">
            <h2 className="text-xl lg:text-2xl text-primary font-bold">
              Desarrollo de piezas de caucho moldeadas a medida
            </h2>
            <p className="text-gray-800 leading-relaxed">
              Diseñamos y producimos piezas de caucho moldeado para industrias
              tan diversas como la alimenticia, petrolera, de electrodomésticos
              y autopartista. Construimos relaciones comerciales duraderas
              gracias al respeto por los compromisos asumidos: calidad, fechas
              de entrega, cumplimiento de programación, asesoramiento
              orientado a la eficiencia, política de precios y todo lo que la
              relación requiera.
            </p>
          </div>
        </div>
      </section>

      {/* MISIÓN & VISIÓN */}
      <section id="mision" className="bg-gray-100 py-16 scroll-mt-32">
        <div className="container mx-auto max-w-6xl px-5 lg:px-20 grid lg:grid-cols-2 grid-cols-1 gap-10">
          <div className="flex flex-col lg:flex-row gap-5">
            <img
              src={a.misionIcon}
              alt="Misión"
              className="lg:w-40 w-20 mx-auto lg:mx-0 h-auto"
            />
            <div className="space-y-2">
              <h2 className="text-xl lg:text-2xl text-primary font-bold text-center lg:text-left">
                Misión
              </h2>
              <p className="text-center lg:text-left text-gray-800 leading-relaxed">
                Ser una empresa eficiente, enfocada en entender y brindar
                soluciones a los clientes, con estándares de calidad al nivel
                de los mejores competidores globales, bajo un modelo de
                negocios claro, organizado y beneficioso para todas las partes.
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-5">
            <img
              src={a.visionIcon}
              alt="Visión"
              className="lg:w-40 w-20 mx-auto lg:mx-0 h-auto"
            />
            <div className="space-y-2">
              <h2 className="text-xl lg:text-2xl text-primary font-bold text-center lg:text-left">
                Visión
              </h2>
              <p className="text-center lg:text-left text-gray-800 leading-relaxed">
                Ser una <strong>marca calificada</strong> y reconocida por
                ofrecer soluciones en piezas moldeadas de caucho y componentes,
                bajo demanda y por catálogo, con calidad, experiencia técnica y
                adaptabilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FRASE DESTACADA */}
      <section className="bg-primary py-14">
        <p className="container mx-auto max-w-4xl px-5 text-center text-white text-xl lg:text-2xl font-bold leading-relaxed">
          Nos enfocamos en entender las necesidades de nuestros clientes y
          brindar soluciones en un modelo de negocios que genere beneficios
          para todas las partes, impulsando relaciones de largo plazo.
        </p>
      </section>

      {/* COMERCIO EXTERIOR */}
      <section
        id="comercio"
        className="container mx-auto max-w-6xl px-5 lg:px-20 py-16 lg:py-20 scroll-mt-32"
      >
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-10 items-center">
          <div className="space-y-5">
            <h2 className="text-2xl lg:text-3xl text-primary font-bold">
              Comercio Exterior
            </h2>
            <p className="text-gray-800 leading-relaxed">
              Disponemos de un departamento de comercio exterior especializado
              en atender mercados fuera de Argentina, asegurando a nuestros
              clientes una atención profesional, cercana y constante. Este
              equipo gestiona cada etapa del proceso de exportación, desde la
              documentación y requisitos aduaneros hasta la coordinación
              logística y el cumplimiento riguroso de los plazos, garantizando
              que cada envío llegue a tiempo.
            </p>
            <p className="text-gray-800 leading-relaxed">
              Nuestro compromiso con la calidad y la seriedad nos ha permitido
              construir relaciones comerciales sólidas en la región.
              Actualmente, tenemos presencia en Brasil, Bolivia, Chile y
              Uruguay, trabajando para expandir a nuevos destinos.
            </p>
          </div>
          <video
            src={a.comercioVideo}
            poster={a.comercioPoster}
            className="w-full rounded"
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
          />
        </div>
      </section>

      {/* COMPROMISO AMBIENTAL */}
      <section
        id="compromiso"
        className="bg-gray-100 py-16 scroll-mt-32"
      >
        <div className="container mx-auto max-w-6xl px-5 lg:px-20 grid lg:grid-cols-2 grid-cols-1 gap-10 items-center">
          <div className="space-y-5">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Compromiso ambiental
            </h2>
            <h3 className="text-lg text-gray-800">
              En Griffo creemos que producir con responsabilidad es parte de
              hacer bien nuestro trabajo.
            </h3>
            <p className="text-gray-800 leading-relaxed">
              Por eso <strong>reciclamos el scrap</strong> de caucho de nuestra
              producción para transformarlo en pisos para plazas, gimnasios y
              canchas de futbol, dándole una segunda vida útil a un material
              que de otro modo se descartaría.
            </p>
            <p className="text-gray-800 leading-relaxed">
              Además, <strong>incorporamos paneles solares</strong> en nuestra
              planta para{" "}
              <strong>reducir el consumo energético</strong> tradicional y
              avanzar hacia el autoabastecimiento, apostando a un modelo
              industrial más sustentable.
            </p>
          </div>
          <img
            src={a.panelyscrap}
            alt="Paneles solares y reciclado de scrap"
            className="w-full rounded"
          />
        </div>
      </section>
    </>
  );
}
