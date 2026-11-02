# SEO de Fabio Producciones

## Estado de la configuración
- Dominio: `https://fabioproducciones.vercel.app` (confirmado por ahora), centralizado en `src/content/site.ts`; se cambia con `NEXT_PUBLIC_SITE_URL` si el cliente compra otro. Define canonical, sitemap, Open Graph y JSON-LD.
- Indexación: solo con `VERCEL_ENV=production` (o fuera de Vercel). Previews y `SITE_NOINDEX=1` emiten `noindex` y `robots.txt` bloquea todo.
- Metadatos por página: `pageMetadata()` en `src/lib/seo.ts` (canonical, Open Graph, Twitter). Textos en `src/content/events.ts`.
- JSON-LD: `Organization` + `WebSite` en la portada; `Service` + `BreadcrumbList` en eventos; `BreadcrumbList` en la galería. Todos referencian `${url}/#organization`.
- `Organization` y no `LocalBusiness`: Google exige `address` para LocalBusiness y no hay dirección confirmada.
- Orientación geográfica (Maldonado y Canelones): solo en algunos `title`/`description` (metadatos). Nunca en textos visibles, y `areaServed` declara solo Uruguay: una prioridad comercial no confirma cobertura. Sin páginas por ciudad.
- 404: `src/app/not-found.tsx` en el layout raíz mínimo; el sitio vive en `src/app/(site)/` con su propio layout (navbar, footer, escenario).

## Pendiente de datos del propietario
Ver la lista de preguntas en la entrega; al confirmarlas, completar `site.ts` (cobertura, dominio).
