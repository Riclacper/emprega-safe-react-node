import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import logo from "../assets/logo.png";
import LanguageSelector from "../components/LanguageSelector.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { forgotPassword, resetPassword } from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleRequestCode(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError(t("auth.registeredEmail"));
      setEmailError(true);
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(email.trim());

      setEmailError(false);
      setMessage(t("auth.sentCode"));
      setStep(2);
    } catch (err) {
      setMessage("");
      setError(err.message || t("auth.invalidCode"));
      setCodeError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (code.trim().length !== 6) {
      setError(t("auth.informSixDigitCode"));
      setCodeError(true);
      return;
    }

    if (password.length < 6) {
      setError(t("auth.newPasswordMinError"));
      setPasswordError(true);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      setConfirmPasswordError(true);
      return;
    }

    setLoading(true);

    try {
      await resetPassword(email.trim(), code.trim(), password);

      navigate("/login", {
        replace: true,
        state: {
          message: t("auth.passwordResetSuccess"),
        },
      });
    } catch (err) {
      setMessage("");
      setError(err.message || t("auth.enterRegisteredEmail"));
      setEmailError(true);
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

          <h1>{t("auth.resetTitle")}</h1>

          <p>
            {t("auth.resetText")}
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="auth-form" noValidate>
            <label className={`field-group ${emailError ? "field-error" : ""}`}>
              <span>{t("common.email")}</span>
              <div className="field-control">
                <Mail size={19} />

                <input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setMessage("");
                    setEmailError(false);
                  }}
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                />
              </div>
            </label>
            {error && <div className="alert-error full-width">{error}</div>}
            {message && (
              <div className="alert-success full-width">{message}</div>
            )}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? t("common.sending") : t("auth.sendCode")}
            </button>
            <p className="auth-switch">
              {t("auth.rememberedPassword")}{" "}
              <Link to="/login">{t("auth.loginButton")}</Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="auth-form" noValidate>
            {" "}
            {message && (
              <div className="alert-success full-width">{message}</div>
            )}
            <label className={`field-group ${codeError ? "field-error" : ""}`}>
              <span>{t("auth.sixDigitCode")}</span>

              <div className="field-control">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                    setCodeError(false);
                  }}
                  inputMode="numeric"
                  placeholder={t("auth.sixDigitCodePlaceholder")}
                />
              </div>
            </label>
            <label
              className={`field-group ${passwordError ? "field-error" : ""}`}
            >
              {" "}
              <span>{t("auth.newPassword")}</span>
              <div className="field-control">
                <LockKeyhole size={19} />

                <input
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                    setPasswordError(false);
                  }}
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("auth.minPasswordPlaceholder")}
                />

                <button
                  type="button"
                  className="field-icon-button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword ? t("auth.hidePassword") : t("auth.showPassword")
                  }
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            <label
              className={`field-group ${confirmPasswordError ? "field-error" : ""}`}
            >
              {" "}
              <span>{t("auth.confirmNewPassword")}</span>
              <div className="field-control">
                <LockKeyhole size={19} />

                <input
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                    setConfirmPasswordError(false);
                  }}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("auth.confirmNewPasswordPlaceholder")}
                />

                <button
                  type="button"
                  className="field-icon-button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} />
                  ) : (
                    <Eye size={19} />
                  )}
                </button>
              </div>
            </label>
            {error && <div className="alert-error full-width">{error}</div>}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? t("auth.resetting") : t("auth.resetPassword")}
            </button>
            <p className="auth-switch">
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setStep(1);
                  setCode("");
                  setPassword("");
                  setConfirmPassword("");
                  setError("");
                  setMessage("");
                  setEmailError(false);
                  setCodeError(false);
                  setPasswordError(false);
                  setConfirmPasswordError(false);
                }}
              >
                {t("auth.useAnotherEmail")}
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
