import { galleryNotice } from "@/content/gallery";
import { cn } from "@/lib/utils";

/** Aviso breve y discreto: explica la etiqueta «Ilustrativa» de las piezas. */
export default function GalleryNotice({ className }: { className?: string }) {
  return (
    <p data-reveal="fade" className={cn("border-l-2 border-white/20 pl-3 text-sm text-muted", className)}>
      {galleryNotice}
    </p>
  );
}
