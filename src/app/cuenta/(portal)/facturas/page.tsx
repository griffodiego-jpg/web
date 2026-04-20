import { redirect } from "next/navigation";

/**
 * `/cuenta/facturas` se unificó con la cuenta corriente. Mantenemos el
 * archivo con un redirect para no romper bookmarks.
 */
export default function FacturasLegacyRedirect() {
  redirect("/cuenta/cuenta-corriente?filtro=FC");
}
