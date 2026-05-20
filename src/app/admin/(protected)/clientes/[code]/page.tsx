import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientPasswordForm } from "@/components/admin/ClientPasswordForm";
import { ImpersonateButton } from "@/components/admin/ImpersonateButton";
import { loadClientByCode } from "@/lib/b2b/client-loader";
import {
  getDefaultPassword,
  hasCustomPassword,
} from "@/lib/b2b/credentials";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return { title: `Cliente ${code}` };
}

export default async function ClienteDetallePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const client = await loadClientByCode(code);
  if (!client) notFound();

  const defaultPassword = getDefaultPassword(client);
  const hasCustom = await hasCustomPassword(code).catch(() => false);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/clientes"
          className="text-xs font-semibold text-primary hover:underline"
        >
          ← Volver al listado
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
              Cliente B2B
            </p>
            <h1 className="text-2xl font-black text-[#0a2b3d] mt-0.5">
              {client.name || "(sin razón social)"}
            </h1>
            <p className="text-sm text-gray-600 mt-0.5">
              Código <code className="font-mono">{client.client_id}</code>
              {client.cuit ? (
                <>
                  {" "}
                  · CUIT <code className="font-mono">{client.cuit}</code>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ImpersonateButton code={client.client_id} label="Loguear como este cliente" />
            <a
              href={`/admin/clientes/${encodeURIComponent(client.client_id)}/debug-cuenta`}
              className="text-xs font-semibold text-gray-500 hover:text-primary hover:underline"
            >
              🔍 Debug cuenta corriente
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="rounded-xl bg-white shadow-sm p-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#0a2b3d] mb-4">
            Datos del cliente
          </h2>
          <dl className="space-y-3 text-sm">
            <Field label="Razón social" value={client.name} />
            <Field label="Código de cliente" value={client.client_id} mono />
            <Field
              label="CUIT"
              value={client.cuit}
              mono
              hint={!client.cuit ? "No lo expone el ERP actual" : undefined}
            />
            <Field label="Email" value={client.email} />
            <Field label="Teléfono" value={client.phone} />
            <Field label="Dirección" value={client.address} />
            <Field
              label="Lista de precios"
              value={client.priceListCode}
              mono
              hint="Asignada en el ERP · de solo lectura"
            />

          <div className="mt-5 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
              Depósitos ({client.warehouses?.length ?? 0})
            </p>
            {client.warehouses && client.warehouses.length > 0 ? (
              <ul className="space-y-1">
                {client.warehouses.map((w) => (
                  <li
                    key={w.warehouse_id}
                    className="text-sm text-gray-700 flex items-center gap-2"
                  >
                    <code className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                      {w.warehouse_id}
                    </code>
                    <span>{w.description}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Sin depósitos asignados.</p>
            )}
          </div>
        </section>

        <section className="rounded-xl bg-white shadow-sm p-5">
          <h2 className="text-sm font-black uppercase tracking-wide text-[#0a2b3d] mb-1">
            Acceso al portal B2B
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Email de login: <code className="font-mono">{client.email}</code>{" "}
            (viene del ERP, no editable acá).
          </p>
          <ClientPasswordForm
            code={client.client_id}
            defaultPassword={defaultPassword}
            initialHasCustom={hasCustom}
          />
        </section>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  mono,
  hint,
}: {
  label: string;
  value?: string | null;
  mono?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 min-w-[10rem]">
        {label}
      </dt>
      <dd
        className={`text-sm text-[#0a2b3d] text-right ${
          mono ? "font-mono" : ""
        }`}
      >
        {value ? (
          value
        ) : (
          <span className="text-gray-400 italic font-sans">
            —{hint ? ` ${hint}` : ""}
          </span>
        )}
      </dd>
    </div>
  );
}
