import Link from "next/link";
import { cn } from "@/lib/utils";

/** Wordmark tipográfico provisorio (el logo PNG es negro/rojo y no se lee sobre fondo oscuro). */
export default function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Fabio Producciones, ir al inicio"
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span aria-hidden="true" className="relative block h-7 w-7 -skew-x-12 bg-brand transition-colors group-hover:bg-brand-hi">
        <span className="absolute inset-y-1 left-1 w-1 bg-bg" />
        <span className="absolute left-1 top-1 h-1 w-4 bg-bg" />
      </span>
      <span className="font-display text-xl font-extrabold uppercase leading-none tracking-[0.06em] text-text">
        Fabio <span className="text-muted">Producciones</span>
      </span>
    </Link>
  );
}
