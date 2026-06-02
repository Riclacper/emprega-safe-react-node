const Analysis = require("../models/Analysis");
const Report = require("../models/Report");
const { normalize } = require("../utils/normalize");

function normalizeClassification(classification) {
  if (
    classification === "Fraudulenta" ||
    classification === "Potencialmente fraudulenta"
  ) {
    return "Fraudulenta";
  }

  if (classification === "Crítica" || classification === "Risco crítico") {
    return "Crítica";
  }

  return classification;
}

async function getStats(req, res) {
  const [analyses, reports] = await Promise.all([
    Analysis.find({ user: req.user._id }),
    Report.find({ user: req.user._id }),
  ]);

  const stats = analyses.reduce(
    (acc, item) => {
      const classification = normalizeClassification(item.classification);

      acc.total += 1;

      if (classification === "Confiável") acc.safe += 1;
      if (classification === "Suspeita") acc.suspicious += 1;
      if (classification === "Fraudulenta") acc.fraudulent += 1;
      if (classification === "Crítica") acc.critical += 1;

      return acc;
    },
    { total: 0, safe: 0, suspicious: 0, fraudulent: 0, critical: 0 },
  );

  const flaggedCompanies = new Set();

  analyses
    .filter(
      (item) => normalizeClassification(item.classification) !== "Confiável",
    )
    .forEach((item) =>
      flaggedCompanies.add(normalize(item.company || "Empresa não informada")),
    );

  reports.forEach((item) =>
    flaggedCompanies.add(normalize(item.company || "Empresa não informada")),
  );

  const classificationChart = [
    { name: "Confiável", value: stats.safe },
    { name: "Suspeita", value: stats.suspicious },
    { name: "Fraudulenta", value: stats.fraudulent },
    { name: "Crítica", value: stats.critical },
  ];

  const modeChart = [
    {
      name: "Regras",
      value: analyses.filter((item) => item.analysisMode === "rules").length,
    },
    {
      name: "Híbrida",
      value: analyses.filter((item) => item.analysisMode === "hybrid").length,
    },
  ];

  const totalScore = analyses.reduce((sum, item) => {
    const score = Number(item.score || 0);
    return sum + score;
  }, 0);

  return res.json({
    ...stats,
    reports: reports.length,
    companiesFlagged: Array.from(flaggedCompanies).filter(Boolean).length,
    classificationChart,
    modeChart,
    averageScore: analyses.length
      ? Math.round(totalScore / analyses.length)
      : 0,
  });
}

module.exports = { getStats };
