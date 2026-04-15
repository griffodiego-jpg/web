/**
 * Base de distribuidores Griffo.
 *
 * Los datos vienen del Excel institucional. Para actualizar:
 * 1) Abrir el Excel
 * 2) Copiar las filas (ctrl+A, ctrl+C)
 * 3) Pedirle a Claude que convierta a este formato, o editarlo a mano
 *    siguiendo el patrón de abajo.
 *
 * El orden afecta el orden de visualización en la página.
 */

export type Distribuidor = {
  nombre: string;
  telefono: string;
  email: string;
  provincia: string;
  /** URL opcional si el distribuidor tiene web propia. */
  web?: string;
  /** Dirección opcional. */
  direccion?: string;
};

/* TODO: reemplazar con el listado completo del Excel. */
export const distribuidores: Distribuidor[] = [
  {
    nombre: "Autopiezas Centenario",
    telefono: "011 4286-4977 / 4286-2624 / 4276-4910",
    email: "info@centenarioglobal.com.ar",
    provincia: "Buenos Aires",
  },
  {
    nombre: "Distribuidora Sur S.H.",
    telefono: "011 4293-2111",
    email: "distrisursh@uolsinectics.com.ar",
    provincia: "Buenos Aires",
  },
  {
    nombre: "Distribuidora Libertad",
    telefono: "0223-4741222 / 3",
    email: "libertad@speedy.com.ar",
    provincia: "Buenos Aires",
  },
  {
    nombre: "Etman Multioriginal",
    telefono: "0291-4565000",
    email: "ventas@etman.com.ar",
    provincia: "Buenos Aires",
  },
  {
    nombre: "Distrisuper S.R.L.",
    telefono: "02302-423388 / 422115",
    email: "adminpico@distrisuper.com",
    provincia: "La Pampa",
  },
  {
    nombre: "Distrisur",
    telefono: "0341-4635000",
    email: "ventas@asirsa.com.ar",
    provincia: "Santa Fe",
  },
];

/**
 * Lista de provincias únicas, ordenadas alfabéticamente, calculada
 * a partir de los datos. Si se agregan distribuidores en provincias
 * nuevas, aparecen automáticamente en el selector.
 */
export function listarProvincias(): string[] {
  const set = new Set(distribuidores.map((d) => d.provincia));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
}
