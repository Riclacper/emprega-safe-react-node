import RiskBadge from "./RiskBadge.jsx";
import { scoreLabel } from "../utils/riskUtils";

export default function AnalysisResult({ analysis }) {
  if (!analysis) return null;

  return (
    <section className="card result-card" id="analysis-result-pdf">
      <div className="result-header">
        <div>
          <span className="eyebrow">Resultado da análise</span>
          <h2>{analysis.classification}</h2>
          <p>{scoreLabel(analysis.score)} • modo: {analysis.analysisMode === "hybrid" ? "Regras + IA" : "Regras locais"}</p>
        </div>
        <div className="score-ring">
          <strong>{analysis.score}</strong>
          <span>/100</span>
        </div>
      </div>

      <RiskBadge badge={analysis.badge}>{analysis.classification}</RiskBadge>

      <h3>Motivos identificados</h3>
      <ul className="reason-list">
        {analysis.reasons?.map((reason, index) => (
          <li key={`${reason}-${index}`}>{reason}</li>
        ))}
      </ul>

      <div className="recommendation">
        <strong>Recomendação:</strong>
        <p>{analysis.recommendation}</p>
      </div>
    </section>
  );
}
