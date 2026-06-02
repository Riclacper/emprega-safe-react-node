const { normalize } = require("../utils/normalize");
const { classificationByScore, recommendationByScore } = require("../utils/riskLabels");

function pushSignal(signals, points, reason, evidence) {
  signals.push({ points, reason, evidence: evidence || null });
}

function includesTerm(text, term) {
  const escaped = normalize(term).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\W)${escaped}(?=\\W|$)`).test(text);
}

function analyzeByRules(payload) {
  const title = normalize(payload.title);
  const company = normalize(payload.company);
  const description = normalize(payload.description);
  const contact = normalize(payload.contact);
  const link = normalize(payload.link);
  const salary = Number(payload.salary || 0);
  const fullText = `${title} ${company} ${description} ${contact} ${link}`;
  const signals = [];

  const paymentTerms = ["taxa", "pagamento", "pix", "deposito", "depósito", "boleto", "curso obrigatorio", "curso obrigatório", "investimento inicial"];
  const sensitiveTerms = ["cpf", "rg", "foto do cartao", "foto do cartão", "cartao de credito", "cartão de crédito", "senha", "conta bancaria", "conta bancária"];
  const urgencyTerms = ["urgente", "contratacao imediata", "contratação imediata", "ganhos garantidos", "lucro rapido", "lucro rápido", "aprovacao imediata", "aprovação imediata"];
  const suspiciousDomains = ["bit.ly", "tinyurl", "encurtador", "wa.me", "t.me", "telegram", "whatsapp"];
  const genericEmailDomains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com"];
  const hasSuspiciousDomain = suspiciousDomains.some((domain) => link.includes(domain));
  const contactDomain = contact.includes("@") ? contact.split("@")[1] || "" : "";
  const hasGenericEmail = genericEmailDomains.includes(contactDomain);
  const deniesPayment = [
    "nao solicita pagamento",
    "nao solicita pagamentos",
    "nao cobra",
    "sem cobranca",
  ].some((term) => fullText.includes(normalize(term)));

  if (!deniesPayment && paymentTerms.some((term) => includesTerm(fullText, term))) {
    pushSignal(signals, 35, "Há indício de cobrança, pagamento, curso obrigatório ou transferência para participar do processo seletivo.");
  }

  if (!company || company.length < 3 || ["empresa confidencial", "nao informado", "não informado", "sigilosa"].includes(company)) {
    pushSignal(signals, 20, "A empresa não está claramente identificada.");
  }

  if (salary >= 12000) {
    pushSignal(signals, 15, "A remuneração informada está muito acima do padrão comum e exige validação adicional.", `R$ ${salary}`);
  } else if (salary > 0 && salary < 1000) {
    pushSignal(signals, 6, "O salário informado está abaixo do esperado e precisa de conferência com a descrição da vaga.");
  }

  if (sensitiveTerms.some((term) => includesTerm(fullText, term))) {
    pushSignal(signals, 20, "A vaga solicita dados pessoais sensíveis antes de uma validação formal da empresa.");
  }

  if (urgencyTerms.some((term) => includesTerm(fullText, term))) {
    pushSignal(signals, 12, "O texto usa gatilhos de urgência ou promessas irreais para pressionar o candidato.");
  }

  if (!link) {
    pushSignal(signals, 8, "A vaga não informa link verificável da empresa ou do anúncio.");
  } else if (hasSuspiciousDomain) {
    pushSignal(signals, 12, "O link informado usa encurtadores ou canais menos confiáveis.", link);
  }

  if (contact.includes("@")) {
    if (hasGenericEmail) {
      pushSignal(signals, 10, "O recrutamento usa e-mail genérico em vez de domínio corporativo.", contactDomain);
    }
  } else if (contact && !/^\+?\d{10,13}$/.test(contact.replace(/\D/g, ""))) {
    pushSignal(signals, 6, "O contato informado não segue um padrão profissional claro.");
  }

  if (hasSuspiciousDomain && hasGenericEmail) {
    pushSignal(signals, 8, "A combinação de e-mail genérico com link encurtado reduz a rastreabilidade do recrutador.");
  }

  const weakTextSignals = ["!!!", "clique agora", "apenas hoje", "sem entrevista", "renda extra garantida"];
  if (weakTextSignals.some((term) => fullText.includes(normalize(term)))) {
    pushSignal(signals, 8, "O texto contém informalidade excessiva, pressão comercial ou possível apelo enganoso.");
  }

  if (description.length < 80) {
    pushSignal(signals, 8, "A descrição da vaga é curta demais e fornece poucas informações verificáveis.");
  }

  if (!/requisitos|atividades|beneficios|benefícios|responsabilidades|horario|horário/.test(description)) {
    pushSignal(signals, 6, "A descrição não apresenta informações comuns de uma vaga formal, como requisitos, atividades ou benefícios.");
  }

  const score = Math.min(100, signals.reduce((total, item) => total + item.points, 0));
  const labels = classificationByScore(score);

  return {
    score,
    ...labels,
    reasons: signals.length ? signals.map((item) => item.reason) : ["Nenhum sinal crítico foi identificado na análise automática inicial."],
    signals,
    recommendation: recommendationByScore(score),
  };
}

module.exports = { analyzeByRules };
