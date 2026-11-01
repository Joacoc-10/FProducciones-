import type { MetadataRoute } from "next";
import { events } from "@/content/events";
import { servicePages } from "@/content/service-pages";
import { absoluteUrl } from "@/lib/seo";

/** Solo URLs públicas e indexables. Sin lastmod: no hay fecha real de modificación por página. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    ...servicePages.map((s) => `/servicios/${s.slug}`),
    ...events.map((e) => `/eventos/${e.slug}`),
    "/galeria",
  ].map((path) => ({ url: absoluteUrl(path) }));
}
