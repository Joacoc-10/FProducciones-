"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;
export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface NetworkInfo { saveData?: boolean; effectiveType?: string }

/** Ahorro de datos o conexión lenta (2g/3g): no cargar video decorativo. */
export function isDataConstrained(): boolean {
  if (typeof navigator === "undefined") return false;
  const c = (navigator as Navigator & { connection?: NetworkInfo }).connection;
  if (!c) return false;
  return Boolean(c.saveData) || ["slow-2g", "2g", "3g"].includes(c.effectiveType ?? "");
}

export { gsap, ScrollTrigger };
