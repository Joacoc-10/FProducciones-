import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { eventBySlug, events } from "@/content/events";
import { services } from "@/content/services";
import { servicePageForService } from "@/content/service-pages";
import { pageMetadata, servicePageJsonLd } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import { getMedia } from "@/lib/media";
import { ChannelLabel } from "@/components/console/Console";
import Media from "@/components/media/Media";
import { ArrowIcon } from "@/components/ui/Icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const ev = eventBySlug(slug);
  if (!ev) return {};
  return pageMetadata({
    title: ev.seoTitle,
    description: ev.seoDescription,
    path: `/eventos/${ev.slug}`,
    image: getMedia(ev.mediaId).src,
  });
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const ev = eventBySlug(slug);
  if (!ev) notFound();

  const media = getMedia(ev.mediaId);
  const others = events.filter((e) => e.slug !== ev.slug);

  return (
    <article style={{ "--light": ev.light } as CSSProperties}>
      <JsonLd
        data={servicePageJsonLd({
          path: `/eventos/${ev.slug}`,
          name: ev.seoTitle,
          serviceType: `Sonido, iluminación y escenario portátil para ${ev.title.toLowerCase()}`,
          description: ev.summary,
          breadcrumb: [{ name: "Inicio", path: "/" }, { name: "Eventos", path: "/#eventos" }, { name: ev.title, path: `/eventos/${ev.slug}` }],
        })}
      />
      <header className="grain relative flex min-h-[78svh] items-end overflow-hidden">
        <Media media={media} sizes="100vw" priority light={ev.light} />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-bg/30" />
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_20%_100%,rgb(var(--light)/0.28),transparent_70%)]" />
        <div className="wrap relative z-10 pb-16 pt-40 md:pb-24">
          <nav aria-label="Ruta de navegación" className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-muted">
            <Link href="/" className="hover:text-text">Inicio</Link> <span aria-hidden="true">/</span>{" "}
            <Link href="/#eventos" className="hover:text-text">Eventos</Link> <span aria-hidden="true">/</span>{" "}
            <span className="text-text" aria-current="page">{ev.title}</span>
          </nav>
          <ChannelLabel channel="EVENTO">{`Luz ${ev.lightName}`}</ChannelLabel>
          <h1 className="h-display mt-5 max-w-[12ch]">{ev.title}</h1>
          <p className="mt-6 max-w-xl text-xl text-text/85">{ev.tagline}</p>
        </div>
      </header>

      <section className="section-y">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-lg text-muted lg:col-span-6">
            <h2 className="h-section text-text">{ev.summary}</h2>
            {ev.body.map((p) => <p key={p}>{p}</p>)}
            <h3 className="pt-4 text-2xl font-extrabold text-text">Qué conviene contarnos</h3>
            <ul className="list-disc space-y-2 pl-5 text-base">
              {ev.planning.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <ChannelLabel channel="MIX" led={false}>Qué podemos sumar</ChannelLabel>
            <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {services.map((s) => (
                <li key={s.id} className="py-5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-brand-hi">{s.channel}</p>
                  <h3 className="mt-1 text-3xl font-extrabold">
                    <Link href={`/servicios/${servicePageForService(s.id).slug}`} className="hover:text-brand-hi">{s.title}</Link>
                  </h3>
                  <p className="mt-1 text-muted">{s.text}</p>
                </li>
              ))}
            </ul>
            <Link href={`/?evento=${ev.slug}#presupuesto`} className="btn btn-primary mt-8 w-full sm:w-auto">
              Pedí tu presupuesto <ArrowIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="otros-title" className="border-t border-white/10 py-16">
        <div className="wrap">
          <h2 id="otros-title" className="text-3xl font-extrabold md:text-4xl">Otros eventos</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/eventos/${o.slug}`} className="inline-flex min-h-[48px] items-center border border-white/20 px-5 font-display text-lg font-bold uppercase tracking-[0.08em] transition-colors hover:border-white hover:bg-white/5">
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
