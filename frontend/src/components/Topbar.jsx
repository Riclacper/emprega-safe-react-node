import { LogOut, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const pageTitles = {
  "/": {
    title: "Painel de segurança das vagas",
    subtitle:
      "Acompanhe quais vagas parecem confiáveis, suspeitas ou com alto risco antes de enviar dados pessoais.",
  },
  "/analisar": {
    title: "Analisar vaga",
    subtitle:
      "Informe os dados da oportunidade para verificar sinais de risco antes de avançar no processo.",
  },
  "/historico": {
    title: "Histórico de análises",
    subtitle:
      "Consulte as vagas já analisadas e acompanhe os resultados anteriores.",
  },
  "/denuncias": {
    title: "Denúncias",
    subtitle:
      "Registre oportunidades suspeitas para ajudar a identificar possíveis golpes.",
  },
  "/sobre": {
    title: "Sobre o EmpregaSafe",
    subtitle:
      "Entenda como o sistema ajuda a identificar sinais de risco em vagas de emprego.",
  },
};

export default function Topbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const pageInfo = pageTitles[location.pathname] || pageTitles["/"];

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{pageInfo.title}</h1>
        <p>{pageInfo.subtitle}</p>
      </div>

      <div className="topbar-user">
        <div className="topbar-user-info">
          <UserCircle size={24} />
          <span>{user?.name || "EmpregaSafe"}</span>
        </div>

        <button type="button" className="logout-button" onClick={signOut}>
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </header>
  );
}
