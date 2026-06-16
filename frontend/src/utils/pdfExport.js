import jsPDF from "jspdf";
import logoUrl from "../assets/logo.png";
import { formatCurrency, formatDate, formatTime } from "./formatters";

const PAGE = {
  width: 210,
  height: 297,
  margin: 16,
  bottom: 274,
};

const CONTENT_WIDTH = PAGE.width - PAGE.margin * 2;
const SECTION_GAP = 8;

const COLORS = {
  text: [15, 23, 42],
  muted: [71, 85, 105],
  line: [226, 232, 240],
  soft: [248, 250, 252],
  primary: [52, 87, 255],
  primaryDark: [36, 63, 209],
  success: [22, 101, 52],
  warning: [180, 83, 9],
  danger: [185, 28, 28],
  critical: [127, 29, 29],
};

let cachedLogoDataUrl = null;

async function getLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  cachedLogoDataUrl = await new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => resolve(null);
    image.src = logoUrl;
  });

  return cachedLogoDataUrl;
}

function repairSpacedLetters(value) {
  return value.replace(
    /(?:\b[\p{L}\p{N}]\b(?:\s+|$)){4,}/gu,
    (match) => match.replace(/\s+/g, ""),
  );
}

function safeText(value, fallback = "Não informado") {
  const text = repairSpacedLetters(
    String(value ?? "")
    .normalize("NFC")
    .replace(/\u0000/g, "")
    .replace(/[\u200b-\u200f\u202a-\u202e\ufeff]/g, "")
    .replace(/[\u0001-\u001f\u007f-\u009f]/g, " ")
    .replace(/\s+/g, " ")
    .trim(),
  );

  return text || fallback;
}

function analysisId(analysis, i18n) {
  return safeText(
    analysis?.externalId || analysis?._id,
    i18n.t("common.unavailableId"),
  );
}

function analysisModeLabel(mode, i18n) {
  return mode === "hybrid"
    ? i18n.t("common.localRulesAi")
    : i18n.t("common.localRules");
}

function scoreColor(score) {
  const value = Number(score || 0);

  if (value >= 75) return COLORS.critical;
  if (value >= 50) return COLORS.danger;
  if (value >= 25) return COLORS.warning;
  return COLORS.success;
}

function createdAtLabel(analysis, i18n) {
  const date = formatDate(analysis?.createdAt, i18n.language);
  const time = formatTime(analysis?.createdAt, i18n.language);

  if (!date || date === "-") return i18n.t("common.notAvailable");

  return time ? `${date}${i18n.t("pdf.generatedAtConnector")}${time}` : date;
}

function setTextColor(pdf, color = COLORS.text) {
  pdf.setTextColor(color[0], color[1], color[2]);
}

function setDrawColor(pdf, color = COLORS.line) {
  pdf.setDrawColor(color[0], color[1], color[2]);
}

function setFillColor(pdf, color = COLORS.soft) {
  pdf.setFillColor(color[0], color[1], color[2]);
}

function addFooter(pdf, pageNumber, i18n) {
  setDrawColor(pdf);
  pdf.line(PAGE.margin, 282, PAGE.width - PAGE.margin, 282);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text(i18n.t("pdf.footerTitle"), PAGE.margin, 288);
  pdf.text(i18n.t("pdf.page", { page: pageNumber }), PAGE.width - PAGE.margin, 288, {
    align: "right",
  });
}

function addPage(pdf, state, i18n) {
  addFooter(pdf, state.page, i18n);
  pdf.addPage();
  state.page += 1;
  state.y = PAGE.margin + 6;
}

function ensureSpace(pdf, state, height, i18n) {
  if (state.y + height <= PAGE.bottom) return false;
  addPage(pdf, state, i18n);
  return true;
}

function drawWrappedText(pdf, text, x, y, maxWidth, options = {}) {
  const {
    fontSize = 10,
    style = "normal",
    color = COLORS.text,
    lineHeight = 5,
  } = options;

  pdf.setFont("helvetica", style);
  pdf.setFontSize(fontSize);
  setTextColor(pdf, color);

  const lines = pdf.splitTextToSize(safeText(text), maxWidth);
  pdf.text(lines, x, y);

  return y + lines.length * lineHeight;
}

function drawSectionTitle(pdf, state, title, i18n) {
  if (state.y > PAGE.margin + 2) {
    state.y += SECTION_GAP;
  }

  ensureSpace(pdf, state, 16, i18n);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  setTextColor(pdf, COLORS.primaryDark);
  pdf.text(title, PAGE.margin, state.y);
  state.y += 8;
}

function drawKeyValue(pdf, state, label, value, x, width) {
  const startY = state.y;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text(label, x, startY);

  const nextY = drawWrappedText(pdf, value, x, startY + 5, width, {
    fontSize: 10.5,
    style: "bold",
    lineHeight: 5,
  });

  return nextY;
}

function drawHeader(pdf, state, analysis, logoDataUrl, i18n) {
  const boxHeight = 56;
  const x = PAGE.margin;
  const width = CONTENT_WIDTH;
  const logoSize = 20;
  const logoX = x + width - logoSize - 8;
  const logoY = state.y + 8;

  setFillColor(pdf, [238, 242, 255]);
  setDrawColor(pdf, [199, 210, 254]);
  pdf.roundedRect(x, state.y, width, boxHeight, 4, 4, "FD");

  if (logoDataUrl) {
    pdf.addImage(logoDataUrl, "PNG", logoX, logoY, logoSize, logoSize);
  }

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  setTextColor(pdf, COLORS.primaryDark);
  pdf.text("EMPREGASAFE", x + 6, state.y + 9);

  pdf.setFontSize(16);
  setTextColor(pdf, COLORS.text);
  pdf.text(i18n.t("pdf.title"), x + 6, state.y + 19);

  drawWrappedText(
    pdf,
    i18n.t("pdf.subtitle"),
    x + 6,
    state.y + 28,
    width - 48,
    { fontSize: 9.5, color: COLORS.muted, lineHeight: 4.5 },
  );

  const metaY = state.y + 36;
  const metaWidth = width - 12;

  setFillColor(pdf, [255, 255, 255]);
  setDrawColor(pdf, [219, 227, 239]);
  pdf.roundedRect(x + 6, metaY, metaWidth, 12, 3, 3, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text("ID:", x + 10, metaY + 8);

  const idLines = pdf.splitTextToSize(analysisId(analysis, i18n), 108);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.3);
  setTextColor(pdf, COLORS.primaryDark);
  pdf.text(idLines.slice(0, 1), x + 18, metaY + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text(createdAtLabel(analysis, i18n), x + width - 10, metaY + 8, {
    align: "right",
  });

  state.y += boxHeight;
}

function drawSummary(pdf, state, analysis, i18n) {
  drawSectionTitle(pdf, state, i18n.t("pdf.summary"), i18n);

  const x = PAGE.margin;
  const width = CONTENT_WIDTH;
  const rowGap = 4;
  const colWidth = 84;
  const leftX = x + 6;
  const rightX = x + 96;

  ensureSpace(pdf, state, 52, i18n);
  const boxY = state.y;

  setFillColor(pdf);
  setDrawColor(pdf);
  pdf.roundedRect(x, boxY, width, 48, 4, 4, "FD");

  let leftY = boxY + 10;
  let rightY = boxY + 10;

  leftY = drawKeyValue(pdf, { ...state, y: leftY }, tLabel(i18n, "common.job"), safeText(analysis.title, i18n.t("common.notInformed")), leftX, colWidth) + rowGap;
  leftY = drawKeyValue(pdf, { ...state, y: leftY }, tLabel(i18n, "common.salary"), formatCurrency(analysis.salary, analysis.currency, i18n.language), leftX, colWidth);

  rightY = drawKeyValue(pdf, { ...state, y: rightY }, tLabel(i18n, "common.company"), safeText(analysis.company, i18n.t("common.notInformed")), rightX, colWidth) + rowGap;
  rightY = drawKeyValue(pdf, { ...state, y: rightY }, tLabel(i18n, "common.mode"), analysisModeLabel(analysis.analysisMode, i18n), rightX, colWidth);

  state.y = Math.max(leftY, rightY, boxY + 48) + 8;

  const detailRows = [
    [tLabel(i18n, "common.contact"), safeText(analysis.contact, i18n.t("common.notInformedMale"))],
    [tLabel(i18n, "common.link"), safeText(analysis.link, i18n.t("common.notInformedMale"))],
  ];

  detailRows.forEach(([label, value]) => {
    const lines = pdf.splitTextToSize(value, 142);
    const height = Math.max(12, lines.length * 5 + 7);

    ensureSpace(pdf, state, height, i18n);
    setFillColor(pdf, [255, 255, 255]);
    setDrawColor(pdf);
    pdf.roundedRect(x, state.y, width, height, 3, 3, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.3);
    setTextColor(pdf, COLORS.muted);
    pdf.text(`${label}:`, x + 6, state.y + 8);

    drawWrappedText(pdf, value, x + 30, state.y + 8, 142, {
      fontSize: 9.5,
      lineHeight: 5,
    });

    state.y += height + 4;
  });
}

function drawScore(pdf, state, analysis, i18n) {
  drawSectionTitle(pdf, state, i18n.t("result.eyebrow"), i18n);

  ensureSpace(pdf, state, 40, i18n);

  const color = scoreColor(analysis.score);
  setFillColor(pdf, [255, 255, 255]);
  setDrawColor(pdf);
  pdf.roundedRect(PAGE.margin, state.y, CONTENT_WIDTH, 34, 4, 4, "FD");

  setFillColor(pdf, color);
  pdf.circle(PAGE.margin + 18, state.y + 17, 12, "F");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(15);
  pdf.setTextColor(255, 255, 255);
  pdf.text(String(Number(analysis.score || 0)), PAGE.margin + 18, state.y + 16, {
    align: "center",
  });

  pdf.setFontSize(7);
  pdf.text("/100", PAGE.margin + 18, state.y + 22, { align: "center" });

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  setTextColor(pdf, COLORS.text);
  const classification = pdf.splitTextToSize(
    safeText(
      i18n.translateClassification(analysis.classification),
      i18n.t("pdf.classificationMissing"),
    ),
    134,
  );
  pdf.text(classification.slice(0, 1), PAGE.margin + 36, state.y + 13);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text(
    `${i18n.t("pdf.usedMode")} ${analysisModeLabel(analysis.analysisMode, i18n)}`,
    PAGE.margin + 36,
    state.y + 23,
  );

  state.y += 34;
}

function drawAiComparison(pdf, state, analysis, i18n) {
  if (analysis.analysisMode !== "hybrid") return;

  drawSectionTitle(pdf, state, i18n.t("pdf.aiComparison"), i18n);
  ensureSpace(pdf, state, 24, i18n);

  const items = [
    `${i18n.t("pdf.ruleScore")} ${analysis.ruleScore ?? 0}/100`,
    `${i18n.t("pdf.aiScore")} ${analysis.aiScore ?? i18n.t("common.notAvailable")}/100`,
    `${i18n.t("pdf.difference")} ${analysis.scoreDifference ?? 0} ${i18n.t("common.point")}`,
  ];

  setFillColor(pdf);
  setDrawColor(pdf);
  pdf.roundedRect(PAGE.margin, state.y, CONTENT_WIDTH, 20, 4, 4, "FD");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9.5);
  setTextColor(pdf, COLORS.text);

  let x = PAGE.margin + 6;
  items.forEach((item) => {
    pdf.text(item, x, state.y + 12);
    x += 58;
  });

  state.y += 20;
}

function drawReasons(pdf, state, analysis, i18n) {
  const reasons = analysis.reasons?.length
    ? analysis.reasons
    : [i18n.t("pdf.noReason")];

  drawSectionTitle(pdf, state, i18n.t("result.reasons"), i18n);

  reasons.forEach((reason, index) => {
    const reasonText = safeText(
      i18n.translateReason(reason),
      i18n.t("pdf.reasonMissing"),
    );

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);

    const lines = pdf.splitTextToSize(reasonText, 160);
    const lineHeight = 4.6;
    const paddingTop = 6;
    const paddingBottom = 5;
    const height = Math.max(
      15,
      lines.length * lineHeight + paddingTop + paddingBottom,
    );

    const movedToNextPage = ensureSpace(pdf, state, height, i18n);

    if (movedToNextPage) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      setTextColor(pdf, COLORS.primaryDark);
      pdf.text(i18n.t("pdf.reasonsContinuation"), PAGE.margin, state.y);
      state.y += 9;
      ensureSpace(pdf, state, height, i18n);
    }

    setFillColor(pdf, index % 2 === 0 ? [255, 255, 255] : COLORS.soft);
    setDrawColor(pdf);
    pdf.roundedRect(PAGE.margin, state.y, CONTENT_WIDTH, height, 3, 3, "FD");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    setTextColor(pdf, COLORS.primaryDark);
    pdf.text(`${index + 1}.`, PAGE.margin + 6, state.y + paddingTop);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    setTextColor(pdf, COLORS.text);
    drawWrappedText(pdf, reasonText, PAGE.margin + 16, state.y + paddingTop, 158, {
      fontSize: 9.5,
      style: "normal",
      color: COLORS.text,
      lineHeight,
    });

    state.y += height + 3;
  });
}

function drawRecommendation(pdf, state, analysis, i18n) {
  const recommendation = safeText(
    i18n.translateRecommendation(analysis.recommendation),
    i18n.t("pdf.noRecommendation"),
  );
  const lines = pdf.splitTextToSize(recommendation, 166);
  const height = Math.max(28, lines.length * 5 + 16);

  drawSectionTitle(pdf, state, i18n.t("common.recommendation"), i18n);
  ensureSpace(pdf, state, height, i18n);

  setFillColor(pdf, [238, 242, 255]);
  setDrawColor(pdf, [199, 210, 254]);
  pdf.roundedRect(PAGE.margin, state.y, CONTENT_WIDTH, height, 4, 4, "FD");

  drawWrappedText(pdf, recommendation, PAGE.margin + 6, state.y + 10, 166, {
    fontSize: 10,
    style: "bold",
    lineHeight: 5,
  });

  state.y += height;
}

function drawDisclaimer(pdf, state, i18n) {
  const text = i18n.t("pdf.footer");
  const lines = pdf.splitTextToSize(text, 166);
  const height = lines.length * 4.5 + 12;

  state.y += SECTION_GAP;
  ensureSpace(pdf, state, height, i18n);
  setFillColor(pdf);
  setDrawColor(pdf);
  pdf.roundedRect(PAGE.margin, state.y, CONTENT_WIDTH, height, 4, 4, "FD");

  drawWrappedText(pdf, text, PAGE.margin + 6, state.y + 8, 166, {
    fontSize: 8.8,
    color: COLORS.muted,
    lineHeight: 4.5,
  });

  state.y += height;
}

function tLabel(i18n, key) {
  return i18n.t(key);
}

function defaultI18n() {
  return {
    t: (key, params = {}) => {
      const fallback = {
        "common.unavailableId": "ID não disponível",
        "common.notAvailable": "Não disponível",
        "common.notInformed": "Não informado",
        "common.notInformedMale": "Não informado",
        "common.job": "Vaga",
        "common.salary": "Salário",
        "common.company": "Empresa",
        "common.mode": "Modo",
        "common.contact": "Contato",
        "common.link": "Link",
        "common.localRules": "Regras locais",
        "common.localRulesAi": "Regras locais + IA",
        "common.point": "ponto(s)",
        "common.recommendation": "Recomendação",
        "pdf.generatedAtConnector": " às ",
        "pdf.footerTitle": "EmpregaSafe - Relatório de análise de confiabilidade",
        "pdf.page": `Página ${params.page}`,
        "pdf.title": "Relatório de análise de confiabilidade",
        "pdf.subtitle": "Documento gerado para apoiar a avaliação de risco de uma vaga de emprego.",
        "pdf.summary": "Resumo da vaga",
        "pdf.classificationMissing": "Classificação não informada",
        "pdf.usedMode": "Modo usado:",
        "pdf.aiComparison": "Comparação com IA",
        "pdf.ruleScore": "Regras locais:",
        "pdf.aiScore": "IA:",
        "pdf.difference": "Diferença:",
        "pdf.noReason": "Nenhum motivo foi informado para esta análise.",
        "pdf.reasonMissing": "Motivo não informado.",
        "pdf.reasonsContinuation": "Motivos identificados (continuação)",
        "pdf.noRecommendation": "Nenhuma recomendação foi informada para esta análise.",
        "pdf.footer": "Este relatório é um apoio à decisão. Ele não confirma fraude por si só; recomenda-se validar empresa, domínio, canal de contato e condições da vaga antes de compartilhar dados pessoais ou realizar pagamentos.",
        "result.eyebrow": "Resultado da análise",
        "result.reasons": "Motivos identificados",
      };

      return fallback[key] || key;
    },
    language: "pt-BR",
    translateClassification: (value) => value,
    translateReason: (value) => value,
    translateRecommendation: (value) => value,
  };
}

export async function exportAnalysisPdf(analysis, filename, i18n = defaultI18n()) {
  if (!analysis) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const state = { y: PAGE.margin, page: 1 };
  const logoDataUrl = await getLogoDataUrl();

  drawHeader(pdf, state, analysis, logoDataUrl, i18n);
  drawSummary(pdf, state, analysis, i18n);
  drawScore(pdf, state, analysis, i18n);
  drawAiComparison(pdf, state, analysis, i18n);
  drawReasons(pdf, state, analysis, i18n);
  drawRecommendation(pdf, state, analysis, i18n);
  drawDisclaimer(pdf, state, i18n);
  addFooter(pdf, state.page, i18n);

  pdf.save(filename);
}
