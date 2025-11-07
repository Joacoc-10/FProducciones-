"use client";

import { useRouter } from "next/navigation";
import { events } from "@/helpers/Events";

export default function EventModal({ params }: { params: { slug: string } }) {
  const router = useRouter();

  const event = events.find(
    (e) => e.id.toLowerCase() === decodeURIComponent(params.slug).toLowerCase()
  );

  if (!event) return null;

  const closeModal = () => router.back();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-[90%] max-w-3xl bg-black-fp-300 text-white rounded-2xl shadow-xl p-8 animate-fadeIn">
        <button
          onClick={closeModal}
          className="absolute text-2xl text-gray-400 top-3 right-3 hover:text-white"
        >
          ✕
        </button>

        <h1 className="mb-4 text-3xl font-bold text-red-fp-600">
          {event.title}
        </h1>

        <p className="mb-4 text-gray-300">{event.shortDescription}</p>
        <p className="leading-relaxed text-gray-400">
          {event.fullDescription}
        </p>
      </div>
    </div>
  );
}
