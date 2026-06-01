import { Link, NavLink } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileWarning,
  History,
  ShieldCheck,
} from "lucide-react";
import logo from "../assets/logo.png";

const items = [
  { to: "/app", label: "Painel de segurança", icon: BarChart3, end: true },
  { to: "/app/analisar", label: "Analisar vaga", icon: ClipboardCheck },
  { to: "/app/historico", label: "Histórico", icon: History },
  { to: "/app/denuncias", label: "Denúncias", icon: FileWarning },
  { to: "/app/sobre", label: "Sobre", icon: AlertTriangle },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <button
        type="button"
        className="sidebar-close"
        onClick={onClose}
        aria-label="Fechar menu"
      >
        ×
      </button>

      <Link className="brand" to="/app" onClick={onClose}>
        <img src={logo} alt="EmpregaSafe" />
        <span>EmpregaSafe</span>
      </Link>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-card">
        <ShieldCheck size={20} />
        <strong>Análise inteligente</strong>
        <p>Regras automáticas com apoio de IA para avaliar sinais de risco.</p>
      </div>
    </aside>
  );
}
