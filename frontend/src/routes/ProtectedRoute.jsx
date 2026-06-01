import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getToken } from "../services/api";

export default function ProtectedRoute() {
  const { authenticated, isAuthenticated } = useAuth();

  const logged = authenticated || isAuthenticated || Boolean(getToken());

  if (!logged) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
