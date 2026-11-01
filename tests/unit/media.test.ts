import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { mediaEntries } from "@/content/media";
import { galleryItems } from "@/content/gallery";
import { events } from "@/content/events";
import { getGalleryTiles, getMedia, isIllustrative, resolveMedia } from "@/lib/media";

const all = [...mediaEntries, ...galleryItems.map((g) => g.entry)];

describe("registro de medios", () => {
  it("ids únicos, rutas públicas absolutas y alt descriptivo en todo", () => {
    const ids = all.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const e of all) {
      expect(e.file.startsWith("/media/")).toBe(true);
      expect(e.alt.trim().length).toBeGreaterThan(10);
    }
  });

  it("cada tipo de evento referencia un recurso existente", () => {
    for (const ev of events) expect(() => getMedia(ev.mediaId, () => false)).not.toThrow();
  });

  it("usa el archivo definitivo si existe y el fallback si no", () => {
    const entry = mediaEntries.find((e) => e.id === "hero.video")!;
    const withFile = resolveMedia(entry, (p) => p === entry.file);
    expect(withFile.isFallback).toBe(false);
    expect(withFile.src).toBe(entry.file);
    const without = resolveMedia(entry, () => false);
    expect(without.isFallback).toBe(true);
    expect(without.src).toBe(entry.fallback!.src);
  });

  it("sin archivo ni fallback queda como placeholder (sin src)", () => {
    const entry = mediaEntries.find((e) => e.id === "stage.video")!;
    const r = resolveMedia(entry, () => false);
    expect(r.src).toBeNull();
    expect(r.origin).toBe("placeholder");
  });
});

describe("honestidad de la galería", () => {
  const texts = (alt: string) => alt.toLowerCase();

  it("ninguna pieza no auténtica se describe como trabajo realizado", () => {
    for (const { entry } of galleryItems) {
      const r = resolveMedia(entry, () => false);
      if (r.origin !== "authentic") {
        expect(texts(entry.alt)).toMatch(/conceptual/);
        expect(texts(entry.alt)).not.toMatch(/trabajo realizado|nuestro trabajo|realizamos/);
        expect(isIllustrative(r.origin)).toBe(true);
      }
    }
  });

  it("todo fallback de la galería está declarado como ilustrativo (nunca authentic)", () => {
    for (const { entry } of galleryItems) {
      if (entry.fallback) expect(entry.fallback.origin).not.toBe("authentic");
    }
  });

  it("solo se marcan como auténticas piezas que viven en /media/real/", () => {
    for (const e of all) if (e.origin === "authentic") expect(e.file.startsWith("/media/real/")).toBe(true);
  });
});

describe("manifiesto de la galería", () => {
  it("la portada conserva 8 piezas, con una sola de video, sin duplicados y en el orden definido", () => {
    const home = getGalleryTiles("home", () => true);
    expect(home.map((t) => t.id)).toEqual([
      "gallery.concept-06",
      "gallery.concept-01",
      "gallery.concept-02",
      "gallery.concept-08",
      "gallery.video-01",
      "gallery.concept-04",
      "gallery.concept-05",
      "gallery.concept-03",
    ]);
    expect(home[0].featured).toBe(true);
    expect(home.filter((t) => t.kind === "video")).toHaveLength(1);
  });

  it("/galeria incluye todo el manifiesto, incluido lo que no está en la portada", () => {
    expect(getGalleryTiles("all", () => true)).toHaveLength(galleryItems.length);
  });

  it("los archivos locales registrados existen en public/", () => {
    for (const { entry } of galleryItems) {
      if (entry.kind === "image") expect(fs.existsSync(path.join(process.cwd(), "public", entry.file))).toBe(true);
    }
  });
});
