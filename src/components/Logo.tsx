/**
 * Logo provisional de Griffo como SVG inline.
 * Reemplazar por el SVG real cuando lo tengamos (va en /public/iconos/header-icon.svg).
 */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 180 48"
      className={className}
      aria-label="Griffo"
      role="img"
    >
      <text
        x="0"
        y="34"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="34"
        fontWeight="900"
        letterSpacing="1"
        fill="currentColor"
      >
        GRIFFO
      </text>
      <circle cx="155" cy="24" r="6" fill="currentColor" />
    </svg>
  );
}
