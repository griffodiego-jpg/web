/**
 * Helpers de escape para contextos donde interpolamos valores del usuario
 * en strings que después se interpretan (HTML de emails, celdas de CSV).
 */

/**
 * Escapa caracteres especiales de HTML para prevenir inyección cuando
 * concatenamos valores del usuario en templates de email enviados por
 * Resend (`html: ...`). Gmail/Outlook neutralizan <script> pero sí
 * renderizan <a> y <img>, así que un atacante podría meter phishing
 * links o tracking pixels en los mails que recibe contacto@griffo.com.ar.
 */
export function escapeHtml(raw: unknown): string {
  return String(raw ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Igual que `escapeHtml` pero convierte saltos de línea en <br>. Para
 * campos multilínea como "mensaje". Escapa PRIMERO, después convierte
 * los saltos — al revés introduciría tags no deseados.
 */
export function escapeHtmlMultiline(raw: unknown): string {
  return escapeHtml(raw).replace(/\r?\n/g, "<br>");
}

/**
 * Previene CSV/formula injection. Excel y LibreOffice interpretan como
 * fórmula cualquier celda que empiece con `=`, `+`, `-`, `@`, `\t`, `\r`.
 * Si un atacante envía un form con nombre=`=cmd|' /C calc'!A0` y la
 * cliente abre el export en Excel, se ejecuta la fórmula.
 *
 * Fix estándar: prefijar con un single quote — Excel lo esconde visualmente
 * y desactiva la interpretación de fórmula.
 */
export function escapeCsvCell(raw: unknown): string {
  let val = String(raw ?? "");
  if (/^[=+\-@\t\r]/.test(val)) {
    val = "'" + val;
  }
  if (/[",\n\r]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}
