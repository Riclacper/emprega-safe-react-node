import { expect, test } from "@playwright/test";

test("login provides a working return action to landing page", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Voltar" }).click();

  await expect(page).toHaveURL("/");
  await expect(
    page.getByText("Descubra se uma vaga é confiável antes de avançar no processo."),
  ).toBeVisible();
});

test("verification uses six fields, supports paste and returns to login", async ({
  page,
}) => {
  await page.route("**/api/auth/login", async (route) => {
    await route.fulfill({
      json: { requiresVerification: true },
    });
  });

  await page.goto("/login");
  await page.getByPlaceholder("Digite seu e-mail").fill("pessoa@example.com");
  await page.getByPlaceholder("Digite sua senha").fill("senha-segura");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL("/verify");

  const codeInputs = page.locator(".verify-code-input");
  await expect(codeInputs).toHaveCount(6);

  await page.getByRole("button", { name: "Validar código" }).click();
  await expect(page.locator(".verify-code-error .verify-code-input")).toHaveCount(6);

  await codeInputs.first().evaluate((input) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "123456");
    input.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, clipboardData }),
    );
  });

  for (const [index, digit] of [..."123456"].entries()) {
    await expect(codeInputs.nth(index)).toHaveValue(digit);
  }

  await page.getByRole("button", { name: "Voltar para login" }).click();
  await expect(page).toHaveURL("/login");
});
