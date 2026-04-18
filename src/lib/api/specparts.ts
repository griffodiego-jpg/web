/**
 * Cliente de SpecParts (external-api.specparts.ai) — SERVER ONLY.
 *
 * ⚠️ REGLA CRÍTICA DEL PROXY:
 * Para GET a /part/list y otros endpoints con `brand[]=GRIFFO` usamos el módulo
 * nativo `https` + `zlib`, NUNCA `fetch()`. `fetch()` re-codifica los brackets
 * (`brand[]` → `brand%5B%5D`) y SpecParts devuelve ~5 productos en vez de ~370.
 * Bug confirmado en producción de la app mobile.
 *
 * `fetch()` SÍ se puede usar para el POST de auth (no hay query params con
 * brackets que preservar).
 *
 * Cache: ~370 productos en memoria del proceso, TTL 30 min.
 */

import https from "node:https";
import { gunzip } from "node:zlib";
import { promisify } from "node:util";

import type {
  CatalogProduct,
  SpecPartsListResponse,
  SpecPartsPlateResponse,
  SpecPartsProduct,
} from "@/types/specparts";

const gunzipAsync = promisify(gunzip);

const API_HOST = "external-api.specparts.ai";
const AUTH_URL = "https://auth.specparts.ai/oauth";
const CACHE_TTL_MS = 30 * 60 * 1000;

type TokenCache = { token: string; expiresAt: number };
type ProductsCache = { products: CatalogProduct[]; expiresAt: number };

let tokenCache: TokenCache | null = null;
let productsCache: ProductsCache | null = null;
let inflightProducts: Promise<CatalogProduct[]> | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }

  const clientId = process.env.SPECPARTS_CLIENT_ID;
  const clientSecret = process.env.SPECPARTS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("SPECPARTS_CLIENT_ID y SPECPARTS_CLIENT_SECRET no configurados");
  }

  const res = await fetch(AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });
  if (!res.ok) throw new Error(`SpecParts auth falló (${res.status})`);
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("SpecParts auth: respuesta sin access_token");

  tokenCache = { token: data.access_token, expiresAt: Date.now() + 55 * 60 * 1000 };
  return data.access_token;
}

/**
 * GET a SpecParts con `https` nativo. Preserva la URL literal (brackets, etc).
 * No usar `fetch()` acá — ver nota al tope del archivo.
 */
function specpartsGet<T>(path: string, token: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https
      .get(
        {
          hostname: API_HOST,
          path,
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Accept-Encoding": "gzip",
          },
        },
        (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk: Buffer) => chunks.push(chunk));
          res.on("end", async () => {
            const buffer = Buffer.concat(chunks);
            try {
              const body =
                res.headers["content-encoding"] === "gzip"
                  ? (await gunzipAsync(buffer)).toString("utf8")
                  : buffer.toString("utf8");
              resolve(JSON.parse(body) as T);
            } catch (err) {
              reject(err);
            }
          });
          res.on("error", reject);
        },
      )
      .on("error", reject);
  });
}

/**
 * Normaliza texto: minúsculas, sin acentos. Espejo de la función `norm()`
 * de la app mobile — mantenemos la misma lógica para que las búsquedas
 * devuelvan los mismos resultados.
 */
export function normalizeSearch(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function fetchAllProducts(): Promise<CatalogProduct[]> {
  const token = await getAccessToken();
  const all: SpecPartsProduct[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const path = `/part/list?lang=1&limit=100&page=${page}&brand[]=GRIFFO&output=v1`;
    const data = await specpartsGet<SpecPartsListResponse>(path, token);
    if (data?.data) {
      all.push(...data.data);
      totalPages = data.paging?.pages ?? 1;
    } else {
      break;
    }
    page += 1;
  }

  // NO calculamos _searchText server-side: se hace en el cliente para
  // bajar el payload del response inicial.
  return all;
}

/**
 * Devuelve los ~370 productos GRIFFO enriquecidos con `_searchText`.
 * Cachea 30 min en memoria. Deduplica requests concurrentes.
 */
export async function listCatalog(): Promise<CatalogProduct[]> {
  if (productsCache && Date.now() < productsCache.expiresAt) {
    return productsCache.products;
  }
  if (inflightProducts) return inflightProducts;

  inflightProducts = fetchAllProducts()
    .then((products) => {
      productsCache = { products, expiresAt: Date.now() + CACHE_TTL_MS };
      return products;
    })
    .catch(async (err) => {
      // Loguear el fallo para que aparezca en el dashboard admin.
      // Import lazy para evitar ciclos (admin-log → kv → nada circular,
      // pero por consistencia con otros lazy imports en el proyecto).
      const { logAdminError } = await import("@/lib/admin-log");
      await logAdminError("specparts", err);
      throw err;
    })
    .finally(() => {
      inflightProducts = null;
    });

  return inflightProducts;
}

export async function getProductBySlug(slug: string): Promise<CatalogProduct | null> {
  const products = await listCatalog();
  return products.find((p) => p.slug === slug) ?? null;
}

/** Busca un producto por código SKU (case-insensitive, sin espacios). */
export async function getProductByCode(code: string): Promise<CatalogProduct | null> {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  const products = await listCatalog();
  return (
    products.find(
      (p) => p.code.toUpperCase().replace(/\s+/g, "") === normalized
    ) ?? null
  );
}

export async function identifyPlate(plate: string): Promise<SpecPartsPlateResponse> {
  const token = await getAccessToken();
  const path = `/vehicle/identification?plate=${encodeURIComponent(plate)}`;
  return specpartsGet<SpecPartsPlateResponse>(path, token);
}
