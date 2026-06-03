import { useEffect, useMemo, useRef, useState } from "react";
import {
  createReport,
  listReports,
  sendReportEmail,
} from "../services/reportService";
import { listAnalyses } from "../services/analysisService";
import { formatDate } from "../utils/formatters";

const initialForm = {
  analysisId: "",
  company: "",
  link: "",
  reason: "",
  details: "",
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const [showAnalysisOptions, setShowAnalysisOptions] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const analysisPickerRef = useRef(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const messageTimeoutRef = useRef(null);

  function load() {
    Promise.all([listReports(), listAnalyses()])
      .then(([reportsData, analysesData]) => {
        setReports(reportsData);
        setAnalyses(analysesData);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(load, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        analysisPickerRef.current &&
        !analysisPickerRef.current.contains(event.target)
      ) {
        setShowAnalysisOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        closeReportModal();
      }
    }

    if (selectedReport) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [selectedReport]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));

    if (value.trim()) {
      setSubmitted(false);
      setError("");
    }
  }

  const filteredAnalyses = useMemo(() => {
    const search = form.analysisId.toLowerCase().trim();

    const results = analyses.filter((analysis) => {
      const analysisId = getAnalysisIdValue(analysis).toLowerCase();

      return (
        analysis.company?.toLowerCase().includes(search) ||
        analysis.title?.toLowerCase().includes(search) ||
        analysis.classification?.toLowerCase().includes(search) ||
        analysisId.includes(search)
      );
    });

    return results;
  }, [analyses, form.analysisId]);

  function selectAnalysis(analysis) {
    setForm((current) => ({
      ...current,
      analysisId: getAnalysisIdValue(analysis),
      company: analysis.company || analysis.title || "",
      link: analysis.link || "",
      reason: current.reason || "Denúncia relacionada a uma vaga suspeita",
      details:
        current.details ||
        `Denúncia relacionada à vaga "${analysis.title}" classificada como ${analysis.classification} com score ${analysis.score}/100.`,
    }));
    setSubmitted(false);
    setError("");
    setShowAnalysisOptions(false);
  }

  function clearReportForm() {
    setForm(initialForm);
    setSubmitted(false);
    setMessage("");
    setError("");
    setShowAnalysisOptions(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    setSubmitted(true);

    if (!form.analysisId.trim()) {
      return;
    }

    setLoading(true);

    try {
      const createdReport = await createReport({
        analysisId: form.analysisId.trim(),
        company: form.company.trim(),
        link: form.link.trim(),
        reason:
          form.reason.trim() ||
          `Denúncia vinculada à análise ${form.analysisId.trim()}`,
        details: form.details.trim(),
      });

      setReports((currentReports) => [createdReport, ...currentReports]);

      showTemporaryMessage("Denúncia registrada com sucesso.");
      setError("");

      setTimeout(() => {
        setMessage("");
      }, 3000);
      setForm(initialForm);
      setSubmitted(false);
      load();
    } catch (err) {
      setError(err.message || "Não foi possível registrar a denúncia.");
    } finally {
      setLoading(false);
    }
  }

  function shortId(id) {
    if (!id) return "";

    if (id.length <= 18) return id;

    return `${id.slice(0, 10)}...${id.slice(-6)}`;
  }

  function getReportAnalysisId(report) {
    return report.analysis?.externalId || report.analysisId || "";
  }

  function buildReportEmailHref(report) {
    const analysisId = getReportAnalysisId(report);

    const subject = `Denúncia de vaga suspeita - ${
      report.company || "Empresa não informada"
    }`;

    const body = [
      "Olá,",
      "",
      "Segue denúncia registrada no EmpregaSafe:",
      "",
      `Empresa: ${report.company || "Empresa não informada"}`,
      `Data: ${formatDate(report.createdAt)}`,
      analysisId ? `Análise vinculada: ${analysisId}` : "",
      `Motivo: ${
        report.reason?.includes("Denúncia vinculada")
          ? "Vaga suspeita denunciada"
          : report.reason || "Não informado"
      }`,
      "",
      "Detalhes:",
      report.details || "Não informado",
      "",
      report.link ? `Link da vaga: ${report.link}` : "",
      "",
      "Relatório gerado pelo EmpregaSafe.",
    ]
      .filter(Boolean)
      .join("\n");

    return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      body,
    )}`;
  }

  async function handleSendReportEmail(report) {
    setEmailError("");
    setEmailLoading(true);

    try {
      await sendReportEmail(report._id);
      closeReportModal();
    } catch (err) {
      setEmailError(err.message || "Não foi possível enviar o e-mail.");
    } finally {
      setEmailLoading(false);
    }
  }

  function openReportModal(report) {
    setSelectedReport(report);
    setEmailError("");
  }

  function closeReportModal() {
    setSelectedReport(null);
    setEmailError("");
    setEmailLoading(false);
  }

  function getAnalysisIdValue(analysis) {
    return analysis?.externalId || analysis?._id || "";
  }

  function showTemporaryMessage(text, duration = 3000) {
    setMessage(text);

    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    messageTimeoutRef.current = setTimeout(() => {
      setMessage("");
      messageTimeoutRef.current = null;
    }, duration);
  }

  function clearForm() {
    setForm({
      analysisId: "",
      company: "",
      link: "",
      reason: "",
      details: "",
    });

    setSubmitted(false);
    setMessage("");
    setError("");
    setShowAnalysisOptions(false);
  }

  return (
    <div className="page-stack two-column">
      <section className="card">
        <span className="eyebrow">Registro de denúncia</span>
        <h2>Denunciar vaga suspeita</h2>

        <p className="form-hint">
          Selecione uma análise já registrada para vincular a denúncia. O
          sistema preencherá automaticamente os dados principais da vaga.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label className="analysis-picker-wrap" ref={analysisPickerRef}>
            <span className="label-text">
              ID da análise <strong className="required">*</strong>
            </span>
            <input
              className={
                submitted && !form.analysisId.trim() ? "field-error" : ""
              }
              value={form.analysisId}
              onFocus={() => setShowAnalysisOptions(true)}
              onChange={(e) => {
                update("analysisId", e.target.value);
                setShowAnalysisOptions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setShowAnalysisOptions(false);
                }
              }}
              placeholder="Clique para buscar"
            />
            {showAnalysisOptions && (
              <div className="analysis-options">
                {filteredAnalyses.length > 0 ? (
                  filteredAnalyses.map((analysis, index) => (
                    <button
                      type="button"
                      key={
                        analysis.externalId ||
                        analysis._id ||
                        `analysis-${index}`
                      }
                      className="analysis-option"
                      onClick={() => selectAnalysis(analysis)}
                    >
                      <strong>
                        {analysis.company || "Empresa não informada"}
                      </strong>
                      <span>{analysis.title || "Vaga sem título"}</span>
                      <small>
                        {analysis.classification} • {analysis.score}/100 •{" "}
                        {shortId(getAnalysisIdValue(analysis))}
                      </small>
                    </button>
                  ))
                ) : (
                  <div className="analysis-option-empty">
                    Nenhuma análise encontrada com esse termo.
                  </div>
                )}
              </div>
            )}
          </label>

          <label>
            Empresa
            <input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Nome da empresa ou anunciante"
            />
          </label>

          <label className="full">
            <span className="label-text">Motivo</span>

            <input
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              placeholder="Ex: Cobrança antecipada, pedido de documentos, golpe"
            />
          </label>

          <label className="full">
            Detalhes
            <textarea
              value={form.details}
              onChange={(e) => update("details", e.target.value)}
              rows={6}
              placeholder="Descreva o que aconteceu, quais sinais chamaram atenção e como foi o contato."
            />
          </label>

          {message && <div className="alert-success full">{message}</div>}

          {error && <div className="alert-error full">{error}</div>}

          <div className="report-form-actions">
            <button
              type="button"
              className="report-clear-button"
              onClick={clearForm}
            >
              Limpar campos
            </button>

            <button
              type="submit"
              className="report-submit-button"
              disabled={loading}
            >
              {loading ? "Registrando..." : "Registrar denúncia"}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-title reports-title">
          <div>
            <h2>Denúncias recentes</h2>
            <p>{reports.length} registro(s) enviado(s)</p>
          </div>
        </div>

        <div className="report-list">
          {reports.map((report, index) => (
            <article
              key={report.externalId || report._id || `report-${index}`}
              className="report-item"
            >
              <div className="report-item-header">
                <div>
                  <strong>{report.company || "Empresa não informada"}</strong>
                  <span>{formatDate(report.createdAt)}</span>
                </div>
              </div>

              {getReportAnalysisId(report) && (
                <p className="report-analysis-id">
                  <span className="report-id-label">Análise vinculada</span>

                  <strong title={getReportAnalysisId(report)}>
                    {shortId(getReportAnalysisId(report))}
                  </strong>
                </p>
              )}

              <p className="report-reason">
                <strong>Motivo:</strong>{" "}
                {report.reason?.includes("Denúncia vinculada")
                  ? "Denúncia relacionada a uma vaga suspeita"
                  : report.reason}
              </p>

              {report.details && <small>{report.details}</small>}

              <button
                type="button"
                className="report-link report-view-button"
                onClick={() => openReportModal(report)}
              >
                Ver
              </button>
            </article>
          ))}

          {reports.length === 0 && (
            <div className="empty-table-message">
              Nenhuma denúncia registrada ainda.
            </div>
          )}
        </div>
      </section>
      {selectedReport && (
        <div className="report-modal-backdrop" onClick={closeReportModal}>
          <div
            className="report-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="report-modal-header">
              <div>
                <span className="eyebrow">Detalhes da denúncia</span>
                <h2>{selectedReport.company || "Empresa não informada"}</h2>
              </div>
            </div>

            <div className="report-modal-content">
              <p>
                <strong>Data:</strong> {formatDate(selectedReport.createdAt)}
              </p>

              {getReportAnalysisId(selectedReport) && (
                <p>
                  <strong>Análise vinculada:</strong>{" "}
                  {getReportAnalysisId(selectedReport)}
                </p>
              )}

              <p>
                <strong>Motivo:</strong>{" "}
                {selectedReport.reason?.includes("Denúncia vinculada")
                  ? "Vaga suspeita denunciada"
                  : selectedReport.reason}
              </p>

              {selectedReport.details && (
                <p>
                  <strong>Detalhes:</strong>
                  <br />
                  {selectedReport.details}
                </p>
              )}

              <div className="report-modal-actions report-email-actions">
                <button
                  type="button"
                  className="history-pdf-button"
                  onClick={() => handleSendReportEmail(selectedReport)}
                  disabled={emailLoading}
                >
                  {emailLoading ? "Enviando..." : "Enviar por e-mail"}
                </button>

                <button
                  type="button"
                  className="report-clear-button report-modal-close-action"
                  onClick={closeReportModal}
                >
                  Fechar
                </button>

                {emailError && <div className="alert-error">{emailError}</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
