"use client";

import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Image from 'next/image';
import { IGallery } from "@/types/Gallery"; 

// --- Hooks Auxiliares ---

const useMedia = (queries: string[], values: number[], defaultValue: number): number => {
  const get = () => values[queries.findIndex(q => matchMedia(q).matches)] ?? defaultValue;
  const [value, setValue] = useState<number>(get);

  useEffect(() => {
    const handler = () => setValue(get);
    queries.forEach(q => matchMedia(q).addEventListener('change', handler));
    return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler));
  }, [queries]);

  return value;
};

const useMeasure = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
};

const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(
    urls.map(
      src =>
        new Promise<void>(resolve => {
          // Usamos window.Image para evitar conflictos con next/image
          // eslint-disable-next-line no-undef
          const img = new window.Image(); 
          img.src = src;
          img.onload = img.onerror = () => resolve();
        })
    )
  );
};

// --- Interfaces Adaptadas ---

interface MasonryItem extends IGallery {
    calculatedHeight: number; 
}

interface GridItem extends MasonryItem {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MasonryProps {
  items: IGallery[]; 
  ease?: string;
  duration?: number;
  stagger?: number;
  animateFrom?: 'bottom' | 'top' | 'left' | 'right' | 'center' | 'random';
  scaleOnHover?: boolean;
  hoverScale?: number;
  blurToFocus?: boolean;
  colorShiftOnHover?: boolean;
  onItemClick?: (item: IGallery) => void;
}

// --- Componente Masonry ---

const Masonry: React.FC<MasonryProps> = ({
  items,
  ease = 'power3.out',
  duration = 0.6,
  stagger = 0.05,
  animateFrom = 'bottom',
  scaleOnHover = true,
  hoverScale = 0.95,
  blurToFocus = true,
  colorShiftOnHover = false,
  onItemClick
}) => {
  const columns = useMedia(
    ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'],
    [5, 4, 3, 2],
    1
  );

  const [containerRef, { width }] = useMeasure<HTMLDivElement>();
  const [imagesReady, setImagesReady] = useState(false);
  
  // 🚨 ELIMINAMOS el estado [calculatedContainerHeight, setCalculatedContainerHeight]

  const getInitialPosition = (item: GridItem) => {
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return { x: item.x, y: item.y };
    
    let direction = animateFrom;
    if (animateFrom === 'random') {
      const dirs = ['top', 'bottom', 'left', 'right'];
      direction = dirs[Math.floor(Math.random() * dirs.length)] as typeof animateFrom;
    }

    switch (direction) {
      case 'top':
        return { x: item.x, y: -200 };
      case 'bottom':
        return { x: item.x, y: window.innerHeight + 200 };
      case 'left':
        return { x: -200, y: item.y };
      case 'right':
        return { x: window.innerWidth + 200, y: item.y };
      case 'center':
        return {
          x: containerRect.width / 2 - item.w / 2,
          y: containerRect.height / 2 - item.h / 2
        };
      default:
        return { x: item.x, y: item.y + 100 };
    }
  };

  useEffect(() => {
    const imageItems = items.filter(i => i.mediaType === 'photo'); 
    preloadImages(imageItems.map(i => i.url)).then(() => setImagesReady(true));
  }, [items]);

  // useMemo calcula la cuadrícula y la altura máxima.
  const gridAndHeight = useMemo(() => {
    if (!width) return { grid: [], maxColHeight: 0 };
    const colHeights = new Array(columns).fill(0);
    const gap = 16;
    const totalGaps = (columns - 1) * gap;
    const columnWidth = (width - totalGaps) / columns;

    const masonryItems: MasonryItem[] = items.map(item => ({
        ...item,
        // Usamos alturas variables para el efecto masonry
        calculatedHeight: item.id % 3 === 0 ? 800 : (item.id % 2 === 0 ? 400 : 600),
    }));


    const calculatedGrid = masonryItems.map(child => {
        const col = colHeights.indexOf(Math.min(...colHeights));
        const x = col * (columnWidth + gap);
        const height = child.calculatedHeight / 2; 
        const y = colHeights[col];

        colHeights[col] += height + gap;
        return { ...child, x, y, w: columnWidth, h: height };
    });

    const maxColHeight = Math.max(...colHeights);
    
    // Retornamos la cuadrícula y la altura máxima
    return { grid: calculatedGrid, maxColHeight: maxColHeight + gap };
  }, [columns, items, width]);
  
  const grid = gridAndHeight.grid;

  // 🚨 ELIMINAMOS el useEffect con setCalculatedContainerHeight.


  const hasMounted = useRef(false);

  // 💡 useLayoutEffect maneja la animación (GSAP) Y la altura del contenedor.
  useLayoutEffect(() => {
    // 1. Aplicar la altura calculada al contenedor padre (CORRECCIÓN DE FLUJO DOM)
    if (containerRef.current && gridAndHeight.maxColHeight > 0) {
        containerRef.current.style.height = `${gridAndHeight.maxColHeight}px`;
    }
    
    // 2. Lógica de Animación (GSAP)
    if (!imagesReady) return;

    grid.forEach((item, index) => {
      const selector = `[data-key="${item.id}"]`; 
      const animProps = { x: item.x, y: item.y, width: item.w, height: item.h };

      if (!hasMounted.current) {
        const start = getInitialPosition(item);
        gsap.fromTo(
          selector,
          {
            opacity: 0,
            x: start.x,
            y: start.y,
            width: item.w,
            height: item.h,
            ...(blurToFocus && { filter: 'blur(10px)' })
          },
          {
            opacity: 1,
            ...animProps,
            ...(blurToFocus && { filter: 'blur(0px)' }),
            duration: 0.8,
            ease: 'power3.out',
            delay: index * stagger
          }
        );
      } else {
        gsap.to(selector, {
          ...animProps,
          duration,
          ease,
          overwrite: 'auto'
        });
      }
    });

    hasMounted.current = true;
    
  }, [grid, imagesReady, stagger, animateFrom, blurToFocus, duration, ease, containerRef, gridAndHeight.maxColHeight]); // Dependencia actualizada

  const handleMouseEnter = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: hoverScale,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0.3, duration: 0.3 });
    }
  };

  const handleMouseLeave = (id: string, element: HTMLElement) => {
    if (scaleOnHover) {
      gsap.to(`[data-key="${id}"]`, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    if (colorShiftOnHover) {
      const overlay = element.querySelector('.color-overlay') as HTMLElement;
      if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
    }
  };

  // --- Renderizado ---

  return (
    <div 
        ref={containerRef} 
        className="relative w-full mt-12" 
        // 🚨 ELIMINAMOS la propiedad style de altura. Ahora se aplica vía useLayoutEffect
    > 
      {grid.map(item => (
        <div
          key={item.id}
          data-key={item.id}
          className="box-content absolute cursor-pointer"
          style={{ willChange: 'transform, width, height, opacity' }}
          onClick={() => onItemClick && onItemClick(item)} 
          onMouseEnter={e => handleMouseEnter(String(item.id), e.currentTarget)}
          onMouseLeave={e => handleMouseLeave(String(item.id), e.currentTarget)}
        >
          
          {item.mediaType === 'photo' ? (
              // Contenedor de imagen usando Image de Next.js
              <div 
                  className="relative w-full h-full rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] overflow-hidden"
              >
                  <Image
                      src={item.url}
                      alt={item.altText || 'Foto de proyecto'}
                      fill
                      sizes={`(${item.w}px)`}
                      className="object-cover transition-all duration-300 blur-sm hover:blur-none" 
                  />
                  {colorShiftOnHover && (
                      <div className="color-overlay absolute inset-0 rounded-[10px] bg-gradient-to-tr from-pink-500/50 to-sky-500/50 opacity-0 pointer-events-none" />
                  )}
              </div>

          ) : (
              // Contenedor de video
              <video
                  src={item.url}
                  title={item.altText || 'Video de proyecto'}
                  loop
                  muted
                  autoPlay
                  playsInline
                  className="object-cover w-full h-full rounded-[10px] shadow-[0px_10px_50px_-10px_rgba(0,0,0,0.2)] blur-sm hover:blur-none"
              />
          )}

        </div>
      ))}
    </div>
  );
};

export default Masonry;
