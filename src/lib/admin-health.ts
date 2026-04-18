import { listCatalog } from "@/lib/api/specparts";
import { getRedis } from "@/lib/kv";

/**
 * Health checks de los servicios externos que el sitio usa. Cada check
 * devuelve `ok` (verde), `warn` (amarillo) o `error` (rojo) + un
 * mensaje corto para el dashboard.
 *
 * Se corren en paralelo con Promise.allSettled para que un servicio
 * caído no rompa la verificación del resto.
 */

export type HealthStatus = "ok" | "warn" | "error";

export type HealthCheck = {
  id: string;
  label: string;
  status: HealthStatus;
  message: string;
  /** Detalle opcional para mostrar en hover/tooltip. */
  detail?: string;
};

export async function runHealthChecks(): Promise<HealthCheck[]> {
  const [sp, redis, blob, resend] = await Promise.allSettled([
    checkSpecParts(),
    checkRedis(),
    checkBlob(),
    checkResend(),
  ]);

  return [
    settledToCheck("specparts", "SpecParts API", sp),
    settledToCheck("redis", "Upstash Redis", redis),
    settledToCheck("blob", "Vercel Blob", blob),
    settledToCheck("resend", "Resend (email)", resend),
  ];
}

function settledToCheck(
  id: string,
  label: string,
  res: PromiseSettledResult<HealthCheck>
): HealthCheck {
  if (res.status === "fulfilled") return res.value;
  return {
    id,
    label,
    status: "error",
    message: "Crash en el check",
    detail: String(res.reason),
  };
}

async function checkSpecParts(): Promise<HealthCheck> {
  if (!process.env.SPECPARTS_CLIENT_ID || !process.env.SPECPARTS_CLIENT_SECRET) {
    return {
      id: "specparts",
      label: "SpecParts API",
      status: "error",
      message: "Faltan credenciales (SPECPARTS_CLIENT_ID/SECRET)",
    };
  }
  try {
    const products = await listCatalog();
    return {
      id: "specparts",
      label: "SpecParts API",
      status: "ok",
      message: `OK — ${products.length} productos en cache`,
    };
  } catch (e) {
    return {
      id: "specparts",
      label: "SpecParts API",
      status: "error",
      message: "No responde",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function checkRedis(): Promise<HealthCheck> {
  const redis = getRedis();
  if (!redis) {
    return {
      id: "redis",
      label: "Upstash Redis",
      status: "error",
      message: "Env vars faltantes (KV_REST_API_URL/TOKEN)",
    };
  }
  try {
    const res = await redis.ping();
    if (res === "PONG") {
      return {
        id: "redis",
        label: "Upstash Redis",
        status: "ok",
        message: "OK — conectado",
      };
    }
    return {
      id: "redis",
      label: "Upstash Redis",
      status: "warn",
      message: `Respuesta inesperada: ${String(res)}`,
    };
  } catch (e) {
    return {
      id: "redis",
      label: "Upstash Redis",
      status: "error",
      message: "No responde",
      detail: e instanceof Error ? e.message : String(e),
    };
  }
}

async function checkBlob(): Promise<HealthCheck> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return {
      id: "blob",
      label: "Vercel Blob",
      status: "warn",
      message:
        "Env var BLOB_READ_WRITE_TOKEN no seteada — uploads desde admin no funcionan",
    };
  }
  return {
    id: "blob",
    label: "Vercel Blob",
    status: "ok",
    message: "Token presente",
    detail:
      "No hacemos ping real (no hay endpoint barato) — solo chequeo de configuración",
  };
}

async function checkResend(): Promise<HealthCheck> {
  if (!process.env.RESEND_API_KEY) {
    return {
      id: "resend",
      label: "Resend (email)",
      status: "error",
      message: "RESEND_API_KEY no seteada — los forms no mandan email",
    };
  }
  const sender = "onboarding@resend.dev";
  // Si hay dominio propio configurado, la cliente lo puede verificar
  // en Resend. Mientras tanto warning.
  return {
    id: "resend",
    label: "Resend (email)",
    status: "warn",
    message: `Funciona, pero sender = ${sender}`,
    detail:
      "Verificar griffo.com.ar en Resend para mandar desde contacto@griffo.com.ar",
  };
}
