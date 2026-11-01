/** Fundido de entrada entre páginas (se vuelve a montar en cada navegación). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
