"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, prefersReducedMotion, registerGsap, ScrollTrigger } from "@/lib/gsap";

declare global {
  interface Window { __motionReady?: boolean }
}

/**
 * Animaciones globales declarativas:
 *  - [data-reveal]            → entrada al hacer scroll (por lotes)
 *  - [data-parallax="8"]      → parallax suave de fondo (porcentaje)
 *  - .spot                    → foco de luz que sigue al puntero (solo puntero fino)
 * Con prefers-reduced-motion no se registra nada (el contenido queda visible).
 */
export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    registerGsap();
    if (prefersReducedMotion()) {
      document.documentElement.classList.remove("motion-ok");
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 90%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.09,
            overwrite: true,
            clearProps: "transform",
          }),
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const amount = Number(el.dataset.parallax) || 8;
        gsap.fromTo(
          el,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    });

    window.__motionReady = true;
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => ctx.revert();
  }, [pathname]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const spot = (e.target as Element | null)?.closest?.<HTMLElement>(".spot");
      if (!spot) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = spot.getBoundingClientRect();
        spot.style.setProperty("--mx", `${e.clientX - r.left}px`);
        spot.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
