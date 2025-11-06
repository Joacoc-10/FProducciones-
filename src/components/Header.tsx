import React from "react"

const Header = () => {

  return (
<>
<div className="relative w-full overflow-hidden h-[800px] border-b border-white-fp-300 border-opacity-20">
    <video className="absolute top-0 left-0 object-cover w-full h-full" playsInline autoPlay muted loop poster="https://ik.imagekit.io/i1pxujmp5t/FProducciones/4043976-hd_1920_1080_24fps.mp4?updatedAt=1762096509193">
        <source src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/4043976-hd_1920_1080_24fps.mp4?updatedAt=1762096509193" type="video/mp4" />
        {/* <source src="tu-video.webm" type="video/webm" /> */}
        Tu navegador no soporta el video.
    </video>
    
    <div className="absolute inset-0 bg-black-fp-500/70"></div>

    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 text-white-fp-300">
        
        <h1 className="mb-4 text-4xl font-bold text-center md:text-6xl">
            Fabio Producciones: 
        </h1>
        <h2 className="mt-4 text-2xl font-bold text-center md:text-4xl">audio,luces y escenario</h2>
        
        <p className="max-w-2xl mt-12 text-xl text-center">
            Tu evento, con el mejor sonido e iluminación.
        </p>
        
        <a href="#contacto" 
           className="px-8 py-3 mt-24 font-bold tracking-wider uppercase transition duration-300 rounded-lg shadow-lg bg-red-fp-600 text-white-fp-200 hover:bg-red-fp-700">
            Solicitar Presupuesto
        </a>
    </div>
</div>
</>
  );
}

export default Header;
