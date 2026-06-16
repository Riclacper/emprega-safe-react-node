import { useState } from "react";
import AnalysisPdfReport from "../components/AnalysisPdfReport.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { createAnalysis } from "../services/analysisService";
import { exportAnalysisPdf } from "../utils/pdfExport";

const initialForm = {
  title: "",
  company: "",
  salary: "",
  currency: "BRL",
  contact: "",
  link: "",
  description: "",
};

export default function AnalyzeJob() {
  const {
    language,
    t,
    translateClassification,
    translateReason,
    translateRecommendation,
  } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [attachmentName, setAttachmentName] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearForm() {
    setForm(initialForm);
    setAttachmentName("");
    setSubmitted(false);
    setError("");
    setLoadingMessage("");
  }

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0];
    setAttachmentName(file ? file.name : "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(true);
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setLoadingMessage(t("analyze.loadingLocalAi"));

    const delayMessage = setTimeout(() => {
      setLoadingMessage(
        t("analyze.loadingDelay"),
      );
    }, 6000);

    try {
      const result = await createAnalysis({
        ...form,
        salary: parseSalaryToNumber(form.salary),
        currency: form.currency || "BRL",
      });

      setAnalysis(result);
      setForm(initialForm);
      setSubmitted(false);
    } catch (err) {
      setError(err.message || t("analyze.error"));
    } finally {
      clearTimeout(delayMessage);
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function exportPdf() {
    await exportAnalysisPdf(analysis, `EmpregaSafe-${analysis.externalId}.pdf`, {
      t,
      language,
      translateClassification,
      translateReason,
      translateRecommendation,
    });
  }

  function onlyNumbers(value) {
    return value.replace(/\D/g, "");
  }

  function formatSalaryInput(value) {
    const numbers = onlyNumbers(value);

    if (!numbers) return "";

    const amount = Number(numbers) / 100;

    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  function parseSalaryToNumber(value) {
    if (!value) return 0;

    return Number(
      value
        .replace(/\./g, "")
        .replace(",", ".")
        .replace(/[^\d.]/g, ""),
    );
  }

  function fieldHasError(field) {
    return submitted && !String(form[field] || "").trim();
  }

  return (
    <div className="page-stack two-column">
      <section className="card">
        <span className="eyebrow">{t("analyze.eyebrow")}</span>
        <h2>{t("analyze.title")}</h2>

        <p className="form-hint">
          {t("analyze.hint")}
        </p>
        <form onSubmit={handleSubmit} className="form-grid analyze-form-grid">
          <label>
            {t("analyze.jobTitle")}
            <input
              className={fieldHasError("title") ? "field-error" : ""}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder={t("analyze.jobTitlePlaceholder")}
            />
          </label>
          <label>
            {t("common.company")}
            <input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder={t("analyze.companyPlaceholder")}
            />
          </label>
          <label>
            {t("common.salary")}
            <input
              value={form.salary}
              onChange={(e) =>
                update("salary", formatSalaryInput(e.target.value))
              }
              placeholder={t("analyze.salaryPlaceholder")}
              inputMode="numeric"
            />
          </label>

          <label>
            {t("analyze.currency")}
            <select
              className="analysis-currency-select"
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
            >
              <option value="BRL">{t("analyze.brl")}</option>
              <option value="USD">{t("analyze.usd")}</option>
              <option value="EUR">{t("analyze.eur")}</option>
            </select>
          </label>
          <label>
            {t("common.contact")}
            <input
              value={form.contact}
              onChange={(e) => update("contact", e.target.value)}
              placeholder={t("analyze.contactPlaceholder")}
            />
          </label>
          <div className="analysis-file-field">
            <label htmlFor="job-attachment-demo">{t("analyze.attachment")}</label>
            <input
              id="job-attachment-demo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAttachmentChange}
              aria-describedby="analysis-file-hint"
            />
            <small id="analysis-file-hint">
              {t("analyze.attachmentHint")}
            </small>
            {attachmentName && (
              <small className="analysis-file-name">
                {t("common.selected")} {attachmentName}
              </small>
            )}
          </div>
          <label className="full">
            {t("analyze.jobLink")}
            <input
              value={form.link}
              onChange={(e) => update("link", e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className="full">
            {t("analyze.description")}
            <textarea
              className={fieldHasError("description") ? "field-error" : ""}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={8}
              placeholder={t("analyze.descriptionPlaceholder")}
            />
          </label>

          {error && <div className="form-soft-error full">{error}</div>}

          <div className="report-form-actions full">
            <button
              type="button"
              className="report-clear-button"
              onClick={clearForm}
              disabled={loading}
            >
              {t("common.clearFields")}
            </button>

            <button
              className="primary-button analyze-submit report-submit-button"
              disabled={loading}
            >
              {loading ? t("analyze.analyzing") : t("analyze.analyzeButton")}
            </button>
          </div>
        </form>
      </section>

      <div className="page-stack">
        {analysis ? (
          <>
            <AnalysisPdfReport analysis={analysis} id="analysis-result-pdf" />

            <button className="history-pdf-button" onClick={exportPdf}>
              {t("common.downloadPdf")}
            </button>
          </>
        ) : (
          <section className="card empty-state empty-result">
            <h2>{t("analyze.resultTitle")}</h2>

            <p>
              {t("analyze.emptyTextStart")}{" "}
              <strong>{t("analyze.analyzeButton")}</strong>.{" "}
              {t("analyze.emptyTextEnd")}
            </p>
          </section>
        )}
      </div>
      {loading && (
        <div className="analysis-loading-overlay">
          <div className="analysis-loading-box">
            <div className="analysis-spinner" />

            <h3>{t("analyze.loadingTitle")}</h3>

            <p>
              {t("analyze.loadingText")}
            </p>

            <small>{t("analyze.loadingSmall")}</small>
          </div>
        </div>
      )}
    </div>
  );
}
