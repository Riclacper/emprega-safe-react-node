import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import logo from "../assets/logo.png";
import { forgotPassword, resetPassword } from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();

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
      setError("Informe o e-mail cadastrado.");
      setEmailError(true);
      return;
    }

    setLoading(true);

    try {
      const data = await forgotPassword(email.trim());

      setEmailError(false);
      setMessage(data.message || "Código enviado para o e-mail informado.");
      setStep(2);
    } catch (err) {
      setMessage("");
      setError(err.message || "Código inválido ou expirado.");
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
      setError("Informe o código de 6 dígitos.");
      setCodeError(true);
      return;
    }

    if (password.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      setPasswordError(true);
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não conferem.");
      setConfirmPasswordError(true);
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(email.trim(), code.trim(), password);

      navigate("/login", {
        replace: true,
        state: {
          message: data.message || "Senha redefinida com sucesso. Faça login.",
        },
      });
    } catch (err) {
      setMessage("");
      setError(err.message || "Insira o e-mail cadastrado.");
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
            <span>Análise inteligente de vagas</span>
          </div>
        </div>

        <div className="auth-headline">
          <ShieldCheck size={42} />

          <h1>Redefinir senha</h1>

          <p>
            Informe seu e-mail cadastrado para receber um código de segurança e
            criar uma nova senha.
          </p>
        </div>

        {step === 1 && (
          <form onSubmit={handleRequestCode} className="auth-form" noValidate>
            <label className={`field-group ${emailError ? "field-error" : ""}`}>
              <span>E-mail</span>
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
                  placeholder="Digite seu e-mail"
                />
              </div>
            </label>
            {error && <div className="alert-error full-width">{error}</div>}
            {message && (
              <div className="alert-success full-width">{message}</div>
            )}
            <button className="primary-button auth-submit" disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </button>
            <p className="auth-switch">
              Lembrou a senha? <Link to="/login">Entrar</Link>
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
              <span>Código de 6 dígitos</span>

              <div className="field-control">
                <input
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setError("");
                    setCodeError(false);
                  }}
                  inputMode="numeric"
                  placeholder="Digite o código recebido"
                />
              </div>
            </label>
            <label
              className={`field-group ${passwordError ? "field-error" : ""}`}
            >
              {" "}
              <span>Nova senha</span>
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
              className={`field-group ${confirmPasswordError ? "field-error" : ""}`}
            >
              {" "}
              <span>Confirmar nova senha</span>
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
                  placeholder="Repita a nova senha"
                />

                <button
                  type="button"
                  className="field-icon-button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
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
              {loading ? "Redefinindo..." : "Redefinir senha"}
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
                Usar outro e-mail
              </button>
            </p>
          </form>
        )}
      </section>
    </main>
  );
}
