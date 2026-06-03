const test = require("node:test");
const assert = require("node:assert/strict");
const {
  escapeHtml,
  sanitizeEmailSubject,
} = require("../../src/services/emailService");

test("escapeHtml neutralizes HTML special characters in email content", () => {
  assert.equal(
    escapeHtml(`<a href="javascript:alert('x')">Clique</a>`),
    "&lt;a href=&quot;javascript:alert(&#39;x&#39;)&quot;&gt;Clique&lt;/a&gt;",
  );
});

test("sanitizeEmailSubject removes line breaks from subject values", () => {
  assert.equal(
    sanitizeEmailSubject("Empresa\nBCC: atacante@example.com"),
    "Empresa BCC: atacante@example.com",
  );
});
