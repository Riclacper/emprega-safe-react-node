import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { login } from "../services/authService";
import LanguageSelector from "../components/LanguageSelector.jsx";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const { t } = useLanguage();

  const successMessage = location.state?.message || "";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(form.email.trim(), form.password);

      if (data.requiresVerification) {
        sessionStorage.setItem("empregasafe_login_email", form.email.trim());
        navigate("/verify");
        return;
      }

      if (!data.token || !data.user) {
        setError(
          t("auth.loginSessionError"),
        );
        return;
      }

      signIn(data.token, data.user);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(
        err.message || t("auth.loginError"),
      );
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
          <h1>{t("auth.loginTitle")}</h1>

          <p>
            {t("auth.loginText")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {successMessage && (
            <div className="alert-success full-width">{successMessage}</div>
          )}

          <label className="field-group">
            <span>{t("common.email")}</span>

            <div className="field-control login-field-control">
              <Mail size={19} />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                autoComplete="username"
                placeholder={t("auth.emailPlaceholder")}
                required
              />
            </div>
          </label>

          <label className="field-group">
            <span>{t("common.password")}</span>

            <div className="field-control login-field-control login-password-control">
              <LockKeyhole size={19} />

              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder={t("auth.passwordPlaceholder")}
                required
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

          {error && <div className="alert-error full-width">{error}</div>}
          <div className="forgot-password-row">
            <Link to="/forgot-password">{t("auth.forgotPassword")}</Link>
          </div>
          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? t("auth.loggingIn") : t("auth.loginButton")}
          </button>

          <Link to="/" className="report-clear-button auth-back-button">
            <ArrowLeft size={18} />
            {t("common.back")}
          </Link>

          <p className="auth-switch">
            {t("auth.noAccount")}{" "}
            <Link to="/register">{t("auth.createAccountLink")}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
