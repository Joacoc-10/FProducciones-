"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { isWideOnSmall, MOSAIC_GRID, mosaicCells } from "@/lib/mosaic";
import type { GalleryTile } from "@/lib/media-shared";
import { cn } from "@/lib/utils";
import { IllustrativeTag } from "@/components/media/Media";
import GalleryLightbox from "./GalleryLightbox";

type Filter = "all" | "image" | "video";
const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "image", label: "Fotos" },
  { id: "video", label: "Videos" },
];

/** Galería completa: todas las piezas del manifiesto, con filtros Todos/Fotos/Videos y visor. */
export default function GalleryArchive({ tiles }: { tiles: GalleryTile[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [active, setActive] = useState<number | null>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const visible = useMemo(
    () => tiles.filter((t) => filter === "all" || t.kind === filter),
    [tiles, filter],
  );

  const cells = useMemo(() => mosaicCells(visible.length), [visible.length]);

  // Entrada escalonada al cambiar de filtro (las piezas se montan de nuevo, por eso no usan data-reveal)
  useEffect(() => {
    const items = listRef.current?.children;
    if (!items?.length || prefersReducedMotion()) return;
    const tween = gsap.fromTo(
      items,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.04, clearProps: "opacity,transform" },
    );
    return () => {
      tween.kill();
    };
  }, [filter]);

  const openAt = (i: number, el: HTMLElement) => {
    lastFocus.current = el;
    setActive(i);
  };
  const onIndex = (i: number | null) => {
    setActive(i);
    if (i === null) lastFocus.current?.focus();
  };

  return (
    <>
      <div data-reveal role="group" aria-label="Filtrar galería" className="mt-10 flex gap-2">
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

      <p className="sr-only" role="status" aria-live="polite">
        Mostrando {visible.length} {visible.length === 1 ? "pieza" : "piezas"}.
      </p>

      {visible.length === 0 ? (
        <div className="mt-8 border border-white/10 bg-surface p-8 text-muted">
          <p className="text-lg text-text">Todavía no hay material en este filtro.</p>
          <button type="button" onClick={() => setFilter("all")} className="btn btn-ghost mt-6">Ver todos</button>
        </div>
      ) : (
        <ul ref={listRef} className={cn("mt-8", MOSAIC_GRID)}>
          {visible.map((t, i) => (
            <li
              key={t.id}
              className={cn(
                "relative overflow-hidden border border-white/10 bg-surface lg:aspect-auto",
                isWideOnSmall(i, visible.length) ? "col-span-2 aspect-video" : "aspect-[4/5]",
                cells[i].span,
              )}
            >
              <button
                type="button"
                onClick={(e) => openAt(i, e.currentTarget)}
                aria-label={`${t.kind === "video" ? "Reproducir video" : "Ampliar imagen"}: ${t.alt}`}
                className="group absolute inset-0 block h-full w-full text-left"
              >
                {(t.kind === "video" ? t.poster : t.src) ? (
                  <Image
                    src={(t.kind === "video" ? t.poster : t.src)!}
                    alt=""
                    aria-hidden="true"
                    fill
                    loading="lazy"
                    sizes={`(min-width: 1024px) ${Math.round((cells[i].cols / 12) * 100)}vw, ${isWideOnSmall(i, visible.length) ? "100vw" : "50vw"}`}
                    style={t.objectPosition ? { objectPosition: t.objectPosition } : undefined}
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                ) : (
                  <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,rgb(var(--surface-2)),rgb(var(--bg)))]" />
                )}
                <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-transparent opacity-80 transition-opacity group-hover:opacity-50" />
                {t.kind === "video" && (
                  <span aria-hidden="true" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center bg-black/60 backdrop-blur-sm transition-colors group-hover:bg-brand">
                    <svg viewBox="0 0 12 12" className="h-3 w-3 fill-white"><path d="M2 1l9 5-9 5z" /></svg>
                  </span>
                )}
                {t.origin !== "authentic" && <IllustrativeTag className="absolute bottom-3 left-3" />}
              </button>
            </li>
          ))}
        </ul>
      )}

      <GalleryLightbox tiles={visible} index={active} onIndex={onIndex} />
    </>
  );
}
