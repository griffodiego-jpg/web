import type { Metadata } from "next";

/**
 * Layout "raíz" de /admin — deliberadamente mínimo. El chrome con
 * sidebar y la verificación de sesión viven en (protected)/layout.tsx
 * para que el login (que no requiere sesión) no las herede.
 */
export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | Admin Griffo" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
