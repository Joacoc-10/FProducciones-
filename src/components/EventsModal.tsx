import { IEvents } from "@/types/Events";
import { motion } from "framer-motion";
import { BackgroundLines } from "./UI/background-lines";
import InfiniteScrollGallery from "./UI/InfiniteScrollGallery";
import Link from "next/link";

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
        transition={{ duration: 0 }}
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
          className="relative w-full max-w-5xl p-8 pt-20 overflow-y-auto  rounded-2xl shadow-2xl max-h-[90vh] border border-gray-700/50"
        >
          
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
            className="absolute top-0 left-0 z-20 px-6 py-2 text-3xl font-extrabold tracking-wide text-black transform -translate-y-full rounded-r-lg shadow-xl -translate-x-1/4 bg-red-fp-600 rounded-t-xl font-electrolize"
          >
            {service.title}
          </motion.h1>

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            className="absolute z-30 text-2xl text-gray-500 top-4 right-4 hover:text-red-500"
          >
            ✕
          </button>

          <h2 className="mb-3 text-2xl font-bold text-white-fp-400 font-electrolize">
            Detalles del Servicio Técnico
          </h2>
          <p className="mb-6 text-lg text-white-fp-600 font-inter">
            {service.fullDescription}
          </p>

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
              <InfiniteScrollGallery
                mediaGallery={service.mediaGallery}
                durationSeconds={110}
              />
            </div>
          )}

          {/* Botón de Presupuesto */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150, damping: 15 }}
            className="flex justify-center w-full pt-1 mt-6 "
          >
            <Link
              href="#FormSection"
              onClick={onClose}
              className="w-full text-center max-w-sm px-6 py-4 font-extrabold tracking-widest uppercase transition duration-300 rounded-xl shadow-2xl bg-red-fp-600 text-white-fp-200 hover:bg-red-fp-700 hover:scale-[1.02] transform focus:outline-none focus:ring-4 focus:ring-red-fp-500/50 font-electrolize"
            >
              Solicitar Presupuesto
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

export default EventsModal;
