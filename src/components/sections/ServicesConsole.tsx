import Link from "next/link";
import type { CSSProperties } from "react";
import { services } from "@/content/services";
import { getMedia } from "@/lib/media";
import { ChannelLabel, LevelMeter } from "@/components/console/Console";
import Media from "@/components/media/Media";

export default function ServicesConsole() {
  return (
    <section id="servicios" aria-labelledby="servicios-title" className="section-y relative border-y border-white/10 bg-surface">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0" />
      <div className="wrap relative">
        <div className="mb-14 max-w-2xl">
          <p data-reveal="fade" className="eyebrow">Servicios</p>
          <h2 id="servicios-title" data-reveal className="h-section mt-4">El show por dentro</h2>
          <p data-reveal className="mt-5 text-muted">
            Tres canales que trabajan juntos. Los ajustamos según tu evento, tu lugar y tus invitados.
          </p>
        </div>

        <ul className="grid gap-4 lg:grid-cols-3 lg:gap-5">
          {services.map((s) => {
            const media = getMedia(s.mediaId);
            return (
              <li
                key={s.id}
                data-reveal
                style={{ "--lvl": s.level } as CSSProperties}
                className="spot group relative flex min-h-[22rem] overflow-hidden border border-white/10 bg-bg p-6 md:p-8"
              >
                {media.src && <Media media={media} sizes="(min-width: 1024px) 33vw, 100vw" tag className="opacity-30" />}
                <div className="relative z-10 flex flex-1 flex-col">
                  <ChannelLabel channel={s.channel}>{s.id === "escenario" ? "Escenario" : s.title}</ChannelLabel>
                  <h3 className="mt-6 text-5xl font-extrabold md:text-6xl">{s.title}</h3>
                  <p className="mt-4 max-w-xs text-muted">{s.text}</p>
                  {s.id === "escenario" && (
                    <Link href="/#escenario" className="mt-auto inline-flex min-h-[44px] items-center pt-6 font-display text-lg font-bold uppercase tracking-[0.08em] text-brand-hi hover:text-text">
                      Mirá cómo se arma ↓
                    </Link>
                  )}
                </div>

                {/* Fader + medidor decorativos */}
                <div aria-hidden="true" className="relative z-10 ml-4 flex w-12 flex-col items-center gap-4">
                  <div className="relative w-[3px] flex-1 bg-white/15">
                    <span
                      className="absolute left-1/2 block h-7 w-9 -translate-x-1/2 translate-y-1/2 border border-white/30 bg-surface-2 transition-[bottom] duration-700 ease-out group-hover:!bottom-[calc(var(--lvl)*100%+6%)]"
                      style={{ bottom: "calc(var(--lvl) * 100%)" }}
                    >
                      <span className="absolute inset-x-1 top-1/2 h-[2px] -translate-y-1/2 bg-brand-hi" />
                    </span>
                  </div>
                  <LevelMeter bars={5} className="!h-14" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
