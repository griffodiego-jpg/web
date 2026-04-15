/**
 * Barra superior institucional con el mensaje de garantía.
 * Va pegada al top de la página, arriba del header. En mobile el texto
 * se desliza (marquee) porque no entra entero.
 */
export function TopBar() {
  return (
    <div className="bg-primary text-white py-2 text-xs sm:text-sm font-semibold tracking-wide overflow-hidden">
      {/* Desktop: texto centrado estático */}
      <div className="hidden lg:flex items-center justify-center gap-2.5 px-5">
        <ShieldIcon className="w-5 h-5" />
        <span className="uppercase">
          <strong>2 años de garantía</strong>
          <span className="mx-2 opacity-70">·</span>
          En todos nuestros productos
        </span>
      </div>

      {/* Mobile: marquee deslizante */}
      <div className="lg:hidden flex gap-10 px-5 whitespace-nowrap animate-[marquee_22s_linear_infinite]">
        <span className="flex items-center gap-2.5 uppercase shrink-0">
          <ShieldIcon className="w-4 h-4" />
          <strong>2 años de garantía</strong>
          <span className="opacity-70">·</span>
          En todos nuestros productos
        </span>
        <span
          className="flex items-center gap-2.5 uppercase shrink-0"
          aria-hidden
        >
          <ShieldIcon className="w-4 h-4" />
          <strong>2 años de garantía</strong>
          <span className="opacity-70">·</span>
          En todos nuestros productos
        </span>
      </div>
    </div>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M12 2 4 5v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V5l-8-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
