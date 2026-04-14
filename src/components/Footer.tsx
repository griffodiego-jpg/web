import Link from "next/link";
import { navigation, siteConfig } from "@/lib/site-config";
import { Newsletter } from "@/components/Newsletter";

export function Footer() {
  // Agrupa el nav en tres columnas como el sitio original.
  const col1 = navigation.filter((i) =>
    ["Empresa", "Novedades", "Catálogo", "Descargas"].includes(i.label)
  );
  const productos = navigation.find((i) => i.label === "Productos destacados");
  const col3 = navigation.filter((i) =>
    ["Distribuidores", "Garantía", "Desarrollo a medida", "Contacto"].includes(
      i.label
    )
  );

  return (
    <>
      <Newsletter />

      <footer className="bg-gray text-white p-10">
        <div className="w-full py-10 flex justify-center items-start gap-10 lg:gap-20 flex-wrap">
          <ul className="space-y-2.5">
            {col1.map((item) => (
              <FooterItem key={item.label} item={item} withChildren />
            ))}
          </ul>

          {productos && (
            <ul className="space-y-2.5">
              <li>
                <Link
                  href={productos.href}
                  className="text-white font-bold hover:underline"
                >
                  {productos.label}
                </Link>
              </li>
              {productos.children?.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    className="text-white font-bold hover:underline"
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <ul className="space-y-2.5">
            {col3.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-white font-bold hover:underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full py-10">
          <div className="flex justify-between items-center gap-5 flex-wrap border-t border-b py-10 border-white">
            <ul className="flex gap-x-10 gap-5 flex-wrap justify-center items-center">
              <li>
                <Link href="/" aria-label="Inicio" className="text-white">
                  <span className="text-3xl font-black tracking-wider">
                    GRIFFO
                  </span>
                </Link>
              </li>
              <li className="text-white flex gap-2 items-start">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0"
                >
                  <path d="M12 11.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5ZM12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Z" />
                </svg>
                <span>
                  {siteConfig.address.street}, {siteConfig.address.postalCode}
                  <br />
                  {siteConfig.address.locality}, Provincia de{" "}
                  {siteConfig.address.region}
                </span>
              </li>
              <li className="text-white flex gap-2 items-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="shrink-0"
                >
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24c1.12.37 2.33.57 3.57.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02l-2.2 2.2Z" />
                </svg>
                <a href={siteConfig.phoneHref} className="hover:underline">
                  {siteConfig.phone}
                </a>
              </li>
            </ul>

            <ul className="flex gap-5 flex-wrap justify-center items-center w-full lg:w-fit">
              <li>
                <a
                  href={siteConfig.socials.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="text-white hover:opacity-80"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 22v-8h3l1-4h-4V7.5c0-1.1.4-2 2.2-2H17V2.1C16.7 2 15.7 2 14.5 2 11.9 2 10 3.6 10 6.7V10H7v4h3v8h3Z" />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="text-white hover:opacity-80"
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.6A3 3 0 0 0 1 7.2C.5 9.1.5 12 .5 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM9.8 15.5v-7l6 3.5-6 3.5Z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-white text-sm text-center">
          &copy;{new Date().getFullYear()} Griffo — Todos los derechos reservados.
        </p>
      </footer>
    </>
  );
}

function FooterItem({
  item,
  withChildren,
}: {
  item: (typeof navigation)[number];
  withChildren?: boolean;
}) {
  return (
    <>
      <li>
        {item.external ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white font-bold hover:underline"
          >
            {item.label}
          </a>
        ) : (
          <Link href={item.href} className="text-white font-bold hover:underline">
            {item.label}
          </Link>
        )}
      </li>
      {withChildren &&
        item.children?.map((child) => (
          <li key={child.href}>
            <Link
              href={child.href}
              className="text-white font-bold hover:underline"
            >
              {child.label}
            </Link>
          </li>
        ))}
    </>
  );
}
