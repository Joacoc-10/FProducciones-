import { IEvents } from "@/types/Events";
import { motion} from "framer-motion";
import { BackgroundLines } from "./UI/background-lines";
import InfiniteScrollGallery from "./UI/InfiniteScrollGallery";

interface ServiceModalProps {
  service: IEvents;
  onClose: () => void;
}

function EventsModal({ service, onClose }: ServiceModalProps) {

  const hasMedia = service.mediaGallery && service.mediaGallery.length > 0;
  
  return (
    <>
    
    <motion.div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md pt-32"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
        <BackgroundLines
        className="absolute inset-0 w-full h-full bg-black/90 backdrop-blur-lg"
        svgOptions={{ duration: 12 }}
      />
      {/* Modal Content */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-full max-w-5xl p-8 overflow-y-auto card-dark rounded-2xl shadow-2xl max-h-[90vh]"
      >
       
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute text-2xl text-gray-500 top-4 right-4 hover:text-red-500"
        >
          ✕
        </button>

        {/* Contenido */}
        <h1 className="mb-4 text-4xl font-extrabold text-red-fp-500/90 font-electrolize">
          {service.title}
        </h1>

        <h2 className="mb-3 text-2xl font-bold text-white-fp-400 font-electrolize">
          Detalles del Servicio Técnico
        </h2>
        <p className="mb-6 text-lg text-white-fp-500 font-inter">{service.fullDescription}</p>
       
        <div className="pt-4 mt-10 border-t border-gray-700/50">
          <h3 className="text-xl font-semibold text-white-fp-400 font-electrolize">
            La Base de Nuestra Oferta:
          </h3>
          <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-white-fp-600 font-inter">
            <li>Sistemas de Audio Profesional</li>
            <li>Diseño y Montaje de Luces</li>
            <li>Instalación de Escenario Portátil</li>
            <li>Operación por Técnicos de Sonido</li>
            <li>Servicio de DJ (Opcional)</li>
          </ul>
        </div>

        {hasMedia && (
            <div className="py-6 my-6 border-t border-b border-gray-700/50">
                <InfiniteScrollGallery mediaGallery={service.mediaGallery} durationSeconds={110} />
            </div>
        )}
      </motion.div>
    </motion.div>
    </>
  );
}

export default EventsModal;