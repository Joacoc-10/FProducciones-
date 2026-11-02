import { expect, test, type Page } from "@playwright/test";

/** Espacio que deja la navbar sobre el destino: scroll-margin-top = nav-h (4,5 rem) + 1 rem. */
const TOP = 88;
const ORDER = ["eventos", "servicios", "escenario", "galeria", "presupuesto"] as const;
const LABEL: Record<(typeof ORDER)[number], string> = {
  eventos: "Eventos",
  servicios: "Servicios",
  escenario: "Escenario",
  galeria: "En portada",
  presupuesto: "Presupuesto",
};

const topOf = (page: Page, id: string) =>
  page.evaluate((i) => Math.round(document.getElementById(i)!.getBoundingClientRect().top), id);

/** Espera a que el scroll deje de cambiar (sin timeouts fijos: compara fotogramas consecutivos). */
async function settled(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let last = -1;
        let same = 0;
        const tick = () => {
          same = Math.abs(window.scrollY - last) < 0.5 ? same + 1 : 0;
          last = window.scrollY;
          if (same >= 20) resolve();
          else requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

async function expectAt(page: Page, id: string) {
  await settled(page);
  expect(Math.abs((await topOf(page, id)) - TOP)).toBeLessThanOrEqual(2);
}

/** Navega con un enlace del menú desplegable. */
async function viaMenu(page: Page, id: (typeof ORDER)[number]) {
  await page.getByRole("button", { name: /menú/i }).click();
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: LABEL[id], exact: true }).click();
}

const frameRequests = (page: Page) => {
  const hits: string[] = [];
  page.on("request", (r) => r.url().includes("/stage/frames/") && hits.push(r.url()));
  return hits;
};

test.describe("anclas en la portada", () => {
  test("Inicio → Contacto llega directo, sin recorrer el escenario", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const frames = frameRequests(page);
    await page.getByRole("link", { name: /pedí tu presupuesto/i }).first().click();
    await expectAt(page, "presupuesto");
    await expect(page).toHaveURL(/#presupuesto$/);
    // Atravesar el escenario scrub a scrub pedía decenas de fotogramas (36–53 antes del arreglo)
    expect(frames.length).toBeLessThanOrEqual(3);
  });

  test("cada ancla principal llega a su sitio, de ida y de vuelta", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    for (const id of ORDER) {
      await viaMenu(page, id);
      await expectAt(page, id);
    }
    for (const id of [...ORDER].reverse().slice(1)) {
      await viaMenu(page, id);
      await expectAt(page, id);
    }
  });

  test("tras navegar por un enlace, el escenario sigue montándose al hacer scroll manual", async ({ page, isMobile }) => {
    test.skip(isMobile, "La rueda se prueba en escritorio");
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await viaMenu(page, "presupuesto");
    await expectAt(page, "presupuesto");
    await viaMenu(page, "servicios");
    await expectAt(page, "servicios");
    const status = page.locator("#escenario").getByText(/Estado \d\d \/ 05/);
    await page.locator("#escenario").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 40));
    await expect(status).toContainText("Estado 01");
    for (let i = 0; i < 40; i++) await page.mouse.wheel(0, 250);
    await expect(status).not.toContainText("Estado 01");
  });
});

test.describe("portada → evento → presupuesto", () => {
  test("el recorrido completo llega a Contacto, también repetido", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    for (const slug of ["bodas", "corporativos", "bodas"]) {
      await page.locator(`#eventos a[href='/eventos/${slug}']`).click();
      await expect(page).toHaveURL(new RegExp(`/eventos/${slug}$`));
      await page.getByRole("link", { name: /pedí tu presupuesto/i }).click();
      await expect(page).toHaveURL(new RegExp(`/\\?evento=${slug}#presupuesto$`));
      await expectAt(page, "presupuesto");
      // Nada vuelve a mover la página después de aterrizar
      const y = await page.evaluate(() => window.scrollY);
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => window.scrollY)).toBe(y);
      await page.locator("#eventos").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 88));
      await expect(page.locator("#eventos a[href='/eventos/bodas']")).toBeVisible();
    }
  });

  test("tras llegar a Contacto, la rueda suelta el destino y no se vuelve a forzar", async ({ page, isMobile }) => {
    test.skip(isMobile, "La rueda se prueba en escritorio");
    await page.goto("/eventos/bodas");
    await page.getByRole("link", { name: /pedí tu presupuesto/i }).click();
    await expectAt(page, "presupuesto");
    await page.mouse.move(400, 400);
    await page.mouse.wheel(0, -1200);
    await page.waitForTimeout(700);
    expect(await topOf(page, "presupuesto")).toBeGreaterThan(TOP + 400);
  });

  test("atrás y adelante restauran la posición de cada entrada", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("#eventos").evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY + 300));
    await settled(page);
    const y0 = await page.evaluate(() => Math.round(window.scrollY));
    await page.locator("#eventos a[href='/eventos/bodas']").click();
    await expect(page).toHaveURL(/\/eventos\/bodas$/);
    await page.getByRole("link", { name: /pedí tu presupuesto/i }).click();
    await expectAt(page, "presupuesto");
    await page.goBack(); // evento
    await expect(page).toHaveURL(/\/eventos\/bodas$/);
    await page.goBack(); // portada, donde estaba
    await expect(page).toHaveURL(/localhost:\d+\/$/);
    await settled(page);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - y0)).toBeLessThanOrEqual(2);
    await page.goForward();
    await page.goForward();
    await expect(page).toHaveURL(/#presupuesto$/);
    await expectAt(page, "presupuesto");
  });

  test("atrás tras un ancla de la misma página vuelve a la posición anterior", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await viaMenu(page, "servicios");
    await expectAt(page, "servicios");
    await viaMenu(page, "presupuesto");
    await expectAt(page, "presupuesto");
    await page.goBack();
    await expect(page).toHaveURL(/#servicios$/);
    await expectAt(page, "servicios");
  });
});

test.describe("acceso directo y recarga con hash", () => {
  test("/#presupuesto carga en Contacto y la recarga conserva la posición", async ({ page }) => {
    await page.goto("/#presupuesto");
    await expectAt(page, "presupuesto");
    await page.reload();
    await expectAt(page, "presupuesto");
  });

  test("/#escenario carga al inicio del escenario", async ({ page }) => {
    await page.goto("/#escenario");
    await expectAt(page, "escenario");
  });
});

/** Exceso de contenido sobre el área visible del menú abierto (0 = nada recortado ni con scroll). */
async function overflowOf(page: Page) {
  return page.evaluate(() => {
    const header = document.querySelector("header")!;
    const h = header.getBoundingClientRect();
    let x = 0;
    let y = 0;
    for (const el of header.querySelectorAll<HTMLElement>("#menu-principal a, #menu-principal li")) {
      const r = el.getBoundingClientRect();
      x = Math.max(x, Math.ceil(h.left + 1 - r.left), Math.ceil(r.right - (h.right - 1)));
      y = Math.max(y, Math.ceil(r.bottom - (h.bottom - 1)));
    }
    const nav = document.querySelector<HTMLElement>("#menu-principal nav")!;
    const scrollable = [nav, ...nav.querySelectorAll<HTMLElement>("*")].some(
      (e) => e.scrollHeight > e.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(e).overflowY),
    );
    return { x, y: y + (scrollable ? 1 : 0) };
  });
}

test.describe("navbar compacto", () => {
  const toggle = (page: Page) => page.getByRole("button", { name: /menú/i });
  const box = (page: Page) => page.locator("header").first().boundingBox();

  test("contenedor centrado y compacto, con el logo centrado respecto de él", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "En móvil el logo va a la derecha");
    await page.goto("/");
    const vw = page.viewportSize()!.width;
    const b = (await box(page))!;
    expect(b.width).toBeLessThan(vw);
    expect(b.y).toBeGreaterThan(4);
    expect(Math.abs(b.x + b.width / 2 - vw / 2)).toBeLessThanOrEqual(1);
    const logo = (await page.locator("header a[aria-label*='inicio']").boundingBox())!;
    expect(Math.abs(logo.x + logo.width / 2 - (b.x + b.width / 2))).toBeLessThanOrEqual(1);
  });

  test("abrir expande el mismo contenedor sin mover el layout; cerrar lo devuelve", async ({ page }) => {
    await page.goto("/");
    const before = await page.evaluate(() => [document.documentElement.scrollHeight, document.querySelector("main")!.getBoundingClientRect().top]);
    const closed = (await box(page))!.height;
    await toggle(page).click();
    await expect.poll(async () => (await box(page))!.height).toBeGreaterThan(closed + 150);
    const during = await page.evaluate(() => [document.documentElement.scrollHeight, document.querySelector("main")!.getBoundingClientRect().top]);
    expect(during).toEqual(before);
    await toggle(page).click();
    await expect.poll(async () => (await box(page))!.height).toBe(closed);
    await expect(page.getByRole("navigation", { name: "Principal" })).toBeHidden();
  });

  test("pulsaciones rápidas e inversión a mitad de animación no dejan estados atascados", async ({ page }) => {
    await page.goto("/");
    const closed = (await box(page))!.height;
    const btn = toggle(page);
    for (let n = 1; n <= 7; n++) {
      await btn.evaluate((el: HTMLElement) => el.click());
      await page.waitForTimeout(n * 30);
    }
    // 7 pulsaciones: queda abierto
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect.poll(async () => (await box(page))!.height).toBeGreaterThan(closed + 150);
    await btn.click();
    await page.waitForTimeout(150); // a mitad de cierre
    await btn.click(); // invierte
    await expect(btn).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("navigation", { name: "Principal" }).getByRole("link").first()).toBeVisible();
    await btn.click();
    await expect.poll(async () => (await box(page))!.height).toBe(closed);
    await expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  test("al cambiar el tamaño con el menú abierto, el contenedor cabe en pantalla sin scroll interno", async ({ page }) => {
    await page.goto("/");
    await toggle(page).click();
    await page.setViewportSize({ width: 390, height: 500 });
    await expect.poll(async () => {
      const b = (await box(page))!;
      return b.y + b.height <= 500;
    }).toBe(true);
    await expect.poll(() => overflowOf(page)).toEqual({ x: 0, y: 0 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("desde un evento, un enlace del menú llega a su sección y deja el menú cerrado y el scroll libre", async ({ page }) => {
    await page.goto("/eventos/bodas");
    await toggle(page).click();
    await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Servicios", exact: true }).click();
    await expect(page).toHaveURL(/\/#servicios$/);
    await expectAt(page, "servicios");
    await expect(toggle(page)).toHaveAttribute("aria-expanded", "false");
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(300);
    expect(await topOf(page, "servicios")).toBeLessThan(TOP - 300);
  });

  test("enlace de la misma página con scroll libre al terminar", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await viaMenu(page, "presupuesto");
    await expectAt(page, "presupuesto");
    await page.evaluate(() => window.scrollBy(0, -400));
    await page.waitForTimeout(300);
    expect(await topOf(page, "presupuesto")).toBeGreaterThan(TOP + 300);
  });
});
