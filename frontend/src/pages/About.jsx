import {
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  Database,
  FileSearch,
  ShieldCheck,
} from "lucide-react";

export default function About() {
  return (
    <div className="page-stack">
      <section className="card about-hero">
        <span className="eyebrow">Sobre o projeto</span>

        <div className="about-hero-content">
          <div>
            <h2>EmpregaSafe</h2>

            <p>
              O EmpregaSafe é uma plataforma para analisar vagas de emprego e
              identificar sinais de risco, possíveis golpes e tentativas de
              engenharia social contra candidatos.
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
          <h3>Coleta os dados da vaga</h3>
          <p>
            O sistema analisa informações como título, empresa, salário,
            contato, link e descrição da oportunidade.
          </p>
        </article>

        <article className="card about-card">
          <AlertTriangle size={28} />
          <h3>Identifica sinais de risco</h3>
          <p>
            Detecta cobrança indevida, pedido de dados sensíveis, urgência
            falsa, links suspeitos e comunicação informal.
          </p>
        </article>

        <article className="card about-card">
          <BrainCircuit size={28} />
          <h3>Apoio com IA</h3>
          <p>
            Quando ativada, a IA complementa as regras do sistema e ajuda a
            interpretar melhor o texto da vaga.
          </p>
        </article>

        <article className="card about-card">
          <Database size={28} />
          <h3>Registra histórico</h3>
          <p>
            As análises e denúncias ficam armazenadas para consulta,
            acompanhamento e geração de relatórios.
          </p>
        </article>
      </section>

      <section className="card about-section">
        <h2>Como a pontuação funciona</h2>

        <p>
          Cada vaga recebe uma pontuação de risco de 0 a 100. Quanto maior a
          pontuação, maior a chance de a vaga apresentar comportamento suspeito.
        </p>

        <div className="risk-level-grid">
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
            <p>Indícios fortes de fraude.</p>{" "}
          </div>

          <div className="risk-level critical">
            <strong>81 a 100</strong>
            <span>Risco crítico</span>
            <p>Risco grave. Recomenda-se evitar.</p>
          </div>
        </div>
      </section>

      <section className="card about-section">
        <h2>Objetivo do sistema</h2>

        <div className="about-objective">
          <CheckCircle2 size={28} />

          <p>
            O objetivo do EmpregaSafe é apoiar candidatos antes que enviem
            documentos, dados pessoais, dinheiro ou avancem em processos
            seletivos com sinais de risco.
          </p>
        </div>
      </section>
    </div>
  );
}
