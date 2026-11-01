import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap flex min-h-[80svh] flex-col justify-center py-40">
      <p className="eyebrow">Error 404</p>
      <h1 className="h-display mt-4 max-w-[12ch]">Esta página no existe</h1>
      <p className="mt-6 max-w-md text-muted">Puede que el enlace haya cambiado. Volvé al inicio o pedí tu presupuesto.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-primary">Ir al inicio</Link>
        <Link href="/#presupuesto" className="btn btn-ghost">Pedir presupuesto</Link>
      </div>
    </section>
  );
}
