import React from "react";

// Datos de las tarjetas
const services = [
  {
    title: "Audio",
    videoUrl: "https://ik.imagekit.io/i1pxujmp5t/FProducciones/120954-724685298_small.mp4?updatedAt=1762287887837", 
    alt: "Video de Sistemas de Audio y Consolas",
  },
  {
    title: "Luces",
    videoUrl: "https://ik.imagekit.io/i1pxujmp5t/FProducciones/12972958_3840_2160_30fps.mp4?updatedAt=1762289024709", 
    alt: "Video de Iluminación y Efectos",
  },
  {
    title: "Escenario",
    videoUrl: "https://ik.imagekit.io/i1pxujmp5t/FProducciones/2941128-uhd_4096_2160_24fps.mp4?updatedAt=1762289226117",
    alt: "Video de Montaje de Estructuras y Escenarios",
  },
];

const OVERLAY_CLASS = 'absolute inset-0 bg-black-fp-900 bg-opacity-70 transition-all duration-700 ease-out group-hover:bg-opacity-0';

const AboutUs = () => {
  return (
    <section className="px-4 py-16 md:px-8">
      
      {/* 🎯 SECCIÓN DE TÍTULO Y TEXTO INTRODUCTORIO */}
      <div className="max-w-6xl mx-auto mb-12">
        <h1 className="mb-4 text-4xl font-extrabold tracking-wider uppercase text-white-fp-300">
          Quienes Somos?
        </h1>
        <p className="text-lg leading-relaxed text-white-fp-300">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Officiis illum eos libero ex, molestiae odio eius dolore deserunt consectetur nihil vel autem laborum rem illo blanditiis suscipit ipsa repudiandae repellendus. Quidem at asperiores alias nam. Porro tempora illum esse quidem eum molestias praesentium aliquam commodi hic deleniti beatae aut, officiis nobis eius.
        </p>
      </div>

      {/* 🎯 SECCIÓN DE TARJETAS DE SERVICIO */}
      <div className="grid max-w-6xl grid-cols-1 gap-6 mx-auto md:grid-cols-3">
        {services.map((service, index) => (
          <div
            key={index}
            className="relative overflow-hidden transition-all duration-500 border-2 shadow-2xl cursor-pointer group h-96 rounded-xl border-dark-gray-fp-500 hover:border-red-fp-700/90"
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

            {/* 2. Overlay que Desaparece (Efecto de Difuminado) */}
            <div className={OVERLAY_CLASS} aria-hidden="true"></div>

            {/* 3. Contenido de la Tarjeta (Título) */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <h2
                // La clase `opacity-0` en el hover hará que el texto desaparezca
                className="z-10 text-4xl font-black tracking-widest uppercase transition-opacity duration-500 ease-out text-white-fp-100 group-hover:opacity-0"
              >
                {service.title}
              </h2>
            </div>
            
            {/* 4. Overlay de Acento Rojo (Opcional, para indicar que el video es visible) */}
             <div className="absolute inset-x-0 bottom-0 h-1 transition-transform duration-500 ease-out origin-left scale-x-0 bg-red-fp-700/90 group-hover:scale-x-100"></div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default AboutUs;
