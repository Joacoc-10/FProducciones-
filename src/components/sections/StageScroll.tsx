"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap } from "@/lib/gsap";
import { useMotionPrefs } from "@/lib/use-motion-prefs";
import { FrameSequence } from "@/lib/frame-sequence";
import { getStageFinalUrl, getStageFirstUrl, getStageFrameUrls, getStageStartPositions, stageIndexAt, stageProgressAt, STAGE_FRAMES } from "@/content/stage-frames";
import { cn } from "@/lib/utils";
import { ChannelLabel, Led } from "@/components/console/Console";
import { IllustrativeTag } from "@/components/media/Media";

/** Etapas del montaje: texto genérico, sin medidas ni capacidades. */
const STAGES = [
  { name: "Plataforma desplegada", text: "Se despliega la plataforma portátil: lista para recibir el show." },
  { name: "Estructura", text: "Se arma la estructura que sostiene las luces y el sonido." },
  { name: "Sonido", text: "Se instala el sistema de audio." },
  { name: "Iluminación", text: "Se montan y apuntan las luces." },
  { name: "Show", text: "Todo listo: el escenario cobra vida." },
] as const;

/** Porción del recorrido que se usa para avanzar fotogramas; el resto mantiene el último a la vista. */
const PLAY_SHARE = 0.92;

/** Recorrido de scroll (% de alto de pantalla) por fotograma. */
const SCROLL_PER_FRAME = { desktop: 2.8, mobile: 2.2 } as const;

/**
 * Sección destacada del escenario portátil.
 * Modo animado: sección fijada (pin) y progreso de scroll → fotograma dibujado en un canvas 2D
 * (secuencia de WebP en `public/media/ai/stage/frames/`, ver `content/stage-frames.ts`).
 * Modo estático (reduced-motion, ahorro de datos, sin JS o error de carga): último fotograma + lista de etapas.
 */
export default function StageScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const { autoplayOk, mobile } = useMotionPrefs();
  const [stage, setStage] = useState(0);
  const [failed, setFailed] = useState(false);
  const animated = autoplayOk && !failed;
  const staticStage = STAGES.length - 1;

  useEffect(() => {
    if (!animated) return;
    const section = sectionRef.current;
    const pin = pinRef.current;
    const visual = visualRef.current;
    const canvas = canvasRef.current;
    const ctx2d = canvas?.getContext("2d", { alpha: false });
    if (!section || !pin || !visual || !canvas || !ctx2d) {
      queueMicrotask(() => setFailed(true));
      return;
    }
    registerGsap();

    const urls = getStageFrameUrls();
    const last = urls.length - 1;
    const starts = getStageStartPositions();
    let current = 0;
    let exact = false;
    let raf = 0;

    const draw = () => {
      raf = 0;
      const img = seq.get(current) ?? seq.nearest(current);
      if (!img) return;
      exact = Boolean(seq.get(current));
      // "cover": el visual es 16:9 en móvil/vertical y ocupa toda la sección en pantallas anchas
      const k = Math.max(canvas.width / img.width, canvas.height / img.height);
      const w = img.width * k;
      const h = img.height * k;
      ctx2d.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h);
      canvas.style.opacity = "1";
    };
    const requestDraw = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const seq = new FrameSequence(urls, {
      // Cada fotograma pesa ~0,5 MB y decodificado hasta ~8 MB (escritorio, 1920 px) o ~1 MB (móvil, 640 px).
      // Escritorio: ventana corta y pocas anclas para acotar memoria. Móvil: decodificados son baratos, así que se
      // carga más lejos y se retienen más (invertir el scroll no obliga a decodificar de nuevo), con anclas más densas.
      windowSize: mobile ? 28 : 14,
      retain: mobile ? 14 : 0,
      concurrency: mobile ? 3 : 4,
      constrained: mobile,
      anchorStep: mobile ? 10 : 20,
      onFrame: (i) => {
        // Si se está mostrando un reemplazo aproximado, cualquier fotograma nuevo puede mejorarlo
        if (!exact || i === current) requestDraw();
      },
      onFail: () => setFailed(true),
    });

    // Resolución del canvas: según el tamaño en pantalla y el dispositivo, sin superar la fuente (1920 px)
    const resize = () => {
      const { clientWidth: cw, clientHeight: ch } = visual;
      if (!cw || !ch) return;
      const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
      const k = Math.min(1, STAGE_FRAMES.width / (cw * dpr));
      canvas.width = Math.round(cw * dpr * k);
      canvas.height = Math.round(ch * dpr * k);
      ctx2d.imageSmoothingQuality = "high";
      const cover = Math.max(canvas.width / STAGE_FRAMES.width, canvas.height / STAGE_FRAMES.height);
      seq.setBitmapWidth(Math.min(STAGE_FRAMES.width, Math.max(640, Math.round(STAGE_FRAMES.width * cover))));
      requestDraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(visual);

    // No se descarga nada hasta que la sección está cerca del viewport
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        seq.start();
        io.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(visual);

    let lastStage = -1;
    const proxy = { frame: 0 };
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: `+=${Math.round(last * (mobile ? SCROLL_PER_FRAME.mobile : SCROLL_PER_FRAME.desktop))}%`,
          pin,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          const frame = Math.round(proxy.frame);
          if (frame !== current) {
            current = frame;
            seq.setFocus(frame);
            requestDraw();
          }
          if (barRef.current) barRef.current.style.transform = `scaleX(${stageProgressAt(frame, starts, last)})`;
          const idx = stageIndexAt(frame, starts);
          if (idx !== lastStage) {
            lastStage = idx;
            setStage(idx);
          }
        },
      });
      tl.to(proxy, { frame: last, duration: PLAY_SHARE }).to({}, { duration: 1 - PLAY_SHARE });
    }, section);

    return () => {
      ctx.revert();
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
      seq.dispose();
    };
  }, [animated, mobile]);

  const finalUrl = getStageFinalUrl();
  const currentStage = animated ? stage : staticStage;

  return (
    <section
      id="escenario"
      ref={sectionRef}
      aria-labelledby="escenario-title"
      className="relative border-y border-white/10 bg-bg"
    >
      <div ref={pinRef} className="relative flex min-h-[100svh] flex-col justify-start gap-8 overflow-hidden bg-bg wide:justify-between wide:gap-0">
        {/* Visual (decorativo: el texto equivalente está en la lista de etapas) */}
        <div
          ref={visualRef}
          role="img"
          aria-label={`${STAGE_FRAMES.alt}. Etapas: ${STAGES.map((s) => s.name).join(", ")}.`}
          className="relative order-2 aspect-video w-full wide:absolute wide:inset-0 wide:order-none wide:aspect-auto"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "radial-gradient(90% 70% at 50% 85%, rgb(var(--brand) / 0.22), transparent 65%), rgb(var(--surface))" }}
          />
          {/* Estado estático / error: escenario terminado. Animado: primer fotograma hasta que el canvas dibuja */}
          <Image
            src={animated ? getStageFirstUrl() : finalUrl}
            alt=""
            aria-hidden="true"
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
          {animated && (
            <canvas
              ref={canvasRef}
              aria-hidden="true"
              className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-300"
            />
          )}
          {/* Móvil/vertical: solo se funden los bordes. Ancho: velo para que el texto se lea sobre la foto */}
          <div
            aria-hidden="true"
            className="absolute inset-0 wide:hidden"
            style={{ background: "linear-gradient(to bottom, rgb(var(--bg)) 0, transparent 14%, transparent 86%, rgb(var(--bg)) 100%)" }}
          />
          <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-b from-bg via-bg/10 to-bg wide:block" />
          <IllustrativeTag className="absolute bottom-3 left-3 z-10 wide:hidden" />
          <div aria-hidden="true" className="absolute inset-0 hidden bg-gradient-to-r from-bg/70 via-bg/10 to-transparent wide:block" />
          <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-30" />
        </div>

        <div className="wrap relative z-10 order-1 pt-24 md:pt-28 wide:pt-32">
          <ChannelLabel channel="CH 03">Escenario portátil</ChannelLabel>
          <h2 id="escenario-title" className="h-section mt-5 max-w-[14ch]">
            Del piso vacío <span className="text-brand-hi">al show.</span>
          </h2>
          <p className="mt-3 max-w-md text-text/80 md:mt-5">
            Nuestra plataforma portátil y plegable se traslada y se arma donde se hace tu evento.
          </p>
        </div>

        <div className="wrap relative z-10 order-3 pb-20 wide:pb-14 md:pt-6">
          <IllustrativeTag className="mb-5 hidden wide:inline-flex" />
          <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted">
            <span className="flex items-center gap-2"><Led pulse={animated} /> Estado {String(currentStage + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}</span>
            <span aria-hidden="true" className="hidden sm:inline">{animated ? "Seguí bajando" : ""}</span>
          </div>
          <div aria-hidden="true" className="relative h-[2px] w-full bg-white/15">
            <span
              ref={barRef}
              className="block h-full origin-left bg-brand-hi"
              style={{ transform: animated ? "scaleX(0)" : "scaleX(1)" }}
            />
            {/* Límite de cada etapa: coincide con el borde izquierdo de su columna (columnas iguales, sin gap) */}
            {STAGES.map((s, i) => (
              <span
                key={s.name}
                className={cn(
                  "absolute top-1/2 h-2 w-px -translate-y-1/2 transition-colors duration-300",
                  i <= currentStage ? "bg-brand-hi" : "bg-white/40",
                )}
                style={{ left: `${(i / STAGES.length) * 100}%` }}
              />
            ))}
          </div>
          <ol aria-label="Etapas del montaje" className="mt-5 grid gap-2 max-sm:min-h-[7.5rem] sm:grid-cols-5 sm:gap-0">
            {STAGES.map((s, i) => {
              const current = i === currentStage;
              return (
                <li
                  key={s.name}
                  aria-current={animated && current ? "step" : undefined}
                  className={cn(
                    "border-l-2 pl-3 transition-colors duration-500 sm:min-h-[6rem] sm:pr-4",
                    current ? "border-brand-hi text-text" : "border-white/15 text-muted",
                    // En móvil animado solo se muestra la etapa activa para no tapar el visual
                    animated && !current && "max-sm:hidden",
                  )}
                >
                  <span className="font-mono text-xs tracking-[0.18em]">{String(i + 1).padStart(2, "0")}</span>
                  <p className="font-display text-xl font-bold uppercase tracking-[0.04em]">{s.name}</p>
                  <p className={cn("mt-1 text-sm", animated && !current && "sm:opacity-0", "transition-opacity duration-500")}>{s.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
