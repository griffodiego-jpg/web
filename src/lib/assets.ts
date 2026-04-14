/**
 * URLs de assets del sitio original de Griffo (hotlinked).
 *
 * TODO: cuando podamos descargar los archivos del sitio original y subirlos
 * al repo en /public/images/, reemplazar estos valores por rutas locales
 * (p.ej. "/images/empresa/historia-inicios.png").
 *
 * Nota: intentamos https:// primero. Si el origen no soporta HTTPS las
 * imágenes no van a cargar en Vercel por mixed-content blocking; en ese
 * caso hay que hostearlas localmente.
 */
const ORIGIN_HTTPS = "https://app-griffo.n0mupxh3sq-zqy3j8n516kg.p.temp-site.link";

export const remoteAssets = {
  empresa: {
    historiaInicios: `${ORIGIN_HTTPS}/images/img-historia-inicios.png`,
    historiaHoy: `${ORIGIN_HTTPS}/images/img-historia-hoy.png`,
    familiaFuelle: `${ORIGIN_HTTPS}/images/familia-fuelle.jpg`,
    industriales: `${ORIGIN_HTTPS}/images/industriales.png`,
    misionIcon: `${ORIGIN_HTTPS}/iconos/mision.svg`,
    visionIcon: `${ORIGIN_HTTPS}/iconos/vision.svg`,
    comercioVideo: `${ORIGIN_HTTPS}/videos/comercio-exterior.mp4`,
    comercioPoster: `${ORIGIN_HTTPS}/images/video-comercio.png`,
    panelyscrap: `${ORIGIN_HTTPS}/images/panelyscrap.jpg`,
  },
};
