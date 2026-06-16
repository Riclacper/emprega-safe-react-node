import { useEffect, useMemo, useRef, useState } from "react";
import {
  createReport,
  listReports,
  sendReportEmail,
} from "../services/reportService";
import { listAnalyses } from "../services/analysisService";
import { useLanguage } from "../context/LanguageContext.jsx";
import { formatDate } from "../utils/formatters";

const initialForm = {
  analysisId: "",
  company: "",
  link: "",
  reason: "",
  details: "",
};

export default function Reports() {
  const { language, t, translateClassification } = useLanguage();
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
      reason: current.reason || t("reports.defaultReason"),
      details:
        current.details ||
        t("reports.defaultDetails", {
          title: analysis.title,
          classification: translateClassification(analysis.classification),
          score: analysis.score,
        }),
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
          t("reports.linkedReason", { id: form.analysisId.trim() }),
        details: form.details.trim(),
      });

      setReports((currentReports) => [createdReport, ...currentReports]);

      showTemporaryMessage(t("reports.success"));
      setError("");

      setTimeout(() => {
        setMessage("");
      }, 3000);
      setForm(initialForm);
      setSubmitted(false);
      load();
    } catch (err) {
      setError(err.message || t("reports.submitError"));
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

  function isLinkedReportReason(reason = "") {
    return (
      reason.includes("Denúncia vinculada") ||
      reason.includes("Report linked")
    );
  }

  function buildReportEmailHref(report) {
    const analysisId = getReportAnalysisId(report);

    const company = report.company || t("common.notInformed");
    const subject = t("reports.emailSubject", { company });

    const body = [
      t("reports.emailGreeting"),
      "",
      t("reports.emailIntro"),
      "",
      `${t("common.company")}: ${company}`,
      `${t("common.date")}: ${formatDate(report.createdAt, language)}`,
      analysisId ? `${t("reports.emailLinkedAnalysis")} ${analysisId}` : "",
      `${t("common.reason")}: ${
        isLinkedReportReason(report.reason)
          ? t("reports.suspiciousJobReported")
          : report.reason || t("common.notInformedMale")
      }`,
      "",
      t("reports.emailDetails"),
      report.details || t("common.notInformedMale"),
      "",
      report.link ? `${t("reports.emailJobLink")} ${report.link}` : "",
      "",
      t("reports.emailFooter"),
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
      setEmailError(err.message || t("reports.emailError"));
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
        <span className="eyebrow">{t("reports.eyebrow")}</span>
        <h2>{t("reports.title")}</h2>

        <p className="form-hint">
          {t("reports.hint")}
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label className="analysis-picker-wrap" ref={analysisPickerRef}>
            <span className="label-text">
              {t("reports.analysisId")} <strong className="required">*</strong>
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
              placeholder={t("reports.searchPlaceholder")}
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
                        {analysis.company || t("common.notInformed")}
                      </strong>
                      <span>{analysis.title || t("reports.untitledJob")}</span>
                      <small>
                        {translateClassification(analysis.classification)} •{" "}
                        {analysis.score}/100 • {shortId(getAnalysisIdValue(analysis))}
                      </small>
                    </button>
                  ))
                ) : (
                  <div className="analysis-option-empty">
                    {t("reports.noAnalysis")}
                  </div>
                )}
              </div>
            )}
          </label>

          <label>
            {t("common.company")}
            <input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder={t("reports.companyPlaceholder")}
            />
          </label>

          <label className="full">
            <span className="label-text">{t("common.reason")}</span>

            <input
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              placeholder={t("reports.reasonPlaceholder")}
            />
          </label>

          <label className="full">
            {t("common.details")}
            <textarea
              value={form.details}
              onChange={(e) => update("details", e.target.value)}
              rows={6}
              placeholder={t("reports.detailsPlaceholder")}
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
              {t("common.clearFields")}
            </button>

            <button
              type="submit"
              className="report-submit-button"
              disabled={loading}
            >
              {loading ? t("reports.registering") : t("reports.register")}
            </button>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-title reports-title">
          <div>
            <h2>{t("reports.recentTitle")}</h2>
            <p>{t("reports.sentRecords", { count: reports.length })}</p>
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
                  <strong>{report.company || t("common.notInformed")}</strong>
                  <span>{formatDate(report.createdAt, language)}</span>
                </div>
              </div>

              {getReportAnalysisId(report) && (
                <p className="report-analysis-id">
                  <span className="report-id-label">
                    {t("reports.linkedAnalysis")}
                  </span>

                  <strong title={getReportAnalysisId(report)}>
                    {shortId(getReportAnalysisId(report))}
                  </strong>
                </p>
              )}

              <p className="report-reason">
                <strong>{t("common.reason")}:</strong>{" "}
                {isLinkedReportReason(report.reason)
                  ? t("reports.defaultReason")
                  : report.reason}
              </p>

              {report.details && <small>{report.details}</small>}

              <button
                type="button"
                className="report-link report-view-button"
                onClick={() => openReportModal(report)}
              >
                {t("common.view")}
              </button>
            </article>
          ))}

          {reports.length === 0 && (
            <div className="empty-table-message">
              {t("reports.noReports")}
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
                <span className="eyebrow">{t("reports.detailsEyebrow")}</span>
                <h2>{selectedReport.company || t("common.notInformed")}</h2>
              </div>
            </div>

            <div className="report-modal-content">
              <p>
                <strong>{t("common.date")}:</strong>{" "}
                {formatDate(selectedReport.createdAt, language)}
              </p>

              {getReportAnalysisId(selectedReport) && (
                <p>
                  <strong>{t("reports.linkedAnalysis")}:</strong>{" "}
                  {getReportAnalysisId(selectedReport)}
                </p>
              )}

              <p>
                <strong>{t("common.reason")}:</strong>{" "}
                {isLinkedReportReason(selectedReport.reason)
                  ? t("reports.suspiciousJobReported")
                  : selectedReport.reason}
              </p>

              {selectedReport.details && (
                <p>
                  <strong>{t("common.details")}:</strong>
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
                  {emailLoading ? t("common.sending") : t("common.sendEmail")}
                </button>

                <button
                  type="button"
                  className="report-clear-button report-modal-close-action"
                  onClick={closeReportModal}
                >
                  {t("common.close")}
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
