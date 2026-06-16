import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import LanguageSelector from "../components/LanguageSelector.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function Landing() {
  const { t } = useLanguage();

  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-logo">
            <img src={logo} alt="EmpregaSafe" />
          </div>

          <div>
            <strong>EmpregaSafe</strong>
            <span>{t("common.appTagline")}</span>
          </div>
        </div>

        <nav className="landing-nav">
          <a href="#como-funciona">{t("landing.navHow")}</a>
          <a href="#classificacoes">{t("landing.navRisk")}</a>
          <LanguageSelector className="landing-language-selector" />
          <Link className="landing-login-link" to="/login">
            {t("landing.login")}
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div>
          <span className="eyebrow">EmpregaSafe</span>

          <h1>
            {t("landing.heroTitle")}
          </h1>

          <p>
            {t("landing.heroText")}
          </p>

          <div className="landing-actions">
            <Link className="landing-primary" to="/login">
              {t("landing.accessPlatform")}
              <ArrowRight size={20} />
            </Link>

            <a className="landing-secondary" href="#como-funciona">
              {t("landing.seeHow")}
            </a>
          </div>
        </div>

        <div className="landing-preview-card">
          <span>{t("landing.example")}</span>

          <div className="landing-score">
            <strong>73</strong>
            <small>/100</small>
          </div>

          <h2>{t("landing.exampleTitle")}</h2>

          <p>
            {t("landing.exampleText")}
          </p>
        </div>
      </section>

      <section className="landing-cards">
        <article>
          <FileSearch size={28} />
          <h3>{t("landing.cardAnalyzeTitle")}</h3>
          <p>
            {t("landing.cardAnalyzeText")}
          </p>
        </article>

        <article>
          <AlertTriangle size={28} />
          <h3>{t("landing.cardRiskTitle")}</h3>
          <p>
            {t("landing.cardRiskText")}
          </p>
        </article>

        <article>
          <ShieldCheck size={28} />
          <h3>{t("landing.cardRecommendationTitle")}</h3>
          <p>
            {t("landing.cardRecommendationText")}
          </p>
        </article>
      </section>

      <section id="como-funciona" className="landing-section">
        <div>
          <span className="eyebrow">{t("landing.howEyebrow")}</span>
          <h2>{t("landing.howTitle")}</h2>
        </div>

        <div className="landing-steps">
          <div>
            <strong>1</strong>
            <h3>{t("landing.step1Title")}</h3>
            <p>
              {t("landing.step1Text")}
            </p>
          </div>

          <div>
            <strong>2</strong>
            <h3>{t("landing.step2Title")}</h3>
            <p>{t("landing.step2Text")}</p>
          </div>

          <div>
            <strong>3</strong>
            <h3>{t("landing.step3Title")}</h3>
            <p>{t("landing.step3Text")}</p>
          </div>
        </div>
      </section>

      <section id="classificacoes" className="landing-section">
        <div>
          <span className="eyebrow">{t("landing.riskEyebrow")}</span>
          <h2>{t("landing.riskTitle")}</h2>
        </div>

        <div className="landing-risk-grid">
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
            <p>{t("risk.fraudulentDescription")}</p>
          </div>

          <div className="risk-level critical">
            <strong>81 a 100</strong>
            <span>{t("risk.critical")}</span>
            <p>{t("risk.criticalDescription")}</p>
          </div>
        </div>
      </section>

      <section className="landing-final">
        <CheckCircle2 size={34} />
        <h2>
          {t("landing.finalText")}
        </h2>
        <Link to="/login" className="landing-cta-button">
          <span>{t("landing.accessPlatform")}</span>
          <ArrowRight size={22} />
        </Link>
      </section>
    </main>
  );
}
