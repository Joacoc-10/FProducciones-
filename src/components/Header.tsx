import React from "react"

const Header = () => {

  return (
<>
<div className="relative w-full overflow-hidden h-[600px]">
    <video className="absolute top-0 left-0 object-cover w-full h-full" playsInline autoPlay muted loop poster="https://ik.imagekit.io/i1pxujmp5t/FProducciones/4043976-hd_1920_1080_24fps.mp4?updatedAt=1762096509193">
        <source src="https://ik.imagekit.io/i1pxujmp5t/FProducciones/4043976-hd_1920_1080_24fps.mp4?updatedAt=1762096509193" type="video/mp4" />
        {/* <source src="tu-video.webm" type="video/webm" /> */}
        Tu navegador no soporta el video.
    </video>
    
    <div className="absolute inset-0 bg-black/50"></div>

    <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-4 text-white">
        
        <h1 className="mb-4 text-4xl font-bold text-center md:text-6xl">
            Fabio Producciones: audio , luces y escenario
        </h1>
        
        <p className="max-w-2xl mb-8 text-xl text-center">
            Creamos la atmósfera perfecta para tu evento, concierto o fiesta.
        </p>
        
        <a href="#contacto" 
           className="px-8 py-3 font-bold tracking-wider text-white uppercase transition duration-300 bg-[#B20000] rounded-lg shadow-lg hover:bg-[#990000]">
            Solicitar Presupuesto
        </a>
    </div>
</div>
</>
  );
}

export default Header;
