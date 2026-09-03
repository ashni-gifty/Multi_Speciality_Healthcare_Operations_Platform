import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Doctor from "./pages/Doctor";
import LabDashboard from "./pages/lab/LabDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const RootRedirect = () => {
  const { user } = useAuth();
  const token = localStorage.getItem("access_token");

  if (!user || !token) return <Navigate to="/login" replace />;

  const role = (user.role || "").toUpperCase().replace("-", "_");
  if (role === "ADMIN" || role === "ADMINISTRATOR") return <Navigate to="/admin" replace />;
  if (["LAB_TECHNICIAN", "LAB_TECH", "LAB", "LABTECHNICIAN"].includes(role)) return <Navigate to="/lab-technician" replace />;
  if (role === "DOCTOR") return <Navigate to="/doctor" replace />;
  return <Navigate to="/admin" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/doctor" element={<ProtectedRoute allowedRoles={["DOCTOR"]}><Doctor /></ProtectedRoute>} />
        <Route path="/lab-technician" element={<ProtectedRoute allowedRoles={["LAB_TECHNICIAN", "LAB"]}><LabDashboard /></ProtectedRoute>} />
        <Route path="/lab" element={<ProtectedRoute allowedRoles={["LAB_TECHNICIAN", "LAB"]}><LabDashboard /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
