import type { CSSProperties } from "react";
import { events } from "@/content/events";
import { getMedia } from "@/lib/media";
import { cn } from "@/lib/utils";
import Media from "@/components/media/Media";
import { ArrowIcon } from "@/components/ui/Icons";
import EventCardLink from "./EventCardLink";

const spans = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

export default function EventsSection() {
  return (
    <section id="eventos" aria-labelledby="eventos-title" className="section-y">
      <div className="wrap">
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p data-reveal="fade" className="eyebrow">Eventos</p>
            <h2 id="eventos-title" data-reveal className="h-section mt-4">Elegí tu show</h2>
          </div>
          <p data-reveal className="max-w-md text-muted">
            Cada tipo de evento tiene su propio clima. Mirá cómo lo pensamos y pedí un presupuesto a medida.
          </p>
        </div>

        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
          {events.map((ev, i) => {
            const media = getMedia(ev.mediaId);
            return (
              <li key={ev.slug} data-reveal className={cn(spans[i], i === 0 && "md:col-span-2")}>
                <EventCardLink
                  heroSrc={media.src}
                  href={`/eventos/${ev.slug}`}
                  style={{ "--light": ev.light } as CSSProperties}
                  className="spot group relative block h-[26rem] overflow-hidden border border-white/10 md:h-[30rem] lg:h-[34rem]"
                >
                  <Media
                    media={media}
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    light={ev.light}
                    imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-105"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-light transition-transform duration-500 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                  />
                  <div className="absolute inset-x-0 bottom-0 z-10 p-6 md:p-8">
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-light">
                      {String(i + 1).padStart(2, "0")} · luz {ev.lightName}
                    </p>
                    <h3 className="mt-2 text-4xl font-extrabold md:text-5xl">{ev.title}</h3>
                    <p className="mt-3 max-w-md text-text/80">{ev.summary}</p>
                    <span className="mt-5 inline-flex items-center gap-2 font-display text-lg font-bold uppercase tracking-[0.08em]">
                      Ver evento
                      <ArrowIcon className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </span>
                  </div>
                </EventCardLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
