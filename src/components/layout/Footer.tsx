import Link from "next/link";
import { formatPhone, navLinks, site } from "@/content/site";
import { genericWhatsappMessage, waLink } from "@/lib/whatsapp";
import { InstagramIcon, MailIcon, WhatsappIcon } from "@/components/ui/Icons";
import { ChannelLabel } from "@/components/console/Console";
import JCodingSignature from "@/components/ui/JCodingSignature";
import Logo from "./Logo";

export default function Footer() {
  const link = "inline-flex items-center text-muted transition-colors hover:text-text min-h-[44px] text-sm lg:min-h-[34px] lg:text-base";
  return (
    <footer className="site-footer relative border-t border-white/10 bg-surface pb-24 pt-8 lg:pb-7 lg:pt-10">
      <div className="wrap grid gap-5 md:grid-cols-2 md:gap-x-10 md:gap-y-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <Logo imgClassName="h-16 sm:h-16" />
          <p className="mt-3 max-w-xs text-sm text-muted">
            Sonido profesional, iluminación y escenario portátil para que tu evento sea el show.
          </p>
        </div>

        <nav aria-label="Pie de página" className="lg:col-span-3">
          <ChannelLabel channel="CH 00" led={false}>Mapa</ChannelLabel>
          <ul className="mt-1 flex flex-wrap gap-x-4 lg:mt-3 lg:block">
            {navLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className={link}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2 lg:col-span-5">
          <ChannelLabel channel="CH 00" led={false}>Contacto</ChannelLabel>
          <ul className="mt-1 md:grid md:grid-cols-2 md:gap-x-10 lg:mt-3 lg:block">
            {site.whatsapp.map((n, i) => (
              <li key={n}>
                <a href={waLink(n, genericWhatsappMessage)} target="_blank" rel="noopener noreferrer" className={`${link} gap-3`}>
                  <WhatsappIcon className="h-5 w-5" />
                  <span>{formatPhone(n)}<span className="sr-only"> (WhatsApp{i === 0 ? ", principal" : ""})</span></span>
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className={`${link} gap-3 break-all`}>
                <MailIcon className="h-5 w-5 shrink-0" /> {site.email}
              </a>
            </li>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className={`${link} gap-3`}>
                <InstagramIcon className="h-5 w-5" /> @{site.instagram.handle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="wrap mt-6 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} {site.name}. Todos los derechos reservados.</p>
        <JCodingSignature variant="signature" theme="dark" language="es" />
      </div>
    </footer>
  );
}
