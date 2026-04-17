import type { Metadata } from "next";
import { LeadsTabs } from "@/components/admin/LeadsTabs";
import { getRedis } from "@/lib/kv";
import {
  countLeads,
  listLeads,
  type ContactoLead,
  type DescargaLead,
  type GarantiaLead,
  type NewsletterLead,
} from "@/lib/leads";

export const metadata: Metadata = {
  title: "Formularios",
};

// Dynamic: los leads cambian en cada submit del público.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function LeadsPage() {
  const redisAvailable = getRedis() !== null;

  const [
    descarga,
    contacto,
    newsletter,
    garantia,
    cntD,
    cntC,
    cntN,
    cntG,
  ] = await Promise.all([
    listLeads<DescargaLead>("descarga"),
    listLeads<ContactoLead>("contacto"),
    listLeads<NewsletterLead>("newsletter"),
    listLeads<GarantiaLead>("garantia"),
    countLeads("descarga"),
    countLeads("contacto"),
    countLeads("newsletter"),
    countLeads("garantia"),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-black text-[#0a2b3d]">Formularios</h1>
      <p className="mt-2 text-sm text-gray-500">
        Leads capturados por los formularios del sitio. Los datos persisten en
        Upstash Redis y también se envían por email a contacto@griffo.com.ar.
      </p>

      {!redisAvailable && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-bold">Persistencia no configurada</p>
          <p className="mt-1">
            No se encontraron las env vars{" "}
            <code className="bg-amber-100 px-1 rounded">KV_REST_API_URL</code> /{" "}
            <code className="bg-amber-100 px-1 rounded">KV_REST_API_TOKEN</code>
            . Conectá Upstash Redis al proyecto en Vercel → Storage para
            empezar a guardar los formularios acá.
          </p>
        </div>
      )}

      <div className="mt-8">
        <LeadsTabs
          initialTab="descarga"
          leads={{ descarga, contacto, newsletter, garantia }}
          counts={{
            descarga: cntD,
            contacto: cntC,
            newsletter: cntN,
            garantia: cntG,
          }}
        />
      </div>
    </div>
  );
}
