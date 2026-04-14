/**
 * Paths locales de assets del sitio.
 *
 * Los archivos viven en /public/... — cuando falten, los componentes
 * <AssetImage /> y <AssetVideo /> muestran un placeholder estilizado
 * automáticamente. Cuando se suban los archivos reales al repo con
 * estas rutas, los placeholders desaparecen solos sin tocar código.
 *
 * Los nombres matchean EXACTAMENTE los del sitio original de Griffo
 * para que baste con descargar + subir (sin renombrar nada).
 */
export const localAssets = {
  empresa: {
    historiaInicios: "/images/empresa/img-historia-inicios.png",
    historiaHoy: "/images/empresa/img-historia-hoy.png",
    familiaFuelle: "/images/empresa/familia-fuelle.jpg",
    industriales: "/images/empresa/industriales.png",
    // Video y poster van en la misma carpeta para simplificar el upload.
    comercioVideo: "/images/empresa/comercio-exterior.mp4",
    comercioPoster: "/images/empresa/video-comercio.png",
    panelyscrap: "/images/empresa/panelyscrap.jpg",
  },
};
