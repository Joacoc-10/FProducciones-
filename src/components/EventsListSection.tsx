"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { events } from "@/helpers/Events";
import { IEvents } from "@/types/Events";
import EventsModal from "./EventsModal";
import CardSwap, { Card } from "./UI/CardSwap";
import Image from "next/image";
import EventsCardSwap from "./EventsCardSwap";

export default function EventsListSection() {
  const router = useRouter();
  const pathname = usePathname(); // Detecta la URL actual
  const [selectedService, setSelectedService] = useState<IEvents | null>(null);

  // 🔁 Si el usuario entra directo a /events/Algo, abrimos el modal correspondiente
  useEffect(() => {
    const match = pathname.match(/^\/events\/(.+)/);
    if (match) {
      const slug = decodeURIComponent(match[1]);
      const found = events.find(
        (s) => s.id.toLowerCase() === slug.toLowerCase()
      );
      if (found) {
        queueMicrotask(() => setSelectedService(found));
      }
    } else {
      // Si salimos de /events/slug, cerramos modal
      queueMicrotask(() => setSelectedService(null));
    }
  }, [pathname]);

  // 💡 Cuando abres un servicio
  const handleOpenService = (service: IEvents) => {
    setSelectedService(service);
    router.push(`/events/${encodeURIComponent(service.id)}`, { scroll: false });
  };

  // 💡 Cuando cierras el modal
  const handleClose = () => {
    setSelectedService(null);
    router.push("/", { scroll: false }); // vuelve a la landing
  };

  return (
    <section className="container px-4 py-24 mx-auto" id="Events">
      <h1 className="mb-10 text-5xl font-extrabold text-white-fp-300 font-electrolize">
        Nuestros servicios
      </h1>

      {/* Seccion de cartas moviles con Servicios */}
      <EventsCardSwap />

      {/* Cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {events.map((service) => (
          <div
            key={service.id}
            onClick={() => handleOpenService(service)}
            className="block p-5 transition duration-300 bg-white border rounded-lg shadow-md cursor-pointer hover:shadow-xl hover:scale-[1.02] card-dark"
          >
            <h3 className="mb-2 text-xl font-semibold text-white-fp-400 font-electrolize">
              {service.title}
            </h3>
            <p className="mb-4 text-gray-600 font-inter">
              {service.shortDescription}
            </p>
            <span className="text-sm font-medium font-inter text-red-fp-600">
              Ver detalles técnicos →
            </span>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedService && (
          <EventsModal service={selectedService} onClose={handleClose} />
        )}
      </AnimatePresence>
    </section>
  );
}
