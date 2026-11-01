import type { Metadata } from "next";
import Link from "next/link";
import { getGalleryTiles } from "@/lib/media";
import { ChannelLabel } from "@/components/console/Console";
import GalleryArchive from "@/components/sections/GalleryArchive";

const title = "Galería audiovisual";
const description = "Fotos y videos de sonido, luces y escenario para bodas, cumpleaños, fiestas privadas, corporativos y espectáculos.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/galeria" },
  openGraph: { title, description, url: "/galeria", type: "website" },
};

export default function GaleriaPage() {
  const tiles = getGalleryTiles("all");
  const hasIllustrative = tiles.some((t) => t.origin !== "authentic");

  return (
    <section aria-labelledby="galeria-title" className="pb-24 pt-36 md:pb-32 md:pt-44">
      <div className="wrap">
        <nav aria-label="Ruta de navegación" className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-muted">
          <Link href="/" className="hover:text-text">Inicio</Link> <span aria-hidden="true">/</span>{" "}
          <span className="text-text" aria-current="page">Galería</span>
        </nav>

        <p data-reveal="fade" className="eyebrow">Galería audiovisual</p>
        <h1 id="galeria-title" data-reveal className="h-section mt-4">Luces, sonido y escenario</h1>

        {hasIllustrative && (
          <div data-reveal className="mt-8 flex flex-col gap-2 border border-white/10 bg-surface p-4 text-sm text-muted sm:flex-row sm:items-start sm:gap-4">
            <ChannelLabel channel="AVISO" className="shrink-0">Material conceptual</ChannelLabel>
            <p>
              Las piezas rotuladas «Ilustrativa» son conceptuales y <strong className="font-semibold text-text">no son trabajos realizados</strong> por Fabio Producciones. La galería se irá completando con registros de eventos reales.
            </p>
          </div>
        )}

        <GalleryArchive tiles={tiles} />
      </div>
    </section>
  );
}
