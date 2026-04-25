/**
 * Campo oculto antispam. Bots ingenuos llenan TODOS los inputs del DOM —
 * si esto viene con valor en el submit, lo descartamos en el server.
 *
 * Triple oculto:
 *   - `display:none` (no se ve)
 *   - `tabindex=-1` (no se accede con Tab)
 *   - `aria-hidden=true` + `autocomplete=off` (no asistencia)
 *
 * El name "website" es el más targeteado por bots (más que "url" o
 * "email_alt"), lo que mejora la tasa de captura.
 */
export function HoneypotField() {
  return (
    <div
      style={{
        position: "absolute",
        left: "-9999px",
        width: "1px",
        height: "1px",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <label>
        Si ves esto, no completes este campo
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </label>
    </div>
  );
}
