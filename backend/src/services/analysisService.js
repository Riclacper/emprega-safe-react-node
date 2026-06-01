const crypto = require("crypto");
const { analyzeByRules } = require("./riskRulesService");
const { analyzeWithAI } = require("./aiAnalysisService");
const {
  classificationByScore,
  recommendationByScore,
} = require("../utils/riskLabels");

function normalizeText(value) {
  return String(value || "").trim();
}

function normalizeForSearch(value) {
  return normalizeText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeClassification(classification) {
  const value = normalizeForSearch(classification);

  if (value.includes("crit")) return "Risco crítico";
  if (value.includes("fraud")) return "Fraudulenta";
  if (value.includes("suspeit")) return "Suspeita";
  if (value.includes("confi")) return "Confiável";

  return null;
}

function minimumScoreByClassification(classification) {
  const normalized = normalizeClassification(classification);

  const map = {
    Confiável: 0,
    Suspeita: 35,
    Fraudulenta: 65,
    "Risco crítico": 85,
  };

  return map[normalized] ?? 0;
}

function countWords(text) {
  return normalizeText(text)
    .split(/\s+/)
    .filter((word) => word.length >= 3).length;
}

function looksLikeRandomDescription(description) {
  const text = normalizeText(description);

  if (!text) return true;
  if (text.length < 25) return true;

  const words = text.split(/\s+/).filter(Boolean);

  if (words.length < 5) return true;

  const validWords = words.filter((word) => /[aeiouáéíóúãõâêôç]/i.test(word));

  return validWords.length / words.length < 0.45;
}

function calculateDataQualityFloor(payload) {
  const company = normalizeText(payload.company);
  const contact = normalizeText(payload.contact);
  const link = normalizeText(payload.link);
  const description = normalizeText(payload.description);

  const missingCompany = !company;
  const missingContact = !contact;
  const missingLink = !link;
  const weakDescription = looksLikeRandomDescription(description);

  if (missingCompany && missingContact && missingLink && weakDescription) {
    return 65;
  }

  if (missingCompany && missingContact && missingLink) {
    return 45;
  }

  if (weakDescription && countWords(description) < 5) {
    return 45;
  }

  return 0;
}

function hasGenericEmail(contact) {
  const value = normalizeForSearch(contact);

  return (
    value.includes("@gmail.") ||
    value.includes("@outlook.") ||
    value.includes("@hotmail.") ||
    value.includes("@yahoo.") ||
    value.includes("@icloud.")
  );
}

function hasShortenedLink(link) {
  const value = normalizeForSearch(link);

  return (
    value.includes("bit.ly") ||
    value.includes("tinyurl") ||
    value.includes("t.co/") ||
    value.includes("goo.gl") ||
    value.includes("shorturl") ||
    value.includes("cutt.ly")
  );
}

function hasStrongFraudSignals(payload) {
  const text = normalizeForSearch(
    `${payload.title} ${payload.company} ${payload.contact} ${payload.link} ${payload.description}`,
  );

  const deniesPayment =
    text.includes("nao solicita pagamento") ||
    text.includes("nao solicita pagamentos") ||
    text.includes("nao cobra") ||
    text.includes("sem cobranca") ||
    text.includes("does not request payment") ||
    text.includes("does not request payments") ||
    text.includes("does not charge") ||
    text.includes("no payment");

  const documentsAfterOffer =
    text.includes("apos proposta formal") ||
    text.includes("apos a proposta formal") ||
    text.includes("apos contratacao") ||
    text.includes("apos a contratacao") ||
    text.includes("after the formal offer") ||
    text.includes("after formal offer") ||
    text.includes("after the offer") ||
    text.includes("formal offer stage");

  const hasRealPaymentRisk =
    !deniesPayment &&
    (text.includes("taxa") ||
      text.includes("pagamento unico") ||
      text.includes("pagar") ||
      text.includes("payment fee") ||
      text.includes("activation fee") ||
      text.includes("registration payment") ||
      text.includes("refundable fee") ||
      text.includes("liberacao do acesso") ||
      text.includes("ativacao da conta"));

  const hasRealSensitiveDataRisk =
    !documentsAfterOffer &&
    (text.includes("dados bancarios") ||
      text.includes("bank account") ||
      text.includes("iban") ||
      text.includes("pix") ||
      text.includes("chave pix") ||
      text.includes("selfie") ||
      text.includes("foto segurando") ||
      text.includes("passport") ||
      text.includes("passaporte") ||
      text.includes("cpf") ||
      text.includes("rg") ||
      text.includes("national id"));

  const hasInformalChannel =
    text.includes("telegram") ||
    text.includes("whatsapp") ||
    text.includes("wa.me") ||
    text.includes("t.me");

  const hasUrgency =
    text.includes("ultimas vagas") ||
    text.includes("vagas limitadas") ||
    text.includes("limited positions") ||
    text.includes("within 24 hours") ||
    text.includes("within 12 hours") ||
    text.includes("termina hoje");

  return (
    hasRealPaymentRisk ||
    hasRealSensitiveDataRisk ||
    hasInformalChannel ||
    hasUrgency ||
    hasShortenedLink(payload.link) ||
    hasGenericEmail(payload.contact)
  );
}

function hasPositiveTrustSignals(payload) {
  const text = normalizeForSearch(
    `${payload.title} ${payload.company} ${payload.contact} ${payload.link} ${payload.description}`,
  );

  const hasCorporateEmail =
    payload.contact &&
    payload.contact.includes("@") &&
    !hasGenericEmail(payload.contact);

  const hasOfficialLink = payload.link && !hasShortenedLink(payload.link);

  const deniesPayment =
    text.includes("does not request payment") ||
    text.includes("does not request payments") ||
    text.includes("no payment") ||
    text.includes("does not charge") ||
    text.includes("nao solicita pagamento") ||
    text.includes("nao solicita pagamentos") ||
    text.includes("nao cobra") ||
    text.includes("sem cobranca");

  const documentsAfterOffer =
    text.includes("after the formal offer") ||
    text.includes("after formal offer") ||
    text.includes("after the offer") ||
    text.includes("formal offer stage") ||
    text.includes("apos proposta formal") ||
    text.includes("apos a proposta formal") ||
    text.includes("apos contratacao") ||
    text.includes("apos a contratacao");

  const officialApplication =
    text.includes("official careers page") ||
    text.includes("official career page") ||
    text.includes("pagina oficial") ||
    text.includes("canal oficial") ||
    text.includes("site oficial");

  return (
    hasCorporateEmail &&
    hasOfficialLink &&
    (deniesPayment || documentsAfterOffer || officialApplication)
  );
}

function mergeReasons(ruleReasons = [], aiReasons = []) {
  return [...ruleReasons, ...aiReasons]
    .filter(Boolean)
    .filter((reason, index, array) => array.indexOf(reason) === index)
    .slice(0, 8);
}

async function buildAnalysis(payload, userId) {
  const ruleResult = analyzeByRules(payload);
  const aiResult = await analyzeWithAI(payload);

  const ruleScore = Math.min(100, Number(ruleResult.score || 0));
  const aiScore = aiResult ? Math.min(100, Number(aiResult.aiScore || 0)) : 0;

  const aiClassificationFloor = aiResult
    ? minimumScoreByClassification(aiResult.aiClassification)
    : 0;

  const dataQualityFloor = calculateDataQualityFloor(payload);

  const weightedScore = aiResult
    ? Math.round(ruleScore * 0.45 + aiScore * 0.55)
    : ruleScore;

  const positiveTrustSignals = hasPositiveTrustSignals(payload);
  const strongFraudSignals = hasStrongFraudSignals(payload);

  let finalScore = Math.min(
    100,
    Math.max(weightedScore, ruleScore, dataQualityFloor),
  );

  if (!positiveTrustSignals || strongFraudSignals) {
    finalScore = Math.min(100, Math.max(finalScore, aiClassificationFloor));
  }

  if (positiveTrustSignals && !strongFraudSignals && finalScore > 35) {
    finalScore = 35;
  }

  const labels = classificationByScore(finalScore);

  let reasons = mergeReasons(ruleResult.reasons, aiResult?.aiReasons);

  if (hasPositiveTrustSignals(payload) && !strongFraudSignals) {
    reasons = reasons.filter((reason) => {
      const value = normalizeForSearch(reason);

      return !(
        value.includes("dados pessoais sensiveis") ||
        value.includes("documentos sensiveis") ||
        value.includes("antes de uma validacao formal") ||
        value.includes("antes da proposta formal") ||
        value.includes("cobranca") ||
        value.includes("pagamento") ||
        value.includes("curso obrigatorio") ||
        value.includes("transferencia")
      );
    });
  }

  if (hasPositiveTrustSignals(payload) && !strongFraudSignals) {
    reasons.unshift(
      "A vaga apresenta sinais positivos, como e-mail corporativo, link oficial e ausência de cobrança antecipada.",
    );
  }

  const recommendation =
    finalScore >= 56
      ? aiResult?.aiRecommendation || recommendationByScore(finalScore)
      : recommendationByScore(finalScore);

  return {
    externalId: `ANL-${crypto.randomUUID()}`,
    user: userId || null,
    title: payload.title,
    company: payload.company,
    salary: Number(payload.salary || 0),
    currency: payload.currency || "BRL",
    contact: payload.contact,
    link: payload.link,
    description: payload.description,
    score: finalScore,
    classification: labels.classification,
    badge: labels.badge,
    analysisMode: aiResult ? "hybrid" : "rules",
    ruleScore,
    aiScore: aiResult ? aiScore : null,
    scoreDifference: aiResult ? Math.round(aiScore - ruleScore) : 0,
    reasons,
    signals: ruleResult.signals,
    recommendation,
    ai: aiResult
      ? {
          enabled: true,
          score: aiScore,
          classification: normalizeClassification(aiResult.aiClassification),
          reasons: aiResult.aiReasons || [],
          recommendation: aiResult.aiRecommendation || null,
        }
      : {
          enabled: false,
          score: null,
          classification: null,
          reasons: [],
          recommendation: null,
        },
  };
}

module.exports = { buildAnalysis };
