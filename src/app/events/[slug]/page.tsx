import { BackgroundLines } from "@/components/UI/background-lines";
import InfiniteScrollGallery from "@/components/UI/InfiniteScrollGallery";
import Navbar from "@/components/UI/Navbar/Navbar";
import { events } from "@/helpers/Events";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return events.map((service) => ({
    slug: service.id.toString(),
  }));
}

export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;

  const service = events.find(
    (s) => s.id.toLowerCase() === decodeURIComponent(slug).toLowerCase()
  );

  if (!service) {
    notFound();
  }

  const hasMedia = service.mediaGallery && service.mediaGallery.length > 0;

  return (
    <BackgroundLines>
      <Navbar />
      <main className="min-h-screen px-6 py-48 text-white-fp-100">
        <article className="relative max-w-5xl mx-auto overflow-visible border shadow-xl border-gray-700/50 rounded-2xl">
          <h1 className="absolute top-0 left-0 z-20 px-6 py-2 text-3xl font-extrabold tracking-wide text-black rounded-r-lg rounded-tl-lg shadow-xl bg-red-fp-600 font-electrolize">
            {service.title}
          </h1>

          <div className="p-8 pt-16">
            <h2 className="mb-3 text-2xl font-bold text-white-fp-400 font-electrolize">
              Detalles del Servicio Técnico
            </h2>
            <p className="mb-6 text-lg whitespace-pre-line text-white-fp-500 font-inter">
              {service.fullDescription}
            </p>

            <section className="pt-4 mt-10 border-t border-gray-700/50">
              <h3 className="text-xl font-semibold text-white-fp-400 font-electrolize">
                La Base de Nuestra Oferta:
              </h3>
              <ul className="mt-2 ml-4 space-y-1 list-disc list-inside text-white-fp-600 font-inter">
                <li>Sistemas de Audio Profesionales</li>
                <li>Diseño y Montaje de Luces</li>
                <li>Escenario Portátil</li>
                <li>Técnicos en Audio y Sonido</li>
                <li>Servicio de DJ (Opcional)</li>
              </ul>
            </section>

            {/* Galería */}
            {hasMedia && (
              <div className="py-6 my-6 border-t border-b border-gray-700/50">
                <InfiniteScrollGallery
                  mediaGallery={service.mediaGallery}
                  durationSeconds={110}
                />
              </div>
            )}
          </div>
        </article>
      </main>
    </BackgroundLines>
  );
}
