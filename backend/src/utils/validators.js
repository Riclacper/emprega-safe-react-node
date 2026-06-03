const { sanitizeText, isValidUrl } = require("./normalize");

function validateAnalysisPayload(body) {
  const title = sanitizeText(body.title, 150);
  const company = sanitizeText(body.company, 150);
  const salary = Number(body.salary || 0);
  const currency = String(body.currency || "BRL")
    .trim()
    .toUpperCase();
  const contact = sanitizeText(body.contact, 150);
  const link = sanitizeText(body.link, 500);
  const description = sanitizeText(body.description, 5000);

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

  if (!Number.isFinite(salary) || salary < 0) {
    return {
      valid: false,
      message: "Informe um salário válido.",
    };
  }

  if (link && !isValidUrl(link)) {
    return {
      valid: false,
      message: "Informe um link válido para a vaga.",
    };
  }

  const allowedCurrencies = ["BRL", "USD", "EUR"];

  return {
    valid: true,
    payload: {
      title,
      company,
      salary,
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
