const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-with-enough-entropy";
process.env.CORS_ORIGIN = "http://localhost:5173";

const app = require("../../src/app");

test("health endpoint exposes security headers", async () => {
  const response = await request(app).get("/health").expect(200);

  assert.ok(response.headers["x-content-type-options"]);
  assert.ok(response.headers["x-frame-options"]);
  assert.ok(response.headers["content-security-policy"]);
});

test("CORS accepts configured origin", async () => {
  const response = await request(app)
    .get("/health")
    .set("Origin", "http://localhost:5173")
    .expect(200);

  assert.equal(
    response.headers["access-control-allow-origin"],
    "http://localhost:5173",
  );
});

test("CORS rejects unknown origin", async () => {
  const response = await request(app)
    .get("/health")
    .set("Origin", "https://evil.example");

  assert.equal(response.status, 500);
  assert.doesNotMatch(response.text, /stack|node_modules/i);
});

test("protected API rejects missing and malformed bearer tokens", async () => {
  await request(app).get("/api/analyses").expect(401);
  await request(app)
    .get("/api/analyses")
    .set("Authorization", "Bearer invalid-token")
    .expect(401);
});

test("JSON body limit rejects oversized requests", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: "a".repeat(2_100_000), password: "password" });

  assert.equal(response.status, 413);
});

test("registration rejects a common email domain typo", async () => {
  const response = await request(app).post("/api/auth/register").send({
    name: "Pessoa Teste",
    email: "nbh@hgh.vom",
    password: "senha-segura",
  });

  assert.equal(response.status, 400);
  assert.equal(
    response.body.message,
    "Verifique o domínio do e-mail. Você quis dizer .com?",
  );
});

test("login endpoint limits repeated attempts", async () => {
  let response;

  for (let attempt = 0; attempt < 21; attempt += 1) {
    response = await request(app).post("/api/auth/login").send({});
  }

  assert.equal(response.status, 429);
});
