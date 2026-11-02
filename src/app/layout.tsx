import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import SiteSpeedInsights from "@/components/analytics/SiteSpeedInsights";
import { site } from "@/content/site";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

/** Layout raíz mínimo: la estructura del sitio (navbar, footer, scroll) vive en (site)/layout.tsx para que la 404 quede independiente.
 *  Valores por defecto (p. ej. la página 404). Cada página define su canonical, Open Graph y Twitter con pageMetadata(). */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "Fabio Producciones | Sonido, luces y escenario para eventos", template: "%s | Fabio Producciones" },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  robots: site.indexable ? undefined : { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#07070A",
  colorScheme: "dark",
};

/** Marca .motion-ok antes del primer pintado (evita el parpadeo de los revelados).
 *  Si el JS de animación no arranca en 4 s, el contenido se muestra igualmente. */
const motionGate = `(function(){try{var d=document.documentElement;if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion-ok');setTimeout(function(){if(!window.__motionReady)d.classList.add('motion-failed')},4000)}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-UY"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
        <noscript>
          <style>{`.motion-ok [data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        {children}
        <SiteSpeedInsights />
      </body>
    </html>
  );
}
