import React from "react";
import ScrollFloat from "./UI/ScrollFloat";
import Link from "next/link";

// Datos de las tarjetas
const services = [
  {
    title: "Audio",
    videoUrl:
      "https://ik.imagekit.io/i1pxujmp5t/FProducciones/120954-724685298_small.mp4?updatedAt=1762287887837",
    alt: "Video de Sistemas de Audio y Consolas",
  },
  {
    title: "Luces",
    videoUrl:
      "https://ik.imagekit.io/i1pxujmp5t/FProducciones/12972958_3840_2160_30fps.mp4?updatedAt=1762289024709",
    alt: "Video de Iluminación y Efectos",
  },
  {
    title: "Escenario",
    videoUrl:
      "https://ik.imagekit.io/i1pxujmp5t/FProducciones/2941128-uhd_4096_2160_24fps.mp4?updatedAt=1762289226117",
    alt: "Video de Montaje de Estructuras y Escenarios",
  },
];

const OVERLAY_CLASS =
  "absolute inset-0 bg-black-fp-900 bg-opacity-70 transition-all duration-700 ease-out group-hover:bg-opacity-0";

const AboutUs = () => {
  return (
    <section className="px-4 py-16 md:px-8" id="AboutUs">
      {/* 🎯 SECCIÓN DE TÍTULO Y TEXTO INTRODUCTORIO */}

      <div className="mx-auto mb-12 max-w-7xl">
        <ScrollFloat>       
           <h1 className="mb-4 text-4xl font-semibold tracking-wider uppercase text-white-fp-300 font-electrolize">
          Quienes Somos?
        </h1>
        </ScrollFloat>

        <ScrollFloat>
        <p className="text-lg leading-relaxed text-white-fp-400 font-inter">
          En Fabio Producciones nos especializamos en ofrecer soluciones
          integrales de audio, iluminación y montaje de escenarios para todo
          tipo de eventos. Con años de experiencia en el rubro, brindamos un
          servicio profesional, confiable y personalizado, adaptado a las
          necesidades de cada cliente.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-white-fp-400 font-inter">
          Contamos con equipamiento de primera calidad y un equipo técnico
          altamente capacitado, garantizando un sonido impecable, iluminación
          profesional y un montaje seguro y estético. Nuestro compromiso es que
          cada evento tenga una experiencia visual y sonora única, cuidando cada
          detalle desde la planificación hasta la ejecución.
        </p>
        </ScrollFloat>
      </div>

      {/* 🎯 SECCIÓN DE TARJETAS DE SERVICIO */}
      <ScrollFloat>
        <Link href="#Gallery">
      <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
        {services.map((service, index) => (
          <div
            key={index}
            className="relative h-48 overflow-hidden transition-all duration-500 shadow-2xl cursor-pointer group rounded-xl card-dark"
          >
            {/* 1. Video de Fondo */}
            <video
              src={service.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
            />

            {/* 2. Overlay que Desaparece (Efecto de Difuminado)*/}
            <div className={OVERLAY_CLASS} aria-hidden="true"></div>

            {/* 3. Contenido de la Tarjeta (Título) */}
            <div className="absolute inset-0 flex items-center justify-center p-4 font-electrolize">
              <h2 className="z-10 p-2 text-3xl font-black tracking-widest uppercase transition-opacity duration-500 ease-out border backdrop-blur-md rounded-xl text-white-fp-100 group-hover:opacity-0">
                {service.title}
              </h2>
            </div>

            {/* 4. Overlay de Acento Rojo*/}
            <div className="absolute inset-x-0 bottom-0 h-1 transition-transform duration-500 ease-out origin-left scale-x-0 bg-red-fp-700/90 group-hover:scale-x-100"></div>
          </div>
        ))}
      </div>
      </Link>
      </ScrollFloat>
    </section>
  );
};

export default AboutUs;
