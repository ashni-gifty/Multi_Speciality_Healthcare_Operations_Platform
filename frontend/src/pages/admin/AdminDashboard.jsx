import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Pill,
  Building2,
  FileText,
  Clock,
  BarChart3,
  LogOut,
  Search,
  Plus,
  RefreshCw,
  Stethoscope,
  Activity,
  Menu,
  X,
  Package,
  AlertTriangle,
  Layers,
  DollarSign,
  FlaskConical,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";

// Modular Admin Sub-Pages
import StaffList from "./StaffList";
import DepartmentList from "./DepartmentList";
import MedicineMaster from "./MedicineMaster";
import PatientHistory from "./PatientHistory";

import AdminReports from "./AdminReports";

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation tabs: 'dashboard' | 'staff' | 'departments' | 'inventory' | 'patients' | 'attendance' | 'reports'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Executive Dashboard Data
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await reportService.generateComprehensiveReport();
      setReportData(data);
    } catch (err) {
      console.error("Error loading admin dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const stats = reportData?.statistics || {
    total_patients: 0,
    incoming_patients: 0,
    completed_patients: 0,
    cancelled_patients: 0,
    pending_appointments: 0,
    consultation_revenue: 0,
    pharmacy_billing: 0,
    pharmacy_stock_value: 0,
    laboratory_billing: 0,
    total_revenue: 0,
  };

  const staff = reportData?.staff || {
    total: 0,
    doctors: 0,
    receptionists: 0,
    pharmacists: 0,
    lab_technicians: 0,
  };

  return (
    <div className="d-flex min-vh-100 bg-slate-50 text-dark">
      {/* MOBILE OVERLAY */}
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
        {/* Brand */}
        <div className="px-4 py-4 border-bottom border-slate-800 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
              <Stethoscope size={20} />
            </div>
            <div>
              <h6 className="mb-0 fw-bold tracking-wide text-white">Hospital Admin</h6>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase" style={{ fontSize: "10px" }}>
                Hospital Control Center
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
            Operations Menu
          </div>

          <div className="d-flex flex-column gap-1">
            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "dashboard" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("dashboard");
                setSidebarOpen(false);
              }}
            >
              <LayoutDashboard size={18} />
              <span className="fw-medium">Dashboard</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "staff" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("staff");
                setSidebarOpen(false);
              }}
            >
              <UserCog size={18} />
              <span className="fw-medium">Staff Management</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "departments" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("departments");
                setSidebarOpen(false);
              }}
            >
              <Building2 size={18} />
              <span className="fw-medium">Departments</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "inventory" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("inventory");
                setSidebarOpen(false);
              }}
            >
              <Pill size={18} />
              <span className="fw-medium">Medicine Master</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "patients" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("patients");
                setSidebarOpen(false);
              }}
            >
              <FileText size={18} />
              <span className="fw-medium">Patient History</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "attendance" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("attendance");
                setSidebarOpen(false);
              }}
            >
            </button>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-top border-slate-800 bg-slate-950">
          <div className="d-flex align-items-center gap-3 mb-3 px-2">
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden">
              <div className="text-truncate fw-semibold text-white small">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Hospital Administrator"}
              </div>
              <div className="text-slate-400 small" style={{ fontSize: "11px" }}>
                Super Administrator
              </div>
            </div>
          </div>
          <button
            className="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2 rounded-2"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="main-content flex-grow-1 d-flex flex-column">
        {/* Top Header */}
        <header className="bg-white border-bottom px-4 py-3 sticky-top shadow-xs d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light d-md-none p-1 text-muted" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h5 className="mb-0 fw-bold text-slate-900">
                {activeTab === "dashboard" && "Hospital Dashboard"}
                {activeTab === "staff" && "Hospital Staff Administration"}
                {activeTab === "departments" && "Medical Departments & Divisions"}
                {activeTab === "inventory" && "Medicine Master & Pharmacy Inventory"}
                {activeTab === "patients" && "Patient Medical Records & History"}
                {activeTab === "attendance" && "Staff Attendance & Check-In Logs"}
                {activeTab === "reports" && "Executive Financial & Operational Reports"}
              </h5>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={loadDashboardData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span className="d-none d-sm-inline">Refresh Data</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-3 p-md-4 flex-grow-1">
          {/* =================================================
              TAB 1: EXECUTIVE DASHBOARD
          ================================================= */}
          {activeTab === "dashboard" && (
            <div className="d-flex flex-column gap-4">
              {/* Top Operational Financial Overview (4 Metric Cards) */}
              <div className="row g-3">
                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-primary p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">Doctor <br/>Consultation</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">₹{stats.consultation_revenue?.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-blue-subtle text-primary rounded-3">
                        <Stethoscope size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-success p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">Pharmacy <br/>Billing</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">₹{stats.pharmacy_billing?.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-emerald-subtle text-success rounded-3">
                        <Pill size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-warning p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">Laboratory <br/>Billing</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">₹{stats.laboratory_billing?.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                        <FlaskConical size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-purple p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">Total Hospital <br/>Revenue</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">₹{stats.total_revenue?.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-purple-subtle text-purple rounded-3">
                        <DollarSign size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Flow Status Breakdown (4 Cards: Incoming, Completed, Cancelled, Pending) */}
              <div className="card border-0 shadow-xs rounded-3 bg-white p-4">
                <h6 className="fw-bold mb-3 text-slate-900">Patient Volume & Appointment Status</h6>
                <div className="row g-3">
                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-blue-subtle border border-primary-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-primary small fw-bold text-uppercase">Incoming Patients</span>
                        <h3 className="fw-bold mt-1 mb-0 text-primary">{stats.incoming_patients}</h3>
                        <small className="text-muted">In queue & triage</small>
                      </div>
                      <Users size={28} className="text-primary opacity-75" />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-emerald-subtle border border-success-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-success small fw-bold text-uppercase">Completed Patients</span>
                        <h3 className="fw-bold mt-1 mb-0 text-success">{stats.completed_patients}</h3>
                        <small className="text-muted">Consultations finished</small>
                      </div>
                      <CheckCircle2 size={28} className="text-success opacity-75" />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-amber-subtle border border-warning-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-warning-emphasis small fw-bold text-uppercase">Pending Appointments</span>
                        <h3 className="fw-bold mt-1 mb-0 text-warning-emphasis">{stats.pending_appointments}</h3>
                        <small className="text-muted">Awaiting doctor/labs</small>
                      </div>
                      <Clock size={28} className="text-warning-emphasis opacity-75" />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-danger-subtle border border-danger-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-danger small fw-bold text-uppercase">Cancelled Appointments</span>
                        <h3 className="fw-bold mt-1 mb-0 text-danger">{stats.cancelled_patients}</h3>
                        <small className="text-muted">No-shows or revoked</small>
                      </div>
                      <X size={28} className="text-danger opacity-75" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Staff Roles & Quick Administrative Shortcuts */}
              <div className="row g-4">
                {/* Healthcare Staff Roster */}
                <div className="col-lg-6">
                  <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
                    <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-0 text-slate-900">Healthcare Staff by Role</h6>
                        <small className="text-muted">Doctors, Receptionists, Pharmacists, Lab Technicians</small>
                      </div>
                      <button className="btn btn-outline-primary btn-sm rounded-2 px-3 fw-medium" onClick={() => setActiveTab("staff")}>
                        Manage Staff
                      </button>
                    </div>
                    <div className="card-body px-4 pt-1">
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">🩺</span>
                            <div>
                              <strong className="d-block text-slate-800">Doctors & Specialists</strong>
                              <small className="text-muted">Physicians with custom consultation fees</small>
                            </div>
                          </div>
                          <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                            {staff.doctors} Active
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">📋</span>
                            <div>
                              <strong className="d-block text-slate-800">Receptionists</strong>
                              <small className="text-muted">Front desk, patient registration, appointments</small>
                            </div>
                          </div>
                          <span className="badge bg-success rounded-pill px-3 py-2 fs-6">
                            {staff.receptionists} Active
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">💊</span>
                            <div>
                              <strong className="d-block text-slate-800">Pharmacists</strong>
                              <small className="text-muted">Dispensary managers & medication billing</small>
                            </div>
                          </div>
                          <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fs-6">
                            {staff.pharmacists} Active
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">🔬</span>
                            <div>
                              <strong className="d-block text-slate-800">Lab Technicians</strong>
                              <small className="text-muted">Diagnostic lab pathologists & specimen testing</small>
                            </div>
                          </div>
                          <span className="badge bg-info text-dark rounded-pill px-3 py-2 fs-6">
                            {staff.lab_technicians} Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Module Fast-Action Hub */}
                <div className="col-lg-6">
                  <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
                    <div className="card-header bg-white border-0 py-3 px-4">
                      <h6 className="fw-bold mb-0 text-slate-900">Hospital Administration Hub</h6>
                      <small className="text-muted">Direct fast-access shortcuts to operational modules</small>
                    </div>
                    <div className="card-body px-4 pt-1">
                      <div className="row g-3">
                        <div className="col-6">
                          <div
                            className="p-3 bg-slate-50 rounded-3 border hover-shadow cursor-pointer transition"
                            onClick={() => setActiveTab("inventory")}
                            role="button"
                          >
                            <div className="p-2 bg-success text-white rounded-2 d-inline-block mb-2">
                              <Pill size={18} />
                            </div>
                            <h6 className="fw-bold mb-1 text-slate-900">Medicine Master</h6>
                            <small className="text-muted">Catalog, prices, supplier, batches</small>
                          </div>
                        </div>

                        <div className="col-6">
                          <div
                            className="p-3 bg-slate-50 rounded-3 border hover-shadow cursor-pointer transition"
                            onClick={() => setActiveTab("patients")}
                            role="button"
                          >
                            <div className="p-2 bg-primary text-white rounded-2 d-inline-block mb-2">
                              <FileText size={18} />
                            </div>
                            <h6 className="fw-bold mb-1 text-slate-900">Patient History</h6>
                            <small className="text-muted">EMR, past visits, lab reports</small>
                          </div>
                        </div>

                        <div className="col-6">
                          <div
                            className="p-3 bg-slate-50 rounded-3 border hover-shadow cursor-pointer transition"
                            onClick={() => setActiveTab("attendance")}
                            role="button"
                          >
                            <div className="p-2 bg-warning text-dark rounded-2 d-inline-block mb-2">
                              <Clock size={18} />
                            </div>
                            <h6 className="fw-bold mb-1 text-slate-900">Staff Attendance</h6>
                            <small className="text-muted">Biometric check-ins & duty logs</small>
                          </div>
                        </div>

                        <div className="col-6">
                          <div
                            className="p-3 bg-slate-50 rounded-3 border hover-shadow cursor-pointer transition"
                            onClick={() => setActiveTab("reports")}
                            role="button"
                          >
                            <div className="p-2 bg-purple text-white rounded-2 d-inline-block mb-2" style={{ backgroundColor: "#9333ea" }}>
                              <BarChart3 size={18} />
                            </div>
                            <h6 className="fw-bold mb-1 text-slate-900">Admin Reports</h6>
                            <small className="text-muted">Revenues, billing, printable EMR</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              TAB 2: STAFF MANAGEMENT
          ================================================= */}
          {activeTab === "staff" && <StaffList />}

          {/* =================================================
              TAB 3: DEPARTMENTS
          ================================================= */}
          {activeTab === "departments" && <DepartmentList />}

          {/* =================================================
              TAB 4: MEDICINE MASTER
          ================================================= */}
          {activeTab === "inventory" && <MedicineMaster />}

          {/* =================================================
              TAB 5: PATIENT HISTORY & EMR
          ================================================= */}
          {activeTab === "patients" && <PatientHistory />}

          {/* =================================================
              TAB 6: ATTENDANCE
          ================================================= */}
          {activeTab === "attendance" && <Attendance />}

          {/* =================================================
              TAB 7: REPORTS & ANALYTICS
          ================================================= */}
          {activeTab === "reports" && <AdminReports />}
        </main>
      </div>

      {/* CUSTOM CSS FOR CLEAN MODERN LOOK */}
      <style>
        {`
          .bg-slate-50 { background-color: #f8fafc; }
          .bg-slate-100 { background-color: #f1f5f9; }
          .bg-slate-800 { background-color: #1e293b; }
          .bg-slate-900 { background-color: #0f172a; }
          .bg-slate-950 { background-color: #020617; }
          .text-slate-300 { color: #cbd5e1; }
          .text-slate-400 { color: #94a3b8; }
          .text-slate-600 { color: #475569; }
          .text-slate-700 { color: #334155; }
          .text-slate-800 { color: #1e293b; }
          .text-slate-900 { color: #0f172a; }
          .border-slate-100 { border-color: #f1f5f9 !important; }
          .border-slate-800 { border-color: #1e293b !important; }

          .bg-blue-subtle { background-color: #eff6ff; }
          .bg-emerald-subtle { background-color: #ecfdf5; }
          .bg-amber-subtle { background-color: #fffbeb; }
          .bg-purple-subtle { background-color: #faf5ff; }
          .border-purple { border-color: #9333ea !important; }
          .text-purple { color: #9333ea !important; }
          .bg-purple {background-color: #6f42c1 !important;}
          .bg-darkyellow {background-color: #ddaf18 !important;}

          .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04); }

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

export default AdminDashboard;
