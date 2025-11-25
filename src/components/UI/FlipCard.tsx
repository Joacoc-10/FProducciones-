"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { IEvents } from "@/types/Events";

interface FlipCardProps {
  service: IEvents;
  onClick: (service: IEvents) => void;
}

const FlipCard: React.FC<FlipCardProps> = ({ service, onClick }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleMouseEnter = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsFlipped(true);
    }
  };

  const handleMouseLeave = () => {
    if (typeof window !== "undefined" && window.innerWidth >= 768) {
      setIsFlipped(false);
    }
  };

  const handleCardClick = () => {
    if (typeof window === "undefined") return;

    if (window.innerWidth < 768) {
      if (isFlipped) {
        onClick(service);
      } else {
        handleFlip();
      }
    } else {
      onClick(service);
    }
  };

  const frontZIndex = isFlipped ? 0 : 1;
  const backZIndex = isFlipped ? 1 : 0;

  return (
    <div
      className="relative w-full border cursor-pointer perspective-1000 h-80 rounded-xl card-dark"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        initial={{ rotateY: 0, z: 0.01 }}
        animate={{ rotateY: isFlipped ? 180 : 0, z: 0.01 }}
        transition={{
          duration: 0.6,
          type: "spring",
          stiffness: 100,
          damping: 15,
        }}
      >
        {/* --- CARA FRONTAL (IMAGEN Y TÍTULO) --- */}
        <div
          className="absolute inset-0 w-full h-full overflow-hidden shadow-xl rounded-xl backface-hidden"
          style={{ backfaceVisibility: "hidden", zIndex: frontZIndex }}
        >
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/50 ">
            <h3 className="p-2 text-2xl font-black text-center text-white uppercase border rounded-xl font-electrolize backdrop-blur-md drop-shadow-lg">
              {service.title}
            </h3>
          </div>
        </div>

        {/* --- CARA TRASERA (INFORMACIÓN) --- */}
        <div
          className="absolute inset-0 w-full h-full p-5 border border-gray-200 rounded-xl backface-hidden bg-white-fp-100"
          style={{
            backfaceVisibility: "hidden",
            zIndex: backZIndex,
            transform: "rotateY(180deg) translateZ(0.01px)",
          }}
        >
          <div className="flex flex-col items-center justify-center text-center items ">
            <div>
              <h3 className="mb-2 text-xl font-semibold text-red-fp-500/90 font-electrolize">
                {service.title}
              </h3>
              <p className="mt-6 text-base text-black-fp-900 font-inter">
                {service.shortDescription}
              </p>
            </div>
            <span className="absolute text-sm font-medium font-inter text-red-fp-500 bottom-3 right-4 hover:text-red-fp-600">
              Ver detalles →
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
