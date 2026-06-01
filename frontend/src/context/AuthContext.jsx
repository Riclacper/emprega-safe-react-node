import { createContext, useContext, useMemo, useState } from "react";
import { clearSession, getStoredUser, setSession } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());

  function signIn(token, loggedUser) {
    setSession(token, loggedUser);
    setUser(loggedUser);
  }

  function signOut(redirectTo = "/") {
    clearSession();
    window.location.replace(redirectTo);
  }

  const value = useMemo(
    () => ({
      user,
      authenticated: Boolean(user),
      isAuthenticated: Boolean(user),
      signIn,
      signOut,
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
