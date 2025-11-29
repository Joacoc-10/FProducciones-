import type { Metadata } from "next";
import { Electrolize, Inter } from "next/font/google";
import "../styles/reset.css";
import "../styles/globals.css";

const electrolize = Electrolize({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-electrolize",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const baseUrl = "https://www.fabio_producciones.vercel.com";

export const metadata: Metadata = {
  // 1. SEO Básico (Motores de Búsqueda)
  title:
    "Fabio Producciones | Audio, Luces y Escenario Profesional para Eventos",
  description:
    "Servicios de alquiler y montaje de **sonido profesional**, **iluminación espectacular** y **escenarios modulares** para bodas, conciertos y eventos corporativos. Calidad y experiencia garantizadas.",
  keywords: [
    "Audio Profesional",
    "Alquiler de Luces para Eventos",
    "Montaje de Escenarios",
    "Sonido para Bodas",
    "Producción de Eventos",
    "Servicios Audiovisuales",
    "Alquiler de sonido para eventos Uruguay",
    "Alquiler de luces para fiestas Maldonado",
    "Sonido profesional para fiestas",
    "Servicios de audio e iluminación",
    "Escenario en alquiler Maldonado",
    "Producción de eventos Maldonado",
    "Alquiler de equipos de sonido profesional",
    "Luces y sonido para bodas",
    "Audio e iluminación para eventos corporativos",
    "Alquiler de tarimas para eventos",
    "Empresas de sonido en Maldonado",
    "Montaje de escenario para shows",
    "Alquiler de luces robóticas",
    "Técnico de sonido para eventos",
    "Alquiler de parlantes Maldonado",
    "Servicio de DJ e iluminación",
    "Audio y luces para cumpleaños de 15",
    "Proveedores audiovisuales para eventos",
    "Iluminación espectacular para fiestas",
  ],
  authors: [{ name: "Fabio Producciones" }],
  creator: "Fabio Producciones",

  // 2. Open Graph (Compartir en Facebook, WhatsApp, LinkedIn, etc.)
  openGraph: {
    title: "Fabio Producciones | Soluciones Audiovisuales de Alto Nivel",
    description:
      "Servicios completos de sonido, iluminación y estructuras para eventos inolvidables.",
    url: baseUrl,
    siteName: "Fabio Producciones",
    images: [
      {
        url: "https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278",
        width: 1200,
        height: 630,
        alt: "Equipo de luces y sonido profesional en un evento",
      },
    ],
    locale: "es_ES",
    type: "website",
  },

  // 3. Twitter Cards (Compartir en X/Twitter)
  twitter: {
    card: "summary_large_image",
    title: "Fabio Producciones | Llevamos tu Evento al Siguiente Nivel",
    description:
      "Sonido, luces y escenarios profesionales para cualquier tipo de celebración.",
    images: [
      "https://ik.imagekit.io/i1pxujmp5t/FProducciones/PHOTO-2025-10-22-20-53-38-Photoroom.png?updatedAt=1761844596278",
    ],
  },

  // 4. Configuración Adicional
  metadataBase: new URL(baseUrl), // Establece la base para todas las URLs relativas
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
    },
  },
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${electrolize.variable} ${inter.variable}`}>
        {children}
        {modal}
      </body>
    </html>
  );
}
