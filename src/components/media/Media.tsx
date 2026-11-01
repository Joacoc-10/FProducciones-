import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ResolvedMedia } from "@/lib/media-shared";

/** Etiqueta de las piezas de galería que no son material real. Solo se usa dentro de la galería. */
export function IllustrativeTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "pointer-events-none inline-flex items-center gap-1.5 bg-black/70 px-2 py-1 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-white/85 backdrop-blur-sm",
        className,
      )}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-white/60" />
      Ilustrativa
      <span className="sr-only"> — imagen conceptual, no es un trabajo realizado</span>
    </span>
  );
}

interface MediaProps {
  media: ResolvedMedia;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  /** Si no hay recurso, color de luz del placeholder (canales rgb) */
  light?: string;
}

/** Imagen (o placeholder de luz si todavía no hay recurso). Rellena a su contenedor relativo. */
export default function Media({
  media,
  sizes,
  priority,
  className,
  imgClassName,
  light,
}: MediaProps) {
  const poster = media.kind === "video" ? media.poster : media.src;
  return (
    <div className={cn("absolute inset-0 overflow-hidden bg-surface", className)}>
      {poster ? (
        <Image
          src={poster}
          alt={media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <div
          role="img"
          aria-label={media.alt}
          className="h-full w-full"
          style={{
            background: `radial-gradient(120% 90% at 30% 20%, rgb(${light ?? "229 50 45"} / 0.35), transparent 60%), linear-gradient(160deg, rgb(var(--surface-2)), rgb(var(--bg)))`,
          }}
        />
      )}
    </div>
  );
}
