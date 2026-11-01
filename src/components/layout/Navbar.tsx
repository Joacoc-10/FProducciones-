"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { navCards, site } from "@/content/site";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { genericWhatsappMessage, waLink } from "@/lib/whatsapp";
import { useScroll } from "@/components/motion/SmoothScroll";
import { ArrowIcon, InstagramIcon, MailIcon, WhatsappIcon } from "@/components/ui/Icons";
import Logo from "./Logo";

const SECTION_IDS = ["eventos", "servicios", "escenario", "galeria", "presupuesto"];
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Alto de la barra compacta (px) y separación mínima con el borde de la pantalla. */
const BAR_H = 64;
const EDGE = 16;
const BORDER = 2; // 1px arriba + 1px abajo del <header> (border-box)

/** Scroll: zona superior donde la barra siempre se ve, y recorrido acumulado que decide la dirección. */
const TOP_ZONE = 80;
const DIRECTION_THRESHOLD = 12;
/** Desplazamiento (px) de un gesto táctil a partir del cual deja de ser un toque. */
const TOUCH_SLOP = 8;

const iconControl =
  "inline-flex h-11 w-11 items-center justify-center rounded-lg text-text transition-colors hover:bg-white/10";

/**
 * Navbar compacta tipo CardNav: un único contenedor centrado y separado del borde.
 *  - Abrir: el mismo contenedor crece hacia abajo y las tarjetas entran escalonadas (timeline GSAP).
 *  - Cerrar o pulsar a mitad de camino: el timeline se invierte desde donde está, sin saltos.
 *  - Superpuesto al contenido (fixed): no desplaza el layout.
 *  - Sin scroll interno: la altura se mide con el contenido real y las distribuciones compactas
 *    (variantes short/tight/land) hacen que entre en pantallas bajas.
 *  - Cerrada: se oculta al bajar y reaparece al subir (translateY del contenedor externo; el timeline solo
 *    anima la altura del <header>, así no compiten). Visible cerca del inicio, con foco dentro o abierta.
 *    Los saltos programáticos (anclas, historial, cambio de ruta) no cuentan hasta el siguiente gesto del usuario.
 *  - Abierto: scroll bloqueado, foco atrapado; Escape, un clic fuera, una rueda/gesto de desplazamiento
 *    fuera del menú o elegir un enlace lo cierran.
 *  - prefers-reduced-motion: el timeline se resuelve al instante y la barra no se desliza.
 */
export default function Navbar() {
  const pathname = usePathname();
  const { lock } = useScroll();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname; // se cierra solo al navegar
  const setOpen = useCallback((v: boolean) => setOpenPath(v ? pathname : null), [pathname]);
  const [scrolled, setScrolled] = useState(false);
  // Oculta solo en la ruta donde se ocultó: al navegar vuelve a verse sin sincronizar estado en un efecto
  const [hiddenPath, setHiddenPath] = useState<string | null>(null);
  const pathRef = useRef(pathname);
  const hidden = hiddenPath === pathname;
  const setHidden = useCallback((v: boolean) => setHiddenPath(v ? pathRef.current : null), []);
  const openRef = useRef(false);
  const focusInRef = useRef(false);
  /** Mientras sea true, el scroll no decide visibilidad (salto programático en curso). Lo libera el siguiente gesto del usuario. */
  const holdRef = useRef(false);
  const [active, setActive] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const close = useCallback(() => setOpen(false), [setOpen]);

  // Timeline de apertura (se crea una vez; se mide de nuevo al cambiar el tamaño)
  useLayoutEffect(() => {
    const header = headerRef.current;
    const list = listRef.current;
    if (!header || !list) return;
    const cards = list.querySelectorAll(".nav-card");
    const target = () => Math.min(BAR_H + list.offsetHeight + BORDER, window.innerHeight - EDGE * 2);

    gsap.set(header, { height: BAR_H });
    gsap.set(cards, { y: 28, opacity: 0 });
    const tl = gsap.timeline({ paused: true });
    tl.fromTo(header, { height: BAR_H }, { height: () => target(), duration: 0.45, ease: "power3.out" });
    tl.to(cards, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", stagger: 0.08 }, "-=0.15");
    tlRef.current = tl;

    const onResize = () => {
      tl.invalidate();
      tl.progress(tl.progress());
    };
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize); // el contenido cambia de alto (fuentes, ancho, distribución)
    ro.observe(list);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      tl.kill();
      tlRef.current = null;
      gsap.set(header, { clearProps: "height" });
      gsap.set(cards, { clearProps: "transform,opacity" });
    };
  }, []);

  // Dirección del timeline según el estado; mismo recorrido de ida y vuelta
  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    tl.timeScale(prefersReducedMotion() ? 1000 : 1);
    if (open) {
      tl.invalidate().play();
    } else {
      // El contenido se vuelve inerte ya: el foco no queda dentro de lo que se está ocultando
      if (panelRef.current?.contains(document.activeElement)) toggleRef.current?.focus({ preventScroll: true });
      tl.reverse();
    }
  }, [open]);

  // Fondo algo translúcido (con blur) al hacer scroll + ocultar al bajar / mostrar al subir
  useEffect(() => {
    let last = window.scrollY;
    let acc = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      const delta = y - last;
      last = y;
      if (openRef.current || focusInRef.current || holdRef.current || y <= TOP_ZONE) {
        acc = 0;
        if (y <= TOP_ZONE) setHidden(false);
        return;
      }
      if (delta === 0) return;
      acc = Math.sign(acc) === Math.sign(delta) ? acc + delta : delta;
      if (acc > DIRECTION_THRESHOLD) setHidden(true);
      else if (acc < -DIRECTION_THRESHOLD) setHidden(false);
    };
    const release = () => {
      holdRef.current = false;
    };
    const hold = () => {
      holdRef.current = true;
      setHidden(false);
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.('a[href*="#"]')) hold();
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", hold);
    document.addEventListener("click", onClick, true);
    const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    userEvents.forEach((t) => window.addEventListener(t, release, { capture: true, passive: true }));
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", hold);
      document.removeEventListener("click", onClick, true);
      userEvents.forEach((t) => window.removeEventListener(t, release, { capture: true }));
    };
  }, [setHidden]);

  // Cambio de ruta: la barra se ve y la posición nueva (ancla, historial, arriba) no la oculta
  useEffect(() => {
    pathRef.current = pathname;
    holdRef.current = true;
  }, [pathname]);

  // Foco dentro de la barra: siempre visible
  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    const onIn = () => {
      focusInRef.current = true;
      setHidden(false);
    };
    const onOut = (e: FocusEvent) => {
      focusInRef.current = header.contains(e.relatedTarget as Node | null);
    };
    header.addEventListener("focusin", onIn);
    header.addEventListener("focusout", onOut);
    return () => {
      header.removeEventListener("focusin", onIn);
      header.removeEventListener("focusout", onOut);
    };
  }, [setHidden]);

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

  // Menú abierto: bloqueo de scroll, foco, Escape y trampa de foco
  useEffect(() => {
    openRef.current = open;
    lock(open);
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus({ preventScroll: true });
        return;
      }
      if (e.key !== "Tab") return;
      const nodes = [...(headerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((n) => !n.closest("[inert]"));
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

    // Desplazarse fuera del menú lo cierra (rueda/trackpad, o un gesto táctil que se mueve; un toque no)
    const inside = (t: EventTarget | null) => headerRef.current?.contains(t as Node | null) ?? false;
    const onWheel = (e: WheelEvent) => {
      if (!inside(e.target)) setOpen(false);
    };
    let start: { x: number; y: number } | null = null;
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      start = e.touches.length === 1 && t && !inside(e.target) ? { x: t.clientX, y: t.clientY } : null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!start || !t) return;
      if (Math.hypot(t.clientX - start.x, t.clientY - start.y) > TOUCH_SLOP) {
        start = null;
        setOpen(false);
      }
    };
    const onTouchEnd = () => {
      start = null;
    };
    const passive = { capture: true, passive: true } as const;
    document.addEventListener("wheel", onWheel, passive);
    document.addEventListener("touchstart", onTouchStart, passive);
    document.addEventListener("touchmove", onTouchMove, passive);
    document.addEventListener("touchend", onTouchEnd, passive);
    document.addEventListener("touchcancel", onTouchEnd, passive);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("wheel", onWheel, { capture: true });
      document.removeEventListener("touchstart", onTouchStart, { capture: true });
      document.removeEventListener("touchmove", onTouchMove, { capture: true });
      document.removeEventListener("touchend", onTouchEnd, { capture: true });
      document.removeEventListener("touchcancel", onTouchEnd, { capture: true });
      lock(false);
    };
  }, [open, lock, setOpen]);

  const wa = waLink(site.whatsapp[0], genericWhatsappMessage);
  const isActive = (href: string) => pathname === "/" && active !== null && href === `/#${active}`;

  const external = [
    { label: "WhatsApp", href: wa, icon: WhatsappIcon, newTab: true },
    { label: `@${site.instagram.handle}`, href: site.instagram.url, icon: InstagramIcon, newTab: true },
    { label: "Email", href: `mailto:${site.email}`, icon: MailIcon, newTab: false },
  ];

  return (
    <>
      {/* Atenúa la página mientras el menú está abierto; un toque fuera lo cierra */}
      <div
        aria-hidden="true"
        onClick={close}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <div
        className={cn(
          "pointer-events-none fixed inset-x-0 top-3 z-50 px-3 transition-transform duration-300 ease-out motion-reduce:transition-none md:top-4",
          hidden && !open && "-translate-y-[calc(100%+1.5rem)]",
        )}
      >
        <header
          ref={headerRef}
          className={cn(
            "pointer-events-auto relative mx-auto h-16 w-full max-w-[900px] overflow-hidden rounded-xl border border-white/10 shadow-[0_8px_30px_rgb(0_0_0/0.45)] transition-[background-color,backdrop-filter] duration-300",
            scrolled && !open ? "bg-surface/85 backdrop-blur-md" : "bg-surface",
            open && "touch-none",
          )}
        >
          {/* Móvil: hamburguesa | logo a la derecha. Desktop: hamburguesa | logo centrado (columnas laterales iguales) | WhatsApp */}
          <div className="relative z-10 grid h-16 grid-cols-2 items-center px-2.5 md:grid-cols-[1fr_auto_1fr]">
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="menu-principal"
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              className={cn(iconControl, "justify-self-start")}
            >
              <span aria-hidden="true" className="relative block h-3 w-7">
                <span className={cn("absolute left-0 h-[2px] w-7 bg-current transition-all duration-300", open ? "top-1/2 rotate-45" : "top-0")} />
                <span className={cn("absolute left-0 h-[2px] w-7 bg-current transition-all duration-300", open ? "top-1/2 -rotate-45" : "bottom-0")} />
              </span>
            </button>
            <Logo className="col-start-2 justify-self-end md:justify-self-center" imgClassName="h-10 sm:h-11" />
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Escribinos por WhatsApp"
              className={cn(iconControl, "hidden justify-self-end md:inline-flex")}
            >
              <WhatsappIcon className="h-6 w-6" />
            </a>
          </div>

          {/* Panel de tarjetas bajo la barra, dentro del mismo contenedor */}
          <div id="menu-principal" ref={panelRef} inert={!open} className="absolute inset-x-0 bottom-0 top-16">
            <nav aria-label="Principal" className="h-full">
            <ul
              ref={listRef}
              className="grid gap-2 p-2 pt-0 md:grid-cols-3 md:gap-3 md:p-3 md:pt-0 short:gap-1.5 tight:grid-cols-2 land:grid-cols-3 land:gap-2"
            >
              {navCards.map((card, i) => {
                const brand = i === navCards.length - 1;
                return (
                  <li
                    key={card.title}
                    className={cn(
                      "nav-card flex min-w-0 flex-col rounded-lg border p-5 short:p-3.5",
                      brand && "tight:col-span-2",
                      brand ? "border-brand bg-brand text-white" : "border-white/10 bg-surface-2",
                    )}
                  >
                    <div className="short:flex short:items-baseline short:justify-between short:gap-2">
                      <p className={cn("font-mono text-xs uppercase tracking-[0.18em]", brand ? "text-white/90" : "text-muted")}>{card.channel}</p>
                      <h2 className="mt-1 text-4xl font-extrabold short:mt-0 short:text-2xl">{card.title}</h2>
                    </div>
                    <ul className="mt-3 flex flex-col short:mt-1.5">
                      {card.links.map((l) => (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            onClick={close}
                            aria-current={isActive(l.href) ? "true" : undefined}
                            className={cn(
                              "group flex min-h-[44px] items-center justify-between gap-3 border-t py-1 font-display text-xl font-bold uppercase tracking-[0.06em] transition-colors short:min-h-[40px] short:py-0 short:text-base cramped:min-h-[36px] tight:text-sm",
                              brand ? "border-white/25 hover:text-white/80" : "border-white/10 hover:text-brand-hi",
                              isActive(l.href) && !brand && "text-brand-hi",
                            )}
                          >
                            {l.label}
                            <ArrowIcon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                          </Link>
                        </li>
                      ))}
                      {brand &&
                        external.map(({ label, href, icon: Icon, newTab }) => (
                          <li key={label}>
                            <a
                              href={href}
                              {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              onClick={close}
                              className="group flex min-h-[44px] items-center justify-between gap-3 border-t border-white/25 py-1 font-display text-xl font-bold uppercase tracking-[0.06em] transition-colors hover:text-white/80 short:min-h-[40px] short:py-0 short:text-base cramped:min-h-[36px]"
                            >
                              <span className="inline-flex items-center gap-2"><Icon className="h-5 w-5" /> {label}</span>
                              <ArrowIcon className="h-5 w-5 shrink-0 -rotate-45 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </a>
                          </li>
                        ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
            </nav>
          </div>
        </header>
      </div>
    </>
  );
}
