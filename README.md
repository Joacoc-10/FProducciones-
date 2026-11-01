# Fabio Producciones

Sitio web de Fabio Producciones (sonido, luces y escenario portátil para eventos).
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 3 · GSAP + ScrollTrigger · Lenis.

- Plan de rediseño y decisiones: [`docs/REDESIGN_PLAN.md`](docs/REDESIGN_PLAN.md)
- Inventario de imágenes/videos y prompts: [`docs/MEDIA_ASSETS.md`](docs/MEDIA_ASSETS.md)

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run build` / `npm start` | Build y servidor de producción |
| `npm run lint` · `npm run typecheck` | ESLint y TypeScript |
| `npm test` | Pruebas unitarias (Vitest) |
| `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=test npm run build && NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY=test npm run test:e2e` | E2E + accesibilidad (Playwright + axe). Requiere `npx playwright install chromium` la primera vez |

## Reemplazar imágenes y videos

Cada recurso tiene una ruta fija en `public/media/…` (ver `docs/MEDIA_ASSETS.md`).
Guardá el archivo en esa ruta y el próximo build lo usa automáticamente en lugar del
provisorio. Para marcar una pieza como trabajo real: moverla a `public/media/real/…` y
cambiar su `origin` a `"authentic"` en `src/content/`.
