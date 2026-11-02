# Fabio Producciones — Plan de rediseño

> Documento vivo. Referencia única del rediseño. Se actualiza cuando se toman decisiones o se completan fases.
> Última actualización: 2026-11-01 (implementación completa de fases 0–6; pendiente de revisión) · Rama de trabajo: `redesign/backstage-console` (desde `main` @ `b7348df`).
> Inventario de recursos visuales: [`MEDIA_ASSETS.md`](./MEDIA_ASSETS.md).

## 1. Objetivos y dirección creativa

**Objetivo.** Web premium, cinematográfica, responsive y rápida para una empresa uruguaya de producción técnica de eventos (sonido profesional, iluminación y escenario portátil plegable) que trabaja en bodas, cumpleaños, fiestas, eventos corporativos y espectáculos.

**Dirección:** *Backstage* (A) + *Mixing Console* (B).

- **Concepto central:** *«Tu evento es el show.»* El cliente es la estrella; Fabio Producciones le arma el escenario.
- **Capa consola (peso medio):** el oficio que sostiene el show. Etiquetas `CH 01 · AUDIO`, LEDs, marcas de nivel, fader. Aparece en hero, servicios, escenario, proceso y formulario. Los medidores son decorativos (`aria-hidden`) y **nunca** muestran datos reales ni inventados.
- **Voz:** voseo profesional y directo («Contanos tu evento», «Pedí tu presupuesto»).
- **Un solo look oscuro**, con tratamiento de luz distinto por tipo de evento.

**Reglas de honestidad (no negociables)**

1. No se inventan testimonios, clientes, cifras de experiencia, certificaciones ni características técnicas del equipamiento.
2. Toda imagen/video tiene **origen declarado**: `authentic` | `ai-illustrative` | `stock-illustrative` | `placeholder`.
3. Lo ilustrativo se rotula como tal y **nunca** se presenta como trabajo realizado por Fabio Producciones.
4. Textos técnicos heredados sin respaldo («Line Array», «escenario certificado», «cabezas móviles», DJ, técnicos) fueron eliminados hasta que el cliente los confirme.

## 2. Sistema de diseño

### Color (tokens CSS → Tailwind)

| Token | Valor | Uso |
|---|---|---|
| `--bg` | `#07070A` | Fondo |
| `--surface` | `#0F0F14` | Paneles / tarjetas |
| `--surface-2` | `#16161D` | Paneles elevados |
| `--line` | `rgba(255,255,255,.09)` | Bordes y grilla |
| `--text` | `#F2EFEA` | Texto principal |
| `--muted` | `#A8A39B` | Texto secundario |
| `--brand` | `#C8201B` | CTA / estados activos (texto blanco ≈ 5,7:1) |
| `--brand-hi` | `#E5322D` | Rojo para texto sobre negro (≈ 4,6:1) |
| `--light-*` | ámbar `#E8A857`, magenta `#D6336C`, violeta `#8B5CF6`, azul frío `#5B8DEF`, rojo `#E5322D` | Luz por evento (bodas, cumpleaños y 15, fiestas, corporativos, espectáculos). Solo resplandores y detalles |

El `#B20000` histórico queda solo como detalle decorativo (≈ 2,8:1 sobre negro: no apto para texto).

### Tipografía (`next/font`, pocos pesos)

- **Display:** Barlow Condensed 600/700/800, mayúsculas, estilo afiche.
- **Cuerpo:** Inter (variable).
- **Mono:** JetBrains Mono 400/500, solo etiquetas técnicas.
- Escala fluida con `clamp()`; cuerpo 16–18 px, line-height 1,5–1,65.

### Movimiento (tokens)

`fast 200ms · base 400ms · slow 800ms`; easing `power3.out`; salida más rápida que entrada. Con `prefers-reduced-motion`: estado final directo, sin Lenis, sin pin, póster en lugar de video.

### Layout

Contenedor máx. 1280 px, gutter fluido (16 → 48 px), grilla de 12 columnas, mobile-first. Pruebas a 375 / 768 / 1024 / 1440 px.

## 3. Arquitectura

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind 3.4 · GSAP + ScrollTrigger (+ `@gsap/react`) · Lenis.
Componentes de servidor por defecto; *islas* de cliente solo para lo interactivo.

```
src/
  app/
    layout.tsx, page.tsx            # landing
    eventos/[slug]/page.tsx         # 5 páginas de evento (generateStaticParams)
    sitemap.ts, robots.ts, opengraph-image.tsx, not-found.tsx, error.tsx
  content/                          # datos tipados (única fuente de verdad del contenido)
    site.ts, events.ts, services.ts, process.ts, gallery.ts, media.ts
  lib/
    media.ts                        # resuelve recursos: archivo local si existe → fallback
    whatsapp.ts, quote.ts           # lógica pura y testeada
    gsap.ts, utils.ts
  components/
    layout/   Navbar, MobileMenu, BottomBar, Footer
    sections/ Hero, Manifesto, EventsSection, ServicesConsole, StageScroll, Gallery, Process, QuoteSection
    quote/    QuoteForm (4 pasos)
    console/  ChannelLabel, Led, LevelMeter
    media/    Media, HeroVideo, IllustrativeTag
    motion/   SmoothScroll, MotionRoot
tests/        unit (Vitest) · e2e (Playwright + axe)
docs/         REDESIGN_PLAN.md · MEDIA_ASSETS.md
```

**Resolución de medios (clave para ir reemplazando recursos).** Cada recurso de `content/media.ts` declara la ruta pública donde debe guardarse. `lib/media.ts` comprueba en build si el archivo existe: si existe, se usa con su `origin`; si no, se usa el *fallback* (medio actual o placeholder). **Para sustituir un recurso basta con guardar el archivo en la ruta indicada: no hay que tocar código.**

**Rutas:** `/`, `/eventos/{bodas|cumpleanos-y-15|fiestas-privadas|corporativos|espectaculos}`. Redirección permanente `/events/*` → `/eventos/*`. Se elimina la ruta interceptada del modal.

## 4. Páginas y secciones

**Landing**

1. **Navbar** nueva: fina, transparente sobre el hero y sólida al bajar; oculta al bajar y reaparece al subir; sección activa; CTA «Presupuesto» + WhatsApp. Menú móvil a pantalla completa con foco atrapado y Escape.
2. **Hero** con video de fondo (póster = imagen estática), título de afiche, dos CTA, franja de canales y control de pausa.
3. **Manifiesto**: frase editorial (texto provisorio, a validar).
4. **Eventos**: 5 tarjetas editoriales con luz propia.
5. **Servicios** como consola: canales Audio / Luces / Escenario portátil.
6. **Escenario portátil**: sección destacada con video vinculado al scroll (pin).
7. **Galería** audiovisual editorial (ver §7).
8. **Cómo se arma**: proceso en 4 pasos (provisorio).
9. **Presupuesto**: formulario guiado + WhatsApp + datos de contacto.
10. **Footer** compacto con logo original, contactos reales, copyright y firma JCoding (abajo a la derecha).
11. **Barra inferior móvil** (WhatsApp + Presupuesto).

**Páginas de evento:** hero con la luz del evento, descripción, qué se puede sumar (audio / luces / escenario), galería ilustrativa rotulada, CTA al formulario con el tipo de evento precargado.

## 5. Animaciones y efectos

- **Lenis + GSAP en un único ticker**; Lenis se desactiva con reduced-motion; anclas y foco por teclado preservados.
- **Carga del hero** escalonada (600–900 ms). **Revelados** de 12–24 px (300–500 ms) por lote con ScrollTrigger.
- **Parallax** solo en fondos (5–15 %).
- **Foco de luz** que sigue al puntero en tarjetas (solo `pointer: fine`).
- **Un solo pin:** escenario portátil.
- **Transición entre páginas:** fundido de entrada por `template`.
- **Microinteracciones:** LEDs/niveles en hover y foco, fader en servicios, estados claros en botones y campos.
- Fuera de alcance: cursor personalizado, WebGL, Three.js / React Three Fiber.

### Escenario portátil (video cinematográfico + scroll)

- La plataforma portátil plegable pasa de **desplegada y vacía** a **equipada e iluminada**.
- Un video optimizado (`stage-build.mp4`) se *scrubbea* con `currentTime` según el progreso de ScrollTrigger (sección fijada ~300 % de viewport).
- Requisitos del video: codificado con keyframes muy frecuentes (ver `MEDIA_ASSETS.md`), sin audio, 16:9, versión móvil.
- **Mientras no exista el video:** el componente muestra el póster (si existe) o un fondo de luz y una **esquemática SVG genérica** animada con el mismo progreso (plataforma → estructura → sonido → luz → show), sin medidas ni capacidades.
- **Fallbacks accesibles:** `prefers-reduced-motion`, `saveData` o conexión 2g/3g → no se carga el video; se muestra póster/estado final y una lista textual de los 5 estados (`Plataforma desplegada`, `Estructura`, `Sonido`, `Iluminación`, `Show`). El texto de cada estado se anuncia mediante región `aria-live` educada solo cuando hay animación.

## 6. Estrategia de imágenes y videos con IA

- Los recursos los genera el equipo; **no se generan automáticamente**. Cada recurso nuevo se documenta en `MEDIA_ASSETS.md` con id, sección, prompt en inglés, ruta exacta, formato, dimensiones, ratio, composición/espacio de texto, referencia necesaria y prioridad.
- Estilo común (prefijo de prompts): cinematográfico, oscuro, haze volumétrico, negros profundos, acento carmesí, anamórfico 35 mm, grano sutil, sin texto/logos/marcas/rostros reconocibles.
- Las imágenes IA se rotulan **«Ilustrativa»** (tarjetas y páginas de evento, escenario, galería) con avisos contextuales en cada sección. El footer **ya no** lleva un aviso general (decisión del 2026-11-01): los rótulos contextuales son la única señal, por eso no deben quitarse.
- **Nunca** se presentan como trabajos realizados. Las imágenes de la sección Galería son material conceptual identificado hasta que haya fotografías auténticas.
- Referencias del escenario real: dos capturas (plataforma desplegada; escenario con estructura de luces y sonido). **Pendiente de recibir** — guardarlas en `docs/reference/` para alimentar los prompts.

## 7. Galería audiovisual

- Composición editorial asimétrica (pieza destacada grande + mosaico), video destacado con reproducción solo en pantalla, transición de apertura y visor accesible (`<dialog>` modal: foco atrapado, Escape, navegación con flechas).
- **Visible siempre.** Mientras no haya material propio, usa contenido conceptual con la etiqueta «Ilustrativa» en cada pieza y un aviso explícito de que **no son trabajos realizados**. El campo `origin` de cada pieza gobierna la etiqueta; una prueba automática falla si una pieza no auténtica se presenta sin etiqueta o con texto de «trabajo realizado».
- Filtros iniciales: Todo / Fotos / Videos. Al llegar material auténtico se agrega filtro por tipo de evento.
- No se usan los videos 4K heredados (12–21 MB) en mosaico.

## 8. Formulario de presupuestos y WhatsApp

**4 pasos**, etiquetas visibles, validación inline, `autocomplete`, errores junto al campo, objetivos táctiles ≥ 44 px, foco al encabezado del paso:

1. **Evento:** tipo, fecha, lugar.
2. **Qué necesitás:** Audio, Luces, Escenario portátil, «No sé, asesorame»; invitados aproximados (rangos).
3. **Contacto:** nombre, WhatsApp/teléfono, email (opcional), comentario.
4. **Resumen y envío.**

- **Envío:** Web3Forms (integración existente, clave pública `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY`), con honeypot. Se elimina el campo `to` hardcodeado: el destinatario lo define la cuenta/clave de Web3Forms (**pendiente: confirmar email de destino del cliente**).
- **Éxito:** pantalla con botón «Seguir por WhatsApp» (mensaje prearmado con el resumen).
- **Error:** mensaje accesible, reintento y alternativa directa por WhatsApp.
- **WhatsApp siempre a mano:** barra inferior en móvil; botón en la navbar en escritorio. Número principal: primero de `content/site.ts` (**pendiente de confirmar**).

## 9. SEO, accesibilidad y rendimiento

**SEO.** `lang="es-UY"`, `metadataBase` correcto, título/descripción limpios, OG/Twitter, `generateMetadata` por evento, sitemap, robots, canonical, redirecciones de rutas antiguas, JSON-LD `LocalBusiness` **solo con datos confirmados** (nombre, url, teléfono, email, Instagram). Sin dirección ni zona de cobertura hasta que el cliente las confirme. Un solo `<h1>` por página.

**Accesibilidad (WCAG 2.2 AA como meta).** Contraste ≥ 4,5:1, foco visible, enlace «saltar al contenido», navegación completa por teclado, diálogos con foco atrapado y Escape, `prefers-reduced-motion`, video con pausa visible, `alt` real en todas las imágenes, decoración con `aria-hidden`, objetivos ≥ 44 px, `lang` correcto.

**Rendimiento (metas).** LCP < 2,5 s, CLS < 0,1, INP < 200 ms en móvil; hero de escritorio ≤ 3 MB y móvil ≤ 1,5 MB; sin 4K; `next/image`, carga diferida y `sizes`; 3 familias tipográficas con pocos pesos; GSAP con solo los plugins necesarios; videos pausados fuera de pantalla; video del hero y del escenario **no se cargan** con `saveData`/reduced-motion.

## 10. Roadmap por fases

| Fase | Alcance | Estado |
|---|---|---|
| **0 Cimientos** | Rama desde `main`, deps (lenis, @gsap/react, vitest, playwright, axe), limpieza de deps sin uso, `lang`, `metadataBase`, plan y medios documentados | ✅ |
| **1 Sistema + Hero** | Tokens, tipografías, Lenis+GSAP, navbar, hero con video, barra inferior, footer | ✅ |
| **2 Eventos y Servicios** | Manifiesto, 5 tarjetas, 5 páginas, consola de servicios, redirecciones | ✅ |
| **3 Escenario** | Sección con video + scroll, esquemática SVG, fallbacks | ✅ (esquemática; el video definitivo se activa al guardar el archivo) |
| **4 Galería** | Composición editorial, visor, etiquetado | ✅ |
| **5 Conversión** | Formulario 4 pasos, WhatsApp, proceso, contacto | ✅ |
| **6 Cierre** | SEO técnico, OG, JSON-LD, pruebas, auditoría a11y/rendimiento, documentación | ✅ (pendiente: revisión visual del cliente y materiales reales) |

(Detalle de cada fase en §13.)

## 11. Criterios de aceptación

- Build, lint y typecheck limpios; pruebas unitarias y E2E en verde.
- Todas las secciones y páginas previstas existen y son visibles (ninguna oculta por falta de imágenes).
- Ninguna imagen no auténtica se presenta como trabajo realizado; toda pieza ilustrativa está rotulada.
- Navegación completa por teclado; axe sin violaciones críticas/serias en `/` y en una página de evento.
- Reduced-motion: sin Lenis, sin pin, sin autoplay; contenido íntegro y legible.
- Móvil (375 px): sin scroll horizontal, barra inferior operativa, menú accesible.
- Formulario: validación por paso, resumen correcto, envío de prueba y mensaje de WhatsApp correcto.
- Reemplazar un recurso en la ruta documentada lo hace aparecer sin tocar código.
- Lighthouse móvil ≥ 90 (Performance, Accessibility, SEO) en la medición final (se informa el valor real, no el objetivo).

## 12. Decisiones pendientes y riesgos

**Pendientes (cliente)**

- Email de destino de los pedidos y número de WhatsApp principal.
- Logo vectorial (SVG) del **mismo** logo original. El PNG original ya está restaurado; sobre fondo oscuro se usa una variante derivada que solo cambia el negro por blanco cálido (ver `MEDIA_ASSETS.md`).
- Dominio definitivo (hoy `fabioproducciones.vercel.app`; configurable con `NEXT_PUBLIC_SITE_URL`).
- **Confirmar si 5 de las fotos actuales (IMG_7176 y las 4 con nombre UUID) son del cliente:** parecen tomas reales de eventos (consolas, escenarios), pero sin confirmación se tratan como ilustrativas. También tienen personas reconocibles: hace falta permiso de publicación.
- Confirmar servicios adicionales (DJ, técnicos) y equipamiento mencionable; zona de cobertura.
- Textos: manifiesto y «Cómo se arma» son provisorios.
- Capturas de referencia del escenario real (`docs/reference/`).
- Procedencia del material actual (probable stock) y fotos/videos propios.

**Pendientes (internos)**

- Microrótulo «Ilustrativa» en tarjetas y páginas de evento, escenario y galería (implementado). **El hero no lleva rótulo y, al quitar el aviso del footer, su video provisorio (stock) queda sin señal de que es conceptual**: decidir si se agrega un rótulo discreto o se reemplaza pronto por material propio.
- Umbral de piezas auténticas para reorganizar la galería.

**Riesgos**

- Lenis + pin + video scrubbing en móviles de gama media → plan B: scroll nativo y póster (flag único en `SmoothScroll`/`StageScroll`).
- El scrub de video exige keyframes densos; con un video mal codificado se ve entrecortado.
- Consistencia visual entre recursos IA.
- `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` es pública por diseño: restringirla por dominio en Web3Forms.
- `next build` descarga Google Fonts: un fallo de red transitorio rompe el build (visto una vez, resuelto al reintentar). Plan B: autoalojar con `next/font/local`.
- Una animación CSS con `transform` y `fill-mode: forwards` en un ancestro convierte al ancestro en bloque contenedor de los `position: fixed` y rompe el pin de GSAP (ocurrió con la transición de página; resuelto con opacidad sola y sin fill). No reintroducir.
- Videos e imágenes siguen en ImageKit (dependencia externa).

## 13. Registro de progreso

- **2026-11-01 · Fase 0:** rama `redesign/backstage-console` creada desde `main` (`b7348df`), árbol limpio. Dependencias nuevas: `lenis`, `@gsap/react`, `vitest`, `@playwright/test`, `@axe-core/playwright`; `@types/node` → 22 (requerido por Vitest). Retiradas: `react-social-icons`, `lucide-react`, `@hcaptcha/react-hcaptcha`, `react-google-recaptcha`, `ogl`, `react-icons`.
- **2026-11-01 · Fases 1–6 (implementación):**
  - Sistema de diseño (tokens CSS → Tailwind, Barlow Condensed + Inter + JetBrains Mono), navbar nueva (oculta al bajar, sección activa, menú móvil a pantalla completa con foco atrapado), barra inferior móvil, footer.
  - Hero con video de fondo: póster siempre debajo (LCP), video solo si no hay reduced-motion ni ahorro de datos / 2g-3g, variante móvil, pausa fuera de pantalla y botón de pausa. Usa temporalmente el video actual (1,8 MB, stock) hasta que exista `public/media/video/hero-loop.mp4`.
  - Manifiesto, 5 tarjetas de evento con luz propia, 5 páginas `/eventos/[slug]` (metadata propia), consola de servicios, escenario con pin + scrub de video (esquemática SVG animada mientras no hay video), galería editorial con visor `<dialog>`, proceso, formulario de 4 pasos con WhatsApp.
  - SEO: `lang="es-UY"`, canonical y OG con dominio real, sitemap, robots, imagen OG generada, JSON-LD `LocalBusiness` con datos confirmados, redirecciones `/events/*` → `/eventos/*`.
  - Retirado el código anterior (CardNav, modal interceptado, FlipCard, SplashCursor, LightRays, 3D pin, etc.) y las dependencias `motion`, `tailwindcss-animate`, `class-variance-authority`.
  - **Verificación:** `tsc` y `eslint` limpios; Vitest 14/14; Playwright 44 ok / 4 omitidos a propósito (aplican solo a escritorio o a móvil) en proyectos desktop (1440×900) y móvil (Pixel 7), incluido axe (WCAG 2.2 AA) sin violaciones serias/críticas en `/` y `/eventos/bodas`; Lighthouse móvil (build local, simulación estándar): Performance 100, Accesibilidad 100, Buenas prácticas 100, SEO 100, LCP 0,9 s, CLS 0, TBT 10 ms.
  - **Decisión de rendimiento:** el contenido del hero no usa animación de entrada (ni con opacidad ni con transform): cualquier animación sobre el elemento LCP retrasaba el LCP medido (1,1–1,4 s → 3,8 s simulado). La entrada del hero la da el fundido del video.
- **2026-11-01 · Corrección de identidad:** el isotipo + texto tipográfico del rediseño **no estaba aprobado** y se eliminó. Se restauró el logo original (el de `main`, ImageKit `PHOTO-2025-10-22-20-53-38-Photoroom.png`) en navbar, footer, imagen OG y JSON-LD, con variante para fondo oscuro que conserva forma y proporciones. La identidad visual se rige por `docs/MEDIA_ASSETS.md § Logo`.
- **2026-11-01 · Favicon, footer y firma:**
  - **Favicon** nuevo a partir del isotipo original «FP» (P + F aislados del PNG original por componentes conexas, geometría intacta; el negro de la P pasa a blanco cálido sobre mosaico `#07070A` para leerse en pestañas claras y oscuras; el rojo no cambia). Archivos: `src/app/favicon.ico` (16/32/48), `icon.png` (256), `apple-icon.png` (180), `public/icons/icon-192|512.png` y `manifest.ts`. Se regenera con `node scripts/make-favicons.mjs`.
  - **Footer** más compacto (≈ 450 → 332 px en escritorio): menos padding, enlaces de la columna Mapa más juntos, columnas más cercanas y distribución propia para tablet y móvil. Se mantiene el logo original, los enlaces, contactos y copyright. Se quitó el aviso general de imágenes ilustrativas.
  - **Firma JCoding** (`components/ui/JCodingSignature`), reutilizada del proyecto florencia-biaturi: misma geometría SVG, CSS, props (`variant`, `theme`, `language`, `animated`) y comportamiento (aro a 30° en 350 ms, `</>` fijo, reduced-motion). En el footer: `variant="signature" theme="dark" language="es"`. Único ajuste: el color del texto sube de 0,4 a 0,62 de opacidad dentro del footer para cumplir contraste 4,5:1 sobre `--surface`.
