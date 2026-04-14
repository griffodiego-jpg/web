# Griffo — Web

Réplica y rediseño del sitio institucional de Griffo
(empresa argentina de piezas de caucho para la industria automotriz).

Stack: **Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4**.

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Scripts

- `pnpm dev` — servidor de desarrollo
- `pnpm build` — build de producción
- `pnpm start` — servidor de producción
- `pnpm lint` — linter (si está configurado)

## Estructura

```
src/
├── app/                 Rutas (App Router)
│   ├── layout.tsx       Layout raíz (Header + Footer + flotantes)
│   ├── page.tsx         Home
│   └── api/             Endpoints de backend (newsletter, etc.)
├── components/          Componentes compartidos
└── lib/
    └── site-config.ts   Datos del sitio (menú, contacto, redes)
```

## Pendiente

Ver `AGENTS.md` para el roadmap de páginas y features a implementar.
