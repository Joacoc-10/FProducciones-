// Lightbox.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { MediaItem } from "@/types/Events"; 

interface LightboxProps {
  mediaGallery: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ mediaGallery, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentItem = mediaGallery[currentIndex];
  const totalItems = mediaGallery.length;

  const navigate = useCallback((direction: 'next' | 'prev') => {
    setCurrentIndex(prevIndex => {
      let newIndex;
      if (direction === 'next') {
        newIndex = (prevIndex + 1) % totalItems; // Vuelve al inicio si llega al final
      } else {
        newIndex = (prevIndex - 1 + totalItems) % totalItems; // Vuelve al final si llega al inicio
      }
      return newIndex;
    });
  }, [totalItems]);

  // Manejar navegación con teclas
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        navigate('next');
      } else if (event.key === 'ArrowLeft') {
        navigate('prev');
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onClose]);


  if (!currentItem) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md cursor-zoom-out"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} 
    >
        {/* Botón Cerrar (opcional, pero buena práctica) */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute z-10 text-3xl text-white transition-colors top-5 right-5 hover:text-red-500"
          aria-label="Cerrar"
        >
          ✕
        </button>
      {/* Contenido (Imagen/Video) */}
      <motion.div
        key={currentIndex} 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "tween", duration: 0.2 }}
        className="relative w-[90vw] h-[90vh] max-w-screen-xl max-h-screen-xl flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()} // <-- EVITA que el clic en la imagen/video cierre el modal
      >
        <AnimatePresence mode="wait">
            {currentItem.mediaType === 'photo' ? (
              <Image
                src={currentItem.url}
                alt={currentItem.altText || 'Imagen en pantalla completa'}
                fill
                sizes="90vw"
                className="object-contain rounded-lg shadow-2xl"
              />
            ) : (
              <video
                src={currentItem.url}
                title={currentItem.altText || 'Video en pantalla completa'}
                controls
                autoPlay
                loop
                className="object-contain w-full h-full rounded-lg shadow-2xl"
              />
            )}
        </AnimatePresence>

        {/* Flecha Izquierda */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate('prev'); }}
          className="absolute z-10 p-3 text-white transition-colors -translate-y-1/2 rounded-full left-4 top-1/2 bg-black/50 hover:bg-black/70"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>

        {/* Flecha Derecha */}
        <button
          onClick={(e) => { e.stopPropagation(); navigate('next'); }}
          className="absolute z-10 p-3 text-white transition-colors -translate-y-1/2 rounded-full right-4 top-1/2 bg-black/50 hover:bg-black/70"
          aria-label="Siguiente"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>

      
      </motion.div>
    </motion.div>
  );
};

export default Lightbox;