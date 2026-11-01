import type { MetadataRoute } from "next";
import { events } from "@/content/events";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/galeria`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...events.map((e) => ({
      url: `${site.url}/eventos/${e.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
