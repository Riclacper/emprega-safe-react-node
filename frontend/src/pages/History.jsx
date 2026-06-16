import { useEffect, useMemo, useState } from "react";
import AnalysisPdfReport from "../components/AnalysisPdfReport.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { listAnalyses } from "../services/analysisService";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";
import { exportAnalysisPdf } from "../utils/pdfExport";

const PAGE_SIZE = 10;

const filters = [
  { labelKey: "history.filtersAll", value: "all" },
  { labelKey: "history.filtersSafe", value: "confiavel" },
  { labelKey: "history.filtersSuspicious", value: "suspeita" },
  { labelKey: "history.filtersFraudulent", value: "fraudulenta" },
  { labelKey: "history.filtersCritical", value: "critica" },
];

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function matchesClassificationFilter(classification, filter) {
  const value = normalize(classification);

  if (filter === "all") return true;

  if (filter === "confiavel") {
    return value.includes("confiavel");
  }

  if (filter === "suspeita") {
    return value.includes("suspeita");
  }

  if (filter === "fraudulenta") {
    return (
      value.includes("fraudulenta") ||
      value.includes("potencialmente fraudulenta")
    );
  }

  if (filter === "critica") {
    return (
      value.includes("risco critico") ||
      value.includes("critico") ||
      value.includes("critica")
    );
  }

  return false;
}

function scoreClass(score) {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "moderate";
  return "low";
}

function classificationWeight(classification) {
  const value = normalize(classification);

  if (value.includes("crit")) return 4;
  if (value.includes("fraudulenta")) return 3;
  if (value.includes("suspeita")) return 2;
  if (value.includes("confiavel")) return 1;
  return 0;
}

export default function History() {
  const {
    language,
    t,
    translateClassification,
    translateReason,
    translateRecommendation,
  } = useLanguage();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    listAnalyses()
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  const filtered = useMemo(() => {
    const term = normalize(search.trim());

    return items.filter((item) => {
      const classification = normalize(item.classification);

      const matchesSearch =
        !term ||
        normalize(
          `${item.title} ${item.company} ${item.classification} ${item.externalId}`,
        ).includes(term);

      const matchesClassification = matchesClassificationFilter(
        item.classification,
        classificationFilter,
      );

      return matchesSearch && matchesClassification;
    });
  }, [items, search, classificationFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const sorted = useMemo(() => {
    return [...filtered].sort((first, second) => {
      if (sortBy === "score-desc") {
        return Number(second.score || 0) - Number(first.score || 0);
      }

      if (sortBy === "score-asc") {
        return Number(first.score || 0) - Number(second.score || 0);
      }

      if (sortBy === "classification-desc") {
        return (
          classificationWeight(second.classification) -
          classificationWeight(first.classification)
        );
      }

      const firstDate = new Date(first.createdAt).getTime();
      const secondDate = new Date(second.createdAt).getTime();

      return sortBy === "date-asc"
        ? firstDate - secondDate
        : secondDate - firstDate;
    });
  }, [filtered, sortBy]);

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [sorted, page]);

  useEffect(() => {
    setPage(1);
  }, [search, classificationFilter, sortBy]);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        setSelectedAnalysis(null);
      }
    }

    if (selectedAnalysis) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedAnalysis]);

  async function copyId(id) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
    setCopiedId(id);

    setTimeout(() => {
      setCopiedId("");
    }, 1600);
  }

  async function exportHistoryPdf() {
    if (!selectedAnalysis) return;

    await exportAnalysisPdf(
      selectedAnalysis,
      `EmpregaSafe-${selectedAnalysis.externalId}.pdf`,
      {
        t,
        language,
        translateClassification,
        translateReason,
        translateRecommendation,
      },
    );
  }

  function displayClassification(value) {
    if (!value) return "";

    if (value === "Potencialmente fraudulenta") {
      return translateClassification("Fraudulenta");
    }

    if (value === "Risco crítico") {
      return t("risk.criticalShort");
    }

    return translateClassification(value);
  }

  return (
    <>
      <section className="card history-card">
        {" "}
        <div className="section-title">
          <div>
            <span className="eyebrow">{t("history.eyebrow")}</span>
            <h2>{t("history.title")}</h2>
            <p>
              {t("history.text")}
            </p>
          </div>

          <div className="history-search-box">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("history.searchPlaceholder")}
            />
          </div>
        </div>
        <div className="history-toolbar">
          <div className="filter-pills">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={classificationFilter === filter.value ? "active" : ""}
                onClick={() => setClassificationFilter(filter.value)}
              >
                {t(filter.labelKey)}
              </button>
            ))}
          </div>

          <label className="history-sort">
            <span>{t("history.sortBy")}</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="date-desc">{t("history.recent")}</option>
              <option value="date-asc">{t("history.old")}</option>
              <option value="score-desc">{t("history.highestScore")}</option>
              <option value="score-asc">{t("history.lowestScore")}</option>
              <option value="classification-desc">{t("history.highestRisk")}</option>
            </select>
          </label>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th className="history-date-column">{t("common.date")}</th>
                <th className="history-job-column">{t("history.jobCompany")}</th>
                <th className="history-salary-column">{t("common.salary")}</th>
                <th className="history-risk-column">{t("history.risk")}</th>
                <th className="history-details-column">{t("common.details")}</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((item) => (
                <tr key={item.externalId}>
                  <td className="history-date-column">
                    <strong>{formatDate(item.createdAt, language)}</strong>
                    <br />
                    <small>{formatTime(item.createdAt, language)}</small>
                  </td>

                  <td className="history-job-column">
                    <div className="history-job-cell">
                      <strong>{item.title}</strong>
                      <span>{item.company || t("common.notInformed")}</span>
                    </div>
                  </td>
                  <td className="history-salary-column">
                    {formatCurrency(item.salary, item.currency, language)}
                  </td>
                  <td className="history-risk-column">
                    <div className="history-risk-cell">
                      <strong className={`history-score ${scoreClass(item.score)}`}>
                        {item.score}/100
                      </strong>
                      <RiskBadge badge={item.badge}>
                        {displayClassification(item.classification)}
                      </RiskBadge>
                      <small>
                        {item.analysisMode === "hybrid"
                          ? t("common.rulesAi")
                          : t("common.rules")}
                      </small>
                    </div>
                  </td>

                  <td className="history-details-column">
                    <button
                      type="button"
                      className="report-view-button"
                      onClick={() => setSelectedAnalysis(item)}
                    >
                      {t("common.view")}
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td className="history-empty-state" colSpan={5}>
                    {t("history.noRecords")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination-footer">
          <span>
            {t("history.showing", {
              start: filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1,
              end: Math.min(page * PAGE_SIZE, filtered.length),
              total: filtered.length,
            })}
          </span>

          <div className="pagination-actions">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              {t("history.previous")}
            </button>

            <strong>
              {t("history.page", { page, total: totalPages })}
            </strong>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              {t("history.next")}
            </button>
          </div>
        </div>
      </section>

      {selectedAnalysis && (
        <div
          className="report-modal-backdrop"
          onClick={() => setSelectedAnalysis(null)}
        >
          <div className="report-modal" onClick={(event) => event.stopPropagation()}>
            <div className="report-modal-header">
              <div>
                <span className="eyebrow">{t("history.reportEyebrow")}</span>
                <h2>{selectedAnalysis.title}</h2>
                <div className="history-report-id-row">
                  <p>
                    <strong>ID:</strong>{" "}
                    {selectedAnalysis.externalId ||
                      selectedAnalysis._id ||
                      t("common.unavailableId")}
                  </p>
                  <button
                    type="button"
                    className={`copy-id-button ${
                      copiedId === (selectedAnalysis.externalId || selectedAnalysis._id)
                        ? "copied"
                        : ""
                    }`}
                    onClick={() =>
                      copyId(selectedAnalysis.externalId || selectedAnalysis._id)
                    }
                  >
                    {copiedId === (selectedAnalysis.externalId || selectedAnalysis._id)
                      ? t("history.copiedId")
                      : t("history.copyId")}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="report-clear-button report-modal-close-action"
                onClick={() => setSelectedAnalysis(null)}
              >
                {t("common.close")}
              </button>
            </div>

            <div className="report-modal-content">
              <AnalysisPdfReport
                analysis={selectedAnalysis}
                id="history-analysis-pdf"
              />
            </div>

            <div className="report-modal-actions">
              <button
                type="button"
                className="history-pdf-button"
                onClick={exportHistoryPdf}
              >
                {t("common.downloadPdf")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
