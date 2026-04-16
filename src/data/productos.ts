/**
 * Contenido detallado de los productos destacados.
 *
 * Cada entrada acá se renderiza como página completa en
 * /productos/[slug]. Los slugs vienen de siteConfig.navigation
 * (el item "Productos destacados"). Los productos que todavía no
 * tienen entrada acá muestran el ComingSoon.
 */

export type Beneficio = {
  /** Etiqueta en bold al inicio (opcional — si no hay, solo se muestra text). */
  label?: string;
  text: string;
};

export type KitContiene = {
  title: string;
  items: string[];
  /** Imagen ilustrativa opcional a la derecha del kit. */
  image?: string;
};

export type PresentacionCelda = {
  label: string;
  image: string;
  /** Código del producto en esta presentación (ej. "950-32B"). */
  codigo?: string;
};

export type PresentacionModelo = {
  nombre: string;
  celdas: PresentacionCelda[];
};

export type Presentacion = {
  title: string;
  modelos: PresentacionModelo[];
};

export type ProductoDetalle = {
  /** Título H1 que se muestra en la página. */
  title: string;
  /** Imagen principal (ruta relativa a /public). */
  image: string;
  /** Frase destacada inicial (primer párrafo en bold). Opcional. */
  tagline?: string;
  /** Párrafos descriptivos del producto. Acepta <strong>. */
  descriptions: string[];
  /** Lista de features con prefijo "→". Opcional. */
  features?: string[];
  /** Texto de aplicación (h3 arriba del código). Opcional. */
  aplicacion?: string;
  /** Código del producto (ej. "54-225-00"). */
  codigo?: string;
  /** Lista de beneficios/características. */
  beneficios?: Beneficio[];
  /** CTA principal (ej. "Comprar" que lleva a Mercado Libre). */
  cta?: {
    label: string;
    url: string;
    external?: boolean;
  };
  /** ID de video de YouTube. */
  youtubeId?: string;
  /** SEO: descripción de la página. */
  description?: string;
  /** Sección "El kit contiene" con items + imagen. */
  kitContiene?: KitContiene;
  /** Sección de presentación con variantes del producto. */
  presentacion?: Presentacion;
};

export const productosDetalle: Record<string, ProductoDetalle> = {
  "maquina-montadora-de-fuelles": {
    title: "Máquina Montadora de Fuelles",
    image: "/products/MaquinaMontadoraFuelles.jpg",
    codigo: "54-122-03",
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

  "kit-de-fuelles-universales-para-homocineticas": {
    title: "Fuelle Universal de Transmisión",
    image: "/products/foto-universal-transmision.jpg",
    codigo: "950-32B (Kit x2) / 950-32 (Kit x6)",
    tagline: "Dos Fuelles. Múltiples aplicaciones.",
    descriptions: [
      "El fuelle universal de transmisión Griffo está diseñado para adaptarse a una amplia variedad de vehículos, sin necesidad de contar con stock específico para cada marca o modelo. <strong>Es flexible, resistente y apto para instalar</strong> con máquina montadora.",
      "Ideal para talleres que quieren trabajar sin demoras y con stock siempre disponible en el taller.",
    ],
    beneficios: [
      {
        label: "No esperes más por el repuesto",
        text: "Tenga stock en el taller. Dispondrá de una solución para todos los automóviles de cualquier origen y no tendrá que aguardar el horario de apertura de los comercios o disponibilidad de stock.",
      },
      {
        label: "No pierdas trabajos por falta de repuestos",
        text: "Por no conseguir el fuelle que necesita.",
      },
      {
        label: "No pierdas tiempo",
        text: "En búsquedas interminables del repuesto.",
      },
      {
        label: "Lográ una reparación definitiva",
        text: "Al usar fuelles, abrazaderas y grasas de primera calidad.",
      },
      {
        label: "Garantía de 2 años",
        text: "Como todos los productos Griffo.",
      },
    ],
    cta: {
      label: "Comprar",
      url: "https://listado.mercadolibre.com.ar/tienda/griffo/fuelle-universal-transmision_NoIndex_True?sb=storefront_url#D[A:fuelle%20universal%20transmision]",
      external: true,
    },
    youtubeId: "VMxES_maTwE",
    description:
      "El fuelle universal de transmisión Griffo está diseñado para adaptarse a una amplia variedad de vehículos, sin necesidad de contar con stock específico para cada marca o modelo.",
    presentacion: {
      title: "Presentación",
      modelos: [
        {
          nombre: "Fuelle Chico Universal",
          celdas: [
            {
              label: "Medidas",
              image: "/products/presentation/fuelle-chico-universal.png",
            },
            {
              label: "Kit x2 Unidades",
              image: "/products/presentation/kit2.png",
              codigo: "950-32B",
            },
            {
              label: "Kit x6 Unidades",
              image: "/products/presentation/kit6.png",
              codigo: "950-32",
            },
          ],
        },
        {
          nombre: "Fuelle Universal Grande",
          celdas: [
            {
              label: "Medidas",
              image: "/products/presentation/fuelle-universal-grande.jpg",
            },
            {
              label: "Kit x2 Unidades",
              image: "/products/presentation/kit2.png",
              codigo: "950-32B",
            },
            {
              label: "Kit x6 Unidades",
              image: "/products/presentation/kit6.png",
              codigo: "950-32",
            },
          ],
        },
      ],
    },
  },

  "extractor-de-juntas-homocineticas": {
    title: "Extractor de Juntas Homocinéticas",
    image: "/products/ExtractorJuntasHomocineticas.webp",
    tagline:
      "Desmontá sin esfuerzo, sin riesgo de daños por golpes, trabajá más rápido.",
    descriptions: [
      "El extractor Griffo permite <strong>remover juntas homocinéticas</strong> de manera <strong>rápida, precisa y sin golpear,</strong> evitando daños en la pieza, en el eje y en la homocinética. Aprovechá la oportunidad de ahorrar tiempo en tus manos.",
      "Es ideal para <strong>talleres mecánicos</strong> que buscan mejorar productividad y ofrecer un servicio más profesional.",
    ],
    codigo: "54-225-00",
    beneficios: [
      {
        label: "FÁCIL Y RÁPIDO",
        text: "Permite extraer la junta sin desmontar el eje.",
      },
      {
        label: "REPARACIÓN SEGURA",
        text: "Sin golpear, sin riesgo de romper alguna otra pieza. Minimiza riesgos de desclavar el semieje del lado caja debido a golpes innecesarios.",
      },
      {
        label: "AMPLIO RANGO",
        text: "Se puede utilizar para una amplia gama de vehículos.",
      },
      {
        label: "Construcción robusta",
        text: "100% metálico, diseñado para uso intensivo.",
      },
      {
        text: "Además, cuenta con 2 años de garantía como todos los productos Griffo.",
      },
    ],
    cta: {
      label: "Comprar",
      url: "https://listado.mercadolibre.com.ar/tienda/griffo/extractor_NoIndex_True?sb=storefront_url#D[A:extractor]",
      external: true,
    },
    youtubeId: "rWz1JP8iP0I",
    description:
      "Desmontá sin esfuerzo, sin riesgo de daños por golpes, trabajá más rápido.",
  },

  "pinza-para-abrazaderas": {
    title: "Pinza para Abrazaderas",
    image: "/products/PinzaParaAbrazadera.webp",
    tagline: "El ajuste perfecto, sin esfuerzo, menor tiempo.",
    descriptions: [
      "La pinza Griffo está diseñada especialmente para <strong>colocar y ajustar abrazaderas metálicas tipo oreja</strong>, utilizadas en fuelles de transmisión y dirección.",
      "Permite un cierre seguro y uniforme, sin dañar la abrazadera ni el fuelle, y garantiza una fijación firme y profesional.",
      "Es ideal para <strong>talleres mecánicos</strong> que buscan mejorar productividad y ofrecer un servicio más profesional.",
    ],
    codigo: "54-224-05",
    beneficios: [
      {
        label: "Acción de triple efecto",
        text: "que otorga elevada calidad de terminación y cierre seguro.",
      },
      {
        label: "Herramienta práctica y liviana",
        text: "que facilita el acceso a la zona de trabajo del automóvil.",
      },
      {
        label: "Empuñadura ergonómica",
        text: "revestida en plástico para un mayor confort en su uso.",
      },
      {
        label: "Mayor durabilidad",
        text: "debido a estar construida en acero. Además, cuenta con 2 años de garantía como todos los productos Griffo.",
      },
      {
        text: "La mejor calidad del trabajo se logra utilizando La Pinza y Abrazaderas Griffo.",
      },
    ],
    cta: {
      label: "Comprar",
      url: "https://listado.mercadolibre.com.ar/tienda/griffo/pinza-de-abrazaderas_NoIndex_True?sb=storefront_url#D[A:pinza%20de%20abrazaderas]",
      external: true,
    },
    youtubeId: "9eFD4AjTJc4",
    description:
      "El ajuste perfecto, sin esfuerzo, menor tiempo. La pinza Griffo está diseñada especialmente para colocar y ajustar abrazaderas metálicas tipo oreja.",
  },

  "fuelle-universal-de-direccion": {
    title: "Fuelle Universal de Dirección",
    image: "/products/FuelleUniversalDireccion2.webp",
    tagline: "Un Fuelle. Múltiples aplicaciones.",
    descriptions: [
      "El Fuelle Universal Griffo de Dirección está diseñado para <strong>proteger la cremallera y los componentes internos del sistema de dirección</strong> frente a polvo, humedad y agentes externos.",
      "Gracias a su diseño universal, se adapta a una amplia variedad de vehículos, permitiéndote resolver al instante <strong>sin necesidad de buscar un modelo exacto.</strong>",
    ],
    features: [
      "Apto <strong>para Cremalleras Hidráulicas y Mecánicas.</strong>",
      "Es ideal para <strong>talleres mecánicos</strong> que buscan mejorar productividad y con stock siempre disponible.",
    ],
    codigo: "955-32",
    beneficios: [
      {
        label: "Ahorrá tiempo. Instalá en pocos minutos",
        text: "Permite la instalación del fuelle sin quitar los extremos, y no requiere alineación de ruedas.",
      },
      {
        label: "No esperes más por el repuesto",
        text: "Tenga stock en el taller. Dispondrá de una solución para todos los automóviles de cualquier origen y no tendrá que aguardar el horario de apertura de los comercios.",
      },
      {
        label: "No pierdas trabajos por falta de repuestos",
        text: "Por no conseguir el fuelle que necesita.",
      },
      {
        label: "Garantía de 2 años",
        text: "Como todos los productos Griffo.",
      },
    ],
    cta: {
      label: "Comprar",
      url: "https://listado.mercadolibre.com.ar/tienda/griffo/fuelle-universal-direccion_NoIndex_True?sb=storefront_url#D[A:fuelle%20universal%20direccion]",
      external: true,
    },
    youtubeId: "3m4-CNta6ME",
    description:
      "Un Fuelle. Múltiples aplicaciones. El Fuelle Universal Griffo de Dirección está diseñado para proteger la cremallera y los componentes internos del sistema de dirección.",
    kitContiene: {
      title: "El kit contiene",
      items: [
        "2 Fuelles Universales de Dirección",
        "4 Precintos",
        "1 Bolsa Instaladora",
      ],
      image: "/products/FuelleUniversalDireccion.webp",
    },
  },

  "kit-de-proteccion-para-suspension-deportiva": {
    title: "Fuelle de Suspensión Deportiva",
    image: "/products/FuelledeSuspensionDeportiva.jpg",
    descriptions: [
      "El fuelle de suspensión deportiva Griffo está diseñado para <strong>proteger el vástago del amortiguador</strong> y otros componentes del sistema de suspensión frente a polvo, agua, piedras y barro.",
      "Su diseño flexible y resistente lo hace ideal para <strong>vehículos con suspensiones deportivas</strong>, donde los recorridos y exigencias son distintas a las de una suspensión original.",
    ],
    aplicacion:
      "Aplicación: para amortiguadores de vástagos cortos y convencionales",
    codigo: "953-35",
    beneficios: [
      { text: "Protege la válvula de compresión de impactos fuertes." },
      {
        text: "Protege el vástago de arañazos y pequeños impactos producidos por los objetos que se encuentran en la calzada.",
      },
      { text: "Protege los amortiguadores de impactos fuertes." },
      { text: "Evita la pérdida prematura de aceite." },
      {
        text: "Actúan como topes de suspensión en la fase de compresión, mejorando la estabilidad en la conducción deportiva.",
      },
      {
        text: "Su sustitución al mismo tiempo que amortiguadores y/o espirales, no supone un coste extra de mano de obra.",
      },
      {
        text: "Actúan como amortiguador en el 63% de su dimensión, y luego como tope de suspensión en la fase de compresión.",
      },
    ],
    cta: {
      label: "Comprar",
      url: "https://listado.mercadolibre.com.ar/tienda/griffo/suspension-deportiva_NoIndex_True?sb=storefront_url#D[A:suspension%20deportiva]",
      external: true,
    },
    description:
      "El fuelle de suspensión deportiva Griffo está diseñado para proteger el vástago del amortiguador y otros componentes del sistema de suspensión.",
    kitContiene: {
      title: "El kit contiene",
      items: ["2 Topes TPU", "2 Fuelles PUR"],
      image: "/products/FuelledeSuspensionDeportiva2.webp",
    },
  },

  "abrazaderas-universales": {
    title: "Abrazaderas Universales",
    image: "/products/abrazadera-instalada.jpg",
    codigo: "AB 25-40 (lado palier) / AB 40-122 (lado copa)",
    tagline: "Ajuste firme y duradero.",
    descriptions: [
      "Las abrazaderas universales Griffo están diseñadas para <strong>asegurar firmemente los fuelles.</strong>",
      "Fabricadas en acero inoxidable, ofrecen un <strong>ajuste seguro y duradero</strong>, soportando condiciones extremas de temperatura, presión y vibración.",
      "Se colocan fácilmente con nuestra <strong>Pinza Griffo para Abrazaderas</strong>, logrando una fijación pareja y sin dañar el fuelle.",
    ],
    beneficios: [
      {
        label: "Amplio rango de ajuste",
        text: "Banda perforada con mayor número de posiciones.",
      },
      {
        text: "Disponible para aplicaciones en lado copa y lado palier.",
      },
      {
        text: "Por su característica, puede llegar a ser usada en otras aplicaciones de fluidos de baja presión.",
      },
    ],
    cta: {
      label: "Comprar",
      url: "https://listado.mercadolibre.com.ar/tienda/griffo/abrazaderas_NoIndex_True?sb=storefront_url#D[A:abrazaderas]",
      external: true,
    },
    youtubeId: "9eFD4AjTJc4",
    description:
      "Ajuste firme y duradero. Las abrazaderas universales Griffo están diseñadas para asegurar firmemente los fuelles.",
    presentacion: {
      title: "Presentación",
      modelos: [
        {
          nombre: "AB 25-40: Abrazadera lado palier",
          celdas: [
            {
              label: "Rango de Ajuste 25 a 40 mm. Pack por 6 unidades.",
              image: "/products/AB_25_40_2.jpg",
            },
          ],
        },
        {
          nombre: "AB 40-122: Abrazadera lado copa",
          celdas: [
            {
              label: "Rango de Ajuste: 40 a 122 mm. Pack por 6 unidades.",
              image: "/products/AB_49_122_2.jpg",
            },
          ],
        },
      ],
    },
  },
};
