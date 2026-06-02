const test = require("node:test");
const assert = require("node:assert/strict");

const analysisModelPath = require.resolve("../../src/models/Analysis");
const analysisServicePath = require.resolve("../../src/services/analysisService");
const controllerPath = require.resolve("../../src/controllers/analysisController");

const state = {};

const Analysis = {
  async exists(query) {
    state.existsQuery = query;
    return state.existingAnalysis;
  },
  async create(payload) {
    state.createPayload = payload;
    return payload;
  },
};

async function buildAnalysis(payload, userId) {
  state.buildAnalysis = { payload, userId };

  return {
    externalId: "ANL-TESTE-001",
    user: userId,
    ...payload,
    score: 12,
    classification: "Confiável",
    badge: "baixo",
    recommendation: "Confira os dados da empresa.",
  };
}

require.cache[analysisModelPath] = {
  id: analysisModelPath,
  filename: analysisModelPath,
  loaded: true,
  exports: Analysis,
};
require.cache[analysisServicePath] = {
  id: analysisServicePath,
  filename: analysisServicePath,
  loaded: true,
  exports: { buildAnalysis },
};
delete require.cache[controllerPath];

const { createAnalysis } = require("../../src/controllers/analysisController");

function resetState() {
  for (const key of Object.keys(state)) {
    delete state[key];
  }

  state.existingAnalysis = null;
}

function createResponse() {
  return {
    statusCode: 200,
    body: null,
    status(statusCode) {
      this.statusCode = statusCode;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

function validBody(overrides = {}) {
  return {
    title: "Desenvolvedor Full Stack",
    company: "Empresa Teste",
    link: "https://empresa.example/vagas/123",
    description: "Atividades e requisitos detalhados para a oportunidade.",
    ...overrides,
  };
}

test.beforeEach(resetState);

test("createAnalysis saves a fingerprint scoped to the authenticated user", async () => {
  const req = { user: { _id: "user-1" }, body: validBody() };
  const res = createResponse();

  await createAnalysis(req, res);

  assert.equal(state.existsQuery.user, "user-1");
  assert.match(state.existsQuery.fingerprint, /^[0-9a-f]{64}$/);
  assert.equal(state.createPayload.fingerprint, state.existsQuery.fingerprint);
  assert.equal(state.buildAnalysis.userId, "user-1");
  assert.equal(res.statusCode, 201);
});

test("createAnalysis rejects a repeated vacancy before running the analysis service", async () => {
  state.existingAnalysis = { _id: "existing-analysis" };
  const req = {
    user: { _id: "user-1" },
    body: validBody({ title: "  Desenvolvedor FULL stack " }),
  };
  const res = createResponse();

  await createAnalysis(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, "Esta vaga já foi analisada por este usuário.");
  assert.equal(state.buildAnalysis, undefined);
  assert.equal(state.createPayload, undefined);
});
