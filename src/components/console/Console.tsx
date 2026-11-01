import { cn } from "@/lib/utils";

/** Detalles de consola. Todos decorativos: nunca representan datos reales. */

export function Led({ className, pulse = false }: { className?: string; pulse?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-2 w-2 rounded-full bg-brand-hi shadow-[0_0_10px_2px_rgb(var(--brand-hi)/0.65)]",
        pulse && "animate-pulse",
        className,
      )}
    />
  );
}

export function ChannelLabel({
  channel,
  children,
  className,
  led = true,
}: {
  channel: string;
  children: React.ReactNode;
  className?: string;
  led?: boolean;
}) {
  return (
    <p className={cn("flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-muted", className)}>
      {led && <Led />}
      <span>{channel}</span>
      <span aria-hidden="true" className="text-white/25">·</span>
      <span className="text-text">{children}</span>
    </p>
  );
}

export function LevelMeter({ bars = 10, className }: { bars?: number; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("flex h-10 items-end gap-[3px]", className)}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className="h-full w-[3px] origin-bottom animate-meter rounded-[1px] bg-gradient-to-t from-brand to-brand-hi"
          style={{ animationDelay: `${(i * 137) % 900}ms`, animationDuration: `${1.2 + ((i * 53) % 10) / 10}s` }}
        />
      ))}
    </div>
  );
}
