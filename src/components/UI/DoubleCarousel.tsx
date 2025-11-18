import React from 'react';
import Image from 'next/image';
import { IGallery } from "@/types/Gallery"; 
import ScrollFloat from './ScrollFloat';

interface DoubleCarouselProps {
    mediaItems: IGallery[];
    onItemClick: (originalIndex: number) => void; 
}

const DoubleCarousel: React.FC<DoubleCarouselProps> = ({ mediaItems, onItemClick }) => {
    
    const duplicatedItems: IGallery[] = [...mediaItems, ...mediaItems]; 

    const topRow = duplicatedItems
        .map((item, index) => ({ ...item, originalIndex: index % mediaItems.length }))
        .filter((_, index) => index % 2 === 0);
        
    const bottomRow = duplicatedItems
        .map((item, index) => ({ ...item, originalIndex: index % mediaItems.length }))
        .filter((_, index) => index % 2 !== 0);


    const renderCarouselRow = (items: (IGallery & { originalIndex: number })[]) => (
        <div className="carousel-track"> 
            {items.map((item, index) => (
                <div 
                    key={`${item.id}-${index}`} 
                    className="cursor-pointer carousel-item" 
                    onClick={() => onItemClick(item.originalIndex)} 
                > 
                    {item.mediaType === 'photo' ? (
                        <div className="media-wrapper">
                            <Image
                                src={item.url}
                                alt={item.altText || `Galería - ${item.id}`}
                                fill 
                                sizes="(max-width: 640px) 100vw, 33vw"
                                style={{ objectFit: 'cover' }}
                                quality={75}
                                priority={false}
                            />
                        </div>
                    ) : (
                        <div className="media-wrapper">
                            <video 
                                src={item.url} 
                                autoPlay 
                                muted 
                                loop 
                                playsInline 
                                className="object-cover w-full h-full" 
                            />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="double-carousel-container">
          <ScrollFloat direction="right" scrollStart="top bottom-=150" animationDuration={1.2}>
            <div className="carousel-wrapper top-row">
                {renderCarouselRow(topRow)}
            </div>
            </ScrollFloat>

            <ScrollFloat direction="left" scrollStart="top bottom-=150" animationDuration={1.2}>
            <div className="carousel-wrapper bottom-row">
                {renderCarouselRow(bottomRow)}
            </div>
            </ScrollFloat>
        </div>
    );
};

export default DoubleCarousel;
