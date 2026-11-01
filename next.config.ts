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
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      ...legacyEventRedirects,
      { source: "/events/:slug*", destination: "/eventos/:slug*", permanent: true },
    ];
  },
};

export default nextConfig;
