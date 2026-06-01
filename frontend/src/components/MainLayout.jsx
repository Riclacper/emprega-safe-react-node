import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useSessionTimeout } from "../hooks/useSessionTimeout.js";
import { Menu } from "lucide-react";

export default function MainLayout() {
  const { signOut, authenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useSessionTimeout(signOut, authenticated);

  return (
    <div className="app-shell">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={18} />
        Menu
      </button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fechar menu"
        />
      )}

      <main className="main-content">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}
