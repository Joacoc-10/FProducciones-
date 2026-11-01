import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eventBySlug } from "@/content/events";
import { servicePageBySlug, servicePages } from "@/content/service-pages";
import { services } from "@/content/services";
import { getMedia } from "@/lib/media";
import { pageMetadata, servicePageJsonLd } from "@/lib/seo";
import { ChannelLabel } from "@/components/console/Console";
import Media from "@/components/media/Media";
import JsonLd from "@/components/seo/JsonLd";
import { ArrowIcon } from "@/components/ui/Icons";

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return servicePages.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = servicePageBySlug(slug);
  if (!page) return {};
  const service = services.find((s) => s.id === page.serviceId)!;
  return pageMetadata({
    title: page.seoTitle,
    description: page.seoDescription,
    path: `/servicios/${page.slug}`,
    image: getMedia(service.mediaId).src,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const page = servicePageBySlug(slug);
  if (!page) notFound();

  const service = services.find((s) => s.id === page.serviceId)!;
  const media = getMedia(service.mediaId);
  const path = `/servicios/${page.slug}`;
  const others = servicePages.filter((s) => s.slug !== page.slug);

  return (
    <article>
      <JsonLd
        data={servicePageJsonLd({
          path,
          name: page.schemaName,
          serviceType: page.schemaName,
          description: page.intro,
          breadcrumb: [{ name: "Inicio", path: "/" }, { name: "Servicios", path: "/#servicios" }, { name: page.linkLabel, path }],
        })}
      />
      <header className="grain relative flex min-h-[70svh] items-end overflow-hidden">
        <Media media={media} sizes="100vw" priority />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/30" />
        <div className="wrap relative z-10 pb-16 pt-40 md:pb-24">
          <nav aria-label="Ruta de navegación" className="mb-8 font-mono text-xs uppercase tracking-[0.18em] text-muted">
            <Link href="/" className="hover:text-text">Inicio</Link> <span aria-hidden="true">/</span>{" "}
            <Link href="/#servicios" className="hover:text-text">Servicios</Link> <span aria-hidden="true">/</span>{" "}
            <span className="text-text" aria-current="page">{page.linkLabel}</span>
          </nav>
          <ChannelLabel channel={service.channel}>{service.title}</ChannelLabel>
          <h1 className="h-display mt-5 max-w-[16ch]">{page.h1}</h1>
          <p className="mt-6 max-w-xl text-xl text-text/85">{page.tagline}</p>
        </div>
      </header>

      <section className="section-y">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          <div className="space-y-6 text-lg text-muted lg:col-span-6">
            <h2 className="h-section text-text">{page.intro}</h2>
            <h3 className="pt-4 text-2xl font-extrabold text-text">{page.planningTitle}</h3>
            <ul className="list-disc space-y-2 pl-5 text-base">
              {page.planning.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </div>

          <div className="lg:col-span-5 lg:col-start-8">
            <ChannelLabel channel="USOS" led={false}>Para qué eventos</ChannelLabel>
            <ul className="mt-5 divide-y divide-white/10 border-y border-white/10">
              {page.uses.map((u) => {
                const ev = eventBySlug(u.slug)!;
                return (
                  <li key={u.slug} className="py-4">
                    <Link href={`/eventos/${ev.slug}`} className="text-2xl font-extrabold hover:text-brand-hi">{ev.title}</Link>
                    <p className="mt-1 text-muted">{u.text}</p>
                  </li>
                );
              })}
            </ul>
            <p className="mt-6 text-muted">{page.combineText}</p>
            <Link href={`/?servicio=${page.serviceId}#presupuesto`} className="btn btn-primary mt-8 w-full sm:w-auto">
              Pedí tu presupuesto <ArrowIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="otros-title" className="border-t border-white/10 py-16">
        <div className="wrap">
          <h2 id="otros-title" className="text-3xl font-extrabold md:text-4xl">Otros servicios</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={`/servicios/${o.slug}`} className="inline-flex min-h-[48px] items-center border border-white/20 px-5 font-display text-lg font-bold uppercase tracking-[0.08em] transition-colors hover:border-white hover:bg-white/5">
                  {o.linkLabel}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </article>
  );
}
