import { galleryItems } from "@/content/gallery";
import { site } from "@/content/site";
import { getMedia } from "@/lib/media";
import Hero from "@/components/sections/Hero";
import Manifesto from "@/components/sections/Manifesto";
import EventsSection from "@/components/sections/EventsSection";
import ServicesConsole from "@/components/sections/ServicesConsole";
import StageScroll from "@/components/sections/StageScroll";
import Gallery, { type GalleryTile } from "@/components/sections/Gallery";
import Process from "@/components/sections/Process";
import QuoteSection from "@/components/sections/QuoteSection";

/** Solo datos confirmados (nombre, URL, contacto). Sin dirección ni zona hasta que el cliente las confirme. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  url: site.url,
  logo: `${site.url}/brand/logo-original-trim.png`,
  description: site.description,
  telephone: site.whatsapp[0],
  email: site.email,
  sameAs: [site.instagram.url],
};

export default function Home() {
  const tiles: GalleryTile[] = galleryItems.map((g) => ({
    ...getMedia(g.entry.id),
    span: g.span,
    featured: g.featured,
    event: g.event,
  }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Manifesto />
      <EventsSection />
      <ServicesConsole />
      <StageScroll poster={getMedia("stage.poster")} final={getMedia("stage.final")} video={getMedia("stage.video")} />
      <Gallery tiles={tiles} />
      <Process />
      <QuoteSection />
    </>
  );
}
