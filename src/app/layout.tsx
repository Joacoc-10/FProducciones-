import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";
import { site } from "@/content/site";
import SmoothScroll from "@/components/motion/SmoothScroll";
import MotionRoot from "@/components/motion/MotionRoot";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomBar from "@/components/layout/BottomBar";

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

const title = "Fabio Producciones | Sonido, luces y escenario para eventos";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: "%s | Fabio Producciones" },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title, description: site.description },
  robots: { index: true, follow: true },
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
        <a href="#contenido" className="skip-link">Saltar al contenido</a>
        <SmoothScroll>
          <Navbar />
          <main id="contenido" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <Footer />
          <BottomBar />
          <MotionRoot />
        </SmoothScroll>
      </body>
    </html>
  );
}
