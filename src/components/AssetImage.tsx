"use client";

/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";

type Status = "loading" | "ok" | "failed";

/**
 * Imagen con fallback visual automático.
 *
 * Estrategia de detección de errores: pre-carga con `new Image()` en un
 * useEffect. Es más confiable que `onError` en el <img> renderizado,
 * porque no depende del sistema de eventos sintéticos de React ni sufre
 * issues de hidratación.
 *
 * Modos:
 *   - default: `<img>` a tamaño natural (w-full h-auto). Fallback es
 *     un placeholder estilizado con aspecto fijo.
 *   - `fill`:  `<img>` posicionada absoluta que llena el contenedor
 *     padre con object-cover.
 *   - `bare`:  sin clases default — solo usa el className del consumidor.
 *     Útil para iconos/logos con tamaño fijo. Fallback es un rectángulo
 *     gris que respeta el className.
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
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  fallbackAspect?: string;
  variant?: "photo" | "video";
  fill?: boolean;
  bare?: boolean;
}) {
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    const img = new Image();
    img.onload = () => {
      if (alive) setStatus("ok");
    };
    img.onerror = () => {
      if (alive) setStatus("failed");
    };
    img.src = src;
    return () => {
      alive = false;
    };
  }, [src]);

  // Si falla: placeholder
  if (status === "failed") {
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

  // Mientras carga, mostrar el mismo placeholder (evita flash del alt roto).
  if (status === "loading") {
    if (bare) {
      return (
        <div
          className={`${className} bg-gray-100 rounded`}
          role="img"
          aria-label="Cargando"
          aria-busy="true"
        />
      );
    }
    if (fill) {
      return (
        <div
          className={`absolute inset-0 ${className} bg-gray-100`}
          aria-busy="true"
        />
      );
    }
    return (
      <div
        className={`${fallbackAspect} ${className} bg-gray-100 rounded`}
        aria-busy="true"
      />
    );
  }

  // Cargó OK: renderizar la imagen
  if (bare) {
    return <img src={src} alt={alt} className={className} />;
  }

  if (fill) {
    return (
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <img src={src} alt={alt} className={`w-full h-auto ${className}`} />
  );
}

/* Icono pequeño de imagen para el placeholder bare */
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
