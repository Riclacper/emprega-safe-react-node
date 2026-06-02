const test = require("node:test");
const assert = require("node:assert/strict");

const analysisModelPath = require.resolve("../../src/models/Analysis");
const reportModelPath = require.resolve("../../src/models/Report");
const emailServicePath = require.resolve("../../src/services/emailService");
const controllerPath = require.resolve("../../src/controllers/reportController");

const state = {};

const Analysis = {
  async findOne(query) {
    state.analysisQuery = query;
    return state.linkedAnalysis;
  },
};

const Report = {
  find(query) {
    state.listQuery = query;

    return {
      populate(...args) {
        state.listPopulate = args;
        return this;
      },
      sort(sort) {
        state.listSort = sort;
        return this;
      },
      limit(limit) {
        state.listLimit = limit;
        return Promise.resolve(state.reports);
      },
    };
  },
  async create(payload) {
    state.createPayload = payload;
    return state.createdReport;
  },
  async exists(query) {
    state.existsQuery = query;
    return state.existingLinkedReport;
  },
  findById(id) {
    state.findById = id;

    return {
      populate(...args) {
        state.createdPopulate = args;
        return Promise.resolve(state.populatedReport);
      },
    };
  },
  findOne(query) {
    state.emailReportQuery = query;

    return {
      populate(...args) {
        state.emailPopulate = args;
        return Promise.resolve(state.emailReport);
      },
    };
  },
};

async function sendReportEmail(email, reportData) {
  state.sentEmail = { email, reportData };
}

require.cache[analysisModelPath] = {
  id: analysisModelPath,
  filename: analysisModelPath,
  loaded: true,
  exports: Analysis,
};
require.cache[reportModelPath] = {
  id: reportModelPath,
  filename: reportModelPath,
  loaded: true,
  exports: Report,
};
require.cache[emailServicePath] = {
  id: emailServicePath,
  filename: emailServicePath,
  loaded: true,
  exports: { sendReportEmail },
};
delete require.cache[controllerPath];

const {
  createReport,
  listReports,
  sendReportByEmail,
} = require("../../src/controllers/reportController");

function resetState() {
  for (const key of Object.keys(state)) {
    delete state[key];
  }

  state.reports = [];
  state.createdReport = { _id: "report-created-id" };
  state.populatedReport = { _id: "report-created-id", company: "Empresa Teste" };
  state.linkedAnalysis = null;
  state.existingLinkedReport = null;
  state.emailReport = null;
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

test.beforeEach(resetState);

test("listReports scopes the query to the authenticated user", async () => {
  state.reports = [{ _id: "report-1" }];
  const req = { user: { _id: "user-1" } };
  const res = createResponse();

  await listReports(req, res);

  assert.deepEqual(state.listQuery, { user: "user-1" });
  assert.deepEqual(state.listSort, { createdAt: -1 });
  assert.equal(state.listLimit, 200);
  assert.deepEqual(res.body, state.reports);
});

test("createReport rejects invalid payloads before writing to the database", async () => {
  const req = { user: { _id: "user-1" }, body: { reason: "não" } };
  const res = createResponse();

  await createReport(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.message,
    "Informe um motivo de denúncia com pelo menos 5 caracteres.",
  );
  assert.equal(state.createPayload, undefined);
});

test("createReport links only an analysis owned by the authenticated user", async () => {
  state.linkedAnalysis = {
    _id: "analysis-1",
    company: "Empresa vinculada",
    link: "https://empresa.example/vaga",
  };
  const req = {
    user: { _id: "user-1" },
    body: {
      analysisId: "ANL-TESTE-001",
      reason: "Cobrança antecipada",
      details: "Solicitaram pagamento antes da entrevista.",
    },
  };
  const res = createResponse();

  await createReport(req, res);

  assert.deepEqual(state.analysisQuery, {
    externalId: "ANL-TESTE-001",
    user: "user-1",
  });
  assert.equal(state.createPayload.user, "user-1");
  assert.equal(state.createPayload.analysis, "analysis-1");
  assert.equal(state.createPayload.company, "Empresa vinculada");
  assert.match(state.createPayload.externalId, /^REP-[0-9a-f-]{36}$/);
  assert.equal(res.statusCode, 201);
  assert.deepEqual(res.body, state.populatedReport);
});

test("createReport refuses a linked analysis that does not belong to the user", async () => {
  const req = {
    user: { _id: "user-1" },
    body: {
      analysisId: "ANL-DE-OUTRO-USUARIO",
      reason: "Vaga suspeita",
    },
  };
  const res = createResponse();

  await createReport(req, res);

  assert.deepEqual(state.analysisQuery, {
    externalId: "ANL-DE-OUTRO-USUARIO",
    user: "user-1",
  });
  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Análise vinculada não encontrada.");
  assert.equal(state.createPayload, undefined);
});

test("createReport rejects a duplicate report for the same user and analysis", async () => {
  state.linkedAnalysis = {
    _id: "analysis-1",
    company: "Empresa vinculada",
  };
  state.existingLinkedReport = { _id: "existing-report" };
  const req = {
    user: { _id: "user-1" },
    body: {
      analysisId: "ANL-TESTE-001",
      reason: "Cobrança antecipada",
    },
  };
  const res = createResponse();

  await createReport(req, res);

  assert.deepEqual(state.existsQuery, {
    user: "user-1",
    analysis: "analysis-1",
  });
  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, "Esta vaga já foi denunciada por este usuário.");
  assert.equal(state.createPayload, undefined);
});

test("sendReportByEmail scopes the report query and sends the authenticated user email", async () => {
  state.emailReport = {
    company: "Empresa Teste",
    reason: "Cobrança antecipada",
    details: "Foi solicitado pagamento.",
    link: "https://empresa.example/vaga",
    createdAt: "2026-06-02T12:00:00.000Z",
    analysis: {
      externalId: "ANL-TESTE-001",
      title: "Desenvolvedor Full Stack",
      company: "Empresa Teste",
      classification: "Suspeita",
      score: 45,
    },
  };
  const req = {
    params: { id: "report-1" },
    user: { _id: "user-1", email: "pessoa@example.com" },
  };
  const res = createResponse();

  await sendReportByEmail(req, res);

  assert.deepEqual(state.emailReportQuery, {
    _id: "report-1",
    user: "user-1",
  });
  assert.equal(state.sentEmail.email, "pessoa@example.com");
  assert.equal(state.sentEmail.reportData.analysisId, "ANL-TESTE-001");
  assert.equal(state.sentEmail.reportData.score, "45/100");
  assert.deepEqual(res.body, { message: "E-mail enviado com sucesso." });
});

test("sendReportByEmail does not expose a report outside the authenticated user scope", async () => {
  const req = {
    params: { id: "report-from-another-user" },
    user: { _id: "user-1", email: "pessoa@example.com" },
  };
  const res = createResponse();

  await sendReportByEmail(req, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.message, "Denúncia não encontrada.");
  assert.equal(state.sentEmail, undefined);
});

test("sendReportByEmail rejects an authenticated user without a registered email", async () => {
  state.emailReport = {
    company: "Empresa Teste",
    reason: "Cobrança antecipada",
    createdAt: "2026-06-02T12:00:00.000Z",
  };
  const req = {
    params: { id: "report-1" },
    user: { _id: "user-1" },
  };
  const res = createResponse();

  await sendReportByEmail(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.message,
    "Usuário logado não possui e-mail cadastrado.",
  );
  assert.equal(state.sentEmail, undefined);
});
