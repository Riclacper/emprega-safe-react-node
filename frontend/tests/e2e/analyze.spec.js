import { expect, test } from "@playwright/test";

async function prepareAuthenticatedPage(page) {
  await page.addInitScript(() => {
    localStorage.setItem("empregasafe_token", "test-token");
    localStorage.setItem(
      "empregasafe_user",
      JSON.stringify({ name: "Pessoa Teste", email: "teste@example.com" }),
    );
  });
}

test("displays an API warning when the vacancy was already analyzed", async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await page.route("**/api/analyses", (route) =>
    route.fulfill({
      status: 409,
      json: { message: "Esta vaga já foi analisada por este usuário." },
    }),
  );

  await page.goto("/app/analisar");
  await page
    .getByPlaceholder("Ex: Auxiliar Administrativo")
    .fill("Desenvolvedor Full Stack");
  await page
    .getByPlaceholder("Cole aqui a descrição completa da vaga...")
    .fill("Atividades e requisitos detalhados para a oportunidade.");
  await page.getByRole("button", { name: "Analisar vaga" }).click();

  await expect(
    page.getByText("Esta vaga já foi analisada por este usuário."),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Analisar vaga" })).toBeEnabled();
});
