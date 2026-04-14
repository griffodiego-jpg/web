import type { Metadata } from "next";
import { AssetImage } from "@/components/AssetImage";
import { AssetVideo } from "@/components/AssetVideo";
import { MisionIcon, VisionIcon } from "@/components/MisionVisionIcons";
import { localAssets } from "@/lib/assets";

const a = localAssets.empresa;

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

      {/* Hero: 2 columnas en desktop (texto a la izquierda, foto panorámica
          a la derecha). En mobile: foto como fondo con texto superpuesto.
          La foto se muestra a su tamaño natural — sin recorte forzado. */}
      <section className="relative lg:bg-primary bg-primary/70 grid lg:grid-cols-2 grid-cols-1 items-stretch">
        <div className="absolute inset-0 lg:relative grid place-items-center px-5 z-10 py-10">
          <p className="text-xl lg:text-2xl text-white font-bold lg:max-w-md text-center lg:text-left drop-shadow-md">
            Conocé nuestra trayectoria, nuestros valores y el compromiso que
            nos impulsa a mejorar e innovar cada día.
          </p>
        </div>
        {/* Imagen a su tamaño natural (w-full h-auto) — sin recorte. */}
        <AssetImage
          src={a.historiaInicios}
          alt="Inicios de Griffo"
          caption="Foto: inicios de Griffo"
          className="lg:mix-blend-normal mix-blend-multiply opacity-60 lg:opacity-100"
        />
      </section>

      {/* Nav interna sticky con anchors */}
      <nav className="bg-gray py-2 sticky top-14 z-[5] overflow-x-auto shadow">
        <ul className="container mx-auto max-w-6xl px-5 flex lg:justify-center items-center gap-8 lg:gap-10 whitespace-nowrap text-sm">
          <li>
            <a href="#nuestra-historia" className="text-white hover:text-accent transition py-2 block">
              Nuestra Historia
            </a>
          </li>
          <li>
            <a href="#segmentos" className="text-white hover:text-accent transition py-2 block">
              Segmentos del Mercado
            </a>
          </li>
          <li>
            <a href="#mision" className="text-white hover:text-accent transition py-2 block">
              Misión &amp; Visión
            </a>
          </li>
          <li>
            <a href="#comercio" className="text-white hover:text-accent transition py-2 block">
              Comercio Exterior
            </a>
          </li>
          <li>
            <a href="#compromiso" className="text-white hover:text-accent transition py-2 block">
              Compromiso Ambiental
            </a>
          </li>
        </ul>
      </nav>

      {/* NUESTRA HISTORIA */}
      <section
        id="nuestra-historia"
        className="container mx-auto max-w-6xl px-5 lg:px-20 py-10 scroll-mt-32"
      >
        <h2 className="text-2xl text-primary font-bold mb-5">
          Nuestra Historia
        </h2>
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5">
          <div className="space-y-5">
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
          <div className="space-y-5">
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
            <AssetImage
              src={a.historiaHoy}
              alt="Griffo hoy"
              caption="Foto: planta actual de Griffo"
            />
          </div>
        </div>
      </section>

      {/* SEGMENTOS DEL MERCADO — blue card contenida, no full-width */}
      <div className="container mx-auto max-w-6xl px-5 lg:px-20 py-6 scroll-mt-32" id="segmentos">
        <section className="bg-primary px-6 lg:px-12 py-10 rounded">
          <h2 className="text-2xl text-white font-bold mb-5">
            Segmentos del Mercado
          </h2>
          <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 items-center">
            <div className="space-y-2">
              <h3 className="text-xl text-white font-bold">
                Aftermarket Autopartista
              </h3>
              <p className="text-white">
                Contamos con líneas de fuelles de suspensión, dirección y
                transmisión bajo catálogo. Desde sus inicios ha innovado en la
                manera de hacer las cosas en toda la cadena comercial. Hoy
                GRIFFO es el referente en esa línea de productos, y hasta
                trasciende las fronteras del país.
              </p>
            </div>
            <AssetImage
              src={a.familiaFuelle}
              alt="Familia de fuelles Griffo"
              caption="Familia de fuelles"
              className="rounded"
            />
          </div>
        </section>
      </div>

      {/* DESARROLLO A MEDIDA */}
      <section className="container mx-auto max-w-6xl px-5 lg:px-20 py-10">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 items-center">
          <AssetImage
            src={a.industriales}
            alt="Piezas industriales a medida"
            caption="Piezas industriales a medida"
          />
          <div className="space-y-2">
            <h2 className="text-xl text-primary font-bold">
              Desarrollo de piezas de caucho moldeadas a medida
            </h2>
            <p>
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
      <section id="mision" className="container mx-auto max-w-6xl px-5 lg:px-20 py-10 scroll-mt-32">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-10 gap-10">
          <div className="flex flex-col lg:flex-row gap-5 items-center lg:items-start">
            <MisionIcon className="lg:w-40 w-20 mx-auto lg:mx-0 shrink-0" />
            <div className="space-y-2.5">
              <h2 className="text-xl text-primary font-bold text-center lg:text-left">
                Misión
              </h2>
              <p className="text-center lg:text-left">
                Ser una empresa eficiente, enfocada en entender y brindar
                soluciones a los clientes, con estándares de calidad al nivel
                de los mejores competidores globales, bajo un modelo de
                negocios claro, organizado y beneficioso para todas las partes.
              </p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-5 items-center lg:items-start">
            <VisionIcon className="lg:w-40 w-20 mx-auto lg:mx-0 shrink-0" />
            <div className="space-y-2.5">
              <h2 className="text-xl text-primary font-bold text-center lg:text-left">
                Visión
              </h2>
              <p className="text-center lg:text-left">
                Ser una <strong>marca calificada</strong> y reconocida por
                ofrecer soluciones en piezas moldeadas de caucho y componentes,
                bajo demanda y por catálogo, con calidad, experiencia técnica y
                adaptabilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FRASE DESTACADA — card azul contenida */}
      <div className="container mx-auto max-w-6xl px-5 lg:px-20 py-6">
        <div className="bg-primary px-6 lg:px-12 py-10 rounded">
          <p className="max-w-4xl mx-auto text-center text-white text-xl font-bold">
            Nos enfocamos en entender las necesidades de nuestros clientes y
            brindar soluciones en un modelo de negocios que genere beneficios
            para todas las partes, impulsando relaciones de largo plazo.
          </p>
        </div>
      </div>

      {/* COMERCIO EXTERIOR */}
      <section
        id="comercio"
        className="container mx-auto max-w-6xl px-5 lg:px-20 py-10 lg:py-20 scroll-mt-32"
      >
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 place-items-center">
          <div className="space-y-5">
            <h2 className="text-2xl text-primary font-bold">
              Comercio Exterior
            </h2>
            <p>
              Disponemos de un departamento de comercio exterior especializado
              en atender mercados fuera de Argentina, asegurando a nuestros
              clientes una atención profesional, cercana y constante. Este
              equipo gestiona cada etapa del proceso de exportación, desde la
              documentación y requisitos aduaneros hasta la coordinación
              logística y el cumplimiento riguroso de los plazos, garantizando
              que cada envío llegue a tiempo.
            </p>
            <p>
              Nuestro compromiso con la calidad y la seriedad nos ha permitido
              construir relaciones comerciales sólidas en la región.
              Actualmente, tenemos presencia en Brasil, Bolivia, Chile y
              Uruguay, trabajando para expandir a nuevos destinos.
            </p>
          </div>
          <AssetVideo
            src={a.comercioVideo}
            poster={a.comercioPoster}
            label="Video: Comercio Exterior"
          />
        </div>
      </section>

      {/* COMPROMISO AMBIENTAL */}
      <section id="compromiso" className="container mx-auto max-w-6xl px-5 lg:px-20 py-10 scroll-mt-32">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-5 items-center">
          <div className="space-y-5">
            <h2 className="text-2xl font-bold">Compromiso ambiental</h2>
            <h3 className="text-lg">
              En Griffo creemos que producir con responsabilidad es parte de
              hacer bien nuestro trabajo.
            </h3>
            <p>
              Por eso <strong>reciclamos el scrap</strong> de caucho de nuestra
              producción para transformarlo en pisos para plazas, gimnasios y
              canchas de futbol, dándole una segunda vida útil a un material
              que de otro modo se descartaría.
            </p>
            <p>
              Además, <strong>incorporamos paneles solares</strong> en nuestra
              planta para{" "}
              <strong>reducir el consumo energético</strong> tradicional y
              avanzar hacia el autoabastecimiento, apostando a un modelo
              industrial más sustentable.
            </p>
          </div>
          <AssetImage
            src={a.panelyscrap}
            alt="Paneles solares y reciclado de scrap"
            caption="Paneles solares y reciclado de scrap"
          />
        </div>
      </section>
    </>
  );
}
