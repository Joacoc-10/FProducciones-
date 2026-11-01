"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section role="alert" className="wrap flex min-h-[80svh] flex-col justify-center py-40">
      <p className="eyebrow">Algo salió mal</p>
      <h1 className="h-display mt-4 max-w-[12ch]">Tuvimos un problema</h1>
      <p className="mt-6 max-w-md text-muted">Probá recargar la página. Si sigue pasando, escribinos por WhatsApp.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-8 self-start">Reintentar</button>
    </section>
  );
}
