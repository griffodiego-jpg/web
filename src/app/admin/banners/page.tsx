export default function AdminBannersPage() {
  return (
    <div>
      <h1 className="text-2xl font-black text-[#0a2b3d] mb-2">Banners</h1>
      <p className="text-sm text-gray-500 mb-6">
        Gestioná los banners del carrusel del home.
      </p>

      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-gray-400"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </div>
        <h2 className="font-bold text-lg text-[#0a2b3d]">
          Gestión de banners — próximamente
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Cuando se conecte Vercel Blob para almacenamiento de archivos,
          vas a poder subir, reordenar y eliminar banners desde acá.
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Requisito: activar Vercel Blob en el dashboard del proyecto.
        </p>
      </div>
    </div>
  );
}
