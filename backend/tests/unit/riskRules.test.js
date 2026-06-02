const test = require("node:test");
const assert = require("node:assert/strict");
const { analyzeByRules } = require("../../src/services/riskRulesService");
const {
  classificationByScore,
  recommendationByScore,
} = require("../../src/utils/riskLabels");
const {
  validateAnalysisPayload,
  validateReportPayload,
} = require("../../src/utils/validators");

test("classifies score boundaries consistently", () => {
  assert.equal(classificationByScore(25).classification, "Confiável");
  assert.equal(classificationByScore(26).classification, "Suspeita");
  assert.equal(classificationByScore(56).classification, "Fraudulenta");
  assert.equal(classificationByScore(81).classification, "Risco crítico");
  assert.match(recommendationByScore(90), /Interrompa o contato/);
});

test("raises risk for advance payment and informal contact", () => {
  const result = analyzeByRules({
    title: "Auxiliar remoto urgente",
    company: "",
    salary: 15000,
    contact: "recrutamento@gmail.com",
    link: "https://bit.ly/vaga",
    description:
      "Contratação imediata. Pague uma taxa via Pix e envie CPF e RG para liberar o acesso.",
  });

  assert.ok(result.score >= 80);
  assert.equal(result.classification, "Risco crítico");
  assert.ok(result.signals.length >= 5);
});

test("keeps a detailed formal vacancy in the low-risk range", () => {
  const result = analyzeByRules({
    title: "Analista de suporte",
    company: "Empresa Exemplo",
    salary: 3500,
    contact: "talentos@empresaexemplo.com.br",
    link: "https://empresaexemplo.com.br/carreiras",
    description:
      "Responsabilidades: atender clientes e documentar chamados. Requisitos: comunicação, organização e experiência com suporte. Benefícios: vale alimentação e plano de saúde.",
  });

  assert.ok(result.score <= 25);
  assert.equal(result.classification, "Confiável");
});

test("validates required analysis fields and normalizes unsupported currency", () => {
  assert.equal(validateAnalysisPayload({}).valid, false);

  const validation = validateAnalysisPayload({
    title: "Pessoa desenvolvedora",
    description: "Atividades e requisitos detalhados para a oportunidade.",
    currency: "ABC",
  });

  assert.equal(validation.valid, true);
  assert.equal(validation.payload.currency, "BRL");
});

test("sanitizes reports and rejects unsafe links", () => {
  const invalid = validateReportPayload({
    reason: "Possível golpe",
    link: "javascript:alert(1)",
  });

  assert.equal(invalid.valid, false);

  const valid = validateReportPayload({
    reason: "Possível golpe com cobrança antecipada",
    details: "x".repeat(4000),
  });

  assert.equal(valid.valid, true);
  assert.equal(valid.payload.details.length, 3000);
});
