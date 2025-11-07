import AboutUs from "@/components/AboutUs";
import EventsListSection from "@/components/EventsListSection";
import Header from "@/components/Header";
// import SplashCursor from "@/components/SplashCursor";
import Navbar from "@/components/UI/Navbar/Navbar";
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
        <EventsListSection/>
      </TracingBeam>
    </>
  );
}
