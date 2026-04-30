"use client";

/**
 * Captura errores que rompen el RootLayout (donde error.tsx no alcanza).
 * Renderiza su propio <html><body> porque reemplaza al layout entero.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body
        style={{
          fontFamily:
            "Montserrat, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#fff",
          color: "#0a2b3d",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560 }}>
          <p
            style={{
              fontSize: "5rem",
              fontWeight: 900,
              color: "#00549f",
              margin: 0,
              lineHeight: 1,
            }}
          >
            Ups
          </p>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              textTransform: "uppercase",
              marginTop: "1rem",
            }}
          >
            Error inesperado
          </h1>
          <p style={{ marginTop: "1rem", color: "#374151" }}>
            Estamos teniendo un problema técnico. Probá recargar la página.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              padding: "0.625rem 2rem",
              background: "#00549f",
              color: "#fff",
              border: "none",
              borderRadius: 9999,
              fontWeight: 700,
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
