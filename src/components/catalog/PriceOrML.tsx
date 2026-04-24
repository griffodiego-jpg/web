"use client";

import { useMockSession } from "@/lib/mock-session";

import { AddToCartButton } from "./AddToCartButton";
import { ProductPrice } from "./ProductPrice";

/**
 * Bloque de "precio + CTAs de compra" del catálogo público.
 *
 * Si el usuario NO está logueado como B2B:
 *   - Ocultamos precios (son precios de compra mayorista).
 *   - Mostramos un único botón "Ver en Mercado Libre". Si el producto
 *     no tiene link en el mapa subido por admin, el botón queda
 *     deshabilitado y en gris ("Sin publicación en Mercado Libre").
 *
 * Si el usuario SÍ está logueado:
 *   - Se muestra el precio (compra o PVP según preferencias B2B).
 *   - Se muestra el botón de "Agregar al carrito" para armar el pedido.
 *   - Si existe link de ML, se ofrece como alternativa secundaria.
 */
export function PriceOrML({
  productCode,
  slug,
  productName,
  image,
  mlLink,
  size = "card",
}: {
  productCode: string;
  slug: string;
  productName: string;
  image?: string;
  mlLink?: string | null;
  /** "card" = versión compacta para ProductCard. "detail" = versión grande. */
  size?: "card" | "detail";
}) {
  const { isLoggedIn, ready } = useMockSession();

  // Mientras el estado de sesión no terminó de hidratar, no renderizamos
  // precios ni CTAs para evitar parpadeos (precio visible → oculto).
  if (!ready) {
    return <div className="h-10" aria-hidden />;
  }

  if (isLoggedIn) {
    if (size === "detail") {
      return (
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <ProductPrice productCode={productCode} size="lg" />
          <div className="flex items-center gap-2">
            <AddToCartButton
              productCode={productCode}
              slug={slug}
              name={productName}
              image={image}
            />
            {mlLink ? (
              <a
                href={mlLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-md bg-[#FFE600] px-3 py-1.5 text-xs font-bold text-[#333] transition hover:brightness-95"
              >
                MercadoLibre ↗
              </a>
            ) : null}
          </div>
        </div>
      );
    }
    return (
      <>
        <ProductPrice productCode={productCode} size="md" />
        <div className="flex items-center justify-end">
          <AddToCartButton
            productCode={productCode}
            slug={slug}
            name={productName}
            image={image}
            compact
          />
        </div>
      </>
    );
  }

  // No logueado: solo Mercado Libre.
  const hasLink = !!mlLink;

  if (size === "detail") {
    return hasLink ? (
      <a
        href={mlLink!}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-[#FFE600] px-5 py-3 text-sm font-bold text-[#333] transition hover:brightness-95"
      >
        Comprar en Mercado Libre ↗
      </a>
    ) : (
      <button
        type="button"
        disabled
        className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-lg bg-gray-200 px-5 py-3 text-sm font-bold text-gray-500 cursor-not-allowed"
      >
        Sin publicación en Mercado Libre
      </button>
    );
  }

  // size="card"
  return hasLink ? (
    <a
      href={mlLink!}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center gap-1 w-full rounded-md bg-[#FFE600] px-2.5 py-1.5 text-[11px] font-bold text-[#333] transition hover:brightness-95"
    >
      Ver en Mercado Libre ↗
    </a>
  ) : (
    <button
      type="button"
      disabled
      onClick={(e) => e.stopPropagation()}
      className="inline-flex items-center justify-center w-full rounded-md bg-gray-100 px-2.5 py-1.5 text-[11px] font-bold text-gray-400 cursor-not-allowed"
    >
      Sin publicación en ML
    </button>
  );
}
