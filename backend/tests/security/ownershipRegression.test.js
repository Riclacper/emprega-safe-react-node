const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const controllers = path.join(__dirname, "../../src/controllers");

function read(file) {
  return fs.readFileSync(path.join(controllers, file), "utf8");
}

test("analysis queries remain scoped to authenticated user", () => {
  const source = read("analysisController.js");

  assert.match(source, /Analysis\.find\(\{ user: req\.user\._id \}\)/);
  assert.match(source, /externalId: req\.params\.externalId,\s+user: req\.user\._id/);
});

test("report listing, linking and email sending remain scoped to authenticated user", () => {
  const source = read("reportController.js");

  assert.match(source, /Report\.find\(\{ user: req\.user\._id \}\)/);
  assert.match(source, /user: req\.user\._id/);
  assert.match(source, /Report\.findOne\(\{\s+_id: req\.params\.id,\s+user: req\.user\._id/);
});

test("statistics remain scoped to authenticated user", () => {
  const source = read("statsController.js");

  assert.match(source, /Analysis\.find\(\{ user: req\.user\._id \}\)/);
  assert.match(source, /Report\.find\(\{ user: req\.user\._id \}\)/);
});
