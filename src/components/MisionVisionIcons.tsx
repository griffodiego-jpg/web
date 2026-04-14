/**
 * Iconos Misión y Visión — reconstrucción inline.
 * Se usan en la página Empresa. Son abstractos y podemos dibujarlos
 * directamente sin depender de archivos externos.
 */

export function MisionIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label="Misión"
    >
      {/* Diana / target */}
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="var(--color-primary-value)"
        strokeWidth="5"
      />
      <circle
        cx="60"
        cy="60"
        r="36"
        fill="none"
        stroke="var(--color-primary-value)"
        strokeWidth="5"
      />
      <circle
        cx="60"
        cy="60"
        r="20"
        fill="none"
        stroke="var(--color-primary-value)"
        strokeWidth="5"
      />
      <circle cx="60" cy="60" r="6" fill="var(--color-primary-value)" />
      {/* Flecha apuntando al centro */}
      <g stroke="var(--color-accent-value)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <line x1="90" y1="30" x2="60" y2="60" />
        <polyline points="78,26 90,30 86,42" fill="var(--color-accent-value)" />
      </g>
    </svg>
  );
}

export function VisionIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 100"
      className={className}
      role="img"
      aria-label="Visión"
    >
      {/* Ojo */}
      <path
        d="M10 50 Q 70 5 130 50 Q 70 95 10 50 Z"
        fill="none"
        stroke="var(--color-primary-value)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle
        cx="70"
        cy="50"
        r="22"
        fill="none"
        stroke="var(--color-primary-value)"
        strokeWidth="5"
      />
      <circle cx="70" cy="50" r="10" fill="var(--color-primary-value)" />
      <circle cx="76" cy="44" r="3" fill="white" />
    </svg>
  );
}
