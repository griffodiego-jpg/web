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

/**
 * Wrapper que llama a Resend y convierte los errores devueltos como
 * objeto en excepciones. El SDK NO throwea — devuelve {data, error}
 * por convención. Sin esto los caller que sólo miran try/catch nunca
 * se enteran de que el envío falló.
 */
type SendPayload = Parameters<Resend["emails"]["send"]>[0];

export async function sendEmail(payload: SendPayload) {
  const result = await getResend().emails.send(payload);
  if (result.error) {
    const err = new Error(
      `Resend: ${result.error.name ?? "error"} — ${result.error.message ?? "sin mensaje"}`,
    );
    (err as Error & { resendError?: unknown }).resendError = result.error;
    throw err;
  }
  return result.data;
}
