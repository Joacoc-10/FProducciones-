import React from "react";
import Masonry from "./UI/Masonry";
import { gallery } from "@/helpers/Gallery";

const Gallery = () => {
  return (
    <>
      <h1 className="mt-12 text-4xl font-electrolize"> Nuestra galeria</h1>
      <Masonry
        items={gallery}
        ease="power3.out"
        duration={0.6}
        stagger={0.05}
        animateFrom="bottom"
        scaleOnHover={true}
        hoverScale={0.95}
        blurToFocus={true}
        colorShiftOnHover={false}
      />
    </>
  );
};

export default Gallery;
