"use client";
import React, { useState } from "react";
import DoubleCarousel from "./UI/DoubleCarousel";
import Lightbox from "./UI/Lightbox"; // Asegúrate de que la ruta sea correcta
import { gallery } from "@/helpers/Gallery";
import ScrollFloat from "./UI/ScrollFloat";
import { IGallery } from "@/types/Gallery"; // Si no lo tienes, usa el tipo IGallery

// Nota: Asumiendo que Lightbox.tsx usa IGallery, aunque el prop se llame MediaItem.

const Gallery = () => {
  // Estado para controlar el Lightbox
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  // Handler que se pasa al DoubleCarousel para manejar el clic
  const handleItemClick = (index: number) => {
    // Es crucial pasar el índice del item DENTRO del array original 'gallery', no del duplicado.
    setInitialIndex(index);
    setIsLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setIsLightboxOpen(false);
  };

  return (
    <>
      <div className="mx-auto max-w-7xl" id="Gallery">
        <ScrollFloat>
          <h1 className="mt-12 text-4xl font-semibold uppercase font-electrolize"> Nuestra galeria</h1>
        </ScrollFloat>

        <DoubleCarousel
          mediaItems={gallery}
          onItemClick={handleItemClick} // 👈 Pasamos el handler de clic
        />
      </div>

      {/* 🚨 RENDERIZADO CONDICIONAL DEL LIGHTBOX 🚨 */}
      {isLightboxOpen && (
        <Lightbox
          // El Lightbox siempre debe usar el array de contenido ORIGINAL y completo
          mediaGallery={gallery as unknown as IGallery[]} // Asegura el tipo si es necesario
          initialIndex={initialIndex}
          onClose={handleCloseLightbox}
        />
      )}
    </>
  );
};

export default Gallery;
