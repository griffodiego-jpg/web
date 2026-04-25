"use client";

/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import { useState } from "react";
import imageDimensions from "@/lib/image-dimensions.json";

const dims = imageDimensions as unknown as Record<string, [number, number]>;

/**
 * Imagen con fallback visual automático y optimización vía next/image.
 *
 * Si la imagen está rasterizada (jpg/png/webp/avif) y existe en
 * `image-dimensions.json` (generado por `scripts/gen-image-dimensions.mjs`),
 * se renderiza con `<Image>` de next/image — Next genera AVIF/WebP, srcset
 * responsive y reserva el espacio para evitar CLS.
 *
 * Para SVGs (logos, iconos) se usa `<img>` regular: next/image no los
 * optimiza y agrega complejidad sin beneficio.
 *
 * Modos:
 *   - default: imagen al ancho del padre, alto auto (`w-full h-auto`).
 *   - `fill`:  llena el contenedor padre con object-cover.
 *   - `bare`:  sin clases default — solo el className del consumidor
 *              (para iconos / logos con tamaño fijo).
 *
 * Props nuevas:
 *   - `priority`: marca como recurso crítico (LCP).
 *   - `sizes`:   override del sizes de next/image cuando el default
 *                no encaja (default: "100vw" en mobile, 1200px en desktop).
 */
export function AssetImage({
  src,
  alt,
  caption,
  className = "",
  fallbackAspect = "aspect-[4/3]",
  variant = "photo",
  fill = false,
  bare = false,
  priority = false,
  sizes,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  fallbackAspect?: string;
  variant?: "photo" | "video";
  fill?: boolean;
  bare?: boolean;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    if (bare) {
      return (
        <div
          className={`${className} bg-gray-200 rounded flex items-center justify-center text-gray-400`}
          role="img"
          aria-label={caption ?? alt}
        >
          <IconPlaceholder />
        </div>
      );
    }
    if (fill) {
      return (
        <Placeholder
          label={caption ?? alt}
          className={`absolute inset-0 ${className}`}
          variant={variant}
        />
      );
    }
    return (
      <Placeholder
        label={caption ?? alt}
        className={`${fallbackAspect} ${className}`}
        variant={variant}
      />
    );
  }

  const isSvg = src.endsWith(".svg");
  const dim = dims[src];
  const onError = () => setFailed(true);

  // SVGs y assets sin dimensiones conocidas: <img> regular con lazy loading.
  // (next/image no optimiza SVGs y requiere width/height para no-fill.)
  if (isSvg || (!fill && !dim)) {
    if (bare) {
      return (
        <img
          src={src}
          alt={alt}
          className={className}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={onError}
        />
      );
    }
    if (fill) {
      return (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover ${className}`}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onError={onError}
        />
      );
    }
    return (
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto ${className}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onError={onError}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes ?? "(max-width: 1024px) 100vw, 50vw"}
        priority={priority}
        className={`object-cover ${className}`}
        onError={onError}
      />
    );
  }

  const [w, h] = dim!;
  const responsiveSizes = sizes ?? "(max-width: 1024px) 100vw, 1200px";

  if (bare) {
    return (
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes={responsiveSizes}
        priority={priority}
        className={className}
        onError={onError}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      sizes={responsiveSizes}
      priority={priority}
      className={`w-full h-auto ${className}`}
      onError={onError}
    />
  );
}

function IconPlaceholder() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-6 h-6 shrink-0"
      aria-hidden
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </svg>
  );
}

function Placeholder({
  label,
  className,
  variant,
}: {
  label: string;
  className: string;
  variant: "photo" | "video";
}) {
  const id = label.replace(/[^a-z0-9]/gi, "-");
  return (
    <div
      className={`${className} w-full relative overflow-hidden rounded bg-gradient-to-br from-[#e6f1fa] via-[#d4e6f3] to-[#bcd5e8] flex items-center justify-center`}
      role="img"
      aria-label={label}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-20"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern
            id={`grid-${id}`}
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="20"
              cy="20"
              r="1.5"
              fill="var(--color-primary-value)"
            />
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#grid-${id})`} />
      </svg>

      <div className="relative flex flex-col items-center justify-center text-center px-6">
        {variant === "video" ? (
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="white"
              aria-hidden
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        ) : (
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary-value)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        )}
        <p className="mt-3 text-primary font-semibold text-sm lg:text-base max-w-[220px]">
          {label}
        </p>
      </div>
    </div>
  );
}
