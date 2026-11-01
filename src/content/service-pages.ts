import type { Service } from "./services";
import type { EventSlug } from "./events";

export type ServicePageSlug = "alquiler-de-sonido" | "alquiler-de-luces" | "alquiler-de-escenario-portatil";

export interface ServicePage {
  slug: ServicePageSlug;
  /** Canal de services.ts al que corresponde (imagen, canal, prefill del formulario) */
  serviceId: Service["id"];
  /** Segmento del <title>; la marca la agrega el template */
  seoTitle: string;
  seoDescription: string;
  /** Texto corto para enlaces internos */
  linkLabel: string;
  h1: string;
  tagline: string;
  intro: string;
  /** Nombre del servicio para datos estructurados */
  schemaName: string;
  planningTitle: string;
  planning: string[];
  /** Tipos de evento donde se usa, con una frase propia de cada uno */
  uses: { slug: EventSlug; text: string }[];
  combineText: string;
}

/**
 * Texto de planificación: describe qué se define con el cliente, sin afirmar equipamiento, marcas,
 * potencias, medidas ni capacidades. Cuando el propietario confirme esos datos, se pueden sumar acá.
 */
export const servicePages: ServicePage[] = [
  {
    slug: "alquiler-de-sonido",
    serviceId: "audio",
    seoTitle: "Alquiler de sonido para eventos",
    seoDescription:
      "Alquiler de sonido y equipos de audio para bodas, fiestas de 15, cumpleaños y eventos en Maldonado y Canelones. Contanos tu evento y pedí presupuesto.",
    linkLabel: "Alquiler de sonido",
    h1: "Alquiler de sonido para eventos",
    tagline: "Que se escuche bien, en cada rincón.",
    intro:
      "Alquilamos sonido y equipos de audio para que la música, las voces y los discursos de tu evento se escuchen con claridad. Dimensionamos el equipo según el lugar y la cantidad de invitados, y lo llevamos y armamos donde se hace la fiesta.",
    schemaName: "Alquiler de sonido y equipos de audio para eventos",
    planningTitle: "Qué definimos con vos para armar el sonido",
    planning: [
      "El lugar: un salón cerrado, una quinta o una casa piden soluciones distintas a un espacio al aire libre.",
      "Cuántos invitados son y cómo se reparten por el espacio.",
      "Qué va a sonar: música grabada, DJ, banda u orquesta en vivo, ceremonia o discursos.",
      "Si hay voces o instrumentos en vivo, qué necesitan los artistas para coordinarlo con el sonido de sala.",
      "Los horarios de montaje y de prueba antes de que lleguen los invitados.",
    ],
    uses: [
      { slug: "bodas", text: "ceremonia, brindis y pista, cada momento con su nivel de sonido." },
      { slug: "cumpleanos-y-15", text: "entrada, vals y baile, con música clara para toda la fiesta." },
      { slug: "fiestas-privadas", text: "desde una reunión tranquila hasta una fiesta que se estira hasta la madrugada." },
      { slug: "corporativos", text: "presentaciones, lanzamientos y cenas donde el mensaje tiene que entenderse." },
      { slug: "espectaculos", text: "sonido coordinado con lo que necesita cada artista." },
    ],
    combineText:
      "El sonido funciona mejor junto con la luz y, si hay artistas en vivo, con un escenario. Podés pedir los tres en un mismo presupuesto.",
  },
  {
    slug: "alquiler-de-luces",
    serviceId: "luces",
    seoTitle: "Alquiler de luces para fiestas y eventos",
    seoDescription:
      "Alquiler de luces e iluminación para bodas, fiestas de 15 y eventos en Maldonado y Canelones: ambientá el salón y marcá los momentos. Pedí presupuesto.",
    linkLabel: "Alquiler de luces",
    h1: "Alquiler de luces para fiestas y eventos",
    tagline: "La luz que marca cada momento.",
    intro:
      "Alquilamos iluminación para ambientar el espacio, marcar los momentos importantes del evento y vestir el escenario. Armamos la propuesta según el lugar y el clima que querés lograr, y la instalamos en el evento.",
    schemaName: "Alquiler de luces e iluminación para eventos",
    planningTitle: "Qué definimos con vos para armar la iluminación",
    planning: [
      "El espacio: si es un salón, una quinta o un lugar abierto, y qué tan oscuro queda a la hora del evento.",
      "Los momentos que querés destacar: la entrada, el brindis, el vals, la pista de baile o una presentación.",
      "El clima que imaginás, más íntimo y cálido o más de fiesta.",
      "Si hay escenario o artistas, para que la luz acompañe lo que pasa arriba.",
      "Dónde y cuándo se puede instalar, para coordinar el montaje.",
    ],
    uses: [
      { slug: "bodas", text: "una luz para la ceremonia y otra para la fiesta." },
      { slug: "cumpleanos-y-15", text: "protagonismo para la entrada, el baile y las fotos." },
      { slug: "fiestas-privadas", text: "ambiente para la pista en casas, quintas y salones." },
      { slug: "corporativos", text: "una escena sobria que le dé jerarquía a la presentación." },
      { slug: "espectaculos", text: "iluminación coordinada con la puesta del show." },
    ],
    combineText:
      "La iluminación luce más con buen sonido y, si hay show en vivo, con un escenario donde ponerla en valor. Podés pedir los tres en un mismo presupuesto.",
  },
  {
    slug: "alquiler-de-escenario-portatil",
    serviceId: "escenario",
    seoTitle: "Alquiler de escenario portátil para eventos",
    seoDescription:
      "Alquiler de escenario portátil y plegable para bodas, fiestas y shows en Maldonado y Canelones. Lo trasladamos y armamos donde se hace tu evento.",
    linkLabel: "Alquiler de escenario portátil",
    h1: "Alquiler de escenario portátil",
    tagline: "Un lugar para que suba el show.",
    intro:
      "Nuestro escenario es una plataforma portátil y plegable: se traslada y se arma donde se hace el evento, ya sea una banda, un DJ, una orquesta o una presentación. Sumalo al sonido y las luces, o pedilo por separado.",
    schemaName: "Alquiler de escenario portátil para eventos",
    planningTitle: "Qué definimos con vos para armar el escenario",
    planning: [
      "El lugar y el espacio disponible, y por dónde se puede llegar para descargar y armar.",
      "Qué va a haber arriba: banda, DJ, orquesta, presentadores o un momento de protagonismo para la agasajada.",
      "Cuántas personas van a subir, para confirmar la configuración adecuada.",
      "Si va junto con sonido y luces, para que todo quede coordinado.",
      "El horario de montaje, para que esté listo antes de que lleguen los invitados.",
    ],
    uses: [
      { slug: "bodas", text: "un lugar para la banda, la orquesta o el DJ." },
      { slug: "cumpleanos-y-15", text: "para que la agasajada sea la estrella." },
      { slug: "fiestas-privadas", text: "un pequeño escenario para una presentación o un show en vivo." },
      { slug: "corporativos", text: "presentaciones y lanzamientos con jerarquía." },
      { slug: "espectaculos", text: "la plataforma es parte de la puesta de cada show." },
    ],
    combineText:
      "Un escenario sin sonido ni luz queda a medias. Podés pedir los tres en un mismo presupuesto y los coordinamos para que armen un solo show.",
  },
];

export const servicePageBySlug = (slug: string) => servicePages.find((s) => s.slug === slug);
export const servicePageForService = (id: Service["id"]) => servicePages.find((s) => s.serviceId === id)!;
