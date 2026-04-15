"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";

/**
 * Logo de Griffo.
 *
 * Intenta cargar el SVG oficial desde /public/iconos/header-icon.svg
 * (archivo que hay que subir al repo desde el sitio original). Si no
 * existe todavía, cae a una reconstrucción vectorial como fallback.
 *
 * Cuando subas el archivo real, el componente usa ese automáticamente
 * sin cambiar código.
 */
export function Logo({ className = "" }: { className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      <img
        src="/header-icon.svg"
        alt="Griffo"
        className={className}
        onError={() => setFailed(true)}
      />
    );
  }

  return <LogoFallback className={className} />;
}

/** SVG de reserva: aproximación del logo hasta tener el archivo real. */
function LogoFallback({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 370 200"
      className={className}
      role="img"
      aria-label="Griffo"
    >
      <defs>
        <radialGradient id="griffo-oval-gloss" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#1f78be" />
          <stop offset="55%" stopColor="#00549f" />
          <stop offset="100%" stopColor="#003d78" />
        </radialGradient>
      </defs>
      <g transform="rotate(-5 185 100)">
        <ellipse
          cx="185"
          cy="100"
          rx="175"
          ry="92"
          fill="url(#griffo-oval-gloss)"
        />
        <ellipse
          cx="185"
          cy="75"
          rx="150"
          ry="35"
          fill="#ffffff"
          opacity="0.08"
        />
        <text
          x="185"
          y="135"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'Segoe UI', system-ui, 'Helvetica Neue', Arial, sans-serif"
          fontSize="118"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-4"
        >
          griffo
        </text>
      </g>
    </svg>
  );
}
