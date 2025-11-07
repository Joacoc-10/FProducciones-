import { IEvents } from "@/types/Events";
import { motion} from "framer-motion";

interface ServiceModalProps {
  service: IEvents;
  onClose: () => void;
}

function EventsModal({ service, onClose }: ServiceModalProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Modal Content */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className="relative w-full max-w-5xl p-8 overflow-y-auto bg-white rounded-2xl shadow-2xl max-h-[90vh]"
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute text-2xl text-gray-500 top-4 right-4 hover:text-red-500"
        >
          ✕
        </button>

        {/* Contenido */}
        <h1 className="mb-4 text-4xl font-extrabold text-blue-700">
          {service.title}
        </h1>
        <p className="mb-6 text-lg text-gray-600">{service.shortDescription}</p>

        <h2 className="mb-3 text-2xl font-bold text-gray-800">
          Detalles del Servicio Técnico
        </h2>
        <p className="leading-relaxed text-gray-700 whitespace-pre-line">
          {service.fullDescription}
        </p>

        <div className="pt-4 mt-10 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">
            La Base de Nuestra Oferta:
          </h3>
          <ul className="mt-2 ml-4 space-y-1 text-gray-600 list-disc list-inside">
            <li>Sistemas de Audio Profesional</li>
            <li>Diseño y Montaje de Luces</li>
            <li>Instalación de Escenario Portátil</li>
            <li>Operación por Técnicos de Sonido</li>
            <li>Servicio de DJ (Opcional)</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default EventsModal;