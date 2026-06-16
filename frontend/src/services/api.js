const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TOKEN_KEY = "empregasafe_token";
const USER_KEY = "empregasafe_user";
const LANGUAGE_KEY = "empregasafe_language";

const serviceMessages = {
  "pt-BR": {
    expiredSession: "Sessão expirada. Faça login novamente.",
    apiConnection:
      "Não foi possível conectar à API. Verifique se o backend está rodando.",
    requestError: "Erro na requisição.",
  },
  "en-US": {
    expiredSession: "Session expired. Please sign in again.",
    apiConnection:
      "Could not connect to the API. Check whether the backend is running.",
    requestError: "Request error.",
  },
};

function serviceMessage(key) {
  const language = localStorage.getItem(LANGUAGE_KEY) || "pt-BR";
  return serviceMessages[language]?.[key] || serviceMessages["pt-BR"][key];
}

const backendMessageTranslations = {
  "Erro ao listar análises.": "Error listing analyses.",
  "Erro ao criar análise.": "Error creating analysis.",
  "Esta vaga já foi analisada por este usuário.":
    "This job has already been analyzed by this user.",
  "Análise não encontrada.": "Analysis not found.",
  "Erro ao buscar análise.": "Error fetching analysis.",
  "Rota não encontrada.": "Route not found.",
  "Erro interno do servidor.": "Internal server error.",
  "Token não informado.": "Token not provided.",
  "Usuário inválido ou inativo.": "Invalid or inactive user.",
  "Sessão expirada ou inválida.": "Session expired or invalid.",
  "Acesso restrito ao administrador.": "Administrator access only.",
  "Informe o título da vaga.": "Enter the job title.",
  "Informe a descrição da vaga.": "Enter the job description.",
  "Informe um salário válido.": "Enter a valid salary.",
  "Informe um link válido para a vaga.": "Enter a valid job link.",
  "Informe um motivo de denúncia com pelo menos 5 caracteres.":
    "Enter a report reason with at least 5 characters.",
  "Informe um link válido para a denúncia.": "Enter a valid report link.",
  "Erro ao listar denúncias.": "Error listing reports.",
  "Análise vinculada não encontrada.": "Linked analysis not found.",
  "Erro ao registrar denúncia.": "Error registering report.",
  "Esta vaga já foi denunciada por este usuário.":
    "This job has already been reported by this user.",
  "Denúncia não encontrada.": "Report not found.",
  "Usuário logado não possui e-mail cadastrado.":
    "The signed-in user does not have a registered email.",
  "E-mail enviado com sucesso.": "Email sent successfully.",
  "Não foi possível enviar o e-mail da denúncia.":
    "Could not send the report email.",
  "Conta criada com sucesso.": "Account created successfully.",
  "Erro ao criar conta.": "Error creating account.",
  "Informe e-mail e senha.": "Enter email and password.",
  "E-mail ou senha inválidos.": "Invalid email or password.",
  "Login realizado em modo desenvolvimento.": "Login completed in development mode.",
  "Código enviado para o e-mail cadastrado.":
    "Code sent to the registered email.",
  "Usuário não encontrado.": "User not found.",
  "Nenhum código ativo.": "No active code.",
  "Código expirado.": "Code expired.",
  "Código inválido.": "Invalid code.",
  "Acesso validado com sucesso.": "Access validated successfully.",
  "Informe o e-mail cadastrado.": "Enter the registered email.",
  "Código de redefinição enviado para o e-mail cadastrado.":
    "Reset code sent to the registered email.",
  "Erro ao solicitar redefinição de senha.":
    "Error requesting password reset.",
  "Informe e-mail, código e nova senha.":
    "Enter email, code and new password.",
  "A nova senha deve ter pelo menos 6 caracteres.":
    "The new password must be at least 6 characters long.",
  "Código inválido ou expirado.": "Invalid or expired code.",
  "Nenhum código de redefinição ativo.": "No active reset code.",
  "Código expirado. Solicite um novo código.":
    "Code expired. Request a new code.",
  "Senha redefinida com sucesso. Faça login para acessar.":
    "Password reset successfully. Sign in to continue.",
  "Erro ao redefinir senha.": "Error resetting password.",
  "Muitas tentativas. Aguarde alguns minutos.":
    "Too many attempts. Please wait a few minutes.",
};

function translateBackendMessage(message) {
  const language = localStorage.getItem(LANGUAGE_KEY) || "pt-BR";

  if (language !== "en-US") return message;

  return backendMessageTranslations[message] || message;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser);
  } catch {
    clearSession();
    return null;
  }
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function redirectToLogin(message = serviceMessage("expiredSession")) {
  clearSession();

  sessionStorage.setItem("empregasafe_auth_message", message);

  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

function isPublicAuthRoute(path) {
  return (
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/verify") ||
    path.startsWith("/auth/forgot") ||
    path.startsWith("/auth/reset")
  );
}

function isJwtExpired(token) {
  if (!token || token.split(".").length !== 3) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = Number(payload.exp || 0) * 1000;

    if (!expiresAt) {
      return false;
    }

    return Date.now() >= expiresAt;
  } catch {
    return false;
  }
}

export async function apiFetch(path, options = {}) {
  const token = getToken();
  const publicRoute = isPublicAuthRoute(path);

  if (!publicRoute && token && isJwtExpired(token)) {
    redirectToLogin();
    throw new Error(serviceMessage("expiredSession"));
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    if (!publicRoute && token) {
      throw new Error(serviceMessage("apiConnection"));
    }

    throw new Error(serviceMessage("apiConnection"));
  }

  const data = await response.json().catch(() => ({}));
  const message = data.message || data.error || "";

  const lowerMessage = message.toLowerCase();

  const isTokenError =
    lowerMessage.includes("token") ||
    lowerMessage.includes("jwt") ||
    lowerMessage.includes("sessão") ||
    lowerMessage.includes("sessao") ||
    lowerMessage.includes("expir") ||
    lowerMessage.includes("unauthorized") ||
    lowerMessage.includes("não autorizado") ||
    lowerMessage.includes("nao autorizado");

  if (
    !publicRoute &&
    (response.status === 401 || response.status === 403 || isTokenError)
  ) {
    redirectToLogin();
    throw new Error(serviceMessage("expiredSession"));
  }

  if (!response.ok) {
    throw new Error(
      message ? translateBackendMessage(message) : serviceMessage("requestError"),
    );
  }

  return data;
}
