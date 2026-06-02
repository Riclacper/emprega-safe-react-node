import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import logo from "../assets/logo.png";
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
      errors.name = "Informe seu nome.";
    }

    if (!form.email.trim()) {
      errors.email = "Informe seu e-mail.";
    } else {
      const emailValidation = validateEmail(form.email);

      if (!emailValidation.valid) {
        errors.email = emailValidation.message;
      }
    }

    if (!form.password.trim()) {
      errors.password = "Informe sua senha.";
    } else if (form.password.length < 6) {
      errors.password = "A senha deve ter no mínimo 6 caracteres.";
    }

    if (!form.confirmPassword.trim()) {
      errors.confirmPassword = "Confirme sua senha.";
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = "As senhas não conferem.";
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
          message: "Conta criada com sucesso. Faça login para acessar.",
        },
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Erro ao criar conta.",
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
            <span>Análise inteligente de vagas</span>
          </div>
        </div>

        <div className="auth-headline">
          <h1>Criar conta</h1>

          <p>
            Cadastre-se para analisar vagas, acompanhar histórico e registrar
            denúncias de oportunidades suspeitas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {" "}
          <label className={`field-group ${nameError ? "field-error" : ""}`}>
            <span>Nome</span>

            <div className="field-control">
              <User size={19} />

              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                type="text"
                autoComplete="name"
                placeholder="Digite seu nome"
              />
            </div>
          </label>
          <label className={`field-group ${emailError ? "field-error" : ""}`}>
            <span>E-mail</span>

            <div className="field-control">
              <Mail size={19} />

              <input
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                autoComplete="email"
                placeholder="Digite seu e-mail"
              />
            </div>
          </label>
          <label
            className={`field-group ${passwordError ? "field-error" : ""}`}
          >
            <span>Senha</span>

            <div className="field-control">
              <LockKeyhole size={19} />

              <input
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
              />

              <button
                type="button"
                className="field-icon-button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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
            <span>Confirmar senha</span>

            <div className="field-control">
              <LockKeyhole size={19} />

              <input
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repita sua senha"
              />

              <button
                type="button"
                className="field-icon-button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={
                  showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {showConfirmPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </label>
          {error && <div className="alert-error full-width">{error}</div>}
          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
          <p className="auth-switch">
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
