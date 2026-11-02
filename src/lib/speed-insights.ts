/**
 * Saneamiento previo al envío a Vercel Speed Insights: deja solo origen + ruta.
 * Descarta query (?evento=, ?servicio= o cualquier dato que alguien pegue) y hash.
 */
export function sanitizeEventUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url.split(/[?#]/)[0];
  }
}

export function sanitizeSpeedInsightsEvent<T extends { url: string }>(event: T): T {
  return { ...event, url: sanitizeEventUrl(event.url) };
}
