"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/gsap";

interface ScrollApi {
  /** Bloquea/desbloquea el scroll de la página (menú móvil, diálogos). */
  lock: (locked: boolean) => void;
  scrollTo: (target: string | HTMLElement, offset?: number) => void;
}

const ScrollContext = createContext<ScrollApi>({ lock: () => {}, scrollTo: () => {} });
export const useScroll = () => useContext(ScrollContext);

const NAV_OFFSET = 72;

/**
 * Lenis + GSAP en un único ticker. Se desactiva con prefers-reduced-motion
 * (scroll nativo). Para volver a scroll nativo en todos los casos basta con
 * devolver `null` en `createLenis()` (plan B documentado en REDESIGN_PLAN.md).
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anclas internas (misma página): desplazamiento suave con compensación de la navbar.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.hash || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname !== window.location.pathname) return;
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      lenis.scrollTo(el, { offset: -NAV_OFFSET, duration: 1.2 });
      history.pushState(null, "", url.hash);
      el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Al cambiar de página, volver arriba (o ir al ancla) sin animación.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    const hash = window.location.hash;
    const el = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (el) lenis.scrollTo(el, { offset: -NAV_OFFSET, immediate: true });
    else lenis.scrollTo(0, { immediate: true });
  }, [pathname]);

  const lock = useCallback((locked: boolean) => {
    const lenis = lenisRef.current;
    if (lenis) {
      if (locked) lenis.stop();
      else lenis.start();
    } else {
      document.body.style.overflow = locked ? "hidden" : "";
    }
  }, []);

  const scrollTo = useCallback((target: string | HTMLElement, offset = NAV_OFFSET) => {
    const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
    if (!el) return;
    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(el, { offset: -offset });
    else el.scrollIntoView({ block: "start" });
  }, []);

  const api = useMemo(() => ({ lock, scrollTo }), [lock, scrollTo]);
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
