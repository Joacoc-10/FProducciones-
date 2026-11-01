"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { formatPhone, navLinks, site } from "@/content/site";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { genericWhatsappMessage, waLink } from "@/lib/whatsapp";
import { useScroll } from "@/components/motion/SmoothScroll";
import { InstagramIcon, MailIcon, WhatsappIcon } from "@/components/ui/Icons";
import { ChannelLabel } from "@/components/console/Console";
import Wordmark from "./Wordmark";

const SECTION_IDS = ["eventos", "servicios", "escenario", "galeria", "presupuesto"];
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Navbar() {
  const pathname = usePathname();
  const { lock } = useScroll();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname; // se cierra solo al navegar
  const setOpen = useCallback((v: boolean) => setOpenPath(v ? pathname : null), [pathname]);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), [setOpen]);

  // Fondo sólido + ocultar al bajar / mostrar al subir
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 40);
      if (!prefersReducedMotion() && !open) {
        if (y > last + 6 && y > 500) setHidden(true);
        else if (y < last - 6 || y < 500) setHidden(false);
      }
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  // Sección activa (solo en la home)
  useEffect(() => {
    if (pathname !== "/") return;
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  // Menú móvil: bloqueo de scroll, foco, Escape y trampa de foco
  useEffect(() => {
    lock(open);
    if (!open) return;
    const first = overlayRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = [
        ...(headerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
        ...(overlayRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []),
      ].filter((n) => !n.closest("[hidden]"));
      if (!nodes.length) return;
      const firstEl = nodes[0];
      const lastEl = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lock(false);
    };
  }, [open, lock, setOpen]);

  const wa = waLink(site.whatsapp[0], genericWhatsappMessage);
  const isActive = (href: string) => pathname === "/" && active && href === `/#${active}`;

  return (
    <>
      <header
        ref={headerRef}
        onFocusCapture={() => setHidden(false)}
        className={cn(
          "fixed inset-x-0 top-0 z-50 h-[var(--nav-h)] transition-[transform,background-color,border-color] duration-500 ease-out",
          solid || open ? "border-b border-white/10 bg-bg/80 backdrop-blur-md" : "border-b border-transparent",
          hidden && !open ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="wrap flex h-full items-center justify-between gap-6">
          <Wordmark />

          <nav aria-label="Principal" className="hidden items-center gap-1 lg:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive(l.href) ? "true" : undefined}
                className={cn(
                  "relative px-4 py-3 font-display text-lg font-semibold uppercase tracking-[0.08em] transition-colors hover:text-text",
                  isActive(l.href) ? "text-text" : "text-muted",
                )}
              >
                {l.label}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-x-4 bottom-1.5 h-[2px] origin-left bg-brand-hi transition-transform duration-300",
                    isActive(l.href) ? "scale-x-100" : "scale-x-0",
                  )}
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href={wa} target="_blank" rel="noopener noreferrer" className="btn btn-ghost hidden !min-h-[44px] !px-5 !py-2 lg:inline-flex">
              <WhatsappIcon className="h-5 w-5" /> WhatsApp
            </a>
            <Link href="/#presupuesto" className="btn btn-primary hidden !min-h-[44px] !px-5 !py-2 lg:inline-flex">
              Presupuesto
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="menu-movil"
              className="inline-flex min-h-[44px] items-center gap-3 px-2 font-display text-lg font-semibold uppercase tracking-[0.1em] lg:hidden"
            >
              <span>{open ? "Cerrar" : "Menú"}</span>
              <span aria-hidden="true" className="relative block h-3 w-6">
                <span className={cn("absolute left-0 h-[2px] w-6 bg-text transition-all duration-300", open ? "top-1/2 rotate-45" : "top-0")} />
                <span className={cn("absolute left-0 h-[2px] w-6 bg-text transition-all duration-300", open ? "top-1/2 -rotate-45" : "bottom-0")} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil a pantalla completa (hermano del header: no hereda su transform) */}
      <div
        id="menu-movil"
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Menú principal"
        hidden={!open}
        className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-bg px-[clamp(1rem,4vw,3rem)] pb-8 pt-[calc(var(--nav-h)+1.5rem)] lg:hidden"
        data-lenis-prevent
      >
        <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
        <ul className="relative flex flex-1 flex-col justify-center gap-1">
          {navLinks.map((l, i) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={close}
                className="group flex items-baseline gap-4 py-2 font-display text-[clamp(2.75rem,13vw,5rem)] font-extrabold uppercase leading-none text-text transition-colors hover:text-brand-hi"
              >
                <span className="font-mono text-xs tracking-[0.18em] text-muted">0{i + 1}</span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="relative mt-8 space-y-4 border-t border-white/10 pt-6">
          <ChannelLabel channel="CH 00">Contacto directo</ChannelLabel>
          <a href={wa} target="_blank" rel="noopener noreferrer" onClick={close} className="btn btn-primary w-full">
            <WhatsappIcon className="h-5 w-5" /> Escribinos por WhatsApp
          </a>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <a href={`tel:${site.whatsapp[0]}`} className="inline-flex min-h-[44px] items-center">{formatPhone(site.whatsapp[0])}</a>
            <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] items-center gap-2"><InstagramIcon className="h-4 w-4" /> @{site.instagram.handle}</a>
            <a href={`mailto:${site.email}`} className="inline-flex min-h-[44px] items-center gap-2"><MailIcon className="h-4 w-4" /> Email</a>
          </div>
        </div>
      </div>
    </>
  );
}
