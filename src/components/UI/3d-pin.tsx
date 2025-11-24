"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs/utils";
import Link from "next/link";


export const PinContainer = ({
  children,
  title,
  href,
  className,
  containerClassName,
}: {
  children: React.ReactNode;
  title?: string;
  href?: string;
  className?: string;
  containerClassName?: string;
}) => {
  const [transform, setTransform] = useState(
    "translate(-50%,-50%) rotateX(0deg)"
  );
  const [hovered, setHovered] = useState(false);

  const onMouseEnter = () => {
    setTransform("translate(-50%,-50%) rotateX(40deg) scale(0.8)");
    setHovered(true); 
  };
  const onMouseLeave = () => {
    setTransform("translate(-50%,-50%) rotateX(0deg) scale(1)");
    setHovered(false); 
  };

  return (
    <a
      className={cn(
        "relative group/pin z-50  cursor-pointer ",
        containerClassName
      )}
      href={href || "/"}
    >
      <div
        style={{
          perspective: "1000px",
          transform: "rotateX(70deg) translateZ(0deg)",
        }}
        className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
      >
        <div
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          style={{
            transform: transform,
          }}
          className="absolute left-1/2 p-4 top-1/2  flex justify-start items-start  rounded-2xl  shadow-[0_8px_16px_rgb(0_0_0/0.4)] card-dark transition duration-700 overflow-hidden "
        >
          <div className={cn(" relative z-50 ", className)}>{children}</div>
        </div>
      </div>
      
      <PinPerspective title={title} href={href} hovered={hovered} /> 
    </a>
  );
};


export const PinPerspective = ({
  title,
  href,
  hovered, 
}: {
  title?: string;
  href?: string;
  hovered: boolean; 
}) => {
  return (
    <motion.div className={cn(
        "pointer-events-none w-96 h-80 flex items-center justify-center z-[60] transition duration-500",
        hovered ? "opacity-100" : "opacity-0"
      )}>
      <div className="inset-0 flex-none w-full h-full -mt-7">
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <Link
            href=""
            target={"_blank"}
            className="relative flex space-x-2 items-center z-10 rounded-full card-dark py-0.5 px-4 ring-1 ring-white/10 "
          >
            <span className="relative z-20 text-white-fp-300 text-sm font-bold inline-block py-0.5 font-inter">
              {title}
            </span>
            
            <span className={cn(
                "absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500",
                hovered ? "opacity-40" : "opacity-0"
            )}></span>
          </Link>
        </div>

        <div
          style={{
            perspective: "1000px",
            transform: "rotateX(70deg) translateZ(0)",
          }}
          className="absolute left-1/2 top-1/2 ml-[0.09375rem] mt-4 -translate-x-1/2 -translate-y-1/2"
        >
        </div>

        <>
          <motion.div className={cn("absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-red-fp-500 translate-y-[14px] w-px blur-[2px] transition-all duration-500", hovered ? "h-40" : "h-20")} />
          <motion.div className={cn("absolute right-1/2 bottom-1/2 bg-gradient-to-b from-transparent to-red-fp-500 translate-y-[14px] w-px transition-all duration-500", hovered ? "h-40" : "h-20")} />
          <motion.div className="absolute right-1/2 translate-x-[1.5px] bottom-1/2 bg-red-fp-300 translate-y-[14px] w-[4px] h-[4px] rounded-full z-40 blur-[3px]" />
          <motion.div className="absolute right-1/2 translate-x-[0.5px] bottom-1/2 bg-red-fp-300 translate-y-[14px] w-[2px] h-[2px] rounded-full z-40 " />
        </>
      </div>
    </motion.div>
  );
};
