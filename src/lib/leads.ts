import { getRedis } from "@/lib/kv";

/**
 * Persistencia de leads (formularios) en Upstash Redis.
 *
 * Cada tipo de form se guarda en una lista Redis (LPUSH = más reciente
 * primero). Los objetos se serializan como JSON. LRANGE 0 -1 lee todo.
 * Si Redis no está configurado, las funciones son no-op — los forms
 * siguen funcionando (mandan email) aunque no persistan.
 */

export type LeadKind =
  | "contacto"
  | "newsletter"
  | "descarga"
  | "garantia"
  | "sugerencia"
  | "desarrollo"
  | "reporte_error";

export type ContactoLead = {
  kind: "contacto";
  ts: number;
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
};

export type NewsletterLead = {
  kind: "newsletter";
  ts: number;
  email: string;
};

export type DescargaLead = {
  kind: "descarga";
  ts: number;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  compraA: string;
  recurso: string;
};

export type GarantiaLead = {
  kind: "garantia";
  ts: number;
  serial: string;
  buyingDate: string;
  buyingPlace: string;
  nombre: string;
  empresa: string;
  domicilio: string;
  pais: string;
  provincia: string;
  ciudad: string;
  email: string;
  telefono: string;
  subscribe: boolean;
};

/**
 * Sugerencia de producto faltante. Se dispara desde el catálogo público
 * cuando el usuario no encuentra lo que busca y aprieta el banner
 * "Sugerir un producto". Sirve como input para definir qué fabricar
 * próximo. Visible en `/admin/leads` → tab Sugerencias.
 */
export type SugerenciaLead = {
  kind: "sugerencia";
  ts: number;
  /** Lo que la persona buscaba (textarea libre, requerido). */
  producto: string;
  /** Marca/modelo/año del vehículo (opcional). */
  marcaVehiculo?: string;
  modeloVehiculo?: string;
  anioVehiculo?: string;
  /** Línea del producto: suspensión / dirección / transmisión / otro. */
  linea?: "suspension" | "direccion" | "transmision" | "otro";
  /** Lado: free text (puede ser izquierdo/derecho, lado caja, lado rueda,
   *  delantero/trasero, o cualquier descripción que use el usuario). */
  lado?: string;
  /** Medidas o dimensiones que conoce (free text). */
  medidas?: string;
  /** Código OEM del fabricante original (free text). */
  oem?: string;
  /** URL de la foto subida a Vercel Blob (opcional). */
  fotoUrl?: string;
  /** Quién es: mecanico / taller / particular / distribuidor (opcional). */
  perfil?: "mecanico" | "taller" | "particular" | "distribuidor";
  /** Email de contacto (opcional). */
  email?: string;
  /** Celular o WhatsApp (opcional). */
  celular?: string;
  /** @deprecated antes era un solo campo de contacto. Se mantiene para leer
   *  registros viejos creados con v1/v2; en v3 se usan email + celular. */
  contacto?: string;
  /** Snapshot del estado del catálogo cuando reportó. Auto-capturado.
   *  Útil para entender qué buscó (palabra/patente/código) y qué tab usaba. */
  busqueda?: string;
  tab?: string;
};

/**
 * Lead del form "Desarrollo a medida" (`/desarrollo-a-medida`). Persistimos
 * todo menos el binario adjunto — ése solo va al mail (Resend). Acá
 * guardamos el filename para tener referencia.
 */
export type DesarrolloLead = {
  kind: "desarrollo";
  ts: number;
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  industria: string;
  cantidad: string;
  descripcion: string;
  archivoNombre?: string;
};

/**
 * Lead del botón "¿Ves un error? Reportar" en la ficha del producto
 * (`/catalogo/[slug]` y `/productos/[slug]`). Permite que cualquier
 * visitante avise de errores en datos del catálogo (foto equivocada,
 * vehículo mal listado, medidas incorrectas, etc.). Visible en
 * `/admin/leads` → tab Reportes.
 */
export type ReporteErrorLead = {
  kind: "reporte_error";
  ts: number;
  /** Código del producto reportado (ej. "950-32"). */
  productoCode: string;
  /** Slug donde estaba el usuario cuando reportó. */
  productoSlug?: string;
  /** URL completa de la página donde se reportó (para que el admin
   *  pueda abrirla con un click y ver lo que ve el usuario). */
  productoUrl?: string;
  /** Categoría del error: foto / vehiculos / medidas / descripcion / otro. */
  tipoError: "foto" | "vehiculos" | "medidas" | "descripcion" | "otro";
  /** Detalle libre de qué está mal. */
  detalle: string;
  /** Contacto del que reporta (opcional, ambos). */
  email?: string;
  celular?: string;
};

export type Lead =
  | ContactoLead
  | NewsletterLead
  | DescargaLead
  | GarantiaLead
  | SugerenciaLead
  | DesarrolloLead
  | ReporteErrorLead;

const KEY_PREFIX = "leads:";

function keyFor(kind: LeadKind): string {
  return `${KEY_PREFIX}${kind}`;
}

/** Guarda un lead. No-op si Redis no está disponible o falla. */
export async function saveLead(lead: Lead): Promise<void> {
  try {
    const redis = getRedis();
    if (!redis) return;
    await redis.lpush(keyFor(lead.kind), JSON.stringify(lead));
  } catch (e) {
    // Nunca romper el flujo del form si Redis falla — el email sale igual.
    console.error("[leads] error guardando en Redis:", e);
  }
}

/** Lee todos los leads de un tipo (más reciente primero). */
export async function listLeads<T extends Lead = Lead>(
  kind: LeadKind
): Promise<T[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const raw = await redis.lrange(keyFor(kind), 0, -1);
    return raw
      .map((entry) => {
        // Upstash puede devolver objeto ya parseado o string según versión.
        if (typeof entry === "string") {
          try {
            return JSON.parse(entry) as T;
          } catch {
            return null;
          }
        }
        return entry as T;
      })
      .filter((x): x is T => x !== null);
  } catch (e) {
    console.error("[leads] error leyendo Redis:", e);
    return [];
  }
}

/** Cantidad de leads por tipo (para mostrar contadores en el sidebar). */
export async function countLeads(kind: LeadKind): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;
  try {
    return await redis.llen(keyFor(kind));
  } catch {
    return 0;
  }
}
