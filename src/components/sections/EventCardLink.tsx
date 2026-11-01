"use client";

import { getImageProps } from "next/image";
import Link from "next/link";
import type { ComponentProps } from "react";
import { preload } from "react-dom";
import { isDataConstrained } from "@/lib/gsap";

const warmed = new Set<string>();

/**
 * Pide con anticipación la foto de cabecera de la página del evento (la misma variante que pedirá su <Media priority>:
 * mismos `sizes`, por lo que el navegador elige el mismo candidato del srcset). Es la única imagen grande de la
 * página de destino y su variante a 100vw nunca se pidió desde la portada (las tarjetas usan una más chica).
 */
function warmHero(src: string) {
  if (warmed.has(src) || isDataConstrained()) return;
  warmed.add(src);
  const { props } = getImageProps({ src, alt: "", fill: true, sizes: "100vw" });
  preload(props.src, { as: "image", imageSrcSet: props.srcSet, imageSizes: props.sizes, fetchPriority: "high" });
}

export default function EventCardLink({ heroSrc, ...props }: ComponentProps<typeof Link> & { heroSrc: string | null }) {
  const warm = () => {
    if (heroSrc) warmHero(heroSrc);
  };
  return <Link {...props} onPointerEnter={warm} onFocus={warm} onTouchStart={warm} />;
}
