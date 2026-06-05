import { expect, test } from "@playwright/test";

const analysisFixture = {
  externalId: "ANL-TESTE-001",
  title: "Desenvolvedor Full Stack",
  company: "Empresa Teste",
  salary: 6500,
  currency: "BRL",
  score: 12,
  classification: "Confiável",
  badge: "baixo",
  analysisMode: "rules",
  reasons: ["Nenhum sinal crítico foi identificado."],
  recommendation: "Confirme os dados da empresa antes de avançar.",
  createdAt: "2026-06-02T12:00:00.000Z",
};

async function prepareAuthenticatedPage(page) {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => {
    localStorage.setItem("empregasafe_token", "test-token");
    localStorage.setItem(
      "empregasafe_user",
      JSON.stringify({ name: "Pessoa Teste", email: "teste@example.com" }),
    );
  });
}

test("landing page keeps its visual structure", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByText("Descubra se uma vaga é confiável antes de avançar no processo."),
  ).toBeVisible();

  await testInfo.attach("landing-light-theme", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("login fields keep white background on focus", async ({ page }, testInfo) => {
  await page.goto("/login");

  const email = page.getByPlaceholder("Digite seu e-mail");
  const password = page.getByPlaceholder("Digite sua senha");

  await email.focus();
  await expect(email.locator("..")).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await password.focus();
  await expect(password.locator("..")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );

  await testInfo.attach("login-focused-fields", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("uses dark theme when the device prefers dark colors", async ({
  page,
}, testInfo) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/login");

  const background = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--bg").trim(),
  );

  expect(background).toBe("#0b1220");
  await expect(page.locator(".auth-card")).toHaveCSS(
    "background-color",
    "rgb(17, 24, 39)",
  );

  const email = page.getByPlaceholder("Digite seu e-mail");
  await email.focus();
  await expect(email.locator("..")).toHaveCSS(
    "background-color",
    "rgb(23, 32, 51)",
  );

  await testInfo.attach("login-dark-device-theme", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
});

test("dashboard help boxes remain readable in dark theme", async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.route("**/api/stats", (route) =>
    route.fulfill({
      json: {
        total: 2,
        safe: 1,
        suspicious: 1,
        fraudulent: 0,
        critical: 0,
        reports: 0,
        companiesFlagged: 1,
        averageScore: 20,
        classificationChart: [
          { name: "Confiável", value: 1 },
          { name: "Suspeita", value: 1 },
          { name: "Fraudulenta", value: 0 },
          { name: "Crítica", value: 0 },
        ],
        modeChart: [
          { name: "Regras", value: 1 },
          { name: "Híbrida", value: 1 },
        ],
      },
    }),
  );
  await page.route("**/api/analyses", (route) =>
    route.fulfill({ json: [analysisFixture] }),
  );

  await page.goto("/app");

  const helpBoxes = page.locator(".chart-help-box");
  await expect(helpBoxes).toHaveCount(2);

  for (const helpBox of await helpBoxes.all()) {
    await expect(helpBox).toHaveCSS("background-color", "rgb(23, 32, 51)");
    await expect(helpBox.locator("strong")).toHaveCSS(
      "color",
      "rgb(248, 250, 252)",
    );
    await expect(helpBox.locator("p")).toHaveCSS(
      "color",
      "rgb(203, 213, 225)",
    );
  }

  const latestStatus = page.locator(".latest-table .badge-baixo");
  await expect(latestStatus).toHaveCSS("background-color", "rgb(18, 55, 47)");
  await expect(latestStatus).toHaveCSS("font-weight", "950");
});

test("history fields and detail modal remain readable in dark theme", async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await page.route("**/api/analyses", (route) =>
    route.fulfill({ json: [analysisFixture] }),
  );

  await page.goto("/app/historico");

  const search = page.getByPlaceholder("Buscar por vaga, empresa, status ou ID");
  await expect(search).toHaveCSS("background-color", "rgb(23, 32, 51)");

  const viewButton = page.getByRole("button", { name: "Ver" });
  await expect(viewButton).toHaveCSS("background-color", "rgb(23, 32, 51)");

  const historyStatus = page.locator(".history-risk-cell .badge-baixo");
  await expect(historyStatus).toHaveCSS("background-color", "rgb(18, 55, 47)");
  await expect(historyStatus).toHaveCSS("color", "rgb(167, 243, 208)");
  await expect(historyStatus).toHaveCSS("font-weight", "950");

  await viewButton.click();

  await expect(page.locator(".report-modal")).toHaveCSS(
    "background-color",
    "rgb(17, 24, 39)",
  );
  await expect(page.locator(".recommendation")).toHaveCSS(
    "background-color",
    "rgb(23, 32, 51)",
  );
  await expect(page.locator(".report-modal .badge-baixo")).toHaveCSS(
    "font-weight",
    "950",
  );
});

test("report form fields remain readable in dark theme", async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.route("**/api/analyses", (route) =>
    route.fulfill({ json: [analysisFixture] }),
  );
  await page.route("**/api/reports", (route) => route.fulfill({ json: [] }));

  await page.goto("/app/denuncias");

  const analysisSearch = page.getByPlaceholder("Clique para buscar");
  await expect(analysisSearch).toHaveCSS("background-color", "rgb(23, 32, 51)");

  const details = page.getByPlaceholder(
    "Descreva o que aconteceu, quais sinais chamaram atenção e como foi o contato.",
  );
  await expect(details).toHaveCSS("background-color", "rgb(23, 32, 51)");
});
