import { Led } from "@/components/console/Console";

/** Texto provisorio: a validar con el cliente. */
export default function Manifesto() {
  return (
    <section aria-labelledby="manifiesto-title" className="section-y relative">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,transparent,black_30%,black_70%,transparent)]" />
      <div className="wrap relative grid gap-10 lg:grid-cols-12">
        <p data-reveal="fade" className="eyebrow flex items-center gap-3 lg:col-span-3">
          <Led /> Manifiesto
        </p>
        <div className="lg:col-span-9">
          <h2 id="manifiesto-title" data-reveal className="h-section max-w-[16ch] md:max-w-[20ch]">
            Un buen show no se improvisa: <span className="text-muted">se arma.</span>
          </h2>
          <p data-reveal className="mt-8 max-w-2xl text-lg text-muted md:text-xl">
            Detrás de cada evento hay sonido que acompaña, luz que marca los momentos y un escenario firme. Nos ocupamos de todo eso para que vos te ocupes de disfrutar.
          </p>
        </div>
      </div>
    </section>
  );
}
