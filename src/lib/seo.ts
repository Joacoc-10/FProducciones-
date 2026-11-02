import type { Metadata } from "next";
import { site } from "@/content/site";

/** URL absoluta de una ruta del sitio ("/" → dominio raíz sin barra final). */
export const absoluteUrl = (path = "/") => (path === "/" ? site.url : `${site.url}${path}`);

interface PageMetaInput {
  /** Segmento del título; el template del layout agrega "| Fabio Producciones" */
  title: string;
  /** Título completo (sin template), p. ej. la portada */
  absoluteTitle?: string;
  description: string;
  path: string;
  /** Ruta pública de una imagen existente; por defecto la imagen de marca (opengraph-image) */
  image?: string | null;
}

/**
 * Metadatos de una página: canonical autorreferenciado y Open Graph / Twitter completos.
 * Next reemplaza `openGraph`/`twitter` enteros en cada página, así que todo se declara acá de una vez.
 */
export function pageMetadata({ title, absoluteTitle, description, path, image }: PageMetaInput): Metadata {
  const fullTitle = absoluteTitle ?? `${title} | ${site.name}`;
  const images = [image && image.startsWith("/") ? image : "/opengraph-image"];
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: site.name, locale: site.locale, title: fullTitle, description, url: path, images },
    twitter: { card: "summary_large_image", title: fullTitle, description, images },
  };
}

const orgId = () => `${site.url}/#organization`;

/** País declarado en el sitio. Una prioridad comercial no confirma cobertura por departamento, así que no se desglosa. */
const areaServed = () => ({ "@type": "Country", name: "Uruguay" });

/**
 * Organización + sitio. Se usa Organization (no LocalBusiness) porque no hay dirección confirmada y Google
 * la exige para LocalBusiness. Cuando el propietario confirme si muestra dirección, evaluar el cambio.
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId(),
        name: site.name,
        url: site.url,
        logo: { "@type": "ImageObject", url: `${site.url}/brand/logo-original-trim.png` },
        slogan: site.tagline,
        description: site.description,
        email: site.email,
        contactPoint: site.whatsapp.map((telephone) => ({
          "@type": "ContactPoint",
          telephone,
          contactType: "customer service",
          areaServed: "UY",
          availableLanguage: "es",
        })),
        areaServed: areaServed(),
        sameAs: [site.instagram.url],
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        inLanguage: "es-UY",
        publisher: { "@id": orgId() },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

/** Página de servicio o de tipo de evento: un Service del negocio + migas de pan. */
export function servicePageJsonLd(input: {
  path: string;
  name: string;
  serviceType: string;
  description: string;
  breadcrumb: { name: string; path: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${absoluteUrl(input.path)}#service`,
        name: input.name,
        serviceType: input.serviceType,
        description: input.description,
        url: absoluteUrl(input.path),
        provider: { "@id": orgId() },
        areaServed: areaServed(),
      },
      breadcrumbJsonLd(input.breadcrumb),
    ],
  };
}
