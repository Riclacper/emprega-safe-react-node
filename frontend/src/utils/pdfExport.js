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

function analysisId(analysis) {
  return safeText(analysis?.externalId || analysis?._id, "ID não disponível");
}

function analysisModeLabel(mode) {
  return mode === "hybrid" ? "Regras locais + IA" : "Regras locais";
}

function scoreColor(score) {
  const value = Number(score || 0);

  if (value >= 75) return COLORS.critical;
  if (value >= 50) return COLORS.danger;
  if (value >= 25) return COLORS.warning;
  return COLORS.success;
}

function createdAtLabel(analysis) {
  const date = formatDate(analysis?.createdAt);
  const time = formatTime(analysis?.createdAt);

  if (!date || date === "-") return "Data não disponível";

  return time ? `${date} às ${time}` : date;
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

function addFooter(pdf, pageNumber) {
  setDrawColor(pdf);
  pdf.line(PAGE.margin, 282, PAGE.width - PAGE.margin, 282);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text("EmpregaSafe - Relatório de análise de confiabilidade", PAGE.margin, 288);
  pdf.text(`Página ${pageNumber}`, PAGE.width - PAGE.margin, 288, {
    align: "right",
  });
}

function addPage(pdf, state) {
  addFooter(pdf, state.page);
  pdf.addPage();
  state.page += 1;
  state.y = PAGE.margin + 6;
}

function ensureSpace(pdf, state, height) {
  if (state.y + height <= PAGE.bottom) return false;
  addPage(pdf, state);
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

function drawSectionTitle(pdf, state, title) {
  if (state.y > PAGE.margin + 2) {
    state.y += SECTION_GAP;
  }

  ensureSpace(pdf, state, 16);
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

function drawHeader(pdf, state, analysis, logoDataUrl) {
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
  pdf.text("Relatório de análise de confiabilidade", x + 6, state.y + 19);

  drawWrappedText(
    pdf,
    "Documento gerado para apoiar a avaliação de risco de uma vaga de emprego.",
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

  const idLines = pdf.splitTextToSize(analysisId(analysis), 108);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.3);
  setTextColor(pdf, COLORS.primaryDark);
  pdf.text(idLines.slice(0, 1), x + 18, metaY + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text(createdAtLabel(analysis), x + width - 10, metaY + 8, {
    align: "right",
  });

  state.y += boxHeight;
}

function drawSummary(pdf, state, analysis) {
  drawSectionTitle(pdf, state, "Resumo da vaga");

  const x = PAGE.margin;
  const width = CONTENT_WIDTH;
  const rowGap = 4;
  const colWidth = 84;
  const leftX = x + 6;
  const rightX = x + 96;

  ensureSpace(pdf, state, 52);
  const boxY = state.y;

  setFillColor(pdf);
  setDrawColor(pdf);
  pdf.roundedRect(x, boxY, width, 48, 4, 4, "FD");

  let leftY = boxY + 10;
  let rightY = boxY + 10;

  leftY = drawKeyValue(pdf, { ...state, y: leftY }, "Vaga", safeText(analysis.title), leftX, colWidth) + rowGap;
  leftY = drawKeyValue(pdf, { ...state, y: leftY }, "Salário", formatCurrency(analysis.salary, analysis.currency), leftX, colWidth);

  rightY = drawKeyValue(pdf, { ...state, y: rightY }, "Empresa", safeText(analysis.company), rightX, colWidth) + rowGap;
  rightY = drawKeyValue(pdf, { ...state, y: rightY }, "Modo", analysisModeLabel(analysis.analysisMode), rightX, colWidth);

  state.y = Math.max(leftY, rightY, boxY + 48) + 8;

  const detailRows = [
    ["Contato", safeText(analysis.contact)],
    ["Link", safeText(analysis.link)],
  ];

  detailRows.forEach(([label, value]) => {
    const lines = pdf.splitTextToSize(value, 142);
    const height = Math.max(12, lines.length * 5 + 7);

    ensureSpace(pdf, state, height);
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

function drawScore(pdf, state, analysis) {
  drawSectionTitle(pdf, state, "Resultado da análise");

  ensureSpace(pdf, state, 40);

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
    safeText(analysis.classification, "Classificação não informada"),
    134,
  );
  pdf.text(classification.slice(0, 1), PAGE.margin + 36, state.y + 13);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9.5);
  setTextColor(pdf, COLORS.muted);
  pdf.text(`Modo usado: ${analysisModeLabel(analysis.analysisMode)}`, PAGE.margin + 36, state.y + 23);

  state.y += 34;
}

function drawAiComparison(pdf, state, analysis) {
  if (analysis.analysisMode !== "hybrid") return;

  drawSectionTitle(pdf, state, "Comparação com IA");
  ensureSpace(pdf, state, 24);

  const items = [
    `Regras locais: ${analysis.ruleScore ?? 0}/100`,
    `IA: ${analysis.aiScore ?? "Não disponível"}/100`,
    `Diferença: ${analysis.scoreDifference ?? 0} ponto(s)`,
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

function drawReasons(pdf, state, analysis) {
  const reasons = analysis.reasons?.length
    ? analysis.reasons
    : ["Nenhum motivo foi informado para esta análise."];

  drawSectionTitle(pdf, state, "Motivos identificados");

  reasons.forEach((reason, index) => {
    const reasonText = safeText(reason, "Motivo não informado.");

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

    const movedToNextPage = ensureSpace(pdf, state, height);

    if (movedToNextPage) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10.5);
      setTextColor(pdf, COLORS.primaryDark);
      pdf.text("Motivos identificados (continuação)", PAGE.margin, state.y);
      state.y += 9;
      ensureSpace(pdf, state, height);
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

function drawRecommendation(pdf, state, analysis) {
  const recommendation = safeText(
    analysis.recommendation,
    "Nenhuma recomendação foi informada para esta análise.",
  );
  const lines = pdf.splitTextToSize(recommendation, 166);
  const height = Math.max(28, lines.length * 5 + 16);

  drawSectionTitle(pdf, state, "Recomendação");
  ensureSpace(pdf, state, height);

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

function drawDisclaimer(pdf, state) {
  const text =
    "Este relatório é um apoio à decisão. Ele não confirma fraude por si só; recomenda-se validar empresa, domínio, canal de contato e condições da vaga antes de compartilhar dados pessoais ou realizar pagamentos.";
  const lines = pdf.splitTextToSize(text, 166);
  const height = lines.length * 4.5 + 12;

  state.y += SECTION_GAP;
  ensureSpace(pdf, state, height);
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

export async function exportAnalysisPdf(analysis, filename) {
  if (!analysis) return;

  const pdf = new jsPDF("p", "mm", "a4");
  const state = { y: PAGE.margin, page: 1 };
  const logoDataUrl = await getLogoDataUrl();

  drawHeader(pdf, state, analysis, logoDataUrl);
  drawSummary(pdf, state, analysis);
  drawScore(pdf, state, analysis);
  drawAiComparison(pdf, state, analysis);
  drawReasons(pdf, state, analysis);
  drawRecommendation(pdf, state, analysis);
  drawDisclaimer(pdf, state);
  addFooter(pdf, state.page);

  pdf.save(filename);
}
