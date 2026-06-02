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

test("registration rejects a common email domain typo before calling the API", async ({
  page,
}) => {
  let registerRequests = 0;

  await page.route("**/api/auth/register", (route) => {
    registerRequests += 1;
    return route.fulfill({ status: 201, json: { message: "Conta criada." } });
  });

  await page.goto("/register");
  await page.getByPlaceholder("Digite seu nome").fill("Pessoa Teste");
  await page.getByPlaceholder("Digite seu e-mail").fill("nbh@hgh.vom");
  await page.getByPlaceholder("Mínimo 6 caracteres").fill("senha-segura");
  await page.getByPlaceholder("Repita sua senha").fill("senha-segura");
  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(
    page.getByText("Verifique o domínio do e-mail. Você quis dizer .com?"),
  ).toBeVisible();
  expect(registerRequests).toBe(0);
});
