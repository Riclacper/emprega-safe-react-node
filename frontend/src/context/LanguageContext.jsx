import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { languages, translations } from "../i18n/translations.js";

const STORAGE_KEY = "empregasafe_language";
const DEFAULT_LANGUAGE = "pt-BR";

const LanguageContext = createContext(null);

function getInitialLanguage() {
  const storedLanguage = localStorage.getItem(STORAGE_KEY);

  if (storedLanguage && translations[storedLanguage]) {
    return storedLanguage;
  }

  return DEFAULT_LANGUAGE;
}

function interpolate(text, params = {}) {
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) =>
    params[key] === undefined ? "" : String(params[key]),
  );
}

function readPath(source, path) {
  return path.split(".").reduce((current, segment) => {
    if (!current || current[segment] === undefined) return undefined;
    return current[segment];
  }, source);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language === "en-US" ? "en" : "pt-BR";
  }, [language]);

  const value = useMemo(() => {
    function t(path, params) {
      const translated = readPath(translations[language], path);
      const fallback = readPath(translations[DEFAULT_LANGUAGE], path);

      return interpolate(translated ?? fallback ?? path, params);
    }

    function translateDynamic(type, valueToTranslate) {
      if (!valueToTranslate) return valueToTranslate;

      const translated =
        translations[language]?.dynamic?.[type]?.[valueToTranslate];
      const fallback =
        translations[DEFAULT_LANGUAGE]?.dynamic?.[type]?.[valueToTranslate];

      return translated ?? fallback ?? valueToTranslate;
    }

    return {
      language,
      languages,
      setLanguage,
      t,
      translateClassification: (valueToTranslate) =>
        translateDynamic("classifications", valueToTranslate),
      translateReason: (valueToTranslate) =>
        translateDynamic("reasons", valueToTranslate),
      translateRecommendation: (valueToTranslate) =>
        translateDynamic("recommendations", valueToTranslate),
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider.");
  }

  return context;
}
