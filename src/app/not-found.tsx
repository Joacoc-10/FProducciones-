import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada" };

/** 404 independiente: vive en el layout raíz mínimo, sin navbar, footer ni escenario. Next añade noindex y responde 404. */
export default function NotFound() {
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="font-display text-[clamp(9rem,40vw,26rem)] font-extrabold leading-[0.8] text-brand-hi">
        404
      </p>
      <h1 className="mt-6 font-display text-3xl font-bold uppercase tracking-[0.06em] text-text md:text-5xl">
        Página no encontrada
      </h1>
      <Link href="/" className="btn btn-primary mt-10">Volver al inicio</Link>
    </main>
  );
}
