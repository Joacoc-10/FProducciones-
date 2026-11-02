import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { events } from "@/content/events";
import { site } from "@/content/site";
import { organizationJsonLd, pageMetadata, servicePageJsonLd } from "@/lib/seo";

describe("sitemap", () => {
  const entries = sitemap();
  it("lista portada, eventos y galería sin lastmod inventado", () => {
    expect(entries).toHaveLength(2 + events.length);
    expect(entries.every((e) => !("lastModified" in e))).toBe(true);
    expect(entries[0].url).toBe(site.url);
    expect(new Set(entries.map((e) => e.url)).size).toBe(entries.length);
  });
});

describe("metadatos de página", () => {
  it("canonical propio y títulos coherentes en Open Graph", () => {
    const m = pageMetadata({ title: "Algo", description: "d", path: "/x" });
    expect(m.alternates?.canonical).toBe("/x");
    expect(m.openGraph?.title).toBe(`Algo | ${site.name}`);
  });
  it("las descripciones no pasan de 165 caracteres", () => {
    for (const d of [...events.map((e) => e.seoDescription), site.description]) {
      expect(d.length).toBeLessThanOrEqual(165);
    }
  });
});

describe("JSON-LD", () => {
  it("el proveedor de cada servicio referencia la organización", () => {
    const org = organizationJsonLd()["@graph"][0];
    const sp = servicePageJsonLd({ path: "/eventos/a", name: "A", serviceType: "A", description: "d", breadcrumb: [{ name: "Inicio", path: "/" }] });
    expect(sp["@graph"][0]).toMatchObject({ provider: { "@id": org["@id"] } });
  });
  it("no desglosa cobertura por departamento", () => {
    expect(JSON.stringify(organizationJsonLd())).not.toMatch(/Maldonado|Canelones/);
  });
  it("no inventa dirección, coordenadas ni valoraciones", () => {
    const text = JSON.stringify(organizationJsonLd());
    for (const k of ["address", "geo", "aggregateRating", "review", "priceRange", "openingHours"]) expect(text).not.toContain(`"${k}"`);
  });
});
