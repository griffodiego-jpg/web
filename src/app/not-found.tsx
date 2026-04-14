import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-2xl px-5 py-24 text-center">
      <p className="text-primary text-7xl font-black">404</p>
      <h1 className="mt-4 text-3xl font-bold">Página no encontrada</h1>
      <p className="mt-3 text-gray-600">
        La página que buscás no existe o fue movida.
      </p>
      <Link
        href="/"
        className="inline-block mt-8 px-6 py-2 uppercase bg-black text-white font-bold rounded-full border border-black hover:bg-white hover:text-black transition"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
