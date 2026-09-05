import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute: Enforces JWT authentication and Role-Based Access Control (RBAC).
 * Unauthenticated users are redirected directly to /login.
 * Authenticated users accessing unauthorized roles are redirected to their own dashboard.
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  const location = useLocation();
  const token = localStorage.getItem("access_token");

  // 1. Check if token or user session is missing
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Role permissions if restricted
  if (allowedRoles.length > 0) {
    const userRole = (user.role || "").toUpperCase().replace("-", "_");
    const isAllowed = allowedRoles.some((r) => {
      const normalizedAllowed = r.toUpperCase().replace("-", "_");
      if (normalizedAllowed === "ADMIN" && (userRole === "ADMIN" || userRole === "ADMINISTRATOR")) return true;
      if (normalizedAllowed === "LAB_TECHNICIAN" && (userRole === "LAB_TECHNICIAN" || userRole === "LAB_TECH" || userRole === "LAB" || userRole === "LABTECHNICIAN")) return true;
      if (normalizedAllowed === "DOCTOR" && userRole === "DOCTOR") return true;
      return userRole === normalizedAllowed;
    });

    if (!isAllowed) {
      if (userRole === "ADMIN" || userRole === "ADMINISTRATOR") {
        return <Navigate to="/admin" replace />;
      }
      if (userRole === "LAB_TECHNICIAN" || userRole === "LAB_TECH" || userRole === "LAB" || userRole === "LABTECHNICIAN") {
        return <Navigate to="/lab-technician" replace />;
      }
      if (userRole === "DOCTOR") {
        return <Navigate to="/doctor" replace />;
      }
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
