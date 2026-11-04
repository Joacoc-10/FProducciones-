import type { NextConfig } from "next";

/** Rutas antiguas (/events/:id) → nuevas (/eventos/:slug). */
const legacyEventRedirects = [
  ["Bodas", "bodas"],
  ["CumpleanosDe15", "cumpleanos-y-15"],
  ["FiestasPrivadas", "fiestas-privadas"],
  ["Corporativos", "corporativos"],
  ["Festivales", "espectaculos"],
].map(([legacy, slug]) => ({
  source: `/events/${legacy}`,
  destination: `/eventos/${slug}`,
  permanent: true,
}));

const nextConfig: NextConfig = {
  // Solo desarrollo: permite probar desde el iPhone por la IP local del Mac (sin esto Next bloquea /_next/* y no hidrata)
  allowedDevOrigins: ["192.168.1.143"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "/**" },
    ],
  },
  async headers() {
    return [
      {
        // Los fotogramas se versionan con ?v= (content/stage-frames.ts): caché larga
        source: "/media/ai/stage/frames/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      ...legacyEventRedirects,
      { source: "/events/:slug*", destination: "/eventos/:slug*", permanent: true },
    ];
  },
};

export default nextConfig;
