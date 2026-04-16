import { Resend } from "resend";

/**
 * Cliente de Resend inicializado lazily para evitar errores en build.
 * La API key viene de la env var RESEND_API_KEY.
 */
let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) throw new Error("RESEND_API_KEY env var no definida");
    _resend = new Resend(key);
  }
  return _resend;
}
