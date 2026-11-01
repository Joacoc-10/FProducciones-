"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { isDataConstrained, prefersReducedMotion } from "@/lib/gsap";
import type { GalleryTile } from "@/lib/media-shared";
import { cn } from "@/lib/utils";
import { IllustrativeTag } from "@/components/media/Media";
import { ChannelLabel } from "@/components/console/Console";
import { ArrowIcon } from "@/components/ui/Icons";
import GalleryLightbox from "./GalleryLightbox";

export type { GalleryTile };

type Filter = "all" | "image" | "video";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todo" },
  { id: "image", label: "Fotos" },
  { id: "video", label: "Videos" },
];

/** Video del mosaico: solo se reproduce en pantalla y si el usuario acepta movimiento. */
function TileVideo({ tile }: { tile: GalleryTile }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!tile.src || prefersReducedMotion() || isDataConstrained()) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setArmed(true);
        el.play().catch(() => {});
      } else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, [tile.src]);

  return (
    <>
      {tile.poster && <Image src={tile.poster} alt="" aria-hidden="true" fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover" />}
      {tile.src && (
        <video
          ref={ref}
          src={armed ? tile.src : undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </>
  );
}

export default function Gallery({ tiles }: { tiles: GalleryTile[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const visible = useMemo(() => tiles.filter((t) => filter === "all" || t.kind === filter), [tiles, filter]);

  const openAt = (i: number, el: HTMLElement) => {
    lastFocus.current = el;
    setActive(i);
  };
  const onIndex = (i: number | null) => {
    setActive(i);
    if (i === null) lastFocus.current?.focus();
  };

  return (
    <section id="galeria" aria-labelledby="galeria-title" className="section-y">
      <div className="wrap">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p data-reveal="fade" className="eyebrow">Galería audiovisual</p>
            <h2 id="galeria-title" data-reveal className="h-section mt-4">Luces, sonido y escenario</h2>
          </div>
          <div data-reveal role="group" aria-label="Filtrar galería" className="flex gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "min-h-[44px] border px-5 font-display text-lg font-bold uppercase tracking-[0.08em] transition-colors",
                  filter === f.id ? "border-brand bg-brand text-white" : "border-white/20 text-muted hover:border-white hover:text-text",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Aviso de honestidad: la galería es conceptual hasta tener material propio */}
        <div data-reveal className="mb-8 flex flex-col gap-2 border border-white/10 bg-surface p-4 text-sm text-muted sm:flex-row sm:items-start sm:gap-4">
          <ChannelLabel channel="AVISO" className="shrink-0">Material conceptual</ChannelLabel>
          <p>
            Estas piezas son ilustrativas y <strong className="font-semibold text-text">no son trabajos realizados</strong> por Fabio Producciones. La galería se irá completando con registros de eventos reales.
          </p>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          Mostrando {visible.length} {visible.length === 1 ? "pieza" : "piezas"}.
        </p>

        <ul className="grid grid-cols-2 gap-3 lg:auto-rows-[8.5rem] lg:grid-cols-12 lg:gap-4">
          {visible.map((t, i) => (
            <li
              key={t.id}
              data-reveal
              className={cn(
                "relative overflow-hidden border border-white/10 bg-surface",
                t.featured ? "col-span-2 aspect-video" : "aspect-[4/5]",
                "lg:aspect-auto",
                filter === "all" ? t.span : "lg:col-span-4 lg:row-span-2",
              )}
            >
              <button
                type="button"
                onClick={(e) => openAt(i, e.currentTarget)}
                aria-label={`Ampliar ${t.kind === "video" ? "video" : "imagen"}: ${t.alt}`}
                className="group absolute inset-0 block h-full w-full text-left"
              >
                {t.kind === "video" ? (
                  <TileVideo tile={t} />
                ) : (
                  t.src && (
                    <Image
                      src={t.src}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes={t.featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
                      style={t.objectPosition ? { objectPosition: t.objectPosition } : undefined}
                      className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                    />
                  )
                )}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-50" />
                {t.kind === "video" && (
                  <span aria-hidden="true" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center bg-black/60 backdrop-blur-sm">
                    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white"><path d="M2 1l9 5-9 5z" /></svg>
                  </span>
                )}
                {t.origin !== "authentic" && <IllustrativeTag className="absolute bottom-3 left-3" />}
              </button>
            </li>
          ))}
        </ul>

        <div data-reveal className="mt-10 flex justify-center">
          <Link
            href="/galeria"
            className="group relative inline-flex min-h-[56px] items-center gap-3 overflow-hidden border border-white/20 bg-surface px-8 font-display text-xl font-bold uppercase tracking-[0.08em] text-text transition-colors duration-300 hover:border-brand"
          >
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-brand transition-[width] duration-300 ease-out group-hover:w-full" />
            <span className="relative">Ver toda la galería</span>
            <ArrowIcon className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <GalleryLightbox tiles={visible} index={active} onIndex={onIndex} />
    </section>
  );
}
