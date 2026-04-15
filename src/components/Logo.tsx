/**
 * Logo de Griffo — reconstrucción vectorial.
 *
 * Proporciones ajustadas al logo oficial (~1.85:1 aspecto,
 * óvalo más "alto" y redondeado, casi stadium-shape).
 * Texto "griffo" en italic extra bold blanco, bien ajustado dentro
 * del óvalo con márgenes proporcionales.
 */
export function Logo({ className = "" }: { className?: string }) {
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

      {/* Óvalo inclinado ligeramente */}
      <g transform="rotate(-5 185 100)">
        <ellipse
          cx="185"
          cy="100"
          rx="175"
          ry="92"
          fill="url(#griffo-oval-gloss)"
        />
        {/* Brillo superior muy sutil */}
        <ellipse
          cx="185"
          cy="75"
          rx="150"
          ry="35"
          fill="#ffffff"
          opacity="0.08"
        />
        {/* Texto */}
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
