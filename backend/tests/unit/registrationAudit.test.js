const test = require("node:test");
const assert = require("node:assert/strict");

process.env.JWT_SECRET = "test-secret-with-enough-entropy";

const modelPath = require.resolve("../../src/models/RegistrationAudit");
const servicePath = require.resolve("../../src/services/registrationAuditService");
const state = {};

const RegistrationAudit = {
  db: { readyState: 1 },
  async create(payload) {
    state.payload = payload;
  },
};

require.cache[modelPath] = {
  id: modelPath,
  filename: modelPath,
  loaded: true,
  exports: RegistrationAudit,
};
delete require.cache[servicePath];

const {
  hashIdentifier,
  maskEmail,
  maskIp,
  recordRegistrationAudit,
} = require("../../src/services/registrationAuditService");

test.beforeEach(() => {
  delete state.payload;
});

test("masks email and IP values while preserving useful correlation", () => {
  assert.equal(maskEmail("pessoa@example.com"), "p***@example.com");
  assert.equal(maskIp("192.168.10.25"), "192.168.10.***");
  assert.equal(hashIdentifier("Pessoa@Example.com"), hashIdentifier("pessoa@example.com"));
});

test("registration audit stores minimized metadata without request secrets", async () => {
  await recordRegistrationAudit(
    {
      ip: "192.168.10.25",
      body: {
        password: "senha-que-nao-pode-ser-gravada",
        verificationCode: "123456",
      },
      get(header) {
        return header === "user-agent" ? "Browser Teste" : "";
      },
    },
    {
      email: "pessoa@example.com",
      outcome: "accepted",
      reason: "account_created",
      user: { _id: "user-1" },
    },
  );

  assert.deepEqual(state.payload, {
    outcome: "accepted",
    reason: "account_created",
    user: "user-1",
    maskedEmail: "p***@example.com",
    emailHash: hashIdentifier("pessoa@example.com"),
    maskedIp: "192.168.10.***",
    ipHash: hashIdentifier("192.168.10.25"),
    userAgent: "Browser Teste",
  });
  assert.doesNotMatch(JSON.stringify(state.payload), /senha|123456/);
});
