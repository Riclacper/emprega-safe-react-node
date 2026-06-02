const fs = require("node:fs");
const path = require("node:path");
const { analyzeByRules } = require("../src/services/riskRulesService");
const fixtures = require("../tests/ai/fixtures");

const liveAi = process.argv.includes("--live-ai");

function meetsExpectation(score, classification, expected) {
  if (expected.minScore !== undefined && score < expected.minScore) return false;
  if (expected.maxScore !== undefined && score > expected.maxScore) return false;
  if (expected.classification && classification !== expected.classification) {
    return false;
  }
  return true;
}

async function run() {
  let analyzeWithAI = null;

  if (liveAi) {
    process.env.AI_ENABLED = "true";
    ({ analyzeWithAI } = require("../src/services/aiAnalysisService"));
  }

  const rows = [];

  for (const fixture of fixtures) {
    const ruleResult = analyzeByRules(fixture.payload);
    const aiResult = liveAi ? await analyzeWithAI(fixture.payload) : null;

    rows.push({
      id: fixture.id,
      expected: fixture.expected,
      rules: {
        score: ruleResult.score,
        classification: ruleResult.classification,
        matchesExpected: meetsExpectation(
          ruleResult.score,
          ruleResult.classification,
          fixture.expected,
        ),
      },
      ai: aiResult
        ? {
            score: aiResult.aiScore,
            classification: aiResult.aiClassification,
            differenceFromRules: aiResult.aiScore - ruleResult.score,
          }
        : null,
    });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    mode: liveAi ? "rules-and-live-ai" : "rules-only",
    total: rows.length,
    ruleMatches: rows.filter((row) => row.rules.matchesExpected).length,
    rows,
  };

  const outputDir = path.join(__dirname, "../artifacts");
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(
    path.join(outputDir, "ai-evaluation.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );

  console.table(
    rows.map((row) => ({
      fixture: row.id,
      rules: `${row.rules.score} ${row.rules.classification}`,
      expected: row.rules.matchesExpected ? "OK" : "FAIL",
      ai: row.ai ? `${row.ai.score} ${row.ai.classification}` : "disabled",
    })),
  );

  if (summary.ruleMatches !== summary.total) {
    process.exitCode = 1;
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
