import { BackgroundLines } from "@/components/UI/background-lines";
import InfiniteScrollGallery from "@/components/UI/InfiniteScrollGallery";
import Navbar from "@/components/UI/Navbar/Navbar";
import { events } from "@/helpers/Events";
import { IEvents } from "@/types/Events";
import Link from "next/link";
import { notFound } from "next/navigation";

interface EventDetailPageProps {
  params: {
    slug: string;
  };
}

// ✅ Genera las rutas estáticas en build time
export async function generateStaticParams() {
  return events.map((service) => ({
    slug: service.id.toString(),
  }));
}

// ✅ Página dinámica para cada evento
export default async function EventDetailPage({
  params,
}: EventDetailPageProps) {
  const { slug } = await params;

  const service: IEvents | undefined = events.find(
    (s) => s.id.toLowerCase() === decodeURIComponent(slug).toLowerCase()
  );

  if (!service) {
    notFound();
  }

  const hasMedia = service.mediaGallery && service.mediaGallery.length > 0;

  return (
    <>
      <BackgroundLines>
        <Navbar />
        {/* Usamos py-32 o py-48 para dejar espacio debajo del navbar fijo. */}
        <main className="min-h-screen px-6 py-48 text-white-fp-100 ">
          <article 
            // Aplicamos las mismas clases visuales (card-dark, rounded-2xl, shadow-xl)
            className="max-w-5xl p-8 mx-auto shadow-xl card-dark rounded-2xl"
          >
            {/* Título (igual que el modal) */}
            <h1 className="mb-4 text-4xl font-extrabold md:text-5xl text-red-fp-500/90 font-electrolize">
              {service.title}
            </h1>

            {/* Subtítulo y Descripción (igual que el modal) */}
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
                <li>Sistemas de Audio Profesional</li>
                <li>Diseño y Montaje de Luces</li>
                <li>Instalación de Escenario Portátil</li>
                <li>Operación por Técnicos de Audio y Sonido</li>
                <li>Servicio de DJ (Opcional)</li>
              </ul>
            </section>
            

             {/* Galería de Scroll (igual que el modal) */}
            {hasMedia && (
              <div className="py-6 my-6 border-t border-b border-gray-700/50">
                <InfiniteScrollGallery
                  mediaGallery={service.mediaGallery}
                  durationSeconds={110}
                />
              </div>
            )}
            

            {/* Botón de navegación (solo en la página dinámica) */}
            <div className="mt-10 text-center">
              <Link
                href="/"
                className="inline-block px-6 py-2 font-semibold transition-all rounded-lg bg-red-fp-600 hover:bg-red-fp-700 text-white-fp-100"
              >
                ← Volver al inicio
              </Link>
            </div>
          </article>
        </main>
      </BackgroundLines>
    </>
  );
}
