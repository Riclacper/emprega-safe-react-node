const test = require("node:test");
const assert = require("node:assert/strict");
const { validateEmail } = require("../../src/utils/emailValidation");

test("accepts a structurally valid email and normalizes its casing", () => {
  assert.deepEqual(validateEmail(" Pessoa@Empresa.COM.BR "), {
    valid: true,
    email: "pessoa@empresa.com.br",
  });
});

test("rejects malformed email addresses", () => {
  for (const email of [
    "sem-arroba.example.com",
    "@example.com",
    "pessoa@",
    "pessoa@example",
    "pessoa@@example.com",
  ]) {
    assert.deepEqual(validateEmail(email), {
      valid: false,
      message: "Informe um e-mail válido.",
    });
  }
});

test("rejects common top-level domain typos with an actionable message", () => {
  assert.deepEqual(validateEmail("nbh@hgh.vom"), {
    valid: false,
    message: "Verifique o domínio do e-mail. Você quis dizer .com?",
  });
});
