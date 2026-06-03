const test = require("node:test");
const assert = require("node:assert/strict");
const jwt = require("jsonwebtoken");

process.env.JWT_SECRET = "test-secret-with-enough-entropy";
process.env.JWT_EXPIRES_IN = "1h";

const userModelPath = require.resolve("../../src/models/User");
const authControllerPath = require.resolve("../../src/controllers/authController");
const authMiddlewarePath = require.resolve("../../src/middlewares/authMiddleware");

const state = {};

const User = {
  findById(id) {
    state.findById = id;

    return {
      select(fields) {
        state.selectFields = fields;
        return Promise.resolve(state.authUser);
      },
    };
  },
  findOne(query) {
    state.findOneQuery = query;
    return Promise.resolve(state.resetUser);
  },
};

require.cache[userModelPath] = {
  id: userModelPath,
  filename: userModelPath,
  loaded: true,
  exports: User,
};

delete require.cache[authControllerPath];
delete require.cache[authMiddlewarePath];

const { generateToken, resetPassword } = require("../../src/controllers/authController");
const { authRequired } = require("../../src/middlewares/authMiddleware");

function resetState() {
  for (const key of Object.keys(state)) {
    delete state[key];
  }
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

function createAuthRequest(token) {
  return {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
}

test.beforeEach(resetState);

test("generateToken includes passwordChangedAt when present", () => {
  const passwordChangedAt = new Date("2026-06-02T12:00:00.000Z");
  const token = generateToken({
    _id: "user-1",
    name: "Pessoa Teste",
    email: "pessoa@example.com",
    role: "user",
    passwordChangedAt,
  });

  const decoded = jwt.decode(token);

  assert.equal(decoded.id, "user-1");
  assert.equal(decoded.passwordChangedAt, passwordChangedAt.getTime());
});

test("authRequired keeps compatibility with users without passwordChangedAt", async () => {
  const token = jwt.sign({ id: "user-1" }, process.env.JWT_SECRET);
  const req = createAuthRequest(token);
  const res = createResponse();
  let nextCalled = false;

  state.authUser = {
    _id: "user-1",
    name: "Pessoa Teste",
    email: "pessoa@example.com",
    role: "user",
    active: true,
    passwordChangedAt: null,
  };

  await authRequired(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user, state.authUser);
});

test("authRequired rejects tokens issued before password reset", async () => {
  const currentPasswordChangedAt = new Date("2026-06-02T12:00:00.000Z");
  const token = jwt.sign(
    { id: "user-1", passwordChangedAt: currentPasswordChangedAt.getTime() - 1 },
    process.env.JWT_SECRET,
  );
  const req = createAuthRequest(token);
  const res = createResponse();
  let nextCalled = false;

  state.authUser = {
    _id: "user-1",
    active: true,
    passwordChangedAt: currentPasswordChangedAt,
  };

  await authRequired(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.message, "Sessão expirada ou inválida.");
});

test("authRequired accepts tokens matching the current passwordChangedAt", async () => {
  const currentPasswordChangedAt = new Date("2026-06-02T12:00:00.000Z");
  const token = jwt.sign(
    { id: "user-1", passwordChangedAt: currentPasswordChangedAt.getTime() },
    process.env.JWT_SECRET,
  );
  const req = createAuthRequest(token);
  const res = createResponse();
  let nextCalled = false;

  state.authUser = {
    _id: "user-1",
    active: true,
    passwordChangedAt: currentPasswordChangedAt,
  };

  await authRequired(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});

test("resetPassword updates passwordChangedAt to invalidate older sessions", async () => {
  const beforeReset = Date.now();
  let saved = false;

  state.resetUser = {
    password: "old-hash",
    passwordResetCode: "123456",
    passwordResetExpires: new Date(Date.now() + 60_000),
    verificationCode: "654321",
    verificationExpires: new Date(Date.now() + 60_000),
    async save() {
      saved = true;
    },
  };

  const req = {
    body: {
      email: "pessoa@example.com",
      code: "123456",
      password: "nova-senha",
    },
  };
  const res = createResponse();

  await resetPassword(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(saved, true);
  assert.equal(state.resetUser.passwordResetCode, null);
  assert.equal(state.resetUser.passwordResetExpires, null);
  assert.equal(state.resetUser.verificationCode, null);
  assert.equal(state.resetUser.verificationExpires, null);
  assert.ok(state.resetUser.passwordChangedAt instanceof Date);
  assert.ok(state.resetUser.passwordChangedAt.getTime() >= beforeReset);
});
