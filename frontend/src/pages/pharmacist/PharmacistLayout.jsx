import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  ReceiptText,
  Stethoscope,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function PharmacistLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    ["dashboard", "/pharmacist", "Dashboard", LayoutDashboard],
    ["medicines", "/pharmacist/medicines", "Medicine Stock", Pill],
    ["prescriptions", "/pharmacist/prescriptions", "Prescriptions", ReceiptText],
    ["reports", "/pharmacist/reports", "Sales Reports", BarChart3],
  ];

  const isActive = (path) => {
    if (path === "/pharmacist") {
      return location.pathname === "/pharmacist" || location.pathname === "/pharmacist/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return <div className="d-flex min-vh-100 bg-slate-50 text-dark">
    {sidebarOpen && <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-md-none" style={{ zIndex: 1040 }} onClick={() => setSidebarOpen(false)} />}
    <aside className={`sidebar bg-slate-900 text-white d-flex flex-column ${sidebarOpen ? "show" : ""}`}>
      <div className="px-4 py-4 border-bottom border-slate-800 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm"><Stethoscope size={20} /></div>
          <div><h6 className="mb-0 fw-bold tracking-wide text-white">Healthcare Pharmacy</h6><span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase" style={{ fontSize: "10px" }}>Hospital Control Center</span></div>
        </div>
        <button className="btn btn-sm text-slate-400 d-md-none p-1" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
      </div>
      <div className="px-3 py-3 flex-grow-1 overflow-auto">
        <div className="text-slate-400 px-3 pb-2 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>Pharmacy Operations</div>
        <div className="d-flex flex-column gap-1">
          {navItems.map(([key, path, label, Icon]) => <button key={key} type="button" className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${isActive(path) ? "active text-white" : "text-slate-300"}`} onClick={() => { navigate(path); setSidebarOpen(false); }}><Icon size={18} /><span className="fw-medium">{label}</span></button>)}
        </div>
      </div>
      <div className="p-3 border-top border-slate-800 bg-slate-950">
        <div className="d-flex align-items-center gap-3 mb-3 px-2"><div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">{user?.first_name ? user.first_name.charAt(0).toUpperCase() : "P"}</div><div className="overflow-hidden"><div className="text-truncate fw-semibold text-white small">{user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Pharmacy User"}</div><div className="text-slate-400 small" style={{ fontSize: "11px" }}>Pharmacist</div></div></div>
        <button className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 rounded-2" onClick={() => { logout(); navigate("/login"); }}><LogOut size={15} /><span>Sign Out</span></button>
      </div>
    </aside>
    <div className="main-content flex-grow-1 d-flex flex-column">
      <header className="bg-white border-bottom px-4 py-3 sticky-top shadow-xs d-flex align-items-center"><button className="btn btn-light d-md-none p-1 text-muted" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button></header>
      <Outlet />
    </div>
    <style>{` .bg-slate-50 { background-color: #f8fafc; } .bg-slate-800 { background-color: #1e293b; } .bg-slate-900 { background-color: #0f172a; } .bg-slate-950 { background-color: #020617; } .text-slate-300 { color: #cbd5e1; } .text-slate-400 { color: #94a3b8; } .text-slate-900 { color: #0f172a; } .border-slate-800 { border-color: #1e293b !important; } .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04); } .sidebar { width: 250px; min-width: 250px; height: 100vh; position: sticky; top: 0; z-index: 1050; transition: all 0.2s ease-in-out; } .nav-btn { transition: all 0.15s ease; } .nav-btn:hover { background-color: rgba(255, 255, 255, 0.07); } .nav-btn.active { background-color: #2563eb; } .avatar { width: 36px; height: 36px; font-size: 14px; } .brand-icon { width: 34px; height: 34px; } @media (max-width: 767.98px) { .sidebar { position: fixed; left: -260px; top: 0; } .sidebar.show { left: 0; } } `}</style>
  </div>;
}

export default PharmacistLayout;
