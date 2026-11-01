import { formatPhone, site } from "@/content/site";
import { genericWhatsappMessage, waLink } from "@/lib/whatsapp";
import { InstagramIcon, MailIcon, WhatsappIcon } from "@/components/ui/Icons";
import QuoteForm from "@/components/quote/QuoteForm";

export default function QuoteSection() {
  return (
    <section id="presupuesto" aria-labelledby="presupuesto-title" className="section-y relative border-t border-white/10">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      <div className="wrap relative grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p data-reveal="fade" className="eyebrow">Presupuesto</p>
          <h2 id="presupuesto-title" data-reveal className="h-section mt-4">Contanos tu evento</h2>
          <p data-reveal className="mt-6 max-w-md text-lg text-muted">
            En cuatro pasos rápidos nos das lo necesario para armar tu propuesta. ¿Preferís hablar ya? Escribinos directo.
          </p>

          <ul data-reveal className="mt-10 space-y-1">
            {site.whatsapp.map((n, i) => (
              <li key={n}>
                <a href={waLink(n, genericWhatsappMessage)} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-3 text-lg transition-colors hover:text-brand-hi">
                  <WhatsappIcon className="h-6 w-6" />
                  <span>{formatPhone(n)}<span className="sr-only"> por WhatsApp</span></span>
                  {i === 0 && <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">principal</span>}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${site.email}`} className="inline-flex min-h-[48px] items-center gap-3 text-lg transition-colors hover:text-brand-hi">
                <MailIcon className="h-6 w-6" /> {site.email}
              </a>
            </li>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[48px] items-center gap-3 text-lg transition-colors hover:text-brand-hi">
                <InstagramIcon className="h-6 w-6" /> @{site.instagram.handle}
              </a>
            </li>
          </ul>
        </div>
        <div data-reveal className="lg:col-span-7">
          <QuoteForm />
        </div>
      </div>
    </section>
  );
}
