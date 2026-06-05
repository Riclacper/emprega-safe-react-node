import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import MetricCard from "../components/MetricCard.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { getStats } from "../services/statsService";
import { listAnalyses } from "../services/analysisService";
import { formatDate } from "../utils/formatters";

const CLASSIFICATION_COLORS = {
  Confiável: "#16a34a",
  Suspeita: "#f59e0b",
  Fraudulenta: "#dc2626",
  Crítica: "#7f1d1d",
};

const MODE_COLORS = ["#3457ff", "#16a34a", "#f59e0b", "#64748b"];

const TOOLTIP_STYLE = {
  background: "#0f172a",
  border: "0",
  borderRadius: "14px",
  color: "#ffffff",
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.22)",
  padding: "10px 14px",
  fontWeight: 800,
};

const TOOLTIP_LABEL_STYLE = {
  color: "#ffffff",
  fontWeight: 900,
  marginBottom: "4px",
};

const TOOLTIP_ITEM_STYLE = {
  color: "#ffffff",
  fontWeight: 800,
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getStats(), listAnalyses()])
      .then(([statsData, analysesData]) => {
        setStats(statsData);
        setAnalyses(analysesData.slice(0, 5));
      })
      .catch((err) => setError(err.message));
  }, []);

  const normalizedClassificationChart = useMemo(() => {
    if (!stats?.classificationChart) return [];

    const totals = {
      Confiável: 0,
      Suspeita: 0,
      Fraudulenta: 0,
      Crítica: 0,
    };

    stats.classificationChart.forEach((item) => {
      const name = item.name || "";
      const value = Number(item.value || 0);

      if (name === "Confiável") {
        totals.Confiável += value;
      } else if (name === "Suspeita") {
        totals.Suspeita += value;
      } else if (
        name === "Fraudulenta" ||
        name === "Potencialmente fraudulenta"
      ) {
        totals.Fraudulenta += value;
      } else if (name === "Crítica") {
        totals.Crítica += value;
      }
    });

    return [
      { name: "Confiável", value: totals.Confiável },
      { name: "Suspeita", value: totals.Suspeita },
      { name: "Fraudulenta", value: totals.Fraudulenta },
      { name: "Crítica", value: totals.Crítica },
    ];
  }, [stats]);

  if (error) return <div className="alert-error">{error}</div>;
  if (!stats) return <div className="card">Carregando dashboard...</div>;

  return (
    <div className="page-stack">
      <section className="metrics-grid">
        <MetricCard
          title="Total de vagas"
          value={stats.total}
          description="Análises feitas no sistema"
        />

        <MetricCard
          title="Vagas suspeitas"
          value={stats.suspicious}
          description="Precisam de atenção"
        />

        <MetricCard
          title="Risco alto"
          value={stats.fraudulent + stats.critical}
          description="Possíveis golpes identificados"
        />

        <MetricCard
          title="Denúncias enviadas"
          value={stats.reports}
          description="Registros enviados por usuários"
        />
      </section>
      <section className="card dashboard-summary">
        <div>
          <h2>Resumo do painel</h2>
          <p>
            Este painel mostra a situação das vagas analisadas pelo EmpregaSafe.
            Vagas em verde indicam menor risco. Vagas em amarelo, vermelho ou
            vermelho escuro exigem atenção antes de enviar dados pessoais,
            documentos ou realizar qualquer pagamento.
          </p>
        </div>

        <div className="risk-legend">
          <span>
            <b className="dot green"></b> Confiável
          </span>
          <span>
            <b className="dot yellow"></b> Suspeita
          </span>
          <span>
            <b className="dot red"></b> Fraudulenta
          </span>
          <span>
            <b className="dot darkred"></b> Crítica
          </span>
        </div>
      </section>
      <section className="dashboard-grid">
        <article className="card chart-card">
          <div className="chart-card-header">
            <div>
              <h2>Método usado nas análises</h2>
              <p>
                Mostra quantas vagas foram avaliadas apenas por regras do
                sistema ou com apoio de IA.
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie
                data={stats.modeChart}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={95}
                innerRadius={54}
                paddingAngle={3}
              >
                {stats.modeChart.map((entry, index) => (
                  <Cell
                    key={`mode-${entry.name}`}
                    fill={MODE_COLORS[index] || "#64748b"}
                  />
                ))}
              </Pie>
              <Tooltip
                cursor={false}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                formatter={(value) => [`${value} análise(s)`, "Total"]}
              />{" "}
            </PieChart>
          </ResponsiveContainer>

          <div className="chart-legend">
            {stats.modeChart.map((item, index) => {
              const label =
                item.name.toLowerCase().includes("ia") ||
                item.name.toLowerCase().includes("ai") ||
                item.name.toLowerCase().includes("híbrida") ||
                item.name.toLowerCase().includes("hybrid")
                  ? "Com apoio de IA"
                  : "Regras locais";

              return (
                <span key={item.name}>
                  <b
                    className="legend-dot"
                    style={{ background: MODE_COLORS[index] || "#64748b" }}
                  ></b>
                  {label} — {item.value}
                </span>
              );
            })}
          </div>
          <div className="chart-help-box">
            <strong>Como interpretar:</strong>
            <p>
              Regras locais são critérios automáticos do sistema, como salário
              suspeito, pedido de pagamento ou contato informal. Com apoio de IA
              indica análises que também usam inteligência artificial para
              interpretar melhor o texto da vaga.
            </p>
          </div>
        </article>

        <article className="card chart-card">
          <div className="chart-card-header">
            <div>
              <h2>Situação das vagas</h2>
              <p>
                Mostra quantas vagas foram classificadas em cada nível de risco.
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={normalizedClassificationChart}>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />
              <XAxis dataKey="name" />
              <YAxis hide />
              <Tooltip
                cursor={false}
                contentStyle={TOOLTIP_STYLE}
                labelStyle={TOOLTIP_LABEL_STYLE}
                itemStyle={TOOLTIP_ITEM_STYLE}
                formatter={(value) => [`${value} vaga(s)`, "Total"]}
              />{" "}
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {normalizedClassificationChart.map((entry, index) => (
                  <Cell
                    key={`classification-${index}`}
                    fill={CLASSIFICATION_COLORS[entry.name] || "#3457ff"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="chart-legend">
            {normalizedClassificationChart.map((item) => (
              <span key={item.name}>
                <b
                  className="legend-dot"
                  style={{
                    background: CLASSIFICATION_COLORS[item.name] || "#3457ff",
                  }}
                ></b>
                {item.name} — {item.value}
              </span>
            ))}
          </div>

          <div className="chart-help-box">
            <strong>Como interpretar:</strong>
            <p>
              Verde indica menor risco. Amarelo exige atenção antes de avançar.
              Vermelho indica possível fraude. Crítica representa risco grave e
              deve ser evitada.
            </p>
          </div>
        </article>
      </section>

      <section className="card top-reported-card">
        <div className="top-reported-header">
          <div>
            <span className="eyebrow">Alertas da comunidade</span>
            <h2>Empresas mais denunciadas</h2>
            <p>
              Ranking agregado de denúncias registradas no sistema. Os dados
              individuais dos usuários permanecem privados.
            </p>
          </div>
        </div>

        {stats.topReportedCompanies?.length ? (
          <ol className="top-reported-list">
            {stats.topReportedCompanies.map((item, index) => (
              <li key={`${item.company}-${index}`}>
                <span className="top-reported-position">{index + 1}</span>
                <div>
                  <strong>{item.company || "Empresa não informada"}</strong>
                  <small>
                    {item.count} denúncia{item.count === 1 ? "" : "s"}{" "}
                    registrada{item.count === 1 ? "" : "s"}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="top-reported-empty">
            Ainda não há volume suficiente de denúncias para formar um ranking.
          </p>
        )}
      </section>

      <section className="card">
        <div className="latest-header">
          <h2>Últimas análises</h2>

          <span className="latest-risk-average">
            Risco médio das análises: {stats.averageScore}/100
          </span>
        </div>

        <div className="table-wrap">
          <table className="latest-table">
            <thead>
              <tr>
                <th className="date-col">Data</th>
                <th className="job-col">Vaga</th>
                <th className="company-col">Empresa</th>
                <th className="score-col">Score</th>
                <th className="status-col">Status</th>
              </tr>
            </thead>

            <tbody>
              {analyses.map((item) => (
                <tr key={item.externalId || item._id}>
                  <td className="date-col">{formatDate(item.createdAt)}</td>
                  <td className="job-col">
                    <strong>{item.title}</strong>
                  </td>
                  <td className="company-col">
                    {item.company || "Não informada"}
                  </td>
                  <td className="score-col">{item.score}/100</td>
                  <td className="status-col">
                    <RiskBadge badge={item.badge}>
                      {item.classification === "Risco crítico"
                        ? "Crítica"
                        : item.classification}
                    </RiskBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
