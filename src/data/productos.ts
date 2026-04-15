/**
 * Contenido detallado de los productos destacados.
 *
 * Cada entrada acá se renderiza como página completa en
 * /productos/[slug]. Los slugs vienen de siteConfig.navigation
 * (el item "Productos destacados"). Los productos que todavía no
 * tienen entrada acá muestran el ComingSoon.
 *
 * Para agregar un producto:
 * 1. Verificar que el slug existe en siteConfig.navigation
 * 2. Agregar la entrada acá
 * 3. Subir la imagen a /public/products/
 */

export type Beneficio = {
  label: string;
  text: string;
};

export type ProductoDetalle = {
  /** Título H1 que se muestra en la página. */
  title: string;
  /** Imagen principal (ruta relativa a /public). */
  image: string;
  /** Frase destacada inicial (primer párrafo en bold). */
  tagline: string;
  /** Párrafos descriptivos del producto. Acepta JSX simple con <b> y <strong>. */
  descriptions: string[];
  /** Lista de beneficios/características, opcional. */
  beneficios?: Beneficio[];
  /** CTA principal (ej. "Comprar" que lleva a Mercado Libre), opcional. */
  cta?: {
    label: string;
    url: string;
    external?: boolean;
  };
  /** ID de video de YouTube para embeber, opcional. */
  youtubeId?: string;
  /** SEO: descripción de la página. */
  description?: string;
};

export const productosDetalle: Record<string, ProductoDetalle> = {
  "maquina-montadora-de-fuelles": {
    title: "Máquina Montadora de Fuelles",
    image: "/products/MaquinaMontadoraFuelles.webp",
    tagline: "Instalación profesional en minutos, sin esfuerzo ni riesgos.",
    descriptions: [
      "La máquina montadora de fuelles Griffo permite <strong>instalar fuelles de transmisión Griffo</strong> de forma rápida, segura y sin necesidad de desmontar la homocinética.",
      "Es ideal para <strong>talleres mecánicos</strong> que buscan mejorar productividad y ofrecer un servicio más profesional.",
    ],
    beneficios: [
      {
        label: "Ahorro de tiempo",
        text: "instalás un fuelle en menos de 5 minutos.",
      },
      {
        label: "Sin desmontar",
        text: "no es necesario desmontar la homocinética.",
      },
      {
        label: "Más rentabilidad",
        text: "ya no solo podés atender los fuelles que están dañados. La facilidad de la máquina permite incluir el cambio de fuelle como parte del mantenimiento PREVENTIVO, generando nuevos ingresos sin sumar horas de trabajo.",
      },
      {
        label: "Compatibilidad universal",
        text: "funciona con todos los fuelles Griffo.",
      },
      {
        label: "Diseño robusto y duradero",
        text: "pensada para uso diario en talleres. Además, cuenta con dos años de garantía.",
      },
    ],
    cta: {
      label: "Comprar",
      url: "https://listado.mercadolibre.com.ar/tienda/griffo/montadora_NoIndex_True?sb=storefront_url#D[A:montadora",
      external: true,
    },
    youtubeId: "NaEUgM5PjNY",
    description:
      "Instalación profesional en minutos, sin esfuerzo ni riesgos. La máquina montadora de fuelles Griffo permite instalar fuelles de transmisión Griffo de forma rápida, segura y sin necesidad de desmontar la homocinética.",
  },
};
