"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";
import { genericWhatsappMessage, waLink } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/ui/Icons";

/** Barra inferior solo móvil: WhatsApp y Presupuesto siempre a mano. */
export default function BottomBar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const show = pathname !== "/" || scrolled;

  useEffect(() => {
    if (pathname !== "/") return;
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 gap-px border-t border-white/10 bg-white/10 pb-[env(safe-area-inset-bottom)] transition-transform duration-500 ease-out lg:hidden",
        show ? "translate-y-0" : "translate-y-full",
      )}
      // Fuera de pantalla: no debe ser enfocable
      {...(!show ? { inert: true } : {})}
    >
      <a
        href={waLink(site.whatsapp[0], genericWhatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-[56px] items-center justify-center gap-2 bg-bg font-display text-lg font-bold uppercase tracking-[0.08em]"
      >
        <WhatsappIcon className="h-5 w-5" /> WhatsApp
      </a>
      <Link
        href="/#presupuesto"
        className="flex min-h-[56px] items-center justify-center bg-brand font-display text-lg font-bold uppercase tracking-[0.08em] text-white"
      >
        Presupuesto
      </Link>
    </div>
  );
}
