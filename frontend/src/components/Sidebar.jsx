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
import { useLanguage } from "../context/LanguageContext.jsx";

const items = [
  { to: "/app", labelKey: "sidebar.dashboard", icon: BarChart3, end: true },
  { to: "/app/analisar", labelKey: "sidebar.analyze", icon: ClipboardCheck },
  { to: "/app/historico", labelKey: "sidebar.history", icon: History },
  { to: "/app/denuncias", labelKey: "sidebar.reports", icon: FileWarning },
  { to: "/app/sobre", labelKey: "sidebar.about", icon: AlertTriangle },
];

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { t } = useLanguage();

  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <button
        type="button"
        className="sidebar-close"
        onClick={onClose}
        aria-label={t("common.closeMenu")}
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
              {t(item.labelKey)}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-card">
        <ShieldCheck size={20} />
        <strong>{t("sidebar.cardTitle")}</strong>
        <p>{t("sidebar.cardText")}</p>
      </div>
    </aside>
  );
}
