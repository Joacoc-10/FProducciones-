import { expect, test } from "@playwright/test";

test.describe("escenario: presentación estática (reduced-motion)", () => {
  test.use({ reducedMotion: "reduce" });

  test("muestra los cinco pasos completos, sin canvas, pin ni paso activo", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#escenario");
    await section.scrollIntoViewIfNeeded();
    await expect(section.getByText("Proceso de armado · 5 pasos")).toBeVisible();
    await expect(section.getByText(/Estado \d\d \/ 05/)).toHaveCount(0);
    await expect(section.locator("canvas")).toHaveCount(0);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    const steps = section.getByRole("list", { name: "Proceso de armado · 5 pasos" }).getByRole("listitem");
    await expect(steps).toHaveCount(5);
    for (let i = 0; i < 5; i++) await expect(steps.nth(i)).toBeVisible();
    await expect(section.locator("li[aria-current]")).toHaveCount(0);
  });
});
