"use client";

import { useSyncExternalStore } from "react";

interface NetworkInfo extends EventTarget { saveData?: boolean; effectiveType?: string }

const REDUCED = "(prefers-reduced-motion: reduce)";
const MOBILE = "(max-width: 767px)";

const connection = () =>
  typeof navigator === "undefined" ? undefined : (navigator as Navigator & { connection?: NetworkInfo }).connection;

function subscribe(cb: () => void) {
  const mqs = [window.matchMedia(REDUCED), window.matchMedia(MOBILE)];
  mqs.forEach((m) => m.addEventListener("change", cb));
  const conn = connection();
  conn?.addEventListener("change", cb);
  return () => {
    mqs.forEach((m) => m.removeEventListener("change", cb));
    conn?.removeEventListener("change", cb);
  };
}

/** Snapshot primitivo "r{reduced}c{constrained}m{mobile}" para que sea estable entre renders. */
function getSnapshot() {
  const c = connection();
  const constrained = Boolean(c?.saveData) || ["slow-2g", "2g", "3g"].includes(c?.effectiveType ?? "");
  return `r${window.matchMedia(REDUCED).matches ? 1 : 0}c${constrained ? 1 : 0}m${window.matchMedia(MOBILE).matches ? 1 : 0}`;
}

/** En servidor y durante la hidratación se asume el caso más conservador: no cargar video decorativo. */
const getServerSnapshot = () => "r1c1m0";

export interface MotionPrefs {
  /** El usuario pidió reducir el movimiento */
  reduced: boolean;
  /** Ahorro de datos o conexión 2g/3g */
  constrained: boolean;
  /** Viewport móvil */
  mobile: boolean;
  /** Se puede cargar y reproducir video decorativo automáticamente */
  autoplayOk: boolean;
}

export function useMotionPrefs(): MotionPrefs {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const reduced = s[1] === "1";
  const constrained = s[3] === "1";
  return { reduced, constrained, mobile: s[5] === "1", autoplayOk: !reduced && !constrained };
}
