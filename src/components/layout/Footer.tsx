import Link from "next/link";
import { formatPhone, navLinks, site } from "@/content/site";
import { genericWhatsappMessage, waLink } from "@/lib/whatsapp";
import { InstagramIcon, MailIcon, WhatsappIcon } from "@/components/ui/Icons";
import { ChannelLabel } from "@/components/console/Console";
import Wordmark from "./Wordmark";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-surface pb-28 pt-16 lg:pb-12">
      <div className="wrap grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Wordmark />
          <p className="mt-5 max-w-sm text-muted">
            Sonido profesional, iluminación y escenario portátil para que tu evento sea el show.
          </p>
        </div>

        <nav aria-label="Pie de página" className="lg:col-span-3">
          <ChannelLabel channel="CH 00" led={false}>Mapa</ChannelLabel>
          <ul className="mt-4 space-y-1">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-[44px] items-center text-muted transition-colors hover:text-text">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <ChannelLabel channel="CH 00" led={false}>Contacto</ChannelLabel>
          <ul className="mt-4 space-y-1">
            {site.whatsapp.map((n, i) => (
              <li key={n}>
                <a
                  href={waLink(n, genericWhatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-3 text-muted transition-colors hover:text-text"
                >
                  <WhatsappIcon className="h-5 w-5" />
                  <span>{formatPhone(n)}<span className="sr-only"> (WhatsApp{i === 0 ? ", principal" : ""})</span></span>
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-[44px] items-center gap-3 text-muted transition-colors hover:text-text">
                <MailIcon className="h-5 w-5" /> {site.email}
              </a>
            </li>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-3 text-muted transition-colors hover:text-text">
                <InstagramIcon className="h-5 w-5" /> @{site.instagram.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap mt-14 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-muted md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</p>
        <p className="max-w-xl md:text-right">
          Las imágenes y videos marcados como «Ilustrativa» son material conceptual (generado con IA o de archivo) y no representan trabajos realizados por {site.name}.
        </p>
      </div>
    </footer>
  );
}
