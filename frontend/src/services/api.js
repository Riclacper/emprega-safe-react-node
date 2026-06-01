const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const TOKEN_KEY = "empregasafe_token";
const USER_KEY = "empregasafe_user";

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

function redirectToLogin(message = "Sessão expirada. Faça login novamente.") {
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
    throw new Error("Sessão expirada. Faça login novamente.");
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
      throw new Error(
        "Não foi possível conectar à API. Verifique se o backend está rodando.",
      );
    }

    throw new Error(
      "Não foi possível conectar à API. Verifique se o backend está rodando.",
    );
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
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    throw new Error(message || "Erro na requisição.");
  }

  return data;
}
