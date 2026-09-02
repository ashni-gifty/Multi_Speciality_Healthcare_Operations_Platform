import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Activity,
  Lock,
  User,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from?.pathname;

  // Redirect user according to their role
  const getDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
      case "administrator":
      case "admin":
        return "/admin";

      case "doctor":
        return "/doctor";

      case "receptionist":
        return "/receptionist";

      case "pharmacist":
        return "/pharmacist";

      case "lab_technician":
      case "lab-technician":
        return "/lab-technician";

      default:
        return "/admin";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!usernameOrEmail.trim()) {
      setError("Please enter your username or email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await login(
        usernameOrEmail.trim(),
        password
      );

      /*
       * Expected response from AuthContext:
       *
       * {
       *   access: "...",
       *   refresh: "...",
       *   user: {
       *     id: 1,
       *     username: "admin",
       *     role: "administrator"
       *   }
       * }
       */

      const role = response?.user?.role;

      if (!role) {
        throw new Error(
          "User role could not be determined."
        );
      }

      const dashboardPath = getDashboardPath(role);

      navigate(redirectPath || dashboardPath, {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 bg-light d-flex align-items-center justify-content-center p-3">

      <div
        className="card border-0 shadow-sm"
        style={{
          maxWidth: "420px",
          width: "100%",
        }}
      >
        <div className="card-body p-4 p-md-5">

          {/* Logo / Header */}
          <div className="text-center mb-4">

            <div
              className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3"
              style={{
                width: "64px",
                height: "64px",
              }}
            >
              <Activity size={32} />
            </div>

            <h3 className="fw-bold mb-1">
              Clinic Management
            </h3>

            <p className="text-muted mb-0">
              Sign in to your account
            </p>

          </div>

          {/* Error */}
          {error && (
            <div
              className="alert alert-danger d-flex align-items-center gap-2 py-2"
              role="alert"
            >
              <AlertCircle
                size={18}
                className="flex-shrink-0"
              />

              <span className="small">
                {error}
              </span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div className="mb-3">

              <label
                htmlFor="usernameOrEmail"
                className="form-label fw-semibold"
              >
                Username or Email
              </label>

              <div className="input-group">

                <span className="input-group-text bg-light">
                  <User size={18} />
                </span>

                <input
                  id="usernameOrEmail"
                  type="text"
                  className="form-control"
                  placeholder="Enter username or email"
                  value={usernameOrEmail}
                  onChange={(e) =>
                    setUsernameOrEmail(e.target.value)
                  }
                  autoComplete="username"
                  autoFocus
                  disabled={loading}
                  required
                />

              </div>
            </div>

            {/* Password */}
            <div className="mb-4">

              <label
                htmlFor="password"
                className="form-label fw-semibold"
              >
                Password
              </label>

              <div className="input-group">

                <span className="input-group-text bg-light">
                  <Lock size={18} />
                </span>

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  className="form-control"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-100 py-2 fw-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />

                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
};

export default Login;