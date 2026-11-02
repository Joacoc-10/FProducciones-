import { expect, test, type Page } from "@playwright/test";

const header = (page: Page) => page.locator("header").first();
const toggle = (page: Page) => page.getByRole("button", { name: /menú/i });
const menu = (page: Page) => page.getByRole("navigation", { name: "Principal" });
const hiddenBar = async (page: Page) => (await header(page).boundingBox())!.y + (await header(page).boundingBox())!.height <= 0;

/** Desplaza con la rueda (Lenis o nativo) y deja pasar unos fotogramas. */
async function wheel(page: Page, dy: number) {
  await page.mouse.move(300, 450);
  for (let i = 0; i < 4; i++) {
    await page.mouse.wheel(0, dy / 4);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(400);
}

/** Exceso del contenido del menú sobre su contenedor, y si algún elemento tiene scroll propio. */
async function clipping(page: Page) {
  return page.evaluate(() => {
    const h = document.querySelector("header")!.getBoundingClientRect();
    let out = 0;
    document.querySelectorAll<HTMLElement>("#menu-principal a").forEach((a) => {
      const r = a.getBoundingClientRect();
      out = Math.max(out, h.top - r.top, r.bottom - h.bottom, h.left - r.left, r.right - h.right);
    });
    const scrollers = [...document.querySelectorAll<HTMLElement>("header *")].filter(
      (e) => /(auto|scroll)/.test(getComputedStyle(e).overflow) && (e.scrollHeight > e.clientHeight + 1 || e.scrollWidth > e.clientWidth + 1),
    );
    return { out: Math.ceil(out), scrollers: scrollers.length, links: document.querySelectorAll("#menu-principal a").length };
  });
}

test.describe("menú sin scroll interno", () => {
  const sizes = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "portátil bajo", width: 1280, height: 600 },
    { name: "móvil 390x844", width: 390, height: 844 },
    { name: "móvil 360x640", width: 360, height: 640 },
    { name: "móvil 375x667", width: 375, height: 667 },
    { name: "móvil horizontal", width: 844, height: 390 },
    { name: "móvil horizontal chico", width: 667, height: 375 },
  ];
  for (const s of sizes) {
    test(`${s.name}: todo visible, sin barras`, async ({ page }) => {
      await page.setViewportSize({ width: s.width, height: s.height });
      await page.goto("/");
      await toggle(page).click();
      await expect(menu(page).getByRole("link", { name: "Email" })).toBeVisible();
      await page.waitForTimeout(900); // animación completa
      const c = await clipping(page);
      expect(c.scrollers).toBe(0);
      expect(c.out).toBeLessThanOrEqual(0);
      const b = (await header(page).boundingBox())!;
      expect(b.y).toBeGreaterThanOrEqual(0);
      expect(b.y + b.height).toBeLessThanOrEqual(s.height);
      // Áreas táctiles razonables
      for (const l of await menu(page).getByRole("link").all()) expect((await l.boundingBox())!.height).toBeGreaterThanOrEqual(36);
    });
  }
});

test.describe("cerrar al desplazarse fuera", () => {
  test("rueda/trackpad fuera cierra y deja seguir; dentro no", async ({ page }) => {
    await page.goto("/");
    await toggle(page).click();
    await expect(menu(page).getByRole("link").first()).toBeVisible();
    const b = (await header(page).boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.mouse.move(b.x + b.width / 2, page.viewportSize()!.height - 6);
    await page.mouse.wheel(0, 300);
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  });

  test("clic fuera y Escape siguen cerrando", async ({ page }) => {
    await page.goto("/");
    await toggle(page).click();
    await page.mouse.click(5, page.viewportSize()!.height - 6);
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    await toggle(page).click();
    await page.keyboard.press("Escape");
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
  });
});

test.describe("cerrar con gesto táctil", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  /** Gesto táctil sintético vía CDP. */
  async function swipe(page: Page, x: number, y0: number, y1: number) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y: y0 }] });
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y: y0 + ((y1 - y0) * i) / steps }] });
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }

  test("un deslizamiento fuera cierra; un toque no se confunde; dentro no cierra", async ({ page }) => {
    await page.goto("/");
    await toggle(page).click();
    await expect(menu(page).getByRole("link").first()).toBeVisible();
    const b = (await header(page).boundingBox())!;
    await swipe(page, 195, b.y + b.height / 2 + 20, b.y + b.height / 2 - 80);
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "true");
    await swipe(page, 195, 830, 600);
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });
});

test.describe("ocultar al bajar y mostrar al subir", () => {
  test("baja: se esconde; sube: reaparece; arriba: visible; abierto: no se oculta", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(header(page)).toBeInViewport();
    await wheel(page, 1200);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    await expect.poll(() => hiddenBar(page)).toBe(true);
    await wheel(page, -150);
    await expect.poll(() => hiddenBar(page)).toBe(false);
    await expect(header(page)).toBeInViewport();
    await wheel(page, 400);
    await expect.poll(() => hiddenBar(page)).toBe(true);
    await wheel(page, -6000); // Lenis gobierna el scroll: se vuelve al inicio con la rueda
    await expect.poll(() => hiddenBar(page)).toBe(false);
  });

  test("movimientos mínimos no la ocultan; el foco dentro la mantiene; Tab la revela", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await wheel(page, 1000);
    await expect.poll(() => hiddenBar(page)).toBe(true);
    await wheel(page, -100);
    await expect.poll(() => hiddenBar(page)).toBe(false);
    await page.mouse.wheel(0, 4);
    await page.waitForTimeout(300);
    expect(await hiddenBar(page)).toBe(false);
    await toggle(page).focus();
    await wheel(page, 600);
    expect(await hiddenBar(page)).toBe(false);
  });

  test("un salto a ancla desde el menú no la oculta ni parpadea", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await toggle(page).click();
    await menu(page).getByRole("link", { name: "Servicios", exact: true }).click();
    const seen: boolean[] = [];
    for (let i = 0; i < 12; i++) {
      seen.push(await hiddenBar(page));
      await page.waitForTimeout(100);
    }
    expect(seen.every((h) => !h)).toBe(true);
  });

  test("movimiento reducido: sin deslizamiento animado y el menú funciona", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await toggle(page).click();
    await expect(menu(page).getByRole("link", { name: "Email" })).toBeVisible();
    const c = await clipping(page);
    expect(c.scrollers).toBe(0);
    await page.keyboard.press("Escape");
    await expect(menu(page)).toBeHidden();
  });
});

test.describe("barra superior", () => {
  test("móvil: hamburguesa a la izquierda, logo a la derecha, sin WhatsApp", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Solo móvil");
    await page.goto("/");
    const h = (await header(page).boundingBox())!;
    const btn = (await toggle(page).boundingBox())!;
    const logo = (await page.locator("header a[aria-label*='inicio']").boundingBox())!;
    expect(btn.x - h.x).toBeLessThan(20);
    expect(h.x + h.width - (logo.x + logo.width)).toBeLessThan(20);
    await expect(page.locator("header a[aria-label*='WhatsApp']")).toBeHidden();
    // El acceso sigue dentro del menú
    await toggle(page).click();
    await expect(menu(page).getByRole("link", { name: "WhatsApp" })).toBeVisible();
  });

  test("desktop: hamburguesa a la izquierda, logo centrado, WhatsApp a la derecha", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "Solo desktop");
    await page.goto("/");
    const h = (await header(page).boundingBox())!;
    const wa = (await page.locator("header a[aria-label*='WhatsApp']").boundingBox())!;
    const logo = (await page.locator("header a[aria-label*='inicio']").boundingBox())!;
    expect(wa.x + wa.width).toBeGreaterThan(h.x + h.width - 20);
    expect(Math.abs(logo.x + logo.width / 2 - (h.x + h.width / 2))).toBeLessThanOrEqual(1);
  });
});
