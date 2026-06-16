import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileSearch,
  ShieldCheck,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="page-stack">
      <section className="card about-hero">
        <span className="eyebrow">{t("about.eyebrow")}</span>

        <div className="about-hero-content">
          <div>
            <h2>EmpregaSafe</h2>

            <p>
              {t("about.text")}
            </p>
          </div>

          <div className="about-hero-icon">
            <ShieldCheck size={42} />
          </div>
        </div>
      </section>

      <section className="about-grid">
        <article className="card about-card">
          <FileSearch size={28} />
          <h3>{t("about.collectTitle")}</h3>
          <p>
            {t("about.collectText")}
          </p>
        </article>

        <article className="card about-card">
          <AlertTriangle size={28} />
          <h3>{t("about.riskTitle")}</h3>
          <p>
            {t("about.riskText")}
          </p>
        </article>

        <article className="card about-card">
          <BrainCircuit size={28} />
          <h3>{t("about.aiTitle")}</h3>
          <p>
            {t("about.aiText")}
          </p>
        </article>

        <article className="card about-card">
          <Database size={28} />
          <h3>{t("about.historyTitle")}</h3>
          <p>
            {t("about.historyText")}
          </p>
        </article>
      </section>

      <section className="card about-section">
        <h2>{t("about.scoreTitle")}</h2>

        <p>
          {t("about.scoreText")}
        </p>

        <div className="risk-level-grid">
          <div className="risk-level safe">
            <strong>0 a 25</strong>
            <span>{t("risk.safe")}</span>
            <p>{t("risk.safeDescription")}</p>
          </div>

          <div className="risk-level warning">
            <strong>26 a 55</strong>
            <span>{t("risk.suspicious")}</span>
            <p>{t("risk.suspiciousDescription")}</p>
          </div>

          <div className="risk-level danger">
            <strong>56 a 80</strong>
            <span>{t("risk.fraudulent")}</span>
            <p>{t("risk.fraudulentDescription")}</p>{" "}
          </div>

          <div className="risk-level critical">
            <strong>81 a 100</strong>
            <span>{t("risk.critical")}</span>
            <p>{t("risk.criticalDescription")}</p>
          </div>
        </div>
      </section>

      <section className="card about-section">
        <h2>{t("about.objectiveTitle")}</h2>

        <div className="about-objective">
          <CheckCircle2 size={28} />

          <p>
            {t("about.objectiveText")}
          </p>
        </div>
      </section>
    </div>
  );
}
