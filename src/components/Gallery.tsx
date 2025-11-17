import React from "react";
import Masonry from "./UI/Masonry";
import { gallery } from "@/helpers/Gallery";
import ScrollFloat from "./UI/ScrollFloat";

const Gallery = () => {
  return (
    <>
      <ScrollFloat>
        <div className="mx-auto mb-24 max-w-7xl" id="Gallery">
          <h1 className="mt-12 text-5xl font-electrolize"> Nuestra galeria</h1>

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
        </div>
      </ScrollFloat>
    </>
  );
};

export default Gallery;
