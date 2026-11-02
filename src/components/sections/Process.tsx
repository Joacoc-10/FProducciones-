import { processSteps } from "@/content/process";
import { Led } from "@/components/console/Console";

/** Proceso provisorio: a validar con el cliente. */
export default function Process() {
  return (
    <section aria-labelledby="proceso-title" className="section-y">
      <div className="wrap">
        <p data-reveal="fade" className="eyebrow">Cómo se arma</p>
        <h2 id="proceso-title" data-reveal className="h-section mt-4 max-w-[18ch]">De tu idea al escenario</h2>

        <ol className="mt-14 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((s) => (
            <li key={s.n} data-reveal className="bg-bg p-6 md:p-8">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm tracking-[0.18em] text-brand-hi">STEP {s.n}</span>
                <Led />
              </div>
              <h3 className="mt-10 text-3xl font-extrabold md:text-4xl">{s.title}</h3>
              <p className="mt-3 text-muted">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
