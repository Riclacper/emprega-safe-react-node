import { useEffect, useMemo, useState } from "react";
import AnalysisPdfReport from "../components/AnalysisPdfReport.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { listAnalyses } from "../services/analysisService";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";
import { exportAnalysisPdf } from "../utils/pdfExport";

const PAGE_SIZE = 10;

const filters = [
  { label: "Todas", value: "all" },
  { label: "Confiável", value: "confiavel" },
  { label: "Suspeita", value: "suspeita" },
  { label: "Fraudulenta", value: "fraudulenta" },
  { label: "Crítica", value: "critica" },
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
    );
  }

  function displayClassification(value) {
    if (!value) return "";

    if (value === "Potencialmente fraudulenta") {
      return "Fraudulenta";
    }

    if (value === "Risco crítico") {
      return "Crítica";
    }

    return value;
  }

  return (
    <>
      <section className="card history-card">
        {" "}
        <div className="section-title">
          <div>
            <span className="eyebrow">Base de análises</span>
            <h2>Registros de análise</h2>
            <p>
              Consulte as vagas analisadas, seus scores, classificações e modo
              de verificação.
            </p>
          </div>

          <div className="history-search-box">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por vaga, empresa, status ou ID"
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
                {filter.label}
              </button>
            ))}
          </div>

          <label className="history-sort">
            <span>Ordenar por</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option value="date-desc">Mais recentes</option>
              <option value="date-asc">Mais antigas</option>
              <option value="score-desc">Maior score</option>
              <option value="score-asc">Menor score</option>
              <option value="classification-desc">Maior risco</option>
            </select>
          </label>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <div className="table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th className="history-date-column">Data</th>
                <th className="history-job-column">Vaga / Empresa</th>
                <th className="history-salary-column">Salário</th>
                <th className="history-risk-column">Risco</th>
                <th className="history-details-column">Detalhes</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((item) => (
                <tr key={item.externalId}>
                  <td className="history-date-column">
                    <strong>{formatDate(item.createdAt)}</strong>
                    <br />
                    <small>{formatTime(item.createdAt)}</small>
                  </td>

                  <td className="history-job-column">
                    <div className="history-job-cell">
                      <strong>{item.title}</strong>
                      <span>{item.company || "Empresa não informada"}</span>
                    </div>
                  </td>
                  <td className="history-salary-column">
                    {formatCurrency(item.salary, item.currency)}
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
                        {item.analysisMode === "hybrid" ? "Regras + IA" : "Regras"}
                      </small>
                    </div>
                  </td>

                  <td className="history-details-column">
                    <button
                      type="button"
                      className="report-view-button"
                      onClick={() => setSelectedAnalysis(item)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td className="history-empty-state" colSpan={5}>
                    Nenhum registro encontrado para a busca ou filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination-footer">
          <span>
            Exibindo {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}{" "}
            registros
          </span>

          <div className="pagination-actions">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Anterior
            </button>

            <strong>
              Página {page} de {totalPages}
            </strong>

            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Próxima
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
                <span className="eyebrow">Relatório da análise</span>
                <h2>{selectedAnalysis.title}</h2>
                <div className="history-report-id-row">
                  <p>
                    <strong>ID:</strong>{" "}
                    {selectedAnalysis.externalId ||
                      selectedAnalysis._id ||
                      "ID não disponível"}
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
                      ? "ID copiado"
                      : "Copiar ID"}
                  </button>
                </div>
              </div>

              <button
                type="button"
                className="report-clear-button report-modal-close-action"
                onClick={() => setSelectedAnalysis(null)}
              >
                Fechar
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
                Baixar relatório em PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
