import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Landing() {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <div className="landing-brand">
          <div className="landing-logo">
            <img src={logo} alt="EmpregaSafe" />
          </div>

          <div>
            <strong>EmpregaSafe</strong>
            <span>Análise inteligente de vagas</span>
          </div>
        </div>

        <nav className="landing-nav">
          <a href="#como-funciona">Como funciona</a>
          <a href="#classificacoes">Classificações</a>
          <Link className="landing-login-link" to="/login">
            Entrar
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div>
          <span className="eyebrow">EmpregaSafe</span>

          <h1>
            Descubra se uma vaga é confiável antes de avançar no processo.
          </h1>

          <p>
            O EmpregaSafe analisa oportunidades de emprego e identifica sinais
            como cobrança antecipada, pedido de documentos sensíveis, links
            suspeitos e urgência artificial.
          </p>

          <div className="landing-actions">
            <Link className="landing-primary" to="/login">
              Acessar plataforma
              <ArrowRight size={20} />
            </Link>

            <a className="landing-secondary" href="#como-funciona">
              Ver como funciona
            </a>
          </div>
        </div>

        <div className="landing-preview-card">
          <span>EXEMPLO DE RESULTADO</span>

          <div className="landing-score">
            <strong>73</strong>
            <small>/100</small>
          </div>

          <h2>Potencialmente fraudulenta</h2>

          <p>
            Indícios de cobrança antecipada, pedido de documentos sensíveis,
            urgência artificial e link suspeito.
          </p>
        </div>
      </section>

      <section className="landing-cards">
        <article>
          <FileSearch size={28} />
          <h3>Analisa a oportunidade</h3>
          <p>
            Avalia título, empresa, salário, contato, link e descrição da
            oportunidade.
          </p>
        </article>

        <article>
          <AlertTriangle size={28} />
          <h3>Identifica sinais de risco</h3>
          <p>
            Detecta cobrança antecipada, pedido de documentos, links suspeitos e
            promessas incompatíveis.
          </p>
        </article>

        <article>
          <ShieldCheck size={28} />
          <h3>Gera uma recomendação</h3>
          <p>
            Apresenta pontuação, classificação, motivos encontrados e orientação
            para o candidato.
          </p>
        </article>
      </section>

      <section id="como-funciona" className="landing-section">
        <div>
          <span className="eyebrow">Como funciona</span>
          <h2>Como o EmpregaSafe avalia uma vaga</h2>
        </div>

        <div className="landing-steps">
          <div>
            <strong>1</strong>
            <h3>Informe a vaga</h3>
            <p>
              Preencha título, descrição e dados disponíveis da oportunidade.
            </p>
          </div>

          <div>
            <strong>2</strong>
            <h3>Execute a análise</h3>
            <p>O sistema aplica regras automáticas e pode usar apoio de IA.</p>
          </div>

          <div>
            <strong>3</strong>
            <h3>Receba o resultado</h3>
            <p>Veja score, classificação, motivos de risco e recomendação.</p>
          </div>
        </div>
      </section>

      <section id="classificacoes" className="landing-section">
        <div>
          <span className="eyebrow">Classificações</span>
          <h2>Entenda os níveis de risco</h2>
        </div>

        <div className="landing-risk-grid">
          <div className="risk-level safe">
            <strong>0 a 25</strong>
            <span>Confiável</span>
            <p>Baixo risco aparente.</p>
          </div>

          <div className="risk-level warning">
            <strong>26 a 55</strong>
            <span>Suspeita</span>
            <p>Exige atenção antes de avançar.</p>
          </div>

          <div className="risk-level danger">
            <strong>56 a 80</strong>
            <span>Fraudulenta</span>
            <p>Indícios fortes de fraude.</p>
          </div>

          <div className="risk-level critical">
            <strong>81 a 100</strong>
            <span>Risco crítico</span>
            <p>Risco grave. Recomenda-se evitar.</p>
          </div>
        </div>
      </section>

      <section className="landing-final">
        <CheckCircle2 size={34} />
        <h2>
          Antes de enviar documentos, dados pessoais ou dinheiro, analise a vaga
          no EmpregaSafe.
        </h2>
        <Link to="/login" className="landing-cta-button">
          <span>Acessar plataforma</span>
          <ArrowRight size={22} />
        </Link>
      </section>
    </main>
  );
}
