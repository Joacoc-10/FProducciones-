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
  /** Segmento del <title> (la marca la agrega el template) */
  seoTitle: string;
  seoDescription: string;
  /** Qué conviene contarnos para armar la propuesta de este tipo de evento */
  planning: string[];
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
    seoTitle: "Sonido, luces y escenario para bodas",
    seoDescription:
      "Sonido, iluminación y escenario portátil para bodas en Maldonado y Canelones: ceremonia, brindis y fiesta. Pedí tu presupuesto.",
    planning: [
      "Cuántos invitados son y si la ceremonia y la fiesta son en el mismo lugar.",
      "Los momentos que querés cuidar: la ceremonia, el brindis, el vals y la pista.",
      "Si habrá banda, orquesta o DJ, para saber si hace falta escenario.",
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
    seoTitle: "Sonido y luces para cumpleaños y fiestas de 15",
    seoDescription:
      "Alquiler de sonido, luces y escenario portátil para fiestas de 15 y cumpleaños en Maldonado y Canelones. Contanos tu festejo y pedí presupuesto.",
    planning: [
      "Los momentos de la fiesta: la entrada, el vals, el baile y las fotos.",
      "Cuántos invitados son y dónde se hace el festejo.",
      "Si querés un escenario para la agasajada o para el DJ.",
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
    seoTitle: "Sonido y luces para fiestas privadas",
    seoDescription:
      "Sonido y luces a medida para fiestas privadas en casas, quintas y salones. Sumá un escenario portátil si tu fiesta lo pide.",
    planning: [
      "El lugar: casa, quinta o salón, y si es abierto o cerrado.",
      "Cuántos invitados son y hasta qué hora se extiende la fiesta.",
      "Si vas a tener música en vivo o una presentación, para sumar un escenario.",
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
    seoTitle: "Sonido y escenario para eventos corporativos",
    seoDescription:
      "Sonido claro, iluminación y escenario portátil para presentaciones, lanzamientos y cenas de empresa. Pedí tu presupuesto.",
    planning: [
      "El formato: presentación, lanzamiento, cena o jornada.",
      "Cuántas personas asisten y cómo está armado el espacio.",
      "Si habrá oradores, música o proyección, para coordinar sonido y escenario.",
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
    seoTitle: "Sonido, luces y escenario para espectáculos",
    seoDescription:
      "Escenario portátil, sonido e iluminación coordinados para shows y espectáculos. Contanos el formato y pedí presupuesto.",
    planning: [
      "El formato del show y cuántos artistas suben al escenario.",
      "Los requerimientos técnicos de cada artista.",
      "El lugar, el público esperado y los horarios de montaje y prueba.",
    ],
    light: "229 50 45",
    lightName: "carmesí",
    mediaId: "event.espectaculos",
  },
];

export const eventBySlug = (slug: string) => events.find((e) => e.slug === slug);
