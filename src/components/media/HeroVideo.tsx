"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMotionPrefs } from "@/lib/use-motion-prefs";
import type { ResolvedMedia } from "@/lib/media-shared";
import Media from "./Media";

/**
 * Video de fondo del hero.
 *  - El póster (imagen) siempre está debajo: es el LCP y el fallback.
 *  - El video solo se carga si el usuario acepta movimiento y no hay ahorro de datos / conexión lenta.
 *  - Se pausa fuera de pantalla y con la pestaña oculta. Botón visible de pausa.
 *  - Móvil: usa la versión liviana si existe.
 */
export default function HeroVideo({ poster, video }: { poster: ResolvedMedia; video: ResolvedMedia }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { autoplayOk, mobile } = useMotionPrefs();
  const [userArmed, setUserArmed] = useState(false); // el usuario pidió reproducir (p. ej. con reduced-motion)
  const [ready, setReady] = useState(false); // ya hay cuadros reproduciéndose
  const [paused, setPaused] = useState(false); // pausa elegida por el usuario

  const hasVideo = Boolean(video.src);
  const armed = hasVideo && (autoplayOk || userArmed);
  const src = mobile && video.mobileSrc ? video.mobileSrc : video.src;

  // Pausar fuera de pantalla / pestaña oculta
  useEffect(() => {
    const el = ref.current;
    if (!el || !armed) return;
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden && !paused) el.play().catch(() => {});
      else el.pause();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    sync();
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [armed, src, paused]);

  const toggle = useCallback(() => {
    if (!armed) {
      setUserArmed(true);
      setPaused(false);
      return;
    }
    setPaused((p) => !p);
  }, [armed]);

  const playing = armed && !paused;

  return (
    <>
      <Media media={poster} sizes="100vw" priority light="229 50 45" imgClassName="object-[60%_50%]" />
      {armed && src && (
        <video
          ref={ref}
          src={src}
          poster={poster.src ?? undefined}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => setReady(true)}
          className={`absolute inset-0 h-full w-full object-cover object-[60%_50%] transition-opacity duration-1000 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
      {hasVideo && (
        <button
          type="button"
          onClick={toggle}
          aria-pressed={paused || !armed}
          className="absolute bottom-5 right-4 z-20 inline-flex min-h-[44px] items-center gap-2 border border-white/25 bg-black/50 px-4 font-mono text-xs uppercase tracking-[0.14em] text-text backdrop-blur-sm transition-colors hover:border-white md:right-8"
        >
          <span aria-hidden="true" className="flex h-3 w-3 items-center justify-center">
            {playing ? (
              <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current"><rect x="1" y="1" width="3.5" height="10" /><rect x="7.5" y="1" width="3.5" height="10" /></svg>
            ) : (
              <svg viewBox="0 0 12 12" className="h-3 w-3 fill-current"><path d="M2 1l9 5-9 5z" /></svg>
            )}
          </span>
          {playing ? "Pausar video de fondo" : "Reproducir video de fondo"}
        </button>
      )}
    </>
  );
}
