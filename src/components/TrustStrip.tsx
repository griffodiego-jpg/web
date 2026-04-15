/**
 * Franja de credenciales / trust signals.
 * 4 bloques con ícono + título + subtítulo separados por divisores.
 */
export function TrustStrip() {
  return (
    <section
      aria-label="Credenciales Griffo"
      className="bg-gray-50 border-y border-gray-200 py-8 lg:py-10"
    >
      <div className="container mx-auto max-w-6xl px-5 lg:px-10 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x lg:divide-gray-300">
        <Credential
          icon={<ShieldIcon className="w-10 h-10" />}
          title="2 años de garantía"
          subtitle="En todos nuestros productos"
        />
        <Credential
          icon={<BadgeIcon className="w-10 h-10" />}
          title="ISO 9001:2015"
          subtitle="Certificación de calidad"
        />
        <Credential
          icon={<FactoryIcon className="w-10 h-10" />}
          title="Desde 1968"
          subtitle="Empresa familiar argentina"
        />
        <Credential
          icon={<TrophyIcon className="w-10 h-10" />}
          title="50+ años"
          subtitle="De experiencia en la industria"
        />
      </div>
    </section>
  );
}

function Credential({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 lg:px-6 text-left">
      <div className="text-primary shrink-0">{icon}</div>
      <div>
        <p className="font-extrabold text-sm lg:text-base text-primary leading-tight uppercase">
          {title}
        </p>
        <p className="text-xs lg:text-sm text-gray-600 leading-tight mt-0.5">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/* ===== Íconos ===== */

function FactoryIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 20V10l6 4V10l6 4V5h5v15H3Z" />
      <path d="M7 15h.01M11 15h.01M15 15h.01M19 15h.01M7 19h.01M11 19h.01M15 19h.01M19 19h.01" />
    </svg>
  );
}

function ShieldIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 2 4 5v6c0 5 3.4 9.6 8 11 4.6-1.4 8-6 8-11V5l-8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function BadgeIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="9" r="6" />
      <path d="m9 14-2 7 5-3 5 3-2-7" />
      <path d="m9 9 2 2 4-4" />
    </svg>
  );
}

function TrophyIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M6 4h12v4a6 6 0 0 1-12 0V4Z" />
      <path d="M6 6H4a2 2 0 0 0-2 2v1a3 3 0 0 0 3 3h1M18 6h2a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-1" />
      <path d="M12 14v4M9 22h6M10 18h4v4h-4z" />
    </svg>
  );
}
