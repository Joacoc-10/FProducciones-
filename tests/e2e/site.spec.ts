import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SECTIONS = ["eventos", "servicios", "escenario", "galeria", "presupuesto"];

test.describe("landing", () => {
  test("renderiza todas las secciones, con un único h1", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/tu evento/i);
    for (const id of SECTIONS) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "es-UY");
  });

  test("las tarjetas de evento apuntan a sus páginas", async ({ page }) => {
    await page.goto("/");
    const hrefs = await page.locator("#eventos a[href^='/eventos/']").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
    expect(hrefs).toEqual([
      "/eventos/bodas",
      "/eventos/cumpleanos-y-15",
      "/eventos/fiestas-privadas",
      "/eventos/corporativos",
      "/eventos/espectaculos",
    ]);
  });

  test("sin desbordamiento horizontal", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("reduced-motion: sin Lenis, sin pin, sin video y contenido visible", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("html")).not.toHaveClass(/motion-ok/);
    await expect(page.locator("html")).not.toHaveClass(/lenis/);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    await expect(page.locator("section").first().locator("video")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("list", { name: "Etapas del montaje" }).getByRole("listitem")).toHaveCount(5);
    await ctx.close();
  });

  test("el hero ofrece control de pausa del video", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /video de fondo/i })).toBeVisible();
  });
});

test.describe("navegación", () => {
  test("enlace de saltar al contenido y teclado: el menú abre, atrapa foco y Escape lo cierra", async ({ page, isMobile }) => {
    test.skip(isMobile, "El teclado se prueba en escritorio");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /saltar al contenido/i })).toBeFocused();
    const toggle = page.locator('button[aria-controls="menu-principal"]'); // su nombre cambia entre «Abrir» y «Cerrar menú»
    await page.keyboard.press("Tab"); // hamburguesa, luego logo
    await expect(toggle).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /ir al inicio/i }).first()).toBeFocused();
    await toggle.focus();
    await page.keyboard.press("Enter");
    const menu = page.getByRole("navigation", { name: "Principal" });
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(menu.getByRole("link").first()).toBeFocused();
    // El foco no sale del encabezado mientras el menú está abierto
    for (let i = 0; i < 20; i++) await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("header"))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test("menú: abre, muestra tarjetas, cierra con Escape y devuelve el foco", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("navigation", { name: "Principal" });
    await expect(menu).toBeHidden();
    await page.getByRole("button", { name: /menú/i }).click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("heading", { level: 2 })).toHaveText(["Explorá", "Galería", "Contacto"]);
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: /menú/i })).toBeFocused();
  });

  test("menú: un toque fuera lo cierra y un enlace lo cierra al llegar", async ({ page }) => {
    await page.goto("/");
    const menu = page.getByRole("navigation", { name: "Principal" });
    const toggle = page.getByRole("button", { name: /menú/i });
    await toggle.click();
    await expect(menu).toBeVisible();
    await page.mouse.click(5, page.viewportSize()!.height - 5);
    await expect(menu).toBeHidden();
    await toggle.click();
    await menu.getByRole("link", { name: "Servicios" }).click();
    await expect(menu).toBeHidden();
    await expect(page).toHaveURL(/#servicios$/);
  });

  test("con scroll la barra es translúcida y abierta es sólida", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header").first();
    const alpha = async () => Number((await header.evaluate((e) => getComputedStyle(e).backgroundColor)).match(/[\d.]+/g)![3] ?? 1);
    expect(await alpha()).toBe(1);
    await page.evaluate(() => window.scrollTo(0, 3000));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.scrollBy(0, -200)); // subir la muestra
    await expect(header).toBeInViewport();
    const a = await alpha();
    expect(a).toBeGreaterThan(0.7); // translúcida pero claramente visible
    expect(a).toBeLessThan(1);
    await page.getByRole("button", { name: /menú/i }).click();
    await expect.poll(alpha).toBe(1);
  });

  test("barra inferior móvil aparece al bajar", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Solo móvil");
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 1500));
    await expect(page.getByRole("link", { name: /^whatsapp$/i }).last()).toBeInViewport();
  });

  test("las URLs antiguas redirigen a las nuevas", async ({ page }) => {
    await page.goto("/events/Bodas");
    await expect(page).toHaveURL(/\/eventos\/bodas$/);
    await page.goto("/events/Festivales");
    await expect(page).toHaveURL(/\/eventos\/espectaculos$/);
  });
});

test.describe("servicios", () => {
  test("el enlace de servicio precarga el formulario", async ({ page }) => {
    await page.goto("/?servicio=luces#presupuesto");
    const form = page.locator("#presupuesto form");
    await form.scrollIntoViewIfNeeded();
    await form.getByLabel("Boda").check({ force: true });
    await form.getByLabel("Lugar o ciudad").fill("Maldonado");
    await form.getByRole("button", { name: /siguiente/i }).click();
    await expect(form.getByLabel("Luces")).toBeChecked();
  });
});

test.describe("páginas de evento", () => {
  for (const [slug, title, seoTitle] of [
    ["bodas", "Bodas", /para bodas/],
    ["cumpleanos-y-15", "Cumpleaños y 15", /cumpleaños y fiestas de 15/],
    ["fiestas-privadas", "Fiestas privadas", /fiestas privadas/],
    ["corporativos", "Corporativos", /eventos corporativos/],
    ["espectaculos", "Espectáculos", /espectáculos/],
  ] as const) {
    test(`/eventos/${slug}`, async ({ page }) => {
      await page.goto(`/eventos/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.getByRole("link", { name: /pedí tu presupuesto/i })).toHaveAttribute("href", `/?evento=${slug}#presupuesto`);
      await expect(page).toHaveTitle(seoTitle);
    });
  }

  test("evento inexistente devuelve 404", async ({ page }) => {
    const res = await page.goto("/eventos/inexistente");
    expect(res?.status()).toBe(404);
  });
});

test.describe("galería", () => {
  test("las piezas no auténticas de la portada están rotuladas y el aviso es el breve", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("#galeria");
    await expect(gallery.getByText("Las imágenes marcadas como «Ilustrativa» fueron generadas con IA.", { exact: true })).toBeVisible();
    await expect(gallery).not.toContainText(/completando|no son trabajos realizados/i);
    const tiles = gallery.locator("ul > li");
    const n = await tiles.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const real = (await tiles.nth(i).getByRole("button").getAttribute("aria-label"))?.match(/Murga sobre|Espectáculo de murga/);
      if (real) await expect(tiles.nth(i)).not.toContainText(/ilustrativa/i);
      else await expect(tiles.nth(i)).toContainText(/ilustrativa/i);
    }
  });

  test("visor accesible: abre, navega con flechas, cierra con Escape y devuelve el foco", async ({ page, isMobile }) => {
    test.skip(isMobile, "Teclado en escritorio");
    await page.goto("/");
    await page.locator("#galeria").scrollIntoViewIfNeeded();
    const first = page.locator("#galeria ul > li button").first();
    await first.focus();
    await page.keyboard.press("Enter");
    const dlg = page.getByRole("dialog", { name: "Visor de la galería" });
    await expect(dlg).toBeVisible();
    await expect(dlg).toContainText("01 /");
    await page.keyboard.press("ArrowRight");
    await expect(dlg).toContainText("02 /");
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await expect(first).toBeFocused();
  });

  test("filtro de videos", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Videos", exact: true }).click();
    const n = await page.locator("#galeria ul > li").count();
    expect(n).toBe(1);
  });
});

test.describe("formulario de presupuesto", () => {
  // Requieren un build con las tres NEXT_PUBLIC_EMAILJS_* (valores de prueba: nunca se contacta a EmailJS, se intercepta)
  const configured = !!(
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID &&
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
  );
  const sendUrl = "https://api.emailjs.com/api/v1.0/email/send";

  async function fillToSummary(page: import("@playwright/test").Page) {
    await page.goto("/");
    const form = page.locator("#presupuesto form");
    await form.scrollIntoViewIfNeeded();

    // Paso 1: validación
    await form.getByRole("button", { name: /siguiente/i }).click();
    await expect(form.getByRole("alert")).toContainText(/revisá/i);
    await expect(form.getByText("Elegí el tipo de evento.")).toBeVisible();
    await form.getByLabel("Boda").check({ force: true });
    await form.getByLabel("Lugar o ciudad").fill("Punta del Este");
    await form.getByRole("button", { name: /siguiente/i }).click();

    // Paso 2
    await form.getByRole("button", { name: /siguiente/i }).click();
    await expect(form.getByText("Elegí al menos una opción.")).toBeVisible();
    await form.getByLabel("Audio").check({ force: true });
    await form.getByLabel("Escenario portátil").check({ force: true });
    await form.getByRole("button", { name: /siguiente/i }).click();

    // Paso 3
    await form.getByLabel("Nombre").fill("Ana Test");
    await form.getByLabel("WhatsApp o teléfono").fill("099123456");
    await form.getByRole("button", { name: /siguiente/i }).click();
    return form;
  }

  test("recorre los 4 pasos y muestra el resumen", async ({ page }) => {
    const form = await fillToSummary(page);
    await expect(form.getByRole("heading", { name: /revisá y enviá/i })).toBeFocused();
    await expect(form).toContainText("Boda");
    await expect(form).toContainText("Audio, Escenario portátil");
    await expect(form).toContainText("Ana Test");
  });

  test("evento precargado desde ?evento=", async ({ page }) => {
    await page.goto("/?evento=corporativos#presupuesto");
    await expect(page.locator("#presupuesto form").getByLabel("Evento corporativo")).toBeChecked();
  });

  test("envío exitoso muestra confirmación y WhatsApp con el resumen", async ({ page }) => {
    test.skip(!configured, "Requiere build con NEXT_PUBLIC_EMAILJS_* (valores de prueba)");
    const bodies: string[] = [];
    await page.route(sendUrl, (r) => {
      bodies.push(r.request().postData() ?? "");
      return r.fulfill({ status: 200, contentType: "text/plain", body: "OK" });
    });
    const form = await fillToSummary(page);
    await form.getByRole("button", { name: /enviar pedido/i }).click();
    await expect(page.getByRole("heading", { name: /pedido enviado/i })).toBeVisible();
    const wa = page.getByRole("link", { name: /seguir por whatsapp/i });
    const href = (await wa.getAttribute("href")) ?? "";
    expect(href).toMatch(/^https:\/\/wa\.me\/59898067306\?text=/);
    expect(decodeURIComponent(href)).toContain("Evento: Boda");
    expect(bodies).toHaveLength(1);
    const sent = JSON.parse(bodies[0]);
    expect(sent.template_params).toMatchObject({ name: "Ana Test", event_type: "Boda", reply_to: "", email: "No informado" });
  });

  test("error del proveedor muestra alternativa por WhatsApp", async ({ page }) => {
    test.skip(!configured, "Requiere build con NEXT_PUBLIC_EMAILJS_* (valores de prueba)");
    await page.route(sendUrl, (r) => r.fulfill({ status: 412, contentType: "text/plain", body: "Invalid grant" }));
    const form = await fillToSummary(page);
    await form.getByRole("button", { name: /enviar pedido/i }).click();
    await expect(form.getByRole("alert")).toContainText(/no pudimos enviar/i);
    await expect(form.getByRole("link", { name: /enviar por whatsapp/i })).toBeVisible();
  });

  test("sin configuración no se envía y se ofrece WhatsApp", async ({ page }) => {
    test.skip(configured, "Solo aplica a un build sin NEXT_PUBLIC_EMAILJS_*");
    let calls = 0;
    await page.route(sendUrl, (r) => { calls++; return r.abort(); });
    const form = await fillToSummary(page);
    await form.getByRole("button", { name: /enviar pedido/i }).click();
    await expect(form.getByRole("alert")).toContainText(/no está disponible/i);
    await expect(form.getByRole("link", { name: /enviar por whatsapp/i })).toBeVisible();
    expect(calls).toBe(0);
  });

  test("servicio precargado desde ?servicio=", async ({ page }) => {
    await page.goto("/?servicio=luces#presupuesto");
    const form = page.locator("#presupuesto form");
    await form.getByLabel("Boda").check({ force: true });
    await form.getByLabel("Lugar o ciudad").fill("Montevideo");
    await form.getByRole("button", { name: /siguiente/i }).click();
    await expect(form.getByLabel("Luces")).toBeChecked();
  });

  test("error de red muestra alternativa por WhatsApp y permite reintentar", async ({ page }) => {
    test.skip(!configured, "Requiere build con NEXT_PUBLIC_EMAILJS_* (valores de prueba)");
    await page.route(sendUrl, (r) => r.abort());
    const form = await fillToSummary(page);
    await form.getByRole("button", { name: /enviar pedido/i }).click();
    await expect(form.getByRole("alert")).toContainText(/no pudimos enviar/i);
    await expect(form.getByRole("link", { name: /enviar por whatsapp/i })).toBeVisible();
    await expect(form.getByRole("button", { name: /reintentar/i })).toBeEnabled();
  });
});

test.describe("footer y firma", () => {
  test("la firma JCoding abre en pestaña nueva con etiqueta accesible y el footer ya no lleva el aviso general", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    const sig = footer.getByRole("link", { name: /JCoding/ });
    await expect(sig).toHaveAttribute("href", "https://jcoding.vercel.app/");
    await expect(sig).toHaveAttribute("target", "_blank");
    await expect(sig).toHaveAttribute("rel", "noopener noreferrer");
    await expect(sig).toHaveAttribute("aria-label", /abre en una pestaña nueva/);
    await expect(footer).toContainText(/© \d{4} Fabio Producciones/);
    await expect(footer).not.toContainText(/Ilustrativa/);
  });

  test("el aro del isotipo gira 30° al pasar el cursor; con reduced-motion no se mueve", async ({ browser, isMobile }) => {
    test.skip(isMobile, "Hover solo en escritorio");
    const rotate = async (reduced: boolean) => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduced ? "reduce" : "no-preference" });
      const page = await ctx.newPage();
      await page.goto("/");
      const sig = page.locator("footer a.jcoding-signature");
      await sig.scrollIntoViewIfNeeded();
      await sig.hover();
      await page.waitForTimeout(600);
      const t = await page.locator(".jcoding-signature__ring").evaluate((e) => getComputedStyle(e).transform);
      await ctx.close();
      return t;
    };
    expect(await rotate(false)).toBe("matrix(0.866025, 0.5, -0.5, 0.866025, 0, 0)");
    expect(await rotate(true)).toBe("none");
  });

  test("«Ilustrativa» solo aparece en la galería: ni hero, ni eventos, servicios o escenario", async ({ page }) => {
    await page.goto("/");
    for (const sel of ["section[aria-labelledby=hero-title]", "#eventos", "#servicios", "#escenario", "#presupuesto"]) {
      await expect(page.locator(sel)).not.toContainText(/ilustrativa/i);
    }
    await expect(page.locator("#galeria")).toContainText(/ilustrativa/i);
    await page.goto("/eventos/bodas");
    await expect(page.locator("article")).not.toContainText(/ilustrativa/i);
  });
});

test.describe("favicon", () => {
  test("el head declara el favicon nuevo y todos los archivos responden", async ({ page, request }) => {
    await page.goto("/");
    const hrefs = await page.locator('head link[rel="icon"], head link[rel="apple-touch-icon"]').evaluateAll((ls) => ls.map((l) => l.getAttribute("href")!));
    expect(hrefs.length).toBeGreaterThanOrEqual(3);
    for (const h of hrefs) expect((await request.get(h)).status()).toBe(200);
    const manifest = await (await request.get("/manifest.webmanifest")).json();
    for (const i of manifest.icons) expect((await request.get(i.src)).status()).toBe(200);
  });
});

test.describe("accesibilidad (axe)", () => {
  for (const path of ["/", "/eventos/bodas"]) {
    test(`sin violaciones serias o críticas en ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // Dar tiempo a que terminen los revelados antes de medir contraste
      await page.waitForTimeout(1500);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const bad = results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""));
      expect(bad.map((v) => `${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`)).toEqual([]);
    });
  }
});

test.describe("galería completa", () => {
  test("el botón de la portada lleva a /galeria, que filtra por tipo y abre el visor", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /ver toda la galería/i }).click();
    await expect(page).toHaveURL(/\/galeria$/);
    const all = await page.locator("section ul > li").count();
    expect(all).toBe(12);
    await expect(page.getByRole("button", { name: /Bodas|Corporativos/ })).toHaveCount(0);
    await page.getByRole("button", { name: "Videos", exact: true }).click();
    expect(await page.locator("section ul > li").count()).toBe(2);
    await page.getByRole("button", { name: "Fotos", exact: true }).click();
    expect(await page.locator("section ul > li").count()).toBe(10);
    await page.getByRole("button", { name: "Todos", exact: true }).click();
    expect(await page.locator("section ul > li").count()).toBe(all);
    await page.locator("section ul > li button").first().click();
    await expect(page.getByRole("dialog", { name: "Visor de la galería" })).toBeVisible();
  });
});

test("las fotos reales de murga en /galeria no llevan «Ilustrativa» y tienen crédito", async ({ page }) => {
  await page.goto("/galeria");
  await page.getByRole("button", { name: "Fotos", exact: true }).click();
  const tiles = page.locator("section ul > li").filter({ has: page.getByRole("button", { name: /Ampliar imagen: (Murga sobre|Espectáculo de murga)/ }) });
  await expect(tiles).toHaveCount(2);
  for (let i = 0; i < 2; i++) await expect(tiles.nth(i)).not.toContainText(/ilustrativa/i);
  await tiles.first().getByRole("button").click();
  await expect(page.getByRole("dialog", { name: "Visor de la galería" })).toContainText("Emilio Fotografía");
});

test.describe("etiqueta y aviso en /galeria y su visor", () => {
  test("aviso breve único; el visor rotula las ilustrativas y no las reales", async ({ page }) => {
    await page.goto("/galeria");
    await expect(page.getByText("Las imágenes marcadas como «Ilustrativa» fueron generadas con IA.", { exact: true })).toBeVisible();
    await expect(page.locator("section")).not.toContainText(/completando|no son trabajos realizados/i);
    const dlg = page.getByRole("dialog", { name: "Visor de la galería" });

    await page.getByRole("button", { name: "Fotos", exact: true }).click();
    const illustrative = page.locator("section ul > li").filter({ hasText: /ilustrativa/i }).first();
    await illustrative.getByRole("button").click();
    await expect(dlg).toContainText(/ilustrativa/i);
    await page.keyboard.press("Escape");

    const real = page.locator("section ul > li").filter({ has: page.getByRole("button", { name: /Ampliar imagen: Murga sobre/ }) }).first();
    await real.getByRole("button").click();
    await expect(dlg).toBeVisible();
    await expect(dlg).not.toContainText(/ilustrativa/i);
  });
});

test.describe("página 404", () => {
  const missing = ["/ruta-que-no-existe", "/eventos/inexistente", "/servicios/inexistente", "/galeria/otra",
    "/servicios/alquiler-de-sonido", "/servicios/alquiler-de-luces", "/servicios/alquiler-de-escenario-portatil"];

  for (const path of missing) {
    test(`acceso directo a ${path}: 404 real, independiente y sin directivas contradictorias`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByText("404", { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página no encontrada");
      await expect(page.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
      // Nada del sitio: ni navbar, ni footer, ni barra inferior, ni escenario, ni presupuesto
      for (const sel of ["header", "footer", "nav", "#escenario", "#presupuesto", "canvas", "[href*='presupuesto']"]) {
        await expect(page.locator(sel)).toHaveCount(0);
      }
      await expect(page.locator('meta[name="robots"]')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      const box = await page.getByRole("heading", { level: 1 }).boundingBox();
      const vp = page.viewportSize()!;
      expect(Math.abs(box!.x + box!.width / 2 - vp.width / 2)).toBeLessThan(2);
      expect(await page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight + 1)).toBe(true);
    });
  }

  test("navegación interna a un slug inexistente muestra la 404 y vuelve al inicio con el sitio completo", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    for (const path of ["/eventos/inexistente", "/servicios/inexistente"]) {
      await page.evaluate((p) => (window as unknown as { next: { router: { push: (u: string) => void } } }).next.router.push(p), path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Página no encontrada");
      await expect(page.locator("footer")).toHaveCount(0);
      await expect(page.locator("canvas")).toHaveCount(0);
      await page.getByRole("link", { name: "Volver al inicio" }).click();
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(/tu evento/i);
      await expect(page.locator("footer")).toHaveCount(1);
      await expect(page.locator("#escenario")).toHaveCount(1);
    }
  });

  test("no hay peticiones a los fotogramas del escenario", async ({ page }) => {
    const frames: string[] = [];
    page.on("request", (r) => { if (r.url().includes("/stage/frames/")) frames.push(r.url()); });
    await page.goto("/ruta-que-no-existe");
    await page.waitForLoadState("networkidle");
    expect(frames).toEqual([]);
  });

  test("accesibilidad (axe)", async ({ page }) => {
    await page.goto("/ruta-que-no-existe");
    const r = await new AxeBuilder({ page }).analyze();
    expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  });
});
