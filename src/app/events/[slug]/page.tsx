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
export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  console.log("🪵 slug recibido:", slug);
  console.log("🪵 events disponibles:", events.map((e) => e.id));

  // Buscar el evento correspondiente
  const service: IEvents | undefined = events.find(
    (s) => s.id.toLowerCase() === decodeURIComponent(slug).toLowerCase()
  );

  if (!service) {
    console.warn("⚠️ No se encontró servicio con slug:", slug);
    notFound();
  }

  return (
    <>
    <Navbar/>
    <main className="min-h-screen px-6 py-48 bg-black-fp-200 text-white-fp-100">
      <article className="max-w-4xl p-10 mx-auto shadow-xl bg-black-fp-300 rounded-2xl">
        <h1 className="mb-6 text-4xl font-extrabold md:text-5xl text-red-fp-600">
          {service.title}
        </h1>

        {service.shortDescription && (
          <p className="mb-8 text-lg text-gray-300">
            {service.shortDescription}
          </p>
        )}

        <h2 className="mb-3 text-2xl font-bold text-blue-500">
          Descripción del Servicio
        </h2>
        <p className="mb-8 leading-relaxed text-gray-200 whitespace-pre-line">
          {service.fullDescription}
        </p>

        <section className="pt-6 mt-10 border-t border-gray-600">
          <h3 className="mb-2 text-xl font-semibold text-gray-100">
            La Base de Nuestra Oferta:
          </h3>
          <ul className="space-y-1 text-gray-400 list-disc list-inside">
            <li>Sistemas de Audio Profesional</li>
            <li>Diseño y Montaje de Luces</li>
            <li>Instalación de Escenario Portátil</li>
            <li>Operación por Técnicos de Audio y Sonido</li>
            <li>Servicio de DJ (Opcional)</li>
          </ul>
        </section>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 font-semibold transition-all rounded-lg bg-red-fp-600 hover:bg-red-fp-700 text-white-fp-100"
          >
            ← Volver al inicio
          </Link>
        </div>
      </article>
    </main>
    </>
  );
}
