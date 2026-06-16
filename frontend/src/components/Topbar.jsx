import { LogOut, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import LanguageSelector from "./LanguageSelector.jsx";

const pageTitles = {
  "/": {
    titleKey: "topbar.dashboardTitle",
    subtitleKey: "topbar.dashboardSubtitle",
  },
  "/analisar": {
    titleKey: "topbar.analyzeTitle",
    subtitleKey: "topbar.analyzeSubtitle",
  },
  "/historico": {
    titleKey: "topbar.historyTitle",
    subtitleKey: "topbar.historySubtitle",
  },
  "/denuncias": {
    titleKey: "topbar.reportsTitle",
    subtitleKey: "topbar.reportsSubtitle",
  },
  "/sobre": {
    titleKey: "topbar.aboutTitle",
    subtitleKey: "topbar.aboutSubtitle",
  },
};

export default function Topbar() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const pageInfo = pageTitles[location.pathname] || pageTitles["/"];

  return (
    <header className="topbar">
      <div className="topbar-title">
        <h1>{t(pageInfo.titleKey)}</h1>
        <p>{t(pageInfo.subtitleKey)}</p>
      </div>

      <div className="topbar-user">
        <LanguageSelector className="topbar-language-selector" />

        <div className="topbar-user-info">
          <UserCircle size={24} />
          <span>{user?.name || "EmpregaSafe"}</span>
        </div>

        <button type="button" className="logout-button" onClick={signOut}>
          <LogOut size={18} />
          {t("topbar.logout")}
        </button>
      </div>
    </header>
  );
}
