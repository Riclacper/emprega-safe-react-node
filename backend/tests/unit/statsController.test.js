const test = require("node:test");
const assert = require("node:assert/strict");

const analysisModelPath = require.resolve("../../src/models/Analysis");
const reportModelPath = require.resolve("../../src/models/Report");
const controllerPath = require.resolve("../../src/controllers/statsController");

const state = {};

const Analysis = {
  async find(query) {
    state.analysisQuery = query;
    return state.analyses;
  },
};

const Report = {
  async find(query) {
    state.reportQuery = query;
    return state.reports;
  },
  async aggregate(pipeline) {
    state.aggregatePipeline = pipeline;
    return state.topReportedCompanies;
  },
};

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
delete require.cache[controllerPath];

const { getStats } = require("../../src/controllers/statsController");

function resetState() {
  for (const key of Object.keys(state)) {
    delete state[key];
  }

  state.analyses = [];
  state.reports = [];
  state.topReportedCompanies = [];
}

function createResponse() {
  return {
    body: null,
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test.beforeEach(resetState);

test("getStats keeps personal stats scoped and exposes only aggregated top reported companies", async () => {
  state.analyses = [
    {
      company: "Empresa A",
      classification: "Suspeita",
      analysisMode: "rules",
      score: 40,
    },
    {
      company: "Empresa B",
      classification: "Confiável",
      analysisMode: "hybrid",
      score: 90,
    },
  ];
  state.reports = [{ company: "Empresa A" }];
  state.topReportedCompanies = [
    { company: "Empresa A", count: 3 },
    { company: "Empresa C", count: 2 },
  ];

  const req = { user: { _id: "user-1" } };
  const res = createResponse();

  await getStats(req, res);

  assert.deepEqual(state.analysisQuery, { user: "user-1" });
  assert.deepEqual(state.reportQuery, { user: "user-1" });
  assert.equal(Array.isArray(state.aggregatePipeline), true);
  assert.equal(res.body.total, 2);
  assert.equal(res.body.reports, 1);
  assert.deepEqual(res.body.topReportedCompanies, [
    { company: "Empresa A", count: 3 },
    { company: "Empresa C", count: 2 },
  ]);
});
