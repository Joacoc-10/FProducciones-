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
    <div>
      <div>
        <button onClick={closeModal}>✕</button>

        <h1>{event.title}</h1>

        <p>{event.fullDescription}</p>
      </div>
    </div>
  );
}
