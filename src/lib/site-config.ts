/**
 * Configuración central del sitio Griffo.
 * Acá viven los datos que se repiten (menú, contacto, redes, productos destacados).
 * Cambiar algo acá lo propaga a header, footer y páginas.
 */

export const siteConfig = {
  name: "Griffo",
  description:
    "Empresa líder en la industria automotriz e industrial, especializada en la fabricación de piezas de caucho y repuestos para vehículos y maquinaria.",
  foundedYear: 1968,
  address: {
    street: "Mariquita Thompson 443",
    postalCode: "B1751AYI",
    locality: "La Tablada",
    region: "Buenos Aires",
    country: "AR",
  },
  phone: "+54 9 11 4454 8401",
  phoneHref: "tel:+5491144548401",
  whatsapp: {
    number: "5491136408439",
    label: "Atención al cliente",
  },
  socials: {
    facebook: "https://www.facebook.com/griffoarg",
    youtube: "https://www.youtube.com/channel/UCQZHmbT5rzKeypFTc0rWcVQ",
  },
  externalCatalog: "https://griffo.specparts.shop/",
  externalCatalogLogin: "https://griffo.specparts.shop/login",
};

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: { label: string; href: string }[];
};

export const navigation: NavItem[] = [
  { label: "Empresa", href: "/empresa" },
  { label: "Novedades", href: "/novedades" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Descargas", href: "/catalogo/download" },
  {
    label: "Productos destacados",
    href: "/productos",
    children: [
      {
        label: "Máquina Montadora de Fuelles",
        href: "/productos/maquina-montadora-de-fuelles",
      },
      {
        label: "Fuelle Universal de Transmisión",
        href: "/productos/kit-de-fuelles-universales-para-homocineticas",
      },
      {
        label: "Extractor de Juntas Homocinéticas",
        href: "/productos/extractor-de-juntas-homocineticas",
      },
      {
        label: "Pinza para Abrazaderas",
        href: "/productos/pinza-para-abrazaderas",
      },
      {
        label: "Fuelle Universal de Dirección",
        href: "/productos/fuelle-universal-de-direccion",
      },
      {
        label: "Fuelle de Suspensión Deportiva",
        href: "/productos/kit-de-proteccion-para-suspension-deportiva",
      },
      {
        label: "Abrazaderas Universales",
        href: "/productos/abrazaderas-universales",
      },
    ],
  },
  { label: "Distribuidores", href: "/distribuidores" },
  { label: "Garantía", href: "/garantia" },
  { label: "Desarrollo a medida", href: "/desarrollo-a-medida" },
  { label: "Contacto", href: "/contacto" },
];
