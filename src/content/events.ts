export type EventSlug =
  | "bodas"
  | "cumpleanos-y-15"
  | "fiestas-privadas"
  | "corporativos"
  | "espectaculos";

export interface EventType {
  slug: EventSlug;
  /** id usado por las URLs antiguas (/events/:id) para las redirecciones */
  legacyId: string;
  title: string;
  /** Valor que se envía en el formulario */
  formLabel: string;
  tagline: string;
  summary: string;
  body: string[];
  /** Canales RGB de la luz del evento (se aplica como --light) */
  light: string;
  lightName: string;
  mediaId: string;
}

/** Texto sobrio: no se afirman equipamiento, certificaciones ni cifras. */
export const events: EventType[] = [
  {
    slug: "bodas",
    legacyId: "Bodas",
    title: "Bodas",
    formLabel: "Boda",
    tagline: "Cada momento, con su propia luz.",
    summary:
      "Ceremonia, recepción y fiesta con sonido e iluminación pensados para acompañar cada momento.",
    body: [
      "Una boda tiene muchos climas: la ceremonia, el brindis, la pista. El sonido y la luz se ajustan a cada uno para que nada distraiga de lo importante.",
      "Si la fiesta necesita un lugar para la banda, la orquesta o el DJ, podemos sumar el escenario portátil.",
    ],
    light: "232 168 87",
    lightName: "ámbar",
    mediaId: "event.bodas",
  },
  {
    slug: "cumpleanos-y-15",
    legacyId: "CumpleanosDe15",
    title: "Cumpleaños y 15",
    formLabel: "Cumpleaños o 15",
    tagline: "El festejo también merece su show.",
    summary:
      "Pista, luces y un escenario para que el festejo tenga su momento de protagonismo.",
    body: [
      "Un cumpleaños de 15 pide protagonismo: la entrada, el vals, el baile y las fotos. Armamos el sonido y las luces para cada instante, y el escenario para que la agasajada sea la estrella.",
      "También para cumpleaños de cualquier edad: contanos cuántos son y cómo imaginás la fiesta.",
    ],
    light: "214 51 108",
    lightName: "magenta",
    mediaId: "event.cumpleanos-y-15",
  },
  {
    slug: "fiestas-privadas",
    legacyId: "FiestasPrivadas",
    title: "Fiestas privadas",
    formLabel: "Fiesta privada",
    tagline: "Tu casa, tu quinta, tu salón.",
    summary:
      "Sonido y luces a medida para reuniones en casas, quintas y salones.",
    body: [
      "Desde una reunión tranquila hasta una fiesta que se estira hasta la madrugada: dimensionamos el equipo según el lugar y la cantidad de invitados.",
      "Si querés un pequeño escenario para una presentación o un show en vivo, lo sumamos.",
    ],
    light: "139 92 246",
    lightName: "violeta",
    mediaId: "event.fiestas-privadas",
  },
  {
    slug: "corporativos",
    legacyId: "Corporativos",
    title: "Corporativos",
    formLabel: "Evento corporativo",
    tagline: "Cuando el mensaje importa.",
    summary:
      "Presentaciones, lanzamientos y cenas con sonido claro y una escena cuidada.",
    body: [
      "Cuando el mensaje importa, el sonido tiene que ser claro y la escena sobria. Dimensionamos el equipo según el espacio y el formato del evento.",
      "Podemos sumar escenario portátil y luces para dar jerarquía a la presentación.",
    ],
    light: "91 141 239",
    lightName: "azul frío",
    mediaId: "event.corporativos",
  },
  {
    slug: "espectaculos",
    legacyId: "Festivales",
    title: "Espectáculos",
    formLabel: "Espectáculo",
    tagline: "Que el show suba en serio.",
    summary:
      "Sonido, luces y escenario portátil coordinados con lo que cada show necesita.",
    body: [
      "Para shows y espectáculos el escenario es parte de la puesta. Plataforma portátil, sonido e iluminación coordinados con lo que cada artista necesita.",
      "Contanos el formato y los requerimientos del show y armamos la propuesta.",
    ],
    light: "229 50 45",
    lightName: "carmesí",
    mediaId: "event.espectaculos",
  },
];

export const eventBySlug = (slug: string) => events.find((e) => e.slug === slug);
