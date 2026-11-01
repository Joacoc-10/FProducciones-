import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logo ORIGINAL de Fabio Producciones. Para fondo oscuro se usa la variante
 * `logo-dark` (misma forma y proporciones; solo el negro pasa a blanco cálido).
 * Se sirve sin recompresión (`unoptimized`) para conservar el borde nítido.
 * Archivos y cómo se generan: docs/MEDIA_ASSETS.md · scripts/make-logo-variants.mjs
 */
export default function Logo({ className, imgClassName }: { className?: string; imgClassName?: string }) {
  return (
    <Link
      href="/"
      aria-label="Fabio Producciones, ir al inicio"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src="/brand/logo-dark-480.png"
        alt=""
        width={480}
        height={218}
        priority
        unoptimized
        className={cn("h-12 w-auto sm:h-14", imgClassName)}
      />
    </Link>
  );
}
