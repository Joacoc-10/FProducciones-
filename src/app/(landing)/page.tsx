import AboutUs from "@/components/AboutUs";
import EventsListSection from "@/components/EventsListSection";
import Gallery from "@/components/Gallery";
import Header from "@/components/Header";
import Footer from "@/components/UI/Footer/Footer";
import Navbar from "@/components/UI/Navbar/Navbar";
import SplashCursor from "@/components/UI/SplashCursor";
import { TracingBeam } from "@/components/UI/tracing-beam";

export default function Home() {
  return (
    <>
      {/* Efecto de arcoiris en el mouse */}
      {/* <SplashCursor /> */}

      {/* Header */}
      <Navbar />
      <Header />

      {/* Resto de la pagina envuelto en componente de color para el scrol */}
      <TracingBeam>
        <AboutUs />
        <EventsListSection />
        <Gallery />
      </TracingBeam>

      <Footer />
    </>
  );
}
