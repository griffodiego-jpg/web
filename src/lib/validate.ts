/**
 * Validaciones comunes para los forms públicos. Sirven para cortar
 * intentos de floodear Redis con payloads gigantes o de pasar emails
 * que la regex regular no chequea bien.
 */

/** Límite estándar para un campo corto (nombre, empresa, email, teléfono). */
export const MAX_FIELD_LEN = 255;
/** Límite para campos libres de texto (mensaje, descripción). */
export const MAX_MESSAGE_LEN = 5000;

/** Validación de email estándar. Acepta la mayoría de los casos reales. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return email.length <= MAX_FIELD_LEN && EMAIL_RE.test(email);
}

/** Devuelve error string si el campo excede el límite, null si está OK. */
export function checkFieldLength(
  value: string,
  name: string,
  max = MAX_FIELD_LEN
): string | null {
  if (value.length > max) {
    return `${name} es demasiado largo (máx ${max} caracteres)`;
  }
  return null;
}
