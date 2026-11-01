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
  test("enlace de saltar al contenido y navegación por teclado", async ({ page, isMobile }) => {
    test.skip(isMobile, "El teclado se prueba en escritorio");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /saltar al contenido/i })).toBeFocused();
    await page.keyboard.press("Tab"); // logo
    await page.keyboard.press("Tab");
    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link").first()).toBeFocused();
  });

  test("menú móvil: abre, atrapa foco y cierra con Escape", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Solo móvil");
    await page.goto("/");
    const menu = page.getByRole("dialog", { name: "Menú principal" });
    await expect(menu).toBeHidden();
    await page.getByRole("button", { name: /menú/i }).click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(page.getByRole("button", { name: /menú/i })).toBeFocused();
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

test.describe("páginas de evento", () => {
  for (const [slug, title] of [
    ["bodas", "Bodas"],
    ["cumpleanos-y-15", "Cumpleaños y 15"],
    ["fiestas-privadas", "Fiestas privadas"],
    ["corporativos", "Corporativos"],
    ["espectaculos", "Espectáculos"],
  ]) {
    test(`/eventos/${slug}`, async ({ page }) => {
      await page.goto(`/eventos/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
      await expect(page.getByRole("link", { name: /pedí tu presupuesto/i })).toHaveAttribute("href", `/?evento=${slug}#presupuesto`);
      await expect(page).toHaveTitle(new RegExp(title));
    });
  }

  test("evento inexistente devuelve 404", async ({ page }) => {
    const res = await page.goto("/eventos/inexistente");
    expect(res?.status()).toBe(404);
  });
});

test.describe("galería", () => {
  test("todas las piezas no auténticas están rotuladas y avisan que no son trabajos reales", async ({ page }) => {
    await page.goto("/");
    const gallery = page.locator("#galeria");
    await expect(gallery).toContainText(/no son trabajos realizados/i);
    const tiles = gallery.locator("ul > li");
    const n = await tiles.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) await expect(tiles.nth(i)).toContainText(/ilustrativa/i);
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
    expect(n).toBe(2);
  });
});

test.describe("formulario de presupuesto", () => {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY;

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
    test.skip(!key, "Requiere build con NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY (puede ser un valor de prueba)");
    await page.route("https://api.web3forms.com/submit", (r) =>
      r.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) }),
    );
    const form = await fillToSummary(page);
    await form.getByRole("button", { name: /enviar pedido/i }).click();
    await expect(page.getByRole("heading", { name: /pedido enviado/i })).toBeVisible();
    const wa = page.getByRole("link", { name: /seguir por whatsapp/i });
    const href = (await wa.getAttribute("href")) ?? "";
    expect(href).toMatch(/^https:\/\/wa\.me\/59898067306\?text=/);
    expect(decodeURIComponent(href)).toContain("Evento: Boda");
  });

  test("error de red muestra alternativa por WhatsApp y permite reintentar", async ({ page }) => {
    test.skip(!key, "Requiere build con NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY");
    await page.route("https://api.web3forms.com/submit", (r) => r.abort());
    const form = await fillToSummary(page);
    await form.getByRole("button", { name: /enviar pedido/i }).click();
    await expect(form.getByRole("alert")).toContainText(/no pudimos enviar/i);
    await expect(form.getByRole("link", { name: /enviar por whatsapp/i })).toBeVisible();
    await expect(form.getByRole("button", { name: /reintentar/i })).toBeEnabled();
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
