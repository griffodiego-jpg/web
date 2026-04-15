/**
 * Banner "Buscador por Patente" — reconstrucción vectorial del banner
 * original de Griffo. Full-width, adaptativo a mobile / tablet / desktop
 * con un solo componente (no hace falta múltiples imágenes por breakpoint).
 */
export function BuscadorPatenteBanner() {
  return (
    <div className="relative w-full overflow-hidden bg-[#e4e7ea]">
      {/* Curvas decorativas del fondo (líneas celestes muy suaves) */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="none"
        viewBox="0 0 1600 600"
        aria-hidden
      >
        <g stroke="#9fc4d9" strokeWidth="1.2" fill="none" opacity="0.5">
          <path d="M-100 120 Q 400 50 900 180 T 1700 160" />
          <path d="M-100 260 Q 500 180 1000 290 T 1800 240" />
          <path d="M-100 390 Q 400 320 900 430 T 1700 380" />
          <path d="M-100 510 Q 500 450 1000 530 T 1800 480" />
          <path d="M 200 -50 Q 400 250 250 600" />
          <path d="M 1400 -50 Q 1200 250 1350 650" />
        </g>
      </svg>

      {/* Contenido full-width: el banner ocupa todo el ancho de la pantalla */}
      <div className="relative w-full px-6 sm:px-10 lg:px-16 xl:px-24 py-10 sm:py-14 lg:py-16 xl:py-20 grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-6 md:gap-10 lg:gap-14 max-w-[1800px] mx-auto">
        <Illustration />
        <TextBlock />
      </div>
    </div>
  );
}

function Illustration() {
  return (
    <div className="mx-auto md:mx-0 w-[220px] sm:w-[280px] md:w-[340px] lg:w-[400px] xl:w-[460px] shrink-0">
      <svg
        viewBox="0 0 320 300"
        className="w-full h-auto"
        aria-label="Ilustración: búsqueda de repuestos"
      >
        {/* === VENTANA DE NAVEGADOR === */}
        <rect
          x="20"
          y="20"
          width="280"
          height="220"
          rx="10"
          fill="#f2f4f6"
          stroke="var(--color-primary-value)"
          strokeWidth="4"
        />
        {/* Barra superior azul */}
        <path
          d="M 20 30 Q 20 20 30 20 L 290 20 Q 300 20 300 30 L 300 54 L 20 54 Z"
          fill="var(--color-primary-value)"
        />
        {/* Botones de la ventana */}
        <circle cx="38" cy="37" r="5" fill="#ffffff" />
        <circle cx="56" cy="37" r="5" fill="#ffffff" />
        <circle cx="74" cy="37" r="5" fill="#ffffff" />
        {/* Barra de dirección blanca dentro del header */}
        <rect x="95" y="30" width="190" height="14" rx="3" fill="#ffffff" opacity="0.9" />

        {/* Líneas de "contenido" abajo del header */}
        <rect x="38" y="72" width="52" height="10" rx="2" fill="#b8c2ca" />
        <rect x="38" y="90" width="34" height="7" rx="2" fill="#b8c2ca" />

        {/* Destellos tipo "click" — arriba a la derecha de la lupa */}
        <g stroke="var(--color-accent-value)" strokeWidth="5" strokeLinecap="round" fill="none">
          <line x1="205" y1="72" x2="205" y2="92" />
          <line x1="188" y1="82" x2="200" y2="94" />
          <line x1="222" y1="82" x2="210" y2="94" />
        </g>

        {/* === FUELLE DE CAUCHO (centrado en la lupa) === */}
        {/* Posicionado en el centro del lens: (170, 160) */}
        <g fill="#1a1a1a">
          {/* Anillos del fuelle — de arriba hacia abajo, con forma acampanada */}
          <ellipse cx="170" cy="115" rx="14" ry="4" />
          <rect x="156" y="115" width="28" height="5" />
          <ellipse cx="170" cy="125" rx="18" ry="4.5" />
          <rect x="152" y="125" width="36" height="5" />
          <ellipse cx="170" cy="135" rx="21" ry="5" />
          <rect x="149" y="135" width="42" height="5" />
          <ellipse cx="170" cy="145" rx="23" ry="5" />
          <rect x="147" y="145" width="46" height="5" />
          <ellipse cx="170" cy="155" rx="24" ry="5" />
          <rect x="146" y="155" width="48" height="5" />
          <ellipse cx="170" cy="165" rx="23" ry="5" />
          <rect x="147" y="165" width="46" height="5" />
          <ellipse cx="170" cy="175" rx="21" ry="5" />
          <rect x="149" y="175" width="42" height="5" />
          <ellipse cx="170" cy="185" rx="18" ry="4.5" />
          <rect x="152" y="185" width="36" height="4" />
          <ellipse cx="170" cy="193" rx="14" ry="4" />
        </g>

        {/* === LUPA === */}
        {/* Círculo exterior (marco) */}
        <circle
          cx="170"
          cy="160"
          r="62"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="10"
        />
        {/* Vidrio interior con leve tinte */}
        <circle cx="170" cy="160" r="56" fill="#ffffff" opacity="0.0" />
        {/* Mango de la lupa */}
        <g>
          <line
            x1="214"
            y1="204"
            x2="260"
            y2="250"
            stroke="#1a1a1a"
            strokeWidth="18"
            strokeLinecap="round"
          />
          <line
            x1="217"
            y1="207"
            x2="255"
            y2="245"
            stroke="#2e2e2e"
            strokeWidth="10"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </div>
  );
}

function TextBlock() {
  return (
    <div className="text-center md:text-left">
      {/* "Nuevo!" — más chico, como "etiqueta" del titular */}
      <p className="font-black text-[#111] leading-none text-2xl sm:text-3xl md:text-4xl">
        Nuevo!
      </p>

      {/* Titular principal */}
      <h2 className="mt-1 font-black leading-[1.05] text-[#111] text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-6xl">
        Buscador por Patente
      </h2>

      {/* Caja azul con forma de flecha a la derecha */}
      <div className="mt-4 sm:mt-5">
        <ArrowBox>
          Encontrá el repuesto exacto
          <br />
          en segundos.
        </ArrowBox>
      </div>

      {/* Bajada */}
      <p className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl font-semibold text-[#0a2b3d]">
        También podés buscar por vehículo,
        <br className="hidden sm:block" /> número de pieza, palabra o medidas.
      </p>
    </div>
  );
}

/**
 * Caja azul con flecha a la derecha. Ancho automático: se adapta al
 * texto más largo que contiene. `whitespace-nowrap` evita wraps
 * inesperados al cambiar el tamaño de fuente.
 */
function ArrowBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block">
      <div
        className="bg-primary text-white font-black uppercase leading-[1.1] whitespace-nowrap px-5 sm:px-6 md:px-7 py-3 sm:py-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-[2.6rem] relative"
        style={{
          clipPath:
            "polygon(0 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%)",
          paddingRight: "44px",
        }}
      >
        {children}
      </div>
    </div>
  );
}
