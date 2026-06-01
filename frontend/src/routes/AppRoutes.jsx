import { Navigate, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute.jsx";
import Login from "../pages/Login.jsx";
import Verify from "../pages/Verify.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import AnalyzeJob from "../pages/AnalyzeJob.jsx";
import History from "../pages/History.jsx";
import Reports from "../pages/Reports.jsx";
import About from "../pages/About.jsx";
import MainLayout from "../components/MainLayout.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/verify" element={<Verify />} />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analisar" element={<AnalyzeJob />} />
          <Route path="/historico" element={<History />} />
          <Route path="/denuncias" element={<Reports />} />
          <Route path="/sobre" element={<About />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
