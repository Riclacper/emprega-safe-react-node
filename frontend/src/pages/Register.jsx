import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import logo from "../assets/logo.png";
import LanguageSelector from "../components/LanguageSelector.jsx";
import { useLanguage } from "../context/LanguageContext.jsx";
import { registerUser } from "../services/authService";
import { validateEmail } from "../utils/emailValidation";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));

    setError("");
  }

  function validateRegisterForm() {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = t("auth.informName");
    }

    if (!form.email.trim()) {
      errors.email = t("auth.informEmail");
    } else {
      const emailValidation = validateEmail(form.email);

      if (!emailValidation.valid) {
        errors.email = emailValidation.messageKey
          ? t(emailValidation.messageKey)
          : emailValidation.message;
      }
    }

    if (!form.password.trim()) {
      errors.password = t("auth.informPassword");
    } else if (form.password.length < 6) {
      errors.password = t("auth.minPasswordError");
    }

    if (!form.confirmPassword.trim()) {
      errors.confirmPassword = t("auth.confirmPasswordError");
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = t("auth.passwordMismatch");
    }

    return errors;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSubmitted(true);
    setError("");

    const errors = validateRegisterForm();

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError(Object.values(errors)[0]);
      return;
    }

    setFieldErrors({});

    setLoading(true);

    try {
      await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/login", {
        replace: true,
        state: {
          message: t("auth.accountCreated"),
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || t("auth.createAccountError"),
      );
    } finally {
      setLoading(false);
    }
  }

  const nameError = Boolean(fieldErrors.name);
  const emailError = Boolean(fieldErrors.email);
  const passwordError = Boolean(fieldErrors.password);
  const confirmPasswordError = Boolean(fieldErrors.confirmPassword);

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
          <h1>{t("auth.registerTitle")}</h1>

          <p>
            {t("auth.registerText")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {" "}
          <label className={`field-group ${nameError ? "field-error" : ""}`}>
            <span>{t("common.name")}</span>

            <div className="field-control">
              <User size={19} />

              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                type="text"
                autoComplete="name"
                placeholder={t("auth.namePlaceholder")}
              />
            </div>
          </label>
          <label className={`field-group ${emailError ? "field-error" : ""}`}>
            <span>{t("common.email")}</span>

            <div className="field-control">
              <Mail size={19} />

              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                autoComplete="email"
                placeholder={t("auth.emailPlaceholder")}
              />
            </div>
          </label>
          <label
            className={`field-group ${passwordError ? "field-error" : ""}`}
          >
            <span>{t("common.password")}</span>

            <div className="field-control">
              <LockKeyhole size={19} />

              <input
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
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
            className={`field-group ${
              confirmPasswordError ? "field-error" : ""
            }`}
          >
            <span>{t("auth.confirmPassword")}</span>

            <div className="field-control">
              <LockKeyhole size={19} />

              <input
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder={t("auth.confirmPasswordPlaceholder")}
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
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>
          {error && <div className="alert-error full-width">{error}</div>}
          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </button>
          <p className="auth-switch">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link to="/login">{t("auth.loginButton")}</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
