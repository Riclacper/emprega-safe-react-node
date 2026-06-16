import AnalysisResult from "./AnalysisResult.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

function analysisId(analysis, t) {
  return analysis?.externalId || analysis?._id || t("common.unavailableId");
}

function analysisModeLabel(mode, t) {
  return mode === "hybrid" ? t("common.localRulesAi") : t("common.localRules");
}

export default function AnalysisPdfReport({ analysis, id }) {
  const { language, t } = useLanguage();

  if (!analysis) return null;

  const createdAt = [
    formatDate(analysis.createdAt, language),
    formatTime(analysis.createdAt, language),
  ]
    .filter((value) => value && value !== "-")
    .join(t("pdf.generatedAtConnector"));

  return (
    <div id={id} className="analysis-pdf-report">
      <header className="analysis-pdf-header">
        <div>
          <span className="eyebrow">EmpregaSafe</span>
          <h2>{t("pdf.title")}</h2>
          <p>
            {t("pdf.subtitle")}
          </p>
        </div>

        <div className="analysis-pdf-meta">
          <strong>{analysisId(analysis, t)}</strong>
          <span>{createdAt || t("common.notAvailable")}</span>
        </div>
      </header>

      <section className="card mini-summary analysis-pdf-summary">
        <h3>{t("pdf.summary")}</h3>

        <div className="analysis-pdf-grid">
          <p>
            <strong>{t("common.job")}:</strong>{" "}
            {analysis.title || t("common.notInformed")}
          </p>

          <p>
            <strong>{t("common.company")}:</strong>{" "}
            {analysis.company || t("common.notInformed")}
          </p>

          <p>
            <strong>{t("common.salary")}:</strong>{" "}
            {formatCurrency(analysis.salary, analysis.currency, language)}
          </p>

          <p>
            <strong>{t("common.contact")}:</strong>{" "}
            {analysis.contact || t("common.notInformedMale")}
          </p>

          <p>
            <strong>{t("common.link")}:</strong>{" "}
            {analysis.link || t("common.notInformedMale")}
          </p>

          <p>
            <strong>{t("common.mode")}:</strong>{" "}
            {analysisModeLabel(analysis.analysisMode, t)}
          </p>
        </div>

        {analysis.analysisMode === "hybrid" && (
          <div className="analysis-pdf-ai">
            <strong>{t("pdf.aiComparison")}</strong>
            <span>{t("pdf.ruleScore")} {analysis.ruleScore ?? 0}/100</span>
            <span>
              {t("pdf.aiScore")}{" "}
              {analysis.aiScore ?? t("common.notAvailable")}/100
            </span>
            <span>
              {t("pdf.difference")} {analysis.scoreDifference ?? 0}{" "}
              {t("common.point")}
            </span>
          </div>
        )}
      </section>

      <AnalysisResult analysis={analysis} />

      <footer className="analysis-pdf-footer">
        {t("pdf.footer")}
      </footer>
    </div>
  );
}
