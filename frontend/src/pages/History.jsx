import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useEffect, useMemo, useState } from "react";
import AnalysisResult from "../components/AnalysisResult.jsx";
import RiskBadge from "../components/RiskBadge.jsx";
import { listAnalyses } from "../services/analysisService";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

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

function shortId(id) {
  if (!id) return "";

  if (id.length <= 18) return id;

  return `${id.slice(0, 10)}...${id.slice(-6)}`;
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

export default function History() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("all");
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

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    setPage(1);
  }, [search, classificationFilter]);

  async function copyId(id) {
    if (!id) return;

    await navigator.clipboard.writeText(id);
    setCopiedId(id);

    setTimeout(() => {
      setCopiedId("");
    }, 1600);
  }

  async function exportHistoryPdf() {
    const element = document.getElementById("history-analysis-pdf");

    if (!element || !selectedAnalysis) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const image = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(image, "PNG", 10, 10, width, height);
    pdf.save(`EmpregaSafe-${selectedAnalysis.externalId}.pdf`);
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
        {error && <div className="alert-error">{error}</div>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>ID</th>
                <th>Vaga</th>
                <th>Empresa</th>
                <th>Salário</th>
                <th>Score</th>
                <th>Classificação</th>
                <th>Modo</th>
                <th>Detalhes</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((item) => (
                <tr key={item.externalId}>
                  <td>
                    <strong>{formatDate(item.createdAt)}</strong>
                    <br />
                    <small>{formatTime(item.createdAt)}</small>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="copy-id-button"
                      onClick={() => copyId(item.externalId)}
                      title={item.externalId}
                    >
                      {copiedId === item.externalId ? "Copiado" : "Copiar"}
                    </button>
                  </td>

                  <td>{item.title}</td>
                  <td>{item.company || "Não informada"}</td>
                  <td>{formatCurrency(item.salary, item.currency)}</td>
                  <td>{item.score}/100</td>

                  <td>
                    <RiskBadge badge={item.badge}>
                      {displayClassification(item.classification)}
                    </RiskBadge>
                  </td>

                  <td>
                    {item.analysisMode === "hybrid" ? "Regras + IA" : "Regras"}
                  </td>

                  <td>
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
        <div className="report-modal-backdrop">
          <div className="report-modal">
            <div className="report-modal-header">
              <div>
                <span className="eyebrow">Relatório da análise</span>
                <h2>{selectedAnalysis.title}</h2>
                <p>
                  <strong>ID:</strong>{" "}
                  {selectedAnalysis.externalId ||
                    selectedAnalysis._id ||
                    "ID não disponível"}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-button"
                onClick={() => setSelectedAnalysis(null)}
              >
                Fechar
              </button>
            </div>

            <div id="history-analysis-pdf" className="report-modal-content">
              <AnalysisResult analysis={selectedAnalysis} />

              <section className="card mini-summary">
                <h3>Resumo da vaga</h3>

                <p>
                  <strong>Empresa:</strong>{" "}
                  {selectedAnalysis.company || "Não informada"}
                </p>

                <p>
                  <strong>Salário:</strong>{" "}
                  {formatCurrency(
                    selectedAnalysis.salary,
                    selectedAnalysis.currency,
                  )}
                </p>

                <p>
                  <strong>Modo:</strong>{" "}
                  {selectedAnalysis.analysisMode === "hybrid"
                    ? "Regras + IA"
                    : "Regras locais"}
                </p>

                <p>
                  <strong>ID da análise:</strong>{" "}
                  {selectedAnalysis.externalId ||
                    selectedAnalysis._id ||
                    "ID não disponível"}{" "}
                </p>
              </section>
            </div>

            <div className="report-modal-actions">
              <button
                type="button"
                className="secondary-button"
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
