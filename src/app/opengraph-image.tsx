import { ImageResponse } from "next/og";

export const alt = "Fabio Producciones: tu evento es el show";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir generada en build (sin depender de archivos externos). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 72,
          color: "#F2EFEA",
          backgroundColor: "#07070A",
          backgroundImage: "radial-gradient(circle at 85% 10%, rgba(229,50,45,0.55), rgba(7,7,10,0) 60%)",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 8, color: "#E5322D", textTransform: "uppercase" }}>
          Sonido · Luces · Escenario
        </div>
        <div style={{ display: "flex", fontSize: 150, fontWeight: 800, lineHeight: 0.95, marginTop: 20, textTransform: "uppercase" }}>
          Tu evento es el show.
        </div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 28, color: "#A8A39B", textTransform: "uppercase", letterSpacing: 4 }}>
          Fabio Producciones
        </div>
      </div>
    ),
    size,
  );
}
