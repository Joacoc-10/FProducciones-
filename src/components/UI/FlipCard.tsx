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
          className="absolute inset-0 w-full h-full p-5 rounded-xl backface-hidden bg-black-fp-800"
          style={{
            backfaceVisibility: "hidden",
            zIndex: backZIndex,
            transform: "rotateY(180deg) translateZ(0.01px)",
          }}
        >
          <div className="absolute top-0 z-20 transform -translate-x-1/2 translate-y-0 left-1/2">
            <h3 className="px-6 py-2 text-xl font-extrabold tracking-wide uppercase shadow-xl text-black-fp-800 bg-red-fp-600 rounded-b-xl font-electrolize whitespace-nowrap">
              {service.title}
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center mt-12 text-center items">
            <p className="mt-6 text-base font-normal text-white-fp-400 font-inter">
              {service.shortDescription}
            </p>
          </div>
          <span className="absolute text-sm font-bold font-electrolize text-red-fp-500 bottom-3 right-4 hover:text-red-fp-600">
            Ver detalles →
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
