"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/gsap";
import { useScroll } from "@/components/motion/SmoothScroll";
import { IllustrativeTag } from "@/components/media/Media";
import { ArrowIcon, CloseIcon } from "@/components/ui/Icons";
import type { GalleryTile } from "@/lib/media-shared";

interface Props {
  tiles: GalleryTile[];
  index: number | null;
  onIndex: (i: number | null) => void;
}

/** Visor accesible basado en <dialog> modal: foco atrapado, Escape y flechas. */
export default function GalleryLightbox({ tiles, index, onIndex }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { lock } = useScroll();
  const open = index !== null;
  const tile = index !== null ? tiles[index] : null;

  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      onIndex((index + d + tiles.length) % tiles.length);
    },
    [index, tiles.length, onIndex],
  );

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
      lock(true);
    }
    if (!open && dlg.open) {
      dlg.close();
      lock(false);
    }
  }, [open, lock]);

  // Transición de entrada al cambiar de pieza
  useEffect(() => {
    if (index === null || !stageRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      stageRef.current,
      { opacity: 0, scale: 0.96, clipPath: "inset(6% round 8px)" },
      { opacity: 1, scale: 1, clipPath: "inset(0% round 0px)", duration: 0.55, ease: "power3.out" },
    );
  }, [index]);

  useEffect(() => () => lock(false), [lock]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
  };

  return (
    <dialog
      ref={ref}
      aria-label="Visor de la galería"
      onCancel={(e) => {
        e.preventDefault();
        onIndex(null);
      }}
      onClose={() => onIndex(null)}
      onClick={(e) => {
        if (e.target === ref.current) onIndex(null);
      }}
      onKeyDown={onKey}
      data-lenis-prevent
      className="m-0 h-full max-h-none w-full max-w-none bg-bg/95 p-0 text-text backdrop:bg-black/80 open:flex"
    >
      {tile && (
        <div className="relative flex h-full w-full flex-col" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
              {String((index ?? 0) + 1).padStart(2, "0")} / {String(tiles.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={() => onIndex(null)}
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 border border-white/20 px-4 font-display text-lg font-bold uppercase tracking-[0.08em] hover:border-white"
            >
              <CloseIcon className="h-5 w-5" /> Cerrar
            </button>
          </div>

          <div ref={stageRef} className="relative min-h-0 flex-1 px-4 md:px-20">
            <div className="relative h-full w-full">
              {tile.kind === "video" && tile.src ? (
                <video
                  key={tile.id}
                  src={tile.src}
                  poster={tile.poster ?? undefined}
                  controls
                  autoPlay
                  playsInline
                  preload="none"
                  aria-label={tile.alt}
                  className="h-full w-full object-contain"
                />
              ) : tile.src ? (
                <Image src={tile.src} alt={tile.alt} fill sizes="100vw" className="object-contain" />
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
            <div className="flex flex-col gap-2">
              <p className="max-w-2xl text-sm text-text/90">{tile.alt}</p>
              {tile.origin !== "authentic" && <IllustrativeTag className="self-start" />}
              {tile.credit && <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">Foto: {tile.credit}</p>}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Anterior" className="inline-flex h-12 w-12 items-center justify-center border border-white/20 hover:border-white">
                <ArrowIcon className="h-5 w-5 rotate-180" />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Siguiente" className="inline-flex h-12 w-12 items-center justify-center border border-white/20 hover:border-white">
                <ArrowIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
