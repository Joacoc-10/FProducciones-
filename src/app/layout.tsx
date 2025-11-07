import type { Metadata } from "next";
import { Electrolize, Inter } from "next/font/google";
import "../styles/reset.css";
import "../styles/globals.css";

export const electrolize = Electrolize({
  subsets: ['latin'],
  weight: '400', 
  variable: '--font-electrolize',
});

export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Fabio Producciones",
  description: "Audio, Luces y Escenario para eventos profesionales.",
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
