const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createAnalysisFingerprint,
} = require("../../src/utils/analysisFingerprint");

test("analysis fingerprint ignores casing, accents and trailing slash differences", () => {
  const first = createAnalysisFingerprint({
    title: "Analista de Suporte",
    company: "Conexão Serviços",
    link: "https://EMPRESA.example/vagas/123/",
    description: "Primeira descrição.",
  });
  const second = createAnalysisFingerprint({
    title: "  analista DE suporte ",
    company: "conexao servicos",
    link: "https://empresa.example/vagas/123",
    description: "Descrição alterada sem mudar a vaga.",
  });

  assert.equal(first, second);
});

test("analysis fingerprint uses vacancy details when no link is available", () => {
  const first = createAnalysisFingerprint({
    title: "Auxiliar Administrativo",
    company: "Empresa Teste",
    contact: "rh@empresa.example",
    description: "Atendimento e organização de documentos.",
  });
  const second = createAnalysisFingerprint({
    title: "Auxiliar Administrativo",
    company: "Empresa Teste",
    contact: "rh@empresa.example",
    description: "Outra oportunidade com atividades diferentes.",
  });

  assert.notEqual(first, second);
});
