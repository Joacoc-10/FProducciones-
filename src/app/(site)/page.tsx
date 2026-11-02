import type { Metadata } from "next";
import { site } from "@/content/site";
import { organizationJsonLd, pageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { getGalleryTiles } from "@/lib/media";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import EventsSection from "@/components/sections/EventsSection";
import ServicesConsole from "@/components/sections/ServicesConsole";
import StageScroll from "@/components/sections/StageScroll";
import Gallery from "@/components/sections/Gallery";
import Process from "@/components/sections/Process";
import QuoteSection from "@/components/sections/QuoteSection";

export const metadata: Metadata = pageMetadata({
  title: "Alquiler de sonido, luces y escenario",
  absoluteTitle: "Alquiler de sonido, luces y escenario | Fabio Producciones",
  description: site.seoDescription,
  path: "/",
});

export default function Home() {
  const tiles = getGalleryTiles("home");

  return (
    <>
      <JsonLd data={organizationJsonLd()} />
      <Hero />
      <Manifesto />
      <EventsSection />
      <ServicesConsole />
      <StageScroll />
      <Gallery tiles={tiles} />
      <Process />
      <QuoteSection />
    </>
  );
}
