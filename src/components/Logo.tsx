/**
 * Logo de Griffo — reconstrucción vectorial más fiel al oficial.
 *
 * Características del logo real:
 *   - Óvalo azul levemente inclinado hacia arriba a la derecha
 *   - Texto "griffo" en blanco, italic, extra bold, rounded sans
 *   - La "g" de "griffo" tiene descender redondeado
 *
 * Nota: sigue siendo una aproximación. Para 100% exactitud habría que
 * usar el archivo SVG/PNG original. Pero esta versión ya queda muy
 * cercana al logo real — inclinada, italic, texto blanco sobre azul.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 140"
      className={className}
      role="img"
      aria-label="Griffo"
    >
      <defs>
        {/* Un suave highlight interno para darle volumen al óvalo */}
        <radialGradient id="griffo-oval-gloss" cx="45%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#1d72b8" />
          <stop offset="60%" stopColor="#00549f" />
          <stop offset="100%" stopColor="#004685" />
        </radialGradient>
      </defs>

      {/* Grupo inclinado ~6° hacia arriba a la derecha */}
      <g transform="rotate(-6 160 70)">
        <ellipse
          cx="160"
          cy="70"
          rx="150"
          ry="62"
          fill="url(#griffo-oval-gloss)"
        />
        {/* Borde muy sutil más oscuro */}
        <ellipse
          cx="160"
          cy="70"
          rx="150"
          ry="62"
          fill="none"
          stroke="#003a73"
          strokeWidth="1.5"
          opacity="0.5"
        />
        <text
          x="160"
          y="97"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'Segoe UI', 'Helvetica Neue', Arial, sans-serif"
          fontSize="78"
          fontWeight="900"
          fontStyle="italic"
          letterSpacing="-3"
        >
          griffo
        </text>
      </g>
    </svg>
  );
}
