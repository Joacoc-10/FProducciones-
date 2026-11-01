import Link from "next/link";
import { site } from "@/content/site";
import { getMedia } from "@/lib/media";
import { genericWhatsappMessage, waLink } from "@/lib/whatsapp";
import { ChannelLabel, LevelMeter } from "@/components/console/Console";
import HeroVideo from "@/components/media/HeroVideo";
import { ArrowIcon, WhatsappIcon } from "@/components/ui/Icons";

const channels = [
  { ch: "CH 01", name: "Audio" },
  { ch: "CH 02", name: "Luces" },
  { ch: "CH 03", name: "Escenario" },
];

export default function Hero() {
  const poster = getMedia("hero.poster");
  const video = getMedia("hero.video");

  return (
    <section aria-labelledby="hero-title" className="grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
      <div className="absolute inset-0">
        <HeroVideo poster={poster} video={video} />
        {/* Overlay: contraste del texto + fundido a negro */}
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-bg/90 via-bg/55 to-bg/10" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/60" />
      </div>

      <div className="wrap relative z-10 pb-24 pt-40 md:pb-28">
        <div>
          <ChannelLabel channel="CH 00">Sonido · Luces · Escenario</ChannelLabel>
        </div>

        <h1 id="hero-title" className="h-display mt-6 max-w-[14ch] text-text">
          <span className="block">Tu evento</span>
          <span className="block text-brand-hi">es el show.</span>
        </h1>

        <p className="mt-8 max-w-xl text-lg text-text/80 md:text-xl">
          Sonido profesional, iluminación y escenario portátil para bodas, cumpleaños, fiestas, eventos corporativos y espectáculos.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/#presupuesto" className="btn btn-primary">
            Pedí tu presupuesto <ArrowIcon className="h-5 w-5" />
          </Link>
          <a href={waLink(site.whatsapp[0], genericWhatsappMessage)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            <WhatsappIcon className="h-5 w-5" /> Escribinos por WhatsApp
          </a>
        </div>
      </div>

      {/* Franja de canales (decorativa) */}
      <div aria-hidden="true" className="relative z-10 hidden border-t border-white/10 bg-bg/50 backdrop-blur-sm md:block">
        <div className="wrap grid grid-cols-3 divide-x divide-white/10">
          {channels.map((c) => (
            <div key={c.ch} className="flex items-center justify-between gap-4 py-4 pr-6 first:pl-0 [&:not(:first-child)]:pl-6">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
                {c.ch} <span className="text-white/25">·</span> <span className="text-text">{c.name}</span>
              </p>
              <LevelMeter bars={9} className="!h-6" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
