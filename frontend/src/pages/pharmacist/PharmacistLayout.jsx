import React, { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Receipt,
  BarChart3,
  LogOut,
  Menu,
  X,
  Stethoscope,
  Building2,
  Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PharmacistLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { key: "dashboard", path: "/pharmacist", label: "Dashboard Overview", icon: LayoutDashboard },
    { key: "medicines", path: "/pharmacist/medicines", label: "Medicine Stock & Batches", icon: Pill },
    { key: "prescriptions", path: "/pharmacist/prescriptions", label: "Prescriptions & Dispense", icon: Receipt },
    { key: "reports", path: "/pharmacist/reports", label: "Sales & Revenue Reports", icon: BarChart3 },
  ];

  const isItemActive = (path) => {
    if (path === "/pharmacist") {
      return location.pathname === "/pharmacist" || location.pathname === "/pharmacist/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="d-flex min-vh-100 bg-slate-50 text-dark">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SLEEK PROFESSIONAL SIDEBAR */}
      <aside
        className={`sidebar bg-slate-900 text-white d-flex flex-column ${
          sidebarOpen ? "show" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 py-4 border-bottom border-slate-800 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
              <Pill size={20} />
            </div>
            <div>
              <h6 className="mb-0 fw-bold tracking-wide text-white">Pharmacy Store</h6>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase" style={{ fontSize: "10px" }}>
                Dispensary Portal
              </span>
            </div>
          </div>
          <button className="btn btn-sm text-slate-400 d-md-none p-1" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-3 flex-grow-1 overflow-auto">
          <div className="text-slate-400 px-3 pb-2 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            Dispensary Operations
          </div>

          <div className="d-flex flex-column gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                    active ? "active text-white" : "text-slate-300"
                  }`}
                >
                  <Icon size={18} />
                  <span className="fw-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pharmacist Profile & Sign Out */}
        <div className="p-3 border-top border-slate-800 bg-slate-950">
          <div className="d-flex align-items-center gap-3 mb-3 px-2">
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "P"}
            </div>
            <div className="overflow-hidden">
              <div className="text-truncate fw-semibold text-white small">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Pharmacist"}
              </div>
              <div className="text-slate-400 small" style={{ fontSize: "11px" }}>
                Pharmacy Manager
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 rounded-2"
            onClick={handleLogout}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-content flex-grow-1 d-flex flex-column">
        {/* Top Navbar */}
        <header className="bg-white border-bottom px-4 py-3 sticky-top shadow-xs d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light d-md-none p-1 text-muted" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h5 className="mb-0 fw-bold text-slate-900">Hospital Pharmacy Operations</h5>
              <small className="text-muted d-none d-sm-inline">
                Inventory Stocking, FIFO Batch Dispensation & POS Tax Invoicing
              </small>
            </div>
          </div>
        </header>

        {/* Child Routes Body */}
        <main className="p-3 p-md-4 flex-grow-1">
          <Outlet />
        </main>
      </div>

      {/* EMBEDDED IDENTICAL ADMIN CSS STYLING */}
      <style>
        {`
          .bg-slate-50 { background-color: #f8fafc; }
          .bg-slate-100 { background-color: #f1f5f9; }
          .bg-slate-800 { background-color: #1e293b; }
          .bg-slate-900 { background-color: #0f172a; }
          .bg-slate-950 { background-color: #020617; }
          .text-slate-300 { color: #cbd5e1; }
          .text-slate-400 { color: #94a3b8; }
          .text-slate-500 { color: #64748b; }
          .text-slate-600 { color: #475569; }
          .text-slate-700 { color: #334155; }
          .text-slate-800 { color: #1e293b; }
          .text-slate-900 { color: #0f172a; }
          .border-slate-100 { border-color: #f1f5f9 !important; }
          .border-slate-800 { border-color: #1e293b !important; }
          .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04); }

          .bg-blue-subtle { background-color: #eff6ff !important; }
          .bg-emerald-subtle { background-color: #ecfdf5 !important; }
          .bg-amber-subtle { background-color: #fffbeb !important; }
          .bg-danger-subtle { background-color: #fef2f2 !important; }
          .bg-purple-subtle { background-color: #faf5ff !important; }

          .bg-purple { background-color: #7c3aed !important; }
          .text-purple { color: #7c3aed !important; }

          .sidebar {
            width: 250px;
            min-width: 250px;
            height: 100vh;
            position: sticky;
            top: 0;
            z-index: 1050;
            transition: all 0.2s ease-in-out;
          }

          .nav-btn {
            transition: all 0.15s ease;
          }
          .nav-btn:hover {
            background-color: rgba(255, 255, 255, 0.07);
          }
          .nav-btn.active {
            background-color: #2563eb;
          }

          .avatar {
            width: 36px;
            height: 36px;
            font-size: 14px;
          }

          .brand-icon {
            width: 34px;
            height: 34px;
          }

          .hover-shadow {
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .hover-shadow:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
          }

          .cursor-pointer {
            cursor: pointer;
          }

          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media (max-width: 767.98px) {
            .sidebar {
              position: fixed;
              left: -260px;
              top: 0;
            }
            .sidebar.show {
              left: 0;
            }
          }
        `}
      </style>
    </div>
  );
};

export default PharmacistLayout;
