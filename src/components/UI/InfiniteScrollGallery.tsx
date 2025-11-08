"use client";
import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { MediaItem } from "@/types/Events";
import { AnimatePresence } from "framer-motion";
import Lightbox from "./Lightbox";

interface InfiniteScrollGalleryProps {
  mediaGallery?: MediaItem[];
  durationSeconds?: number;
}

const InfiniteScrollGallery: React.FC<InfiniteScrollGalleryProps> = ({
  mediaGallery,
  durationSeconds = 60,
}) => {
  // Mover todos los Hooks a la parte superior
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  // 1. Modificamos la interfaz del estado del lightbox para almacenar el índice
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState<
    number | null
  >(null);
  // Aseguramos que la galería completa esté disponible
  const galleryItems = mediaGallery || [];
  // Efecto para pausar/reanudar la animación CSS (DEBE estar antes del return condicional)
  useEffect(() => {
    if (scrollContainerRef.current) {
      if (isHovered) {
        scrollContainerRef.current.style.animationPlayState = "paused";
      } else {
        scrollContainerRef.current.style.animationPlayState = "running";
      }
    }
  }, [isHovered]);

  // AHORA podemos hacer el return condicional
  if (!mediaGallery || mediaGallery.length === 0) {
    return null;
  }

  // El resto de la lógica y renderizado (sin cambios)

  const effectiveMediaGallery =
    mediaGallery.length > 3
      ? [...mediaGallery, ...mediaGallery, ...mediaGallery]
      : mediaGallery;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.offsetWidth / 2;
      scrollContainerRef.current.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
      setIsHovered(true);
      setTimeout(() => {
        if (!scrollContainerRef.current?.matches(":hover")) {
          setIsHovered(false);
        }
      }, 3000);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentLightboxIndex(index);
  };

  const closeLightbox = () => {
    setCurrentLightboxIndex(null);
  };

  return (
    <>
      <style>{`
        @keyframes scroll-infinite-gallery {
          from { transform: translateX(0); }
          to { transform: translateX(-${
            mediaGallery.length > 3 ? "66.6%" : "50%"
          }); }
        }

        .animate-scroll {
          animation: scroll-infinite-gallery ${durationSeconds}s linear infinite;
        }
      `}</style>

      <h3 className="mb-4 text-xl font-semibold text-white-fp-400 font-electrolize">
        Galería
      </h3>

      <div className="relative w-full h-auto overflow-hidden group">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 p-2 text-white transition-opacity duration-300 transform -translate-x-full -translate-y-1/2 rounded-full opacity-0 top-1/2 bg-black/50 hover:bg-black/70 group-hover:opacity-100 group-hover:translate-x-0"
          aria-label="Anterior"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>

        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto w-fit animate-scroll scrollbar-hide"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {effectiveMediaGallery.map((media, index) => (
            <div
              key={`${media.url}-${index}`}
              className="relative flex-shrink-0 w-64 h-40 rounded-lg overflow-hidden shadow-lg border border-gray-700/50 cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => openLightbox(index % galleryItems.length)}
            >
              {media.mediaType === "photo" ? (
                <Image
                  src={media.url}
                  alt={media.altText || "Proyecto de Audio y Video"}
                  fill
                  sizes="(max-width: 768px) 100vw, 256px"
                  className="object-cover"
                />
              ) : (
                <video
                  src={media.url}
                  title={media.altText || "Video de Proyecto"}
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="object-cover w-full h-full"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 p-2 text-white transition-opacity duration-300 transform translate-x-full -translate-y-1/2 rounded-full opacity-0 top-1/2 bg-black/50 hover:bg-black/70 group-hover:opacity-100 group-hover:translate-x-0"
          aria-label="Siguiente"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {currentLightboxIndex !== null && (
          <Lightbox
            mediaGallery={galleryItems} // <--- Pasamos la galería completa
            initialIndex={currentLightboxIndex} // <--- Pasamos el índice inicial
            onClose={closeLightbox}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default InfiniteScrollGallery;
