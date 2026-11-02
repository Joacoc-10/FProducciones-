import type { MetadataRoute } from "next";
import { events } from "@/content/events";
import { absoluteUrl } from "@/lib/seo";

/** Solo URLs públicas e indexables. Sin lastmod: no hay fecha real de modificación por página. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "/",
    ...events.map((e) => `/eventos/${e.slug}`),
    "/galeria",
  ].map((path) => ({ url: absoluteUrl(path) }));
}
