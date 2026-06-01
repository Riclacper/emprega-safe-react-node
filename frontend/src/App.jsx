import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./components/MainLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AnalyzeJob from "./pages/AnalyzeJob.jsx";
import History from "./pages/History.jsx";
import Reports from "./pages/Reports.jsx";
import About from "./pages/About.jsx";
import Register from "./pages/Register.jsx";
import Verify from "./pages/Verify.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="analisar" element={<AnalyzeJob />} />
          <Route path="historico" element={<History />} />
          <Route path="denuncias" element={<Reports />} />
          <Route path="sobre" element={<About />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
