const test = require("node:test");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-with-enough-entropy";

const app = require("../../src/app");

test("report endpoints reject unauthenticated requests", async () => {
  await request(app).get("/api/reports").expect(401);
  await request(app)
    .post("/api/reports")
    .send({ reason: "Vaga suspeita" })
    .expect(401);
  await request(app)
    .post("/api/reports/507f1f77bcf86cd799439011/send-email")
    .expect(401);
});
