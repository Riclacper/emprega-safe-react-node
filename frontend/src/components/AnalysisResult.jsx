import RiskBadge from "./RiskBadge.jsx";
import { scoreLabel } from "../utils/riskUtils";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function AnalysisResult({ analysis }) {
  const {
    t,
    translateClassification,
    translateReason,
    translateRecommendation,
  } = useLanguage();

  if (!analysis) return null;

  const classification = translateClassification(analysis.classification);
  const mode =
    analysis.analysisMode === "hybrid"
      ? t("common.rulesAi")
      : t("common.localRules");

  return (
    <section className="card result-card">
      <div className="result-header">
        <div>
          <span className="eyebrow">{t("result.eyebrow")}</span>
          <h2>{classification}</h2>
          <p>
            {scoreLabel(analysis.score, t)} • {t("common.mode").toLowerCase()}:{" "}
            {mode}
          </p>
        </div>
        <div className="score-ring">
          <strong>{analysis.score}</strong>
          <span>/100</span>
        </div>
      </div>

      <RiskBadge badge={analysis.badge}>{classification}</RiskBadge>

      <h3>{t("result.reasons")}</h3>
      <ul className="reason-list">
        {analysis.reasons?.map((reason, index) => (
          <li key={`${reason}-${index}`}>{translateReason(reason)}</li>
        ))}
      </ul>

      <div className="recommendation">
        <strong>{t("common.recommendation")}</strong>
        <p>{translateRecommendation(analysis.recommendation)}</p>
      </div>
    </section>
  );
}
