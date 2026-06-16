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
import { useLanguage } from "../context/LanguageContext.jsx";

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
  const { language, t, translateClassification } = useLanguage();
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
      { key: "Confiável", name: translateClassification("Confiável"), value: totals.Confiável },
      { key: "Suspeita", name: translateClassification("Suspeita"), value: totals.Suspeita },
      { key: "Fraudulenta", name: translateClassification("Fraudulenta"), value: totals.Fraudulenta },
      { key: "Crítica", name: translateClassification("Crítica"), value: totals.Crítica },
    ];
  }, [stats, translateClassification]);

  if (error) return <div className="alert-error">{error}</div>;
  if (!stats) return <div className="card">{t("common.loadingDashboard")}</div>;

  return (
    <div className="page-stack">
      <section className="metrics-grid">
        <MetricCard
          title={t("dashboard.totalJobs")}
          value={stats.total}
          description={t("dashboard.totalJobsDescription")}
        />

        <MetricCard
          title={t("dashboard.suspiciousJobs")}
          value={stats.suspicious}
          description={t("dashboard.suspiciousJobsDescription")}
        />

        <MetricCard
          title={t("dashboard.highRisk")}
          value={stats.fraudulent + stats.critical}
          description={t("dashboard.highRiskDescription")}
        />

        <MetricCard
          title={t("dashboard.sentReports")}
          value={stats.reports}
          description={t("dashboard.sentReportsDescription")}
        />
      </section>
      <section className="card dashboard-summary">
        <div>
          <h2>{t("dashboard.summaryTitle")}</h2>
          <p>
            {t("dashboard.summaryText")}
          </p>
        </div>

        <div className="risk-legend">
          <span>
            <b className="dot green"></b> {t("risk.safe")}
          </span>
          <span>
            <b className="dot yellow"></b> {t("risk.suspicious")}
          </span>
          <span>
            <b className="dot red"></b> {t("risk.fraudulent")}
          </span>
          <span>
            <b className="dot darkred"></b> {t("risk.criticalShort")}
          </span>
        </div>
      </section>

      <section className="card top-reported-card">
        <div className="top-reported-header">
          <div>
            <span className="eyebrow">{t("dashboard.communityAlerts")}</span>
            <h2>{t("dashboard.topReportedTitle")}</h2>
            <p>
              {t("dashboard.topReportedText")}
            </p>
          </div>
        </div>

        {stats.topReportedCompanies?.length ? (
          <ol className="top-reported-list">
            {stats.topReportedCompanies.map((item, index) => (
              <li key={`${item.company}-${index}`}>
                <span className="top-reported-position">{index + 1}</span>
                <div>
                  <strong>{item.company || t("common.notInformed")}</strong>
                  <small>
                    {t("dashboard.reportCount", {
                      count: item.count,
                      plural: item.count === 1 ? "" : "s",
                    })}
                  </small>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="top-reported-empty">
            {t("dashboard.topReportedEmpty")}
          </p>
        )}
      </section>

      <section className="dashboard-grid">
        <article className="card chart-card">
          <div className="chart-card-header">
            <div>
              <h2>{t("dashboard.methodTitle")}</h2>
              <p>
                {t("dashboard.methodText")}
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
                formatter={(value) => [
                  `${value} ${t("common.analyses")}`,
                  t("common.total"),
                ]}
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
                  ? t("dashboard.withAi")
                  : t("dashboard.localRules");

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
            <strong>{t("dashboard.howInterpret")}</strong>
            <p>
              {t("dashboard.methodHelp")}
            </p>
          </div>
        </article>

        <article className="card chart-card">
          <div className="chart-card-header">
            <div>
              <h2>{t("dashboard.statusTitle")}</h2>
              <p>
                {t("dashboard.statusText")}
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
                formatter={(value) => [
                  `${value} ${t("common.jobs")}`,
                  t("common.total"),
                ]}
              />{" "}
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {normalizedClassificationChart.map((entry, index) => (
                  <Cell
                    key={`classification-${index}`}
                    fill={CLASSIFICATION_COLORS[entry.key] || "#3457ff"}
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
                    background: CLASSIFICATION_COLORS[item.key] || "#3457ff",
                  }}
                ></b>
                {item.name} — {item.value}
              </span>
            ))}
          </div>

          <div className="chart-help-box">
            <strong>{t("dashboard.howInterpret")}</strong>
            <p>
              {t("dashboard.statusHelp")}
            </p>
          </div>
        </article>
      </section>

      <section className="card">
        <div className="latest-header">
          <h2>{t("dashboard.latestTitle")}</h2>

          <span className="latest-risk-average">
            {t("dashboard.averageRisk", { score: stats.averageScore })}
          </span>
        </div>

        <div className="table-wrap">
          <table className="latest-table">
            <thead>
              <tr>
                <th className="date-col">{t("common.date")}</th>
                <th className="job-col">{t("common.job")}</th>
                <th className="company-col">{t("common.company")}</th>
                <th className="score-col">{t("common.score")}</th>
                <th className="status-col">{t("common.status")}</th>
              </tr>
            </thead>

            <tbody>
              {analyses.map((item) => (
                <tr key={item.externalId || item._id}>
                  <td className="date-col">{formatDate(item.createdAt, language)}</td>
                  <td className="job-col">
                    <strong>{item.title}</strong>
                  </td>
                  <td className="company-col">
                    {item.company || t("common.notInformed")}
                  </td>
                  <td className="score-col">{item.score}/100</td>
                  <td className="status-col">
                    <RiskBadge badge={item.badge}>
                      {item.classification === "Risco crítico"
                        ? t("risk.criticalShort")
                        : translateClassification(item.classification)}
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
