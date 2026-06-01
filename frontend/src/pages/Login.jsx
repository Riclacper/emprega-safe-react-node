import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { login } from "../services/authService";
import logo from "../assets/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

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
          "Login realizado, mas a sessão não foi retornada corretamente.",
        );
        return;
      }

      signIn(data.token, data.user);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(
        err.message || "Não foi possível acessar. Confira o e-mail e a senha.",
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
            <span>Análise inteligente de vagas</span>
          </div>
        </div>

        <div className="auth-headline">
          <h1>Acessar plataforma</h1>

          <p>
            Entre para analisar vagas, acompanhar histórico e registrar
            denúncias de oportunidades suspeitas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {successMessage && (
            <div className="alert-success full-width">{successMessage}</div>
          )}

          <label className="field-group">
            <span>E-mail</span>

            <div className="field-control">
              <Mail size={19} />

              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                type="email"
                autoComplete="username"
                placeholder="Digite seu e-mail"
                required
              />
            </div>
          </label>

          <label className="field-group">
            <span>Senha</span>

            <div className="field-control">
              <LockKeyhole size={19} />

              <input
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Digite sua senha"
                required
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

          {error && <div className="alert-error full-width">{error}</div>}
          <div className="forgot-password-row">
            <Link to="/forgot-password">Esqueci minha senha</Link>
          </div>
          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="auth-switch">
            Ainda não tem conta? <Link to="/register">Criar conta</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
