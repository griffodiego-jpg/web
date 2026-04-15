/**
 * Base de distribuidores Griffo.
 *
 * Generado a partir del Excel institucional (src/data/Distribuidores.csv).
 * Para regenerar: pedirle a Claude que reparsée el CSV, o actualizar
 * este archivo a mano siguiendo el patrón.
 *
 * Campos:
 *   - provincia:        donde está físicamente ubicado el distribuidor
 *   - provinciasFiltro: provincias a las que ENTREGA (pueden ser varias)
 */

export type Distribuidor = {
  nombre: string;
  telefono: string;
  email: string;
  provincia: string;
  provinciasFiltro: string[];
};

export const distribuidores: Distribuidor[] = [
  {
    nombre: "Autopiezas Centenario",
    telefono: "011 4286-4977 / 4286-2624 / 4276-4910",
    email: "info@centenarioglobal.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Buenos Aires - GBA", "Capital Federal", "Jujuy", "Neuquén", "Río Negro", "Salta", "Tucumán"],
  },
  {
    nombre: "Distribuidora Sur S.H",
    telefono: "011 4293-2111",
    email: "distrisursh@uolsinectics.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Buenos Aires - GBA", "Capital Federal", "Entre Ríos", "Formosa", "Tucumán"],
  },
  {
    nombre: "Distrisuper S.R.L.",
    telefono: "02302-423388/422115",
    email: "adminpico@distrisuper.com",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Buenos Aires - GBA", "La Pampa"],
  },
  {
    nombre: "Etman Multioriginal",
    telefono: "0291-4565000",
    email: "ventas@etman.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Catamarca", "Chaco", "Chubut", "Corrientes", "Córdoba", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  },
  {
    nombre: "Distribuidora Libertad",
    telefono: "0223-4741222 / 3",
    email: "libertad@speedy.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Córdoba", "Santa Fe"],
  },
  {
    nombre: "Distrisur",
    telefono: "0341-4635000",
    email: "ventas@asirsa.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Corrientes", "Córdoba", "Entre Ríos", "Formosa", "Misiones", "Santa Fe"],
  },
  {
    nombre: "Megaparts Autopiezas",
    telefono: "0291-4502004 / 602",
    email: "ventas@megaparts.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Chubut", "Río Negro", "Santa Cruz"],
  },
  {
    nombre: "Todo Suspensión",
    telefono: "011 4686-4709 / 5553",
    email: "todosusp@speedy.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Chubut", "Córdoba", "La Pampa", "Neuquén", "Río Negro", "Santa Cruz"],
  },
  {
    nombre: "Pagano & Cía",
    telefono: "(02346) 43-0999 / 42-4325",
    email: "ventas@paganoycia.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires"],
  },
  {
    nombre: "Der Distribuciones",
    telefono: "(011) 4846-7500 / 6958-8882",
    email: "info@derdistribuciones.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Buenos Aires - GBA", "Capital Federal", "Catamarca", "Chaco", "Chubut", "Corrientes", "Córdoba", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  },
  {
    nombre: "Expoyer",
    telefono: "(011) 7090-2700/2701/2702/2703/2704",
    email: "info@expoyer.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires", "Buenos Aires - GBA", "Capital Federal", "Catamarca", "Chaco", "Chubut", "Corrientes", "Córdoba", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja", "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan", "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero", "Tierra del Fuego", "Tucumán"],
  },
  {
    nombre: "Original Suspensión",
    telefono: "011 15-6382-9068",
    email: "victorch@live.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Buenos Aires - GBA", "Capital Federal"],
  },
  {
    nombre: "Discam",
    telefono: "011 4755-1323",
    email: "discam@arnetbiz.com.ar",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Capital Federal", "Córdoba", "Jujuy", "La Rioja", "Salta", "Santa Fe"],
  },
  {
    nombre: "J.F. Correa",
    telefono: "0381-4241084 / 4246923",
    email: "jfcorrea@arnet.com.ar",
    provincia: "Tucumán",
    provinciasFiltro: ["Catamarca", "Chaco", "Jujuy", "La Rioja", "Salta", "Santiago del Estero", "Tucumán"],
  },
  {
    nombre: "Rural Santa Fe SAICA",
    telefono: "0342-4884500",
    email: "ruralsantafe@arnet.com.ar",
    provincia: "Santa Fe",
    provinciasFiltro: ["Catamarca", "Chaco", "Corrientes", "Córdoba", "Entre Ríos", "Formosa", "Jujuy", "La Rioja", "Misiones", "Salta", "Santa Fe", "Santiago del Estero", "Tucumán"],
  },
  {
    nombre: "Distribuidora Fazio",
    telefono: "0351-4536000",
    email: "info@nestorfazio.com.ar",
    provincia: "Córdoba",
    provinciasFiltro: ["Catamarca", "Chaco", "Córdoba", "Jujuy", "La Rioja", "Salta", "San Juan", "San Luis", "Santiago del Estero", "Tucumán"],
  },
  {
    nombre: "Cedisa",
    telefono: "0299-4432256",
    email: "cedisaventas@speedy.com.ar",
    provincia: "Neuquén",
    provinciasFiltro: ["Chubut", "Neuquén", "Río Negro", "Santa Cruz", "Tierra del Fuego"],
  },
  {
    nombre: "Juma S.A.",
    telefono: "0229-4424529",
    email: "jumasa@speedy.com.ar",
    provincia: "Neuquén",
    provinciasFiltro: ["Chubut", "Neuquén", "Río Negro", "Santa Cruz"],
  },
  {
    nombre: "Peón Repuestos",
    telefono: "(0351) 560-4480",
    email: "peonrepuesto@gmail.com",
    provincia: "Córdoba",
    provinciasFiltro: ["Córdoba"],
  },
  {
    nombre: "Autopiezas Mayca",
    telefono: "011 4585-3489 / 3",
    email: "info@maycasrl.com",
    provincia: "Buenos Aires",
    provinciasFiltro: ["Corrientes", "Entre Ríos", "Formosa", "Santa Fe"],
  },
  {
    nombre: "Distribuidora Racer",
    telefono: "0362-4448447",
    email: "racer@arnet.com.ar",
    provincia: "Chaco",
    provinciasFiltro: ["Corrientes", "Formosa", "Misiones"],
  },
  {
    nombre: "Autopartes Sol",
    telefono: "03755-499194 / 499484",
    email: "autopartessolsrl@gmail.com",
    provincia: "Misiones",
    provinciasFiltro: ["Corrientes", "Misiones"],
  },
  {
    nombre: "Warnes Distribución",
    telefono: "(03755) 42-5115",
    email: "info@grupowarnes.com.ar",
    provincia: "Misiones",
    provinciasFiltro: ["Corrientes", "Formosa", "Misiones"],
  },
  {
    nombre: "Guido Badaloni S.A.",
    telefono: "0261-4314678",
    email: "info@guidobadaloni.com",
    provincia: "Mendoza",
    provinciasFiltro: ["Mendoza", "San Juan", "San Luis"],
  },
];

/**
 * Lista de provincias de filtro únicas, ordenadas alfabéticamente.
 */
export function listarProvincias(): string[] {
  const set = new Set<string>();
  for (const d of distribuidores) {
    for (const p of d.provinciasFiltro) set.add(p);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}
