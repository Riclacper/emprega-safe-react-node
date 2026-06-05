import { expect, test } from "@playwright/test";

const analysisFixture = {
  _id: "analysis-1",
  externalId: "ANL-TESTE-001",
  title: "Desenvolvedor Full Stack",
  company: "Empresa Teste",
  link: "https://empresa.example/vaga",
  score: 72,
  classification: "Fraudulenta",
};

const reportFixture = {
  _id: "report-1",
  externalId: "REP-TESTE-001",
  company: "Empresa Teste",
  link: "https://empresa.example/vaga",
  reason: "Cobrança antecipada",
  details: "Solicitaram pagamento antes da entrevista.",
  createdAt: "2026-06-02T12:00:00.000Z",
  analysis: analysisFixture,
};

async function prepareAuthenticatedPage(page) {
  await page.addInitScript(() => {
    localStorage.setItem("empregasafe_token", "test-token");
    localStorage.setItem(
      "empregasafe_user",
      JSON.stringify({ name: "Pessoa Teste", email: "teste@example.com" }),
    );
  });
}

async function mockReportsPage(page, reports = []) {
  await page.route("**/api/analyses", (route) =>
    route.fulfill({ json: [analysisFixture] }),
  );
  await page.route("**/api/reports", async (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({ status: 201, json: reportFixture });
    }

    return route.fulfill({ json: reports });
  });
}

test("requires an analysis and creates a report with automatically filled vacancy data", async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await mockReportsPage(page);

  await page.goto("/app/denuncias");
  await page.getByRole("button", { name: "Registrar denúncia" }).click();

  await expect(page.getByPlaceholder("Clique para buscar")).toHaveClass(
    /field-error/,
  );

  await page.getByPlaceholder("Clique para buscar").click();
  await page.getByRole("button", { name: /Empresa Teste/ }).click();

  await expect(
    page.getByPlaceholder("Nome da empresa ou anunciante"),
  ).toHaveValue("Empresa Teste");
  await expect(
    page.getByPlaceholder(
      "Ex: Cobrança antecipada, pedido de documentos, golpe",
    ),
  ).toHaveValue("Denúncia relacionada a uma vaga suspeita");

  const createRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/reports") && request.method() === "POST",
  );
  await page.getByRole("button", { name: "Registrar denúncia" }).click();

  expect((await createRequest).postDataJSON()).toEqual({
    analysisId: "ANL-TESTE-001",
    company: "Empresa Teste",
    link: "https://empresa.example/vaga",
    reason: "Denúncia relacionada a uma vaga suspeita",
    details:
      'Denúncia relacionada à vaga "Desenvolvedor Full Stack" classificada como Fraudulenta com score 72/100.',
  });
  await expect(page.getByText("Denúncia registrada com sucesso.")).toBeVisible();
});

test("closes the report modal automatically after sending email", async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await mockReportsPage(page, [reportFixture]);
  await page.route("**/api/reports/report-1/send-email", (route) =>
    route.fulfill({ json: { message: "E-mail enviado com sucesso." } }),
  );

  await page.goto("/app/denuncias");
  await page.getByRole("button", { name: "Ver" }).click();
  await expect(page.getByText("Detalhes da denúncia")).toBeVisible();

  const emailRequest = page.waitForRequest(
    "**/api/reports/report-1/send-email",
  );
  await page.getByRole("button", { name: "Enviar por e-mail" }).click();
  await emailRequest;

  await expect(page.getByText("Detalhes da denúncia")).toBeHidden();
});

test("displays an API warning when the selected vacancy was already reported", async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await mockReportsPage(page);
  await page.route("**/api/reports", async (route) => {
    if (route.request().method() === "POST") {
      return route.fulfill({
        status: 409,
        json: { message: "Esta vaga já foi denunciada por este usuário." },
      });
    }

    return route.fallback();
  });

  await page.goto("/app/denuncias");
  await page.getByPlaceholder("Clique para buscar").click();
  await page.getByRole("button", { name: /Empresa Teste/ }).click();
  await page.getByRole("button", { name: "Registrar denúncia" }).click();

  await expect(
    page.getByText("Esta vaga já foi denunciada por este usuário."),
  ).toBeVisible();
});

test("keeps the modal open and displays the API error when email sending fails", async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await mockReportsPage(page, [reportFixture]);
  await page.route("**/api/reports/report-1/send-email", (route) =>
    route.fulfill({
      status: 500,
      json: { message: "Não foi possível enviar o e-mail da denúncia." },
    }),
  );

  await page.goto("/app/denuncias");
  await page.getByRole("button", { name: "Ver" }).click();
  await page.getByRole("button", { name: "Enviar por e-mail" }).click();

  await expect(page.getByText("Detalhes da denúncia")).toBeVisible();
  await expect(
    page.getByText("Não foi possível enviar o e-mail da denúncia."),
  ).toBeVisible();
});
