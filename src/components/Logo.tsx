/**
 * Logo de Griffo: óvalo azul con "griffo" en blanco, lowercase.
 * Aproximación en SVG puro basada en el logo oficial.
 * Cuando tengamos el archivo SVG original lo reemplazamos por un <Image />.
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 160"
      className={className}
      role="img"
      aria-label="Griffo"
    >
      {/* Óvalo azul */}
      <ellipse
        cx="150"
        cy="80"
        rx="145"
        ry="70"
        fill="var(--color-primary-value)"
      />
      {/* Texto "griffo" en blanco — lowercase, bold, itálica suave */}
      <text
        x="150"
        y="108"
        textAnchor="middle"
        fontFamily="'Inter', system-ui, Arial, sans-serif"
        fontSize="80"
        fontWeight="900"
        fill="#ffffff"
        fontStyle="italic"
        letterSpacing="-2"
      >
        griffo
      </text>
    </svg>
  );
}
