# Fabio Producciones — Inventario de recursos visuales

> Referencia viva. Plan general: [`REDESIGN_PLAN.md`](./REDESIGN_PLAN.md).
> Los recursos **no se generan automáticamente**: se generan a mano y se guardan en la ruta exacta indicada.
> **Para sustituir un recurso basta con guardar el archivo en su ruta**: el build lo detecta (`src/lib/media.ts`) y reemplaza al fallback sin tocar código.

## Cómo se usan

- **Origen (`origin`)**: `ai-illustrative` (IA, rotulado «Ilustrativa»), `stock-illustrative`, `placeholder`, `authentic` (material real de Fabio Producciones, sin rótulo).
- Todo lo `ai-illustrative` se declara así en `src/content/media.ts`. Al guardar el archivo, se publica con su rótulo.
- Cuando llegue material real, se guarda en `public/media/real/...` y se cambia el `origin` a `authentic` de esa entrada.
- **Prioridad:** P0 = bloquea el impacto visual principal · P1 = importante · P2 = mejora.

## Prefijo de estilo común (anteponer a todos los prompts de imagen)

```
cinematic, dark moody atmosphere, volumetric haze, deep crushed blacks (#07070A), crimson-red accent lighting, 35mm anamorphic lens, shallow depth of field, subtle film grain, photorealistic, premium, no text, no logos, no brand names, no readable signage, no recognizable faces, no watermark
```

Luz por evento (sustituir el acento carmesí): bodas = warm amber `#E8A857`; cumpleaños y 15 = magenta `#D6336C`; fiestas privadas = violet `#8B5CF6`; corporativos = cool blue `#5B8DEF`; espectáculos = crimson/white strobe.

## Estado actual de los recursos

| ID | Sección | Ruta (en `public/`) | Estado |
|---|---|---|---|
| `hero.poster` | Hero (póster/fallback) | `media/ai/hero/hero-stage-wide.jpg` | ⏳ pendiente — se usa degradado de luz |
| `hero.video` | Hero (video principal) | `media/video/hero-loop.mp4` (+ `hero-loop-mobile.mp4`) | ⏳ pendiente — se usa el video actual de ImageKit (stock, 1080p 1,8 MB) |
| `stage.poster` | Escenario | `media/ai/stage/stage-poster.jpg` | ⏳ pendiente |
| `stage.final` | Escenario (estado final / reduced-motion) | `media/ai/stage/stage-final.jpg` | ⏳ pendiente |
| `stage.video` | Escenario (scroll) | `media/video/stage-build.mp4` (+ `stage-build-mobile.mp4`) | ⏳ pendiente — se usa esquemática SVG |
| `event.bodas` … `event.espectaculos` (5) | Tarjetas y páginas de evento | `media/ai/events/{slug}-card.jpg` | ⏳ pendiente — se usan fotos actuales (stock) rotuladas |
| `service.audio` / `.luces` / `.escenario` | Servicios | `media/ai/services/{audio,luces,escenario}.jpg` | ⏳ opcional — sin imagen, la tarjeta funciona sin fondo |
| `gallery.concept-01` … `06` | Galería (conceptual) | `media/ai/gallery/concept-0N.jpg` | ⏳ pendiente — se usan fotos actuales rotuladas «Ilustrativa» |
| `gallery.video-01` / `video-02` | Galería (videos) | `media/video/gallery-01.mp4`, `gallery-02.mp4` | ⏳ opcional — se usan videos actuales (1,2 MB y 0,9 MB) rotulados |
| `brand.logo-light` | Navbar / footer / OG | `brand/logo-light.svg` | ⏳ cliente — se usa wordmark tipográfico |
| Referencias del escenario | Prompts del escenario | `docs/reference/` | ⏳ cliente — dos capturas |

Fallbacks en uso (provenientes de ImageKit, procedencia **no confirmada**, probable stock):
`4043976-hd_1920_1080_24fps.mp4` (hero, 1,8 MB) · `12893899-hd_1920_1080_24fps.mp4` (1,2 MB) · `120954-724685298_small.mp4` (0,9 MB) · fotos `IMG_7176.JPG`, `f55de1c5…`, `aa4ab966…`, `1fb3af46…`, `7cb71912…`, `pexels-wsilvasjb-16085578.jpg`, `pexels-goumbik-1309597.jpg`, `pexels-frentescuphotography-7360983.jpg`.
> **Nota de procedencia:** al revisar las fotos, `IMG_7176.JPG` y las cuatro con nombre UUID (`f55de1c5…`, `aa4ab966…`, `1fb3af46…`, `7cb71912…`) parecen tomas reales de eventos (celular, consolas y escenarios), mientras que las `pexels-*` son de stock. **No se pueden publicar como «trabajos realizados» sin confirmación del cliente**; mientras tanto se muestran como ilustrativas. Si el cliente las confirma, pasarlas a `public/media/real/` y marcarlas `authentic`. Tienen personas reconocibles: pedir permiso de publicación.

Los dos videos 4K (`2941128-uhd_4096_2160_24fps.mp4` 12,8 MB y `12972958_3840_2160_30fps.mp4` 21,2 MB) **ya no se usan** (peso).

---

## P0 — Hero

### `hero.poster` — Hero · póster y fallback · **P0**

- **Ruta / archivo:** `public/media/ai/hero/hero-stage-wide.jpg`
- **Formato / tamaño:** JPG calidad 90, mínimo 2560×1440 (ideal 3840×2160). **Relación:** 16:9.
- **Composición:** tercio izquierdo oscuro y despejado para el título; haces principales en el 50 % central (el recorte vertical móvil usa `object-position: 55% 50%`); sin personas en primer plano.
- **Referencia necesaria:** no.
- **Prompt:**

```
Ultra-wide cinematic photograph of an empty professional concert stage seen from the back of a dark venue. A symmetrical lighting truss hangs overhead with dozens of moving-head fixtures projecting sharp crimson-red and warm white beams that cross through dense volumetric haze. Silhouettes of two tall speaker stacks frame the left and right edges. The glossy black stage floor catches red light streaks. Deep crushed blacks, soft atmospheric glow in the center, a clear dark negative space across the left third of the frame for headline text. Shot on a 35mm anamorphic lens, shallow depth of field, subtle film grain, high dynamic range, photorealistic, moody and premium. No people, no text, no logos, no brand names, no signage, no watermark.
```

### `hero.video` — Hero · video de fondo · **P0 (puede esperar; hay fallback)**

- **Ruta / archivo:** `public/media/video/hero-loop.mp4` (escritorio) y `public/media/video/hero-loop-mobile.mp4` (móvil).
- **Formato:** H.264 MP4, **sin audio**, 8–12 s, loop sin corte visible. Escritorio 1920×1080 ≤ 3 MB; móvil 1280×720 ≤ 1,5 MB. Relación 16:9.
- **Cómo generarlo:** image-to-video a partir de `hero-stage-wide.jpg` (consistencia con el póster).
- **Prompt (image-to-video):**

```
Slow cinematic push-in toward an empty concert stage. Crimson-red and warm white light beams from the overhead truss sweep slowly through thick volumetric haze, gentle drifting smoke, subtle lens flare. Camera moves very slowly forward, perfectly stable, no cuts. Seamless loop, dark moody atmosphere, 35mm anamorphic look. No people, no text, no logos.
```

- **Compresión sugerida:**

```bash
ffmpeg -i in.mp4 -an -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 26 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart hero-loop.mp4
ffmpeg -i in.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 29 -preset slow -pix_fmt yuv420p -movflags +faststart hero-loop-mobile.mp4
```

---

## P0 — Escenario portátil (sección destacada)

El escenario real es una **plataforma portátil plegable**. Necesito **las dos capturas de referencia** (plataforma desplegada; escenario con estructura de luces y sonido) en `docs/reference/` para ajustar los prompts a la forma real.

### `stage.poster` — Estado inicial: plataforma desplegada y vacía · **P0**

- **Ruta:** `public/media/ai/stage/stage-poster.jpg` · JPG 2400×1350 · 16:9.
- **Composición:** cámara **fija** (trípode), plano frontal-ligeramente elevado; plataforma centrada ocupando ~60 % del ancho; espacio libre arriba.
- **Referencia necesaria:** **sí** (captura de la plataforma desplegada).
- **Prompt:**

```
Fixed wide shot of a portable folding stage platform fully unfolded and empty, set up in a dark event hall. Clean dark deck with visible modular panels, simple skirting, completely bare: no lighting rig, no speakers, no truss. Single soft overhead work light, dark room, subtle haze. Locked-off camera, straight frontal view slightly above eye level, platform centered. Photorealistic, cinematic, 35mm, no people, no text, no logos.
```

### `stage.final` — Estado final: equipado e iluminado · **P0**

- **Ruta:** `public/media/ai/stage/stage-final.jpg` · JPG 2400×1350 · 16:9. **Misma cámara, encuadre y plataforma que `stage.poster`.**
- **Referencia necesaria:** **sí** (captura del escenario con estructura de luces y sonido).
- **Prompt:**

```
Same fixed camera and same portable stage platform as the previous frame, now fully equipped and lit: lighting truss overhead with stage lights projecting crimson-red and warm white beams through haze, speaker stacks on both sides, glossy deck reflecting the light. Dramatic show atmosphere, deep blacks. Locked-off camera, identical framing and perspective. Photorealistic, cinematic, 35mm, no people, no text, no logos.
```

> Truco de consistencia: generar primero `stage.final` y derivar `stage.poster` editando esa imagen (quitar luces, truss y parlantes) con la misma semilla.

### `stage.video` — Video del escenario (scroll) · **P1 (hay esquemática SVG mientras tanto)**

- **Ruta:** `public/media/video/stage-build.mp4` (escritorio) y `public/media/video/stage-build-mobile.mp4`.
- **Contenido:** de plataforma desplegada y vacía → estructura → sonido → luces → show completo, cámara fija, 8–12 s, sin audio, 16:9.
- **Cómo generarlo:** image-to-video / frame interpolation entre `stage.poster` y `stage.final` (inicio y fin), con 2 o 3 keyframes intermedios.
- **Codificación obligatoria para scrub (keyframes en cada cuadro):**

```bash
ffmpeg -i in.mp4 -an -vf "scale=1920:-2,fps=24" -c:v libx264 -crf 24 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart stage-build.mp4
ffmpeg -i in.mp4 -an -vf "scale=1280:-2,fps=24" -c:v libx264 -crf 28 -g 1 -keyint_min 1 -pix_fmt yuv420p -movflags +faststart stage-build-mobile.mp4
```

  Presupuesto: ≤ 8 MB escritorio, ≤ 4 MB móvil (si pesa más, bajar fps a 20 o duración).
- **Prompt (video):**

```
Locked-off camera on a portable folding stage in a dark hall. Timelapse-style build: the unfolded empty platform gradually receives a lighting truss rising overhead, speaker stacks appearing at both sides, then stage lights switching on one by one with crimson-red and warm white beams cutting through haze, ending in a full show-ready stage. No people, no text, no logos, photorealistic, cinematic.
```

---

## P1 — Tarjetas y páginas de evento (5)

- **Ruta:** `public/media/ai/events/{slug}-card.jpg` · JPG 1600×2000 · **4:5** · composición: sujeto en el tercio inferior, tercio superior oscuro (título encima). Sin personas reconocibles.
- **Referencia necesaria:** no. **Rotular «Ilustrativa».**

| ID | Archivo | Acento de luz | Prompt (tras el prefijo común) |
|---|---|---|---|
| `event.bodas` | `bodas-card.jpg` | ámbar cálido | `an elegant wedding reception hall at night, warm amber string lights and soft uplighting on a dance floor, long tables with candles out of focus, a small stage platform in the background, intimate and romantic mood` |
| `event.cumpleanos-y-15` | `cumpleanos-y-15-card.jpg` | magenta | `a quinceañera birthday party hall, magenta and pink wash lights, a clear dance floor with haze and light beams, a small stage with a backdrop out of focus, festive celebration mood, no people in foreground` |
| `event.fiestas-privadas` | `fiestas-privadas-card.jpg` | violeta | `a private house party in a garden at night, violet and purple ambient lighting, string lights, a small DJ-style table and compact speakers out of focus, relaxed celebratory mood` |
| `event.corporativos` | `corporativos-card.jpg` | azul frío | `a corporate conference stage in a modern venue, cool blue wash lighting, a clean podium and screen out of focus, rows of empty chairs, professional sober mood` |
| `event.espectaculos` | `espectaculos-card.jpg` | carmesí/blanco | `a live concert stage seen from the audience, dramatic crimson and white strobe beams through dense haze, silhouettes of speaker stacks, energetic show atmosphere, no readable faces` |

## P1 — Servicios (fondos opcionales)

- **Ruta:** `public/media/ai/services/{audio,luces,escenario}.jpg` · JPG 1800×1200 · **3:2** · composición oscura con detalle en el lado derecho (texto a la izquierda).

| ID | Archivo | Prompt (tras el prefijo común) |
|---|---|---|
| `service.audio` | `audio.jpg` | `close-up of a professional audio mixing console in a dark room, faders and knobs softly lit by red LEDs, shallow depth of field, hands not visible` |
| `service.luces` | `luces.jpg` | `moving-head stage lights on a truss projecting crimson and white beams through haze, seen from below, dark background` |
| `service.escenario` | `escenario.jpg` | `portable folding stage platform in a dark hall, modular deck panels catching a soft red rim light, empty, detail shot` |

## P1 — Galería (conceptual, **no son trabajos realizados**)

- **Ruta:** `public/media/ai/gallery/concept-0N.jpg` · JPG calidad 85 · relaciones mixtas para el mosaico: `01` 3:4 (1500×2000) · `02` 16:9 (2400×1350) · `03` 1:1 (1800×1800) · `04` 4:5 (1600×2000) · `05` 16:9 (2400×1350) · `06` 3:4 (1500×2000).
- Se muestran con la etiqueta «Ilustrativa» y un aviso de que no son trabajos realizados.
- **Prompts (tras el prefijo común):** `01` sound engineer's mixing desk with glowing faders, no face visible · `02` wide view of a lit stage with beams in haze · `03` detail of moving-head lights from below · `04` empty dance floor lit in magenta and amber · `05` folding stage platform with truss and speakers at night · `06` backstage cable runs and flight cases in dim red light.

## Cuando llegue material auténtico

- Guardar en `public/media/real/{photos|video}/…` con `alt` descriptivo real, cambiar `origin: "authentic"` en `src/content/gallery.ts` y se mostrará sin rótulo.
- Fotos: JPG/WebP ≥ 2000 px de lado largo. Videos: ver compresión de arriba.

## P2 — Pendientes del cliente

- Logo vectorial (`public/brand/logo-light.svg`, versión clara/monocroma para fondo oscuro).
- Dos capturas de referencia del escenario en `docs/reference/`.
- Fotos y videos propios de eventos, con permiso de publicación.
