const { sanitizeText, isValidUrl } = require("./normalize");

function validateAnalysisPayload(body) {
  const title = String(body.title || "").trim();
  const company = String(body.company || "").trim();
  const salary = Number(body.salary || 0);
  const currency = String(body.currency || "BRL")
    .trim()
    .toUpperCase();
  const contact = String(body.contact || "").trim();
  const link = String(body.link || "").trim();
  const description = String(body.description || "").trim();

  if (!title) {
    return {
      valid: false,
      message: "Informe o título da vaga.",
    };
  }

  if (!description) {
    return {
      valid: false,
      message: "Informe a descrição da vaga.",
    };
  }

  const allowedCurrencies = ["BRL", "USD", "EUR"];

  return {
    valid: true,
    payload: {
      title,
      company,
      salary: Number.isNaN(salary) ? 0 : salary,
      currency: allowedCurrencies.includes(currency) ? currency : "BRL",
      contact,
      link,
      description,
    },
  };
}

module.exports = { validateAnalysisPayload };

function validateReportPayload(body) {
  const analysisId = sanitizeText(body.analysisId, 80);
  const company = sanitizeText(body.company, 150);
  const link = sanitizeText(body.link, 500);
  const reason = sanitizeText(body.reason, 250);
  const details = sanitizeText(body.details, 3000);

  if (!reason || reason.length < 5) {
    return {
      valid: false,
      message: "Informe um motivo de denúncia com pelo menos 5 caracteres.",
    };
  }

  if (link && !isValidUrl(link)) {
    return { valid: false, message: "Informe um link válido para a denúncia." };
  }

  return {
    valid: true,
    payload: {
      analysisId,
      company,
      link,
      reason,
      details,
    },
  };
}

module.exports = { validateAnalysisPayload, validateReportPayload };
