import { expect, test, type Page } from "@playwright/test";

const hint = (page: Page) => page.locator("#escenario .stage-hint");
const scrollTo = (page: Page, y: number) => page.evaluate((v) => window.scrollTo(0, v), y);

test.describe("escenario: indicación de scroll", () => {
  test("mano centrada; se oculta al avanzar y reaparece al volver al inicio, en varios ciclos", async ({ page }, info) => {
    await page.goto("/");
    const top = await page.locator("#escenario").evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await expect(hint(page)).toHaveAttribute("data-show", "false");

    await scrollTo(page, top);
    await expect(hint(page)).toHaveAttribute("data-show", "true");
    await expect(hint(page).locator(".stage-hint-title")).toHaveText("Armá el escenario");
    await expect(hint(page).locator(".stage-hint-text span:visible")).toHaveText(
      info.project.name === "mobile" ? "Deslizá para ver cómo cobra vida." : "Hacé scroll para ver cómo cobra vida.",
    );

    // La mano es visible y está centrada horizontalmente sobre el escenario
    const icon = hint(page).locator(".stage-hint-icon svg");
    await expect(icon).toBeVisible();
    await page.waitForTimeout(700); // fin del fade
    const visual = await page.locator('#escenario [role="img"]').boundingBox();
    const iconBox = await icon.boundingBox();
    const cardBox = await hint(page).locator(".stage-hint-card").boundingBox();
    expect(visual && iconBox && cardBox).toBeTruthy();
    const mid = visual!.x + visual!.width / 2;
    expect(Math.abs(iconBox!.x + iconBox!.width / 2 - mid)).toBeLessThan(2);
    expect(Math.abs(cardBox!.x + cardBox!.width / 2 - mid)).toBeLessThan(2);
    await page.screenshot({ path: `test-results/hint-${info.project.name}.png` });

    // Varios ciclos: bajar oculta, volver al inicio muestra
    for (let i = 0; i < 3; i++) {
      await scrollTo(page, top + 400);
      await expect(hint(page)).toHaveAttribute("data-show", "false");
      await scrollTo(page, top + 150);
      await expect(hint(page)).toHaveAttribute("data-show", "false");
      await scrollTo(page, top);
      await expect(hint(page)).toHaveAttribute("data-show", "true");
    }

    // Oscilar cerca del inicio no la hace parpadear
    await scrollTo(page, top + 400);
    await expect(hint(page)).toHaveAttribute("data-show", "false");
    for (const dy of [30, 60, 30, 60, 30]) {
      await scrollTo(page, top + dy);
      await expect(hint(page)).toHaveAttribute("data-show", "false");
    }

    // Salir de la sección hacia arriba la oculta; al volver al inicio reaparece
    await scrollTo(page, 0);
    await expect(hint(page)).toHaveAttribute("data-show", "false");
    await scrollTo(page, top);
    await expect(hint(page)).toHaveAttribute("data-show", "true");
  });
});

test.describe("escenario: indicación en modo estático", () => {
  test.use({ reducedMotion: "reduce" });
  test("no se renderiza", async ({ page }) => {
    await page.goto("/");
    await expect(hint(page)).toHaveCount(0);
  });
});
