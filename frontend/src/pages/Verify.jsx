import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { verify } from "../services/authService";
import LanguageSelector from "../components/LanguageSelector.jsx";
import logo from "../assets/logo.png";

export default function Verify() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const email = sessionStorage.getItem("empregasafe_login_email");

  const [code, setCode] = useState(Array(6).fill(""));
  const codeInputs = useRef([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [codeError, setCodeError] = useState(false);

  function focusCodeInput(index) {
    codeInputs.current[index]?.focus();
  }

  function handleCodeChange(index, value) {
    const digits = value.replace(/\D/g, "");
    setCodeError(false);

    if (digits.length > 1) {
      const nextCode = Array(6).fill("");
      digits
        .slice(0, 6)
        .split("")
        .forEach((digit, digitIndex) => {
          nextCode[digitIndex] = digit;
        });
      setCode(nextCode);
      focusCodeInput(Math.min(digits.length, 6) - 1);
      return;
    }

    const nextCode = [...code];
    nextCode[index] = digits;
    setCode(nextCode);

    if (digits && index < 5) {
      focusCodeInput(index + 1);
    }
  }

  function handleCodeKeyDown(index, event) {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      event.preventDefault();
      setCodeError(false);
      const nextCode = [...code];
      nextCode[index - 1] = "";
      setCode(nextCode);
      focusCodeInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusCodeInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      focusCodeInput(index + 1);
    }
  }

  function handleCodePaste(event) {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedCode) return;

    setCodeError(false);
    const nextCode = Array(6).fill("");
    pastedCode.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });

    setCode(nextCode);
    focusCodeInput(Math.min(pastedCode.length, 5));
  }

  function handleBackToLogin() {
    sessionStorage.removeItem("empregasafe_login_email");
    navigate("/login", { replace: true });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setCodeError(false);

    if (!email) {
      setError(t("auth.missingEmail"));
      return;
    }

    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      setCodeError(true);
      return;
    }

    setLoading(true);

    try {
      const data = await verify(email, verificationCode);

      if (!data.token || !data.user) {
        setError(t("auth.verifiedMissingSession"));
        return;
      }

      sessionStorage.removeItem("empregasafe_login_email");

      signIn(data.token, data.user);
      navigate("/app", { replace: true });
    } catch (err) {
      if (err.message?.toLowerCase().includes("código inválido")) {
        setCodeError(true);
      } else {
        setError(err.message || t("auth.invalidCode"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card auth-card-login">
        <div className="auth-brand-row">
          <img src={logo} alt="EmpregaSafe" className="auth-logo" />

          <div>
            <strong>EmpregaSafe</strong>
            <span>{t("common.appTagline")}</span>
          </div>
        </div>
        <LanguageSelector className="auth-language-selector" />

        <div className="auth-headline">
          <ShieldCheck size={42} />
          <h1>{t("auth.verifyTitle")}</h1>

          <p>
            {t("auth.verifyText")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-group">
            <span>{t("auth.verificationCode")}</span>

            <div
              className={`verify-code-grid ${codeError ? "verify-code-error" : ""}`}
              onPaste={handleCodePaste}
            >
              {Array.from({ length: 6 }, (_, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    codeInputs.current[index] = element;
                  }}
                  className="verify-code-input"
                  value={code[index] || ""}
                  onChange={(event) =>
                    handleCodeChange(index, event.target.value)
                  }
                  onKeyDown={(event) => handleCodeKeyDown(index, event)}
                  onFocus={(event) => event.target.select()}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  aria-invalid={codeError}
                  aria-label={t("auth.digitAria", { number: index + 1 })}
                />
              ))}
            </div>
          </label>

          {error && <div className="alert-error full-width">{error}</div>}

          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? t("auth.validating") : t("auth.validateCode")}
          </button>

          <button
            type="button"
            className="report-clear-button auth-back-button"
            onClick={handleBackToLogin}
          >
            <ArrowLeft size={18} />
            {t("auth.backToLogin")}
          </button>
        </form>
      </section>
    </main>
  );
}
