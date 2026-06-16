import { Languages } from "lucide-react";
import { useLanguage } from "../context/LanguageContext.jsx";

export default function LanguageSelector({ className = "" }) {
  const { language, languages, setLanguage, t } = useLanguage();

  return (
    <label className={`language-selector ${className}`.trim()}>
      <Languages size={16} />
      <span>{t("common.language")}</span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label={t("common.language")}
      >
        {Object.entries(languages).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
