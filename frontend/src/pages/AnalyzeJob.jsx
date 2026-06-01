import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useState } from "react";
import AnalysisResult from "../components/AnalysisResult.jsx";
import { createAnalysis } from "../services/analysisService";
import { formatCurrency } from "../utils/formatters";

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
  const [form, setForm] = useState(initialForm);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(true);
    setError("");

    if (!form.title.trim() || !form.description.trim()) {
      setError("Preencha os campos obrigatórios para continuar.");
      return;
    }

    setLoading(true);
    setAnalysis(null);
    setLoadingMessage("Analisando vaga com regras locais e IA...");

    const delayMessage = setTimeout(() => {
      setLoadingMessage(
        "A análise com IA ainda está em andamento. Isso pode levar até 30 segundos.",
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
      setError(err.message || "Erro ao analisar vaga.");
    } finally {
      clearTimeout(delayMessage);
      setLoading(false);
      setLoadingMessage("");
    }
  }

  async function exportPdf() {
    const element = document.getElementById("analysis-result-pdf");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const image = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = 190;
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(image, "PNG", 10, 10, width, height);
    pdf.save(`EmpregaSafe-${analysis.externalId}.pdf`);
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
        <span className="eyebrow">Nova análise</span>
        <h2>Analisar confiabilidade da vaga</h2>

        <p className="form-hint">
          Campos marcados com <strong>*</strong> são obrigatórios. Os demais
          campos ajudam a melhorar a precisão da análise.
        </p>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Título da vaga *
            <input
              className={fieldHasError("title") ? "field-error" : ""}
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ex: Auxiliar Administrativo"
            />
          </label>
          <label>
            Empresa
            <input
              value={form.company}
              onChange={(e) => update("company", e.target.value)}
              placeholder="Nome da empresa"
            />
          </label>
          <label>
            Salário
            <input
              value={form.salary}
              onChange={(e) =>
                update("salary", formatSalaryInput(e.target.value))
              }
              placeholder="Ex: 2.500,00"
              inputMode="numeric"
            />
          </label>

          <label>
            Moeda
            <select
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
            >
              <option value="BRL">Real brasileiro — R$</option>
              <option value="USD">Dólar — US$</option>
              <option value="EUR">Euro — €</option>
            </select>
          </label>
          <label>
            Contato
            <input
              value={form.contact}
              onChange={(e) => update("contact", e.target.value)}
              placeholder="E-mail, telefone ou WhatsApp"
            />
          </label>
          <label className="full">
            Link da vaga
            <input
              value={form.link}
              onChange={(e) => update("link", e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className="full">
            Descrição da vaga *
            <textarea
              className={fieldHasError("description") ? "field-error" : ""}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={8}
              placeholder="Cole aqui a descrição completa da vaga..."
            />
          </label>

          {error && <div className="form-soft-error full">{error}</div>}
          <button className="primary-button analyze-submit" disabled={loading}>
            {loading ? "Analisando..." : "Analisar vaga"}
          </button>
        </form>
      </section>

      <div className="page-stack">
        {analysis ? (
          <>
            <AnalysisResult analysis={analysis} />
            <section className="card mini-summary">
              <h3>Resumo da vaga</h3>
              <p>
                <strong>Empresa:</strong> {analysis.company || "Não informada"}
              </p>
              <p>
                <strong>Salário:</strong>{" "}
                {formatCurrency(analysis.salary, analysis.currency)}{" "}
              </p>
              <button className="secondary-button" onClick={exportPdf}>
                Baixar relatório em PDF{" "}
              </button>
            </section>
          </>
        ) : (
          <section className="card empty-state empty-result">
            <h2>Resultado da análise</h2>

            <p>
              Preencha os campos obrigatórios e clique em{" "}
              <strong>Analisar vaga</strong>. O sistema mostrará a pontuação de
              risco, a classificação da vaga, os principais sinais encontrados e
              uma recomendação para o candidato.
            </p>
          </section>
        )}
      </div>
      {loading && (
        <div className="analysis-loading-overlay">
          <div className="analysis-loading-box">
            <div className="analysis-spinner" />

            <h3>Analisando vaga com IA</h3>

            <p>
              O EmpregaSafe está verificando sinais de risco, padrões suspeitos
              e indícios de fraude.
            </p>

            <small>Isso pode levar até 30 segundos.</small>
          </div>
        </div>
      )}
    </div>
  );
}
