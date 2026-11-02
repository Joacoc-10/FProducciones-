"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from "react";
import { anchorTop, crossesRange, hashToId, readScroll, saveScroll } from "@/lib/anchor-scroll";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/gsap";

interface ScrollApi {
  /** Bloquea/desbloquea el scroll de la página (menú móvil, diálogos). */
  lock: (locked: boolean) => void;
}

const ScrollContext = createContext<ScrollApi>({ lock: () => {} });
export const useScroll = () => useContext(ScrollContext);

/** Duración del desplazamiento suave entre anclas que no atraviesan el escenario fijado. */
const GLIDE_SECONDS = 1.2;

const urlKey = () => window.location.pathname + window.location.search + window.location.hash;

/**
 * Lenis + GSAP en un único ticker. Se desactiva con prefers-reduced-motion
 * (scroll nativo). Para volver a scroll nativo en todos los casos basta con
 * devolver `null` en `createLenis()` (plan B documentado en REDESIGN_PLAN.md).
 *
 * Posicionamiento (anclas, rutas, atrás/adelante) en un solo lugar:
 *  - El destino se mide con el layout real (incluye los espacios de las secciones fijadas) y se
 *    resuelve igual que el salto nativo, con `scroll-margin-top`.
 *  - Un salto programático es inmediato: no recorre el escenario ni anima el scrub fotograma a fotograma.
 *    Solo se desliza (suave) cuando el trayecto no atraviesa un tramo fijado.
 *  - Tras un salto, la posición se "sostiene" hasta que el usuario toca la página: si el layout cambia
 *    después (los pines se crean tras montar, fuentes, resize), se vuelve a medir el destino. Sin timeouts.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  /** Llegada a una página (carga inicial o cambio de ruta). `popped`: viene de atrás/adelante o de una recarga. */
  const arriveRef = useRef<((popped: boolean) => void) | null>(null);
  const keyRef = useRef("");
  const pathRef = useRef("");
  const poppedRef = useRef(false);
  const firstArrival = useRef(true);
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) return; // scroll nativo: sin pines ni Lenis, el salto del navegador alcanza

    // El navegador restaura el scroll antes de que existan los espacios de los pines: lo gestionamos nosotros.
    // Se fija por ScrollTrigger porque en cada refresh devuelve el valor que tenía al iniciarse.
    const previousRestoration = "scrollRestoration" in history ? history.scrollRestoration : null;
    if (previousRestoration) ScrollTrigger.clearScrollMemory("manual");

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    let hold: (() => number) | null = null;

    /** Salto inmediato a `y`, con los límites reales de la página actual. */
    const place = (y: number) => {
      // Lenis guarda los límites medidos antes de cambiar de página y recortaría el destino a ellos
      lenis.resize();
      lenis.scrollTo(y, { immediate: true, force: true });
      // El scrub suaviza ~0,3 s: en un salto se completa ya, sin recorrer fotogramas intermedios
      ScrollTrigger.update();
      ScrollTrigger.getAll().forEach((st) => st.getTween()?.progress(1));
    };
    const jump = (measure: () => number) => {
      hold = measure;
      place(measure());
    };

    /** Mientras haya un destino sostenido, un cambio de layout lo vuelve a medir. */
    const ro = new ResizeObserver(() => {
      if (!hold) return;
      const y = hold();
      if (Math.abs(y - window.scrollY) > 1) place(y);
    });
    ro.observe(document.body);

    const release = () => {
      hold = null;
    };
    const releaseEvents = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
    releaseEvents.forEach((t) => window.addEventListener(t, release, { capture: true, passive: true }));

    const focusTarget = (el: HTMLElement) => {
      if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
      el.focus({ preventScroll: true });
    };

    const goToElement = (el: HTMLElement) => {
      const measure = () => anchorTop(el, window.scrollY);
      const to = measure();
      const pins = ScrollTrigger.getAll()
        .filter((st) => st.pin)
        .map((st) => ({ start: st.start, end: st.end }));
      if (crossesRange(window.scrollY, to, pins)) {
        jump(measure);
      } else {
        release();
        // Si el menú dejó a Lenis detenido, reanudarlo ya: start() reinicia la animación y no debe llegar después del deslizamiento
        if (lenis.isStopped) lenis.start();
        lenis.scrollTo(to, { duration: GLIDE_SECONDS, force: true });
      }
      focusTarget(el);
    };

    // Entrada del historial que se está viendo: su posición se guarda al salir
    const remember = () => saveScroll(keyRef.current, window.scrollY);

    const arrive = (popped: boolean) => {
      keyRef.current = urlKey();
      pathRef.current = window.location.pathname;
      const el = window.location.hash ? document.getElementById(hashToId(window.location.hash)) : null;
      const saved = popped ? readScroll(keyRef.current) : null;
      if (saved !== null) {
        jump(() => saved);
      } else if (el) {
        jump(() => anchorTop(el, window.scrollY));
        focusTarget(el);
      } else {
        release();
        place(0);
      }
    };
    arriveRef.current = arrive;

    const onPopState = () => {
      remember();
      if (window.location.pathname !== pathRef.current) poppedRef.current = true; // posiciona el efecto de pathname, ya montada la página
      else arrive(true);
    };
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", remember);

    // Anclas internas (misma página): sin recargar y con compensación de la navbar.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank") return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname !== window.location.pathname) {
        remember(); // salimos de esta página: se guarda dónde estaba para atrás/adelante
        return;
      }
      if (!url.hash || url.search !== window.location.search) return;
      const el = document.getElementById(hashToId(url.hash));
      if (!el) return;
      e.preventDefault(); // Next no navega si el evento está cancelado; el resto de los onClick (p. ej. cerrar el menú) siguen
      remember();
      history.pushState(null, "", url.hash);
      keyRef.current = urlKey();
      goToElement(el);
    };
    document.addEventListener("click", onClick, true);

    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", remember);
      releaseEvents.forEach((t) => window.removeEventListener(t, release, { capture: true }));
      ro.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
      arriveRef.current = null;
      if (previousRestoration) ScrollTrigger.clearScrollMemory(previousRestoration);
    };
  }, []);

  // Al llegar a una página (carga inicial o cambio de ruta): ancla, posición recordada o arriba.
  useEffect(() => {
    let popped = poppedRef.current;
    poppedRef.current = false;
    if (firstArrival.current) {
      firstArrival.current = false;
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      popped = nav?.type === "reload" || nav?.type === "back_forward";
    }
    arriveRef.current?.(popped);
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

  const api = useMemo(() => ({ lock }), [lock]);
  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
