export interface Service {
  channel: string; // CH 01
  id: "audio" | "luces" | "escenario";
  title: string;
  text: string;
  /** posición decorativa del fader (0–1). No representa ningún dato real. */
  level: number;
  mediaId: string;
}

export const services: Service[] = [
  {
    channel: "CH 01",
    id: "audio",
    title: "Audio",
    text: "Sonido profesional dimensionado al espacio y al tipo de evento.",
    level: 0.72,
    mediaId: "service.audio",
  },
  {
    channel: "CH 02",
    id: "luces",
    title: "Luces",
    text: "Iluminación para ambientar, marcar momentos y vestir el escenario.",
    level: 0.58,
    mediaId: "service.luces",
  },
  {
    channel: "CH 03",
    id: "escenario",
    title: "Escenario portátil",
    text: "Plataforma plegable que se traslada y se arma donde se hace el evento.",
    level: 0.86,
    mediaId: "service.escenario",
  },
];
