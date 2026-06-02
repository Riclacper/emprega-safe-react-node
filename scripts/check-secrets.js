const { execFileSync } = require("node:child_process");
const fs = require("node:fs");

const trackedFiles = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const forbiddenFiles = trackedFiles.filter(
  (file) => /(^|\/)\.env($|\.)/.test(file) && !file.endsWith(".env.example"),
);

const secretPatterns = [
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /\bgh[opsu]_[A-Za-z0-9_]{30,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
  /\bmongodb(?:\+srv)?:\/\/[^:\s]+:[^@\s]+@/i,
];

const leakedSecrets = [];

for (const file of trackedFiles) {
  if (
    file.endsWith(".env.example") ||
    !fs.existsSync(file) ||
    fs.statSync(file).isDirectory()
  ) {
    continue;
  }

  const content = fs
    .readFileSync(file, "utf8")
    .replace(/mongodb\+srv:\/\/usuario:senha@/gi, "");

  for (const pattern of secretPatterns) {
    if (pattern.test(content)) {
      leakedSecrets.push(`${file}: matches ${pattern}`);
    }
  }
}

if (forbiddenFiles.length || leakedSecrets.length) {
  console.error("Potential secrets found in tracked files.");

  for (const file of forbiddenFiles) {
    console.error(`- forbidden env file: ${file}`);
  }

  for (const leak of leakedSecrets) {
    console.error(`- ${leak}`);
  }

  process.exit(1);
}

console.log("Secret scan passed.");
