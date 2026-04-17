"use client";

import { useState } from "react";
import { useB2BPreferences } from "@/lib/b2b-preferences";

export function PerfilForm({
  initialEmail,
  clientName,
  clientCode,
}: {
  initialEmail: string;
  clientName: string;
  clientCode: string;
}) {
  return (
    <div className="space-y-6">
      <DatosCuenta
        initialEmail={initialEmail}
        clientName={clientName}
        clientCode={clientCode}
      />
      <CambiarPassword />
      <PreciosYMargen />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Datos de cuenta                                                      */
/* -------------------------------------------------------------------- */

function DatosCuenta({
  initialEmail,
  clientName,
  clientCode,
}: {
  initialEmail: string;
  clientName: string;
  clientCode: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [saved, setSaved] = useState(false);

  return (
    <Section
      title="Datos de cuenta"
      description="Razón social y código de cliente los administra Griffo. El email sirve para acceder al portal y recibir notificaciones."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ReadonlyField label="Razón social" value={clientName} />
        <ReadonlyField label="Código de cliente" value={clientCode} mono />
      </div>
      <form
        className="mt-4 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setSaved(true);
          setTimeout(() => setSaved(false), 2500);
        }}
      >
        <div className="flex-1 min-w-[240px]">
          <label
            htmlFor="email"
            className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition text-sm"
        >
          Guardar
        </button>
      </form>
      {saved && (
        <p className="mt-2 text-xs text-emerald-700 font-semibold">
          ✓ Email actualizado (modo demo — todavía no se envía al servidor).
        </p>
      )}
    </Section>
  );
}

/* -------------------------------------------------------------------- */
/* Cambiar contraseña                                                   */
/* -------------------------------------------------------------------- */

function CambiarPassword() {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [msg, setMsg] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (nueva.length < 8) {
      setMsg({ type: "err", text: "La contraseña nueva tiene que tener al menos 8 caracteres." });
      return;
    }
    if (nueva !== repetir) {
      setMsg({ type: "err", text: "La confirmación no coincide con la contraseña nueva." });
      return;
    }
    setMsg({ type: "ok", text: "✓ Contraseña actualizada (modo demo — todavía no se envía al servidor)." });
    setActual("");
    setNueva("");
    setRepetir("");
  }

  return (
    <Section
      title="Cambiar contraseña"
      description="Elegí una contraseña de al menos 8 caracteres. Se te desloguea de otros dispositivos."
    >
      <form onSubmit={submit} className="space-y-3 max-w-md">
        <TextInput label="Contraseña actual" value={actual} onChange={setActual} type="password" required />
        <TextInput label="Contraseña nueva" value={nueva} onChange={setNueva} type="password" required />
        <TextInput label="Repetir contraseña nueva" value={repetir} onChange={setRepetir} type="password" required />
        <button
          type="submit"
          className="px-5 py-2 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition text-sm"
        >
          Actualizar contraseña
        </button>
        {msg && (
          <p
            className={`text-xs font-semibold ${
              msg.type === "ok" ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {msg.text}
          </p>
        )}
      </form>
    </Section>
  );
}

/* -------------------------------------------------------------------- */
/* Preferencias de precios                                              */
/* -------------------------------------------------------------------- */

function PreciosYMargen() {
  const { prefs, setPriceMode, setMarginPct, ready } = useB2BPreferences();
  const [marginInput, setMarginInput] = useState<string>("");

  // Sincroniza el input con la pref cuando está lista
  const currentMargin = ready ? prefs.marginPct : 30;
  const displayValue = marginInput === "" ? String(currentMargin) : marginInput;

  // Ejemplo para mostrar en vivo cómo se vería un precio
  const ejemploCompra = 10_000;
  const ejemploPvp = ejemploCompra * (1 + currentMargin / 100);

  return (
    <Section
      title="Visualización de precios"
      description="Elegí si en el catálogo querés ver tu precio de compra (el que te factura Griffo) o el precio de venta al público (PVP) calculado con tu margen."
    >
      <div className="space-y-5">
        {/* Toggle de modo */}
        <div>
          <label className="block text-xs font-semibold text-[#0a2b3d] mb-2 uppercase tracking-wider">
            Modo de precio
          </label>
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-50">
            <ToggleButton
              active={prefs.priceMode === "compra"}
              onClick={() => setPriceMode("compra")}
            >
              Precio de compra
            </ToggleButton>
            <ToggleButton
              active={prefs.priceMode === "pvp"}
              onClick={() => setPriceMode("pvp")}
            >
              PVP (con margen)
            </ToggleButton>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {prefs.priceMode === "compra"
              ? "Vas a ver el precio neto al que te facturamos."
              : "Vas a ver el precio final sugerido para tus clientes (compra × margen)."}
          </p>
        </div>

        {/* Margen — solo habilitado en modo PVP */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="margen"
              className={`block text-xs font-semibold mb-1 uppercase tracking-wider ${
                prefs.priceMode === "pvp" ? "text-[#0a2b3d]" : "text-gray-400"
              }`}
            >
              Tu margen de ganancia
            </label>
            <div className="relative">
              <input
                id="margen"
                type="number"
                inputMode="decimal"
                min={0}
                max={1000}
                step={0.5}
                disabled={prefs.priceMode !== "pvp"}
                value={displayValue}
                onChange={(e) => setMarginInput(e.target.value)}
                onBlur={() => {
                  const parsed = parseFloat(marginInput);
                  if (!Number.isNaN(parsed)) {
                    setMarginPct(parsed);
                  }
                  setMarginInput("");
                }}
                className="w-32 px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              />
              <span
                className={`absolute right-3 top-1/2 -translate-y-1/2 font-semibold text-sm ${
                  prefs.priceMode === "pvp" ? "text-gray-500" : "text-gray-300"
                }`}
              >
                %
              </span>
            </div>
          </div>
          <div className="text-xs text-gray-600 pb-3">
            {prefs.priceMode === "pvp" ? (
              <>El margen se aplica sobre el precio de compra.</>
            ) : (
              <>
                Activá el modo <b>PVP</b> para habilitar el margen.
              </>
            )}
          </div>
        </div>

        {/* Ejemplo vivo */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm">
          <p className="text-xs uppercase tracking-wider font-semibold text-blue-900 mb-1">
            Ejemplo
          </p>
          <p className="text-blue-900">
            Si un producto tiene <b>${ejemploCompra.toLocaleString("es-AR")} + IVA</b> de
            precio de compra
            {prefs.priceMode === "pvp" && (
              <>
                {" "}y tu margen es <b>{currentMargin}%</b>
              </>
            )}
            , en modo{" "}
            <b>{prefs.priceMode === "compra" ? "Precio de compra" : "PVP"}</b>{" "}
            vas a verlo como:
          </p>
          <p className="mt-1 text-2xl font-black text-[#0a2b3d]">
            $
            {(prefs.priceMode === "compra" ? ejemploCompra : ejemploPvp).toLocaleString(
              "es-AR",
              { maximumFractionDigits: 2 },
            )}
            <span className="text-sm text-gray-600 font-bold ml-2">+ IVA</span>
          </p>
        </div>

        <p className="text-xs text-gray-500">
          🚧 Los precios reales van a aparecer en el catálogo cuando esté
          activa la integración con el ERP. Este toggle ya queda guardado
          en tu navegador.
        </p>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------------- */
/* Helpers UI                                                           */
/* -------------------------------------------------------------------- */

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-black text-[#0a2b3d]">{title}</h3>
      {description && (
        <p className="text-sm text-gray-600 mt-1 mb-4">{description}</p>
      )}
      {children}
    </section>
  );
}

function ReadonlyField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider">
        {label}
      </p>
      <p
        className={`px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#0a2b3d] mb-1 uppercase tracking-wider">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm"
      />
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${
        active
          ? "bg-primary text-white shadow-sm"
          : "text-gray-600 hover:text-[#0a2b3d]"
      }`}
    >
      {children}
    </button>
  );
}
