"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, ScrollTrigger } from "@/lib/gsap";
import { useMotionPrefs } from "@/lib/use-motion-prefs";
import type { ResolvedMedia } from "@/lib/media-shared";
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

interface Props {
  poster: ResolvedMedia;
  final: ResolvedMedia;
  video: ResolvedMedia;
}

/**
 * Sección destacada del escenario portátil.
 * Modo animado: sección fijada (pin) y progreso de scroll → video (`currentTime`),
 * o, mientras no exista el video definitivo, imágenes / esquemática SVG.
 * Modo estático (reduced-motion, ahorro de datos o sin JS): estado final + lista de etapas.
 * Para incorporar el video definitivo: guardar `public/media/video/stage-build.mp4`
 * (ver docs/MEDIA_ASSETS.md). No hace falta tocar código.
 */
export default function StageScroll({ poster, final, video }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  const { reduced, autoplayOk, mobile } = useMotionPrefs();
  const animated = !reduced;
  const [stage, setStage] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const videoSrc = animated && autoplayOk && video.src ? (mobile && video.mobileSrc ? video.mobileSrc : video.src) : null;

  const hasSchematic = !video.src && !poster.src && !final.src;
  const staticStage = STAGES.length - 1;

  // Pin + scrub
  useEffect(() => {
    if (!animated) return;
    registerGsap();
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    // Línea de tiempo de la esquemática (progreso 0–1)
    const svg = svgRef.current;
    const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
    if (svg) {
      const q = (s: string) => svg.querySelectorAll(s);
      gsap.set(q(".draw"), { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(q(".fade-in"), { opacity: 0 });
      tl.to(q(".g-platform .draw"), { strokeDashoffset: 0, duration: 0.2 }, 0)
        .to(q(".g-truss .draw"), { strokeDashoffset: 0, duration: 0.2 }, 0.2)
        .to(q(".g-speakers .draw"), { strokeDashoffset: 0, duration: 0.2 }, 0.4)
        .to(q(".g-lights .fade-in"), { opacity: 1, duration: 0.15, stagger: 0.02 }, 0.6)
        .to(q(".g-beams .fade-in"), { opacity: 1, duration: 0.2, stagger: 0.03 }, 0.68)
        .to(q(".g-glow"), { opacity: 1, duration: 0.2 }, 0.8);
    }

    const proxy = { t: 0 };
    let lastStage = -1;
    const apply = (p: number) => {
      tl.progress(p);
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (finalRef.current) finalRef.current.style.opacity = String(Math.min(1, Math.max(0, (p - 0.55) / 0.35)));
      const v = videoRef.current;
      if (v && v.duration && Number.isFinite(v.duration)) {
        gsap.to(proxy, {
          t: p * v.duration,
          duration: 0.3,
          ease: "power2.out",
          overwrite: true,
          onUpdate: () => {
            v.currentTime = Math.min(v.duration - 0.01, proxy.t);
          },
        });
      }
      const idx = Math.min(STAGES.length - 1, Math.floor(p * STAGES.length));
      if (idx !== lastStage) {
        lastStage = idx;
        setStage(idx);
      }
    };

    const mm = gsap.matchMedia();
    mm.add(
      { mobile: "(max-width: 767px)", desktop: "(min-width: 768px)" },
      (ctx) => {
        const isMobile = ctx.conditions?.mobile;
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: isMobile ? "+=240%" : "+=320%",
          pin,
          scrub: true,
          anticipatePin: 1,
          onUpdate: (self) => apply(self.progress),
        });
        apply(0);
      },
    );

    return () => {
      mm.revert();
      tl.kill();
    };
  }, [animated, videoSrc]);

  // En modo estático el esquema se muestra completo
  const staticVisual = !animated;

  return (
    <section
      id="escenario"
      ref={sectionRef}
      aria-labelledby="escenario-title"
      className="relative border-y border-white/10 bg-bg"
    >
      <div ref={pinRef} className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden">
        {/* Visual (decorativo: el texto equivalente está en la lista de etapas) */}
        <div
          role="img"
          aria-label={`${final.alt}. Etapas: ${STAGES.map((s) => s.name).join(", ")}.`}
          className="absolute inset-0"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: "radial-gradient(90% 70% at 50% 85%, rgb(var(--brand) / 0.22), transparent 65%), rgb(var(--surface))" }}
          />
          {poster.src && (
            <Image src={poster.src} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
          )}
          {final.src && (
            <div ref={finalRef} className="absolute inset-0" style={{ opacity: staticVisual ? 1 : 0 }}>
              <Image src={final.src} alt="" aria-hidden="true" fill sizes="100vw" className="object-cover" />
            </div>
          )}
          {animated && videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
              onLoadedMetadata={(e) => {
                e.currentTarget.pause();
                setVideoReady(true);
              }}
              className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-700", videoReady ? "opacity-100" : "opacity-0")}
            />
          )}
          {hasSchematic && <Schematic svgRef={svgRef} complete={staticVisual} />}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-bg via-bg/30 to-bg" />
          <div aria-hidden="true" className="grid-lines absolute inset-0 opacity-50" />
        </div>

        <div className="wrap relative z-10 pt-28 md:pt-32">
          <ChannelLabel channel="CH 03">Escenario portátil</ChannelLabel>
          <h2 id="escenario-title" className="h-section mt-5 max-w-[14ch]">
            Del piso vacío <span className="text-brand-hi">al show.</span>
          </h2>
          <p className="mt-5 max-w-md text-text/80">
            Nuestra plataforma portátil y plegable se traslada y se arma donde se hace tu evento.
          </p>
        </div>

        <div className="wrap relative z-10 pb-10 md:pb-14">
          <IllustrativeTag className="mb-5" />
          <div className="mb-3 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-muted">
            <span className="flex items-center gap-2"><Led pulse={animated} /> Estado {String((animated ? stage : staticStage) + 1).padStart(2, "0")} / {String(STAGES.length).padStart(2, "0")}</span>
            <span aria-hidden="true" className="hidden sm:inline">{animated ? "Seguí bajando" : ""}</span>
          </div>
          <div aria-hidden="true" className="h-[2px] w-full bg-white/15">
            <span
              ref={barRef}
              className="block h-full origin-left bg-brand-hi"
              style={{ transform: animated ? "scaleX(0)" : "scaleX(1)" }}
            />
          </div>
          <ol aria-label="Etapas del montaje" className="mt-5 grid gap-2 sm:grid-cols-5 sm:gap-4">
            {STAGES.map((s, i) => {
              const current = animated ? i === stage : i === staticStage;
              return (
                <li
                  key={s.name}
                  aria-current={animated && current ? "step" : undefined}
                  className={cn(
                    "border-l-2 pl-3 transition-colors duration-500 sm:min-h-[6rem]",
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

/** Esquemática genérica de una plataforma con estructura, sonido y luces (sin medidas). */
function Schematic({ svgRef, complete }: { svgRef: React.RefObject<SVGSVGElement | null>; complete: boolean }) {
  const stroke = "rgb(242 239 234 / 0.7)";
  const common = { fill: "none", stroke, strokeWidth: 1.5, vectorEffect: "non-scaling-stroke" as const };
  const lightsX = [230, 315, 400, 485, 570];
  return (
    <svg
      ref={svgRef}
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      className="absolute inset-x-0 top-[34%] bottom-[30%] h-[36%] w-full"
    >
      <defs>
        <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(229 50 45)" stopOpacity="0.55" />
          <stop offset="1" stopColor="rgb(229 50 45)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="rgb(229 50 45)" stopOpacity="0.45" />
          <stop offset="1" stopColor="rgb(229 50 45)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="g-glow" style={{ opacity: complete ? 1 : 0 }}>
        <ellipse cx="400" cy="345" rx="330" ry="90" fill="url(#glow)" />
      </g>

      <g className="g-beams">
        {lightsX.map((x, i) => (
          <polygon
            key={x}
            className="fade-in"
            points={`${x - 8},132 ${x + 8},132 ${x + 60 - i * 30},340 ${x - 60 - i * 30},340`}
            fill="url(#beam)"
            style={{ opacity: complete ? 1 : 0 }}
          />
        ))}
      </g>

      <g className="g-platform">
        <path className="draw" pathLength={1} {...common} d="M120 330 H680 L725 380 H75 Z" style={complete ? { strokeDasharray: 1, strokeDashoffset: 0 } : undefined} />
        <path className="draw" pathLength={1} {...common} d="M75 380 H725 V402 H75 Z" style={complete ? { strokeDasharray: 1, strokeDashoffset: 0 } : undefined} />
        <path className="draw" pathLength={1} {...common} d="M262 330 L250 380 M400 330 V380 M538 330 L550 380" style={complete ? { strokeDasharray: 1, strokeDashoffset: 0 } : undefined} />
      </g>

      <g className="g-truss">
        <path className="draw" pathLength={1} {...common} d="M150 330 V96 M170 330 V96 M630 330 V96 M650 330 V96" style={complete ? { strokeDasharray: 1, strokeDashoffset: 0 } : undefined} />
        <path className="draw" pathLength={1} {...common} d="M150 96 H650 M150 118 H650 M150 118 L180 96 L210 118 L240 96 L270 118 L300 96 L330 118 L360 96 L390 118 L420 96 L450 118 L480 96 L510 118 L540 96 L570 118 L600 96 L630 118" style={complete ? { strokeDasharray: 1, strokeDashoffset: 0 } : undefined} />
      </g>

      <g className="g-speakers">
        <path className="draw" pathLength={1} {...common} d="M62 330 V232 H132 V330 M72 262 H122 M97 300 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0" style={complete ? { strokeDasharray: 1, strokeDashoffset: 0 } : undefined} />
        <path className="draw" pathLength={1} {...common} d="M668 330 V232 H738 V330 M678 262 H728 M703 300 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0" style={complete ? { strokeDasharray: 1, strokeDashoffset: 0 } : undefined} />
      </g>

      <g className="g-lights">
        {lightsX.map((x) => (
          <path key={x} className="fade-in" {...common} d={`M${x - 10} 120 H${x + 10} L${x + 7} 134 H${x - 7} Z`} style={{ opacity: complete ? 1 : 0 }} />
        ))}
      </g>
    </svg>
  );
}
