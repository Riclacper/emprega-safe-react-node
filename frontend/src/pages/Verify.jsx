import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { verify } from "../services/authService";
import logo from "../assets/logo.png";

export default function Verify() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const email = sessionStorage.getItem("empregasafe_login_email");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email) {
      setError("E-mail não encontrado. Faça login novamente.");
      return;
    }

    if (code.trim().length !== 6) {
      setError("Informe o código de 6 dígitos.");
      return;
    }

    setLoading(true);

    try {
      const data = await verify(email, code.trim());

      if (!data.token || !data.user) {
        setError("Código validado, mas a sessão não foi retornada.");
        return;
      }

      sessionStorage.removeItem("empregasafe_login_email");

      signIn(data.token, data.user);
      navigate("/app", { replace: true });
    } catch (err) {
      setError(err.message || "Código inválido ou expirado.");
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
          <h1>Verificar acesso</h1>

          <p>
            Enviamos um código de 6 dígitos para o e-mail cadastrado. Informe o
            código para acessar a plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-group">
            <span>Código de verificação</span>

            <div className="field-control">
              <input
                className="verify-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Digite os 6 números"
              />
            </div>
          </label>

          {error && <div className="alert-error full-width">{error}</div>}

          <button className="primary-button auth-submit" disabled={loading}>
            {loading ? "Validando..." : "Validar código"}
          </button>
        </form>
      </section>
    </main>
  );
}
