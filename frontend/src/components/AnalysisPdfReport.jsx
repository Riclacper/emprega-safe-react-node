import AnalysisResult from "./AnalysisResult.jsx";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

function analysisId(analysis) {
  return analysis?.externalId || analysis?._id || "ID não disponível";
}

function analysisModeLabel(mode) {
  return mode === "hybrid" ? "Regras locais + IA" : "Regras locais";
}

export default function AnalysisPdfReport({ analysis, id }) {
  if (!analysis) return null;

  const createdAt = [formatDate(analysis.createdAt), formatTime(analysis.createdAt)]
    .filter((value) => value && value !== "-")
    .join(" às ");

  return (
    <div id={id} className="analysis-pdf-report">
      <header className="analysis-pdf-header">
        <div>
          <span className="eyebrow">EmpregaSafe</span>
          <h2>Relatório de análise de confiabilidade</h2>
          <p>
            Documento gerado para apoiar a avaliação de risco de uma vaga de
            emprego.
          </p>
        </div>

        <div className="analysis-pdf-meta">
          <strong>{analysisId(analysis)}</strong>
          <span>{createdAt || "Data não disponível"}</span>
        </div>
      </header>

      <section className="card mini-summary analysis-pdf-summary">
        <h3>Resumo da vaga</h3>

        <div className="analysis-pdf-grid">
          <p>
            <strong>Vaga:</strong> {analysis.title || "Não informada"}
          </p>

          <p>
            <strong>Empresa:</strong> {analysis.company || "Não informada"}
          </p>

          <p>
            <strong>Salário:</strong>{" "}
            {formatCurrency(analysis.salary, analysis.currency)}
          </p>

          <p>
            <strong>Contato:</strong> {analysis.contact || "Não informado"}
          </p>

          <p>
            <strong>Link:</strong> {analysis.link || "Não informado"}
          </p>

          <p>
            <strong>Modo:</strong> {analysisModeLabel(analysis.analysisMode)}
          </p>
        </div>

        {analysis.analysisMode === "hybrid" && (
          <div className="analysis-pdf-ai">
            <strong>Comparação com IA:</strong>
            <span>Regras locais: {analysis.ruleScore ?? 0}/100</span>
            <span>IA: {analysis.aiScore ?? "Não disponível"}/100</span>
            <span>Diferença: {analysis.scoreDifference ?? 0} ponto(s)</span>
          </div>
        )}
      </section>

      <AnalysisResult analysis={analysis} />

      <footer className="analysis-pdf-footer">
        Este relatório é um apoio à decisão. Ele não confirma fraude por si só;
        recomenda-se validar empresa, domínio, canal de contato e condições da
        vaga antes de compartilhar dados pessoais ou realizar pagamentos.
      </footer>
    </div>
  );
}
