"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { events } from "@/helpers/Events";
import { IEvents } from "@/types/Events";
import EventsModal from "./EventsModal";
import ScrollFloat from "./UI/ScrollFloat";
import FlipCard from "./UI/FlipCard";

export default function EventsListSection() {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedService, setSelectedService] = useState<IEvents | null>(null);

  const targetCardsRef = useRef<HTMLDivElement>(null);

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
      queueMicrotask(() => setSelectedService(null));
    }
  }, [pathname]);

  const handleOpenService = (service: IEvents) => {
    targetCardsRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setTimeout(() => {
      setSelectedService(service);
      router.push(`/events/${encodeURIComponent(service.id)}`, {
        scroll: false,
      });
    }, 500);
  };

  const handleClose = () => {
    setSelectedService(null);
    router.push("/", { scroll: false });
  };

  return (
    <section className="container px-4 py-24 mx-auto max-w-7xl" id="Events">
      <ScrollFloat direction="left">
        <h1 className="mb-10 text-4xl font-semibold text-center uppercase text-white-fp-300 font-electrolize md:text-start">
          Nuestros servicios
        </h1>
      </ScrollFloat>

      {/* Seccion de las cartas fijas */}
      <ScrollFloat direction="right">
        <div
          ref={targetCardsRef}
          className="relative z-20 grid justify-center grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 justify-items-center "
        >
          {events.map((service) => (
            <FlipCard
              key={service.id}
              service={service}
              onClick={handleOpenService}
            />
          ))}
        </div>
      </ScrollFloat>

      {/* Modal Overlay */}
      <AnimatePresence>
        {selectedService && (
          <EventsModal service={selectedService} onClose={handleClose} />
        )}
      </AnimatePresence>
    </section>
  );
}
