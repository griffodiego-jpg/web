/**
 * Banner "Buscador por Patente" — reconstrucción vectorial del banner
 * original de Griffo. Se adapta solo a mobile / tablet / desktop sin
 * necesitar distintas imágenes por breakpoint.
 *
 * Partes:
 *   - Fondo gris claro con curvas decorativas (SVG absoluto)
 *   - Ilustración: ventana de browser con lupa sobre un fuelle de caucho
 *   - Titular: "Nuevo!" + "Buscador por Patente"
 *   - Arrow-box azul: "Encontrá el repuesto exacto en segundos."
 *   - Bajada: "También podés buscar por vehículo..."
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
        <g stroke="#9fc4d9" strokeWidth="1.2" fill="none" opacity="0.45">
          <path d="M-100 120 Q 400 50 900 180 T 1700 160" />
          <path d="M-100 260 Q 500 180 1000 290 T 1800 240" />
          <path d="M-100 390 Q 400 320 900 430 T 1700 380" />
          <path d="M-100 510 Q 500 450 1000 530 T 1800 480" />
          <path d="M 200 -50 Q 400 250 250 600" />
          <path d="M 1400 -50 Q 1200 250 1350 650" />
        </g>
      </svg>

      {/* Contenido: layout responsive */}
      <div className="relative container mx-auto max-w-6xl px-5 sm:px-8 py-10 sm:py-14 lg:py-16 grid grid-cols-1 md:grid-cols-[auto_1fr] items-center gap-6 md:gap-10">
        <Illustration />
        <TextBlock />
      </div>
    </div>
  );
}

function Illustration() {
  return (
    <div className="mx-auto md:mx-0 w-[180px] sm:w-[220px] md:w-[240px] lg:w-[280px] shrink-0">
      <svg
        viewBox="0 0 280 260"
        className="w-full h-auto"
        aria-label="Ilustración: búsqueda de repuestos"
      >
        {/* Ventana de navegador */}
        <rect
          x="15"
          y="15"
          width="250"
          height="200"
          rx="8"
          fill="#f2f4f6"
          stroke="var(--color-primary-value)"
          strokeWidth="4"
        />
        {/* Barra superior azul */}
        <rect
          x="15"
          y="15"
          width="250"
          height="34"
          rx="8"
          fill="var(--color-primary-value)"
        />
        <rect x="15" y="40" width="250" height="9" fill="var(--color-primary-value)" />
        {/* Botones de la ventana */}
        <circle cx="34" cy="32" r="4.5" fill="#ffffff" />
        <circle cx="50" cy="32" r="4.5" fill="#ffffff" />
        <circle cx="66" cy="32" r="4.5" fill="#ffffff" />
        <rect x="85" y="27" width="165" height="10" rx="2" fill="#ffffff" opacity="0.85" />

        {/* Líneas de "contenido" */}
        <rect x="35" y="65" width="45" height="8" rx="2" fill="#cfd5d9" />
        <rect x="35" y="80" width="30" height="6" rx="2" fill="#cfd5d9" />

        {/* Destellos tipo "click" */}
        <line x1="165" y1="60" x2="165" y2="75" stroke="var(--color-primary-value)" strokeWidth="4" strokeLinecap="round" />
        <line x1="150" y1="68" x2="160" y2="78" stroke="var(--color-primary-value)" strokeWidth="4" strokeLinecap="round" />
        <line x1="180" y1="68" x2="170" y2="78" stroke="var(--color-primary-value)" strokeWidth="4" strokeLinecap="round" />

        {/* Fuelle de caucho (rubber boot) dentro de la lupa */}
        <g>
          {/* Cuerpo del fuelle con sus "anillos" */}
          <g transform="translate(95 95)" fill="#2a2a2a">
            <ellipse cx="40" cy="8" rx="18" ry="6" />
            <rect x="22" y="8" width="36" height="6" rx="1" />
            <ellipse cx="40" cy="18" rx="22" ry="7" />
            <rect x="18" y="18" width="44" height="6" rx="1" />
            <ellipse cx="40" cy="28" rx="24" ry="7" />
            <rect x="16" y="28" width="48" height="6" rx="1" />
            <ellipse cx="40" cy="38" rx="26" ry="7" />
            <rect x="14" y="38" width="52" height="6" rx="1" />
            <ellipse cx="40" cy="48" rx="24" ry="7" />
            <rect x="16" y="48" width="48" height="6" rx="1" />
            <ellipse cx="40" cy="58" rx="20" ry="6" />
          </g>
        </g>

        {/* Lupa sobre el fuelle */}
        <g>
          <circle cx="155" cy="145" r="50" fill="none" stroke="#1a1a1a" strokeWidth="8" />
          <circle cx="155" cy="145" r="44" fill="#f2f4f6" opacity="0.15" />
          <line
            x1="191"
            y1="181"
            x2="225"
            y2="215"
            stroke="#1a1a1a"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <line
            x1="191"
            y1="181"
            x2="225"
            y2="215"
            stroke="#2a2a2a"
            strokeWidth="8"
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
      {/* Titular principal */}
      <h2 className="font-black leading-[1.05] text-[#111] text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
        Nuevo!
        <br />
        Buscador por Patente
      </h2>

      {/* Caja azul con forma de flecha a la derecha */}
      <div className="mt-4 sm:mt-5">
        <ArrowBox>
          Encontrá el repuesto exacto
          <br className="hidden sm:block" /> en segundos.
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
 * Caja azul con flecha a la derecha. El triángulo se hace con clip-path
 * para que sea 100% CSS y escale con el texto.
 */
function ArrowBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block w-full sm:max-w-[620px]">
      <div
        className="bg-primary text-white font-black uppercase leading-tight px-5 sm:px-7 py-3 sm:py-4 text-xl sm:text-2xl md:text-3xl lg:text-4xl relative"
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
