import SmoothScroll from "@/components/motion/SmoothScroll";
import MotionRoot from "@/components/motion/MotionRoot";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomBar from "@/components/layout/BottomBar";

/** Estructura de las páginas del sitio. La 404 (app/not-found.tsx) queda fuera de este layout. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
