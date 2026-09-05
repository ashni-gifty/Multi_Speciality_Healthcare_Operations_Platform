import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Receipt,
  UserPlus,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  LogOut,
  Menu,
  X,
  RefreshCw,
  TrendingUp,
  Activity,
  Layers,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Building2,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import receptionistService from "../../services/receptionistService";

// Sub-modules
import PatientRegistration from "./PatientRegistration";
import AppointmentBooking from "./AppointmentBooking";
import AppointmentList from "./AppointmentList";
import BillingDesk from "./BillingDesk";
import TokenQueue from "./TokenQueue";
import ReceptionistBillPrint from "./ReceptionistBillPrint";

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation tab: 'dashboard' | 'appointments' | 'booking' | 'patients' | 'billing' | 'queue'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cross-tab states
  const [preselectedPatient, setPreselectedPatient] = useState(null);
  const [initialBillToPay, setInitialBillToPay] = useState(null);
  const [printingBillData, setPrintingBillData] = useState(null);

  // Alerts
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 4000);
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [patientsRes, appointmentsRes, doctorsRes, billsRes] = await Promise.all([
        receptionistService.getPatients().catch(() => []),
        receptionistService.getAppointments().catch(() => []),
        receptionistService.getDoctors().catch(() => []),
        receptionistService.getBills().catch(() => []),
      ]);

      setPatients(patientsRes);
      setAppointments(appointmentsRes);
      setDoctors(doctorsRes);
      setBills(billsRes);
    } catch (err) {
      console.error("Error loading receptionist data:", err);
      showAlert("danger", "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Cross-tab actions
  const handleBookForPatient = (patient) => {
    setPreselectedPatient(patient);
    setActiveTab("booking");
  };

  const handleCollectPayment = (appointment, bill) => {
    setInitialBillToPay(bill);
    setActiveTab("billing");
  };

  const handlePrintBill = (bill, appointment) => {
    setPrintingBillData({ bill, appointment });
  };

  // Metrics calculation
  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => a.appointment_date === todayStr);

  const todayCheckedIn = todayAppointments.filter(
    (a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING"
  ).length;

  const todayInConsultation = todayAppointments.filter(
    (a) => a.status === "IN_CONSULTATION"
  ).length;

  const todayCompleted = todayAppointments.filter((a) => a.status === "COMPLETED").length;
  const todayCancelled = todayAppointments.filter((a) => a.status === "CANCELLED").length;

  const pendingBillsCount = bills.filter((b) => b.payment_status === "PENDING").length;

  const totalCollectedToday = bills
    .filter((b) => b.payment_status === "PAID")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "appointments", label: "Appointments Desk", icon: CalendarDays, badge: todayAppointments.length },
    { key: "booking", label: "Book Appointment", icon: CalendarPlus },
    { key: "patients", label: "Patient Registry", icon: Users, badge: patients.length },
    { key: "billing", label: "Billing & Payments", icon: Receipt, badge: pendingBillsCount > 0 ? pendingBillsCount : null },
    { key: "queue", label: "Live Token Display", icon: Clock },
  ];

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

      {/* SLEEK PROFESSIONAL SIDEBAR (IDENTICAL TO ADMIN & LAB) */}
      <aside
        className={`sidebar bg-slate-900 text-white d-flex flex-column ${
          sidebarOpen ? "show" : ""
        }`}
      >
        {/* Brand Header */}
        <div className="px-4 py-4 border-bottom border-slate-800 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
              <Stethoscope size={20} />
            </div>
            <div>
              <h6 className="mb-0 fw-bold tracking-wide text-white">Reception Desk</h6>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase" style={{ fontSize: "10px" }}>
                Hospital Front Desk
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
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`nav-btn btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 w-100 ${
                    isActive ? "active text-white" : "text-slate-300"
                  }`}
                  onClick={() => {
                    setActiveTab(item.key);
                    setSidebarOpen(false);
                  }}
                >
                  <div className="d-flex align-items-center gap-3">
                    <Icon size={18} />
                    <span className="fw-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge !== null && (
                    <span
                      className={`badge rounded-pill ${
                        isActive
                          ? "bg-white text-primary"
                          : item.key === "billing" && pendingBillsCount > 0
                          ? "bg-warning text-dark"
                          : "bg-slate-800 text-slate-300"
                      }`}
                      style={{ fontSize: "10px" }}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Profile & Sign Out */}
        <div className="p-3 border-top border-slate-800 bg-slate-950">
          <div className="d-flex align-items-center gap-3 mb-3 px-2">
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : user?.username?.charAt(0).toUpperCase() || "R"}
            </div>
            <div className="overflow-hidden">
              <div className="text-truncate fw-semibold text-white small">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username || "Receptionist"}
              </div>
              <div className="text-slate-400 small" style={{ fontSize: "11px" }}>
                Front Desk Receptionist
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
        {/* Top Header */}
        <header className="bg-white border-bottom px-4 py-3 sticky-top shadow-xs d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light d-md-none p-1 text-muted" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h5 className="mb-0 fw-bold text-slate-900">
                {activeTab === "dashboard" && "Reception Overview Dashboard"}
                {activeTab === "appointments" && "Appointments Desk & Patient Check-In"}
                {activeTab === "booking" && "Schedule New OPD Consultation"}
                {activeTab === "patients" && "Patient Medical Registry"}
                {activeTab === "billing" && "OPD Billing & Fee Collection Desk"}
                {activeTab === "queue" && "OPD Live Token Queue Display"}
              </h5>
              <small className="text-muted d-none d-sm-inline">
                Hospital Frontline Patient Registration & Consultation Management
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={loadAllData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span className="d-none d-sm-inline">Refresh Data</span>
            </button>
            <button
              className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={() => {
                setPreselectedPatient(null);
                setActiveTab("booking");
              }}
            >
              <CalendarPlus size={14} />
              <span className="d-none d-sm-inline">New Appointment</span>
            </button>
          </div>
        </header>

        {/* Alert Feedback Banner */}
        {alertMsg.text && (
          <div className="px-4 pt-3">
            <div
              className={`alert alert-${alertMsg.type} border-0 shadow-xs py-2 px-3 mb-0 d-flex align-items-center gap-2 rounded-3`}
            >
              {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="small">{alertMsg.text}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="p-3 p-md-4 flex-grow-1">
          {/* =================================================
              TAB 1: EXECUTIVE DASHBOARD
          ================================================= */}
          {activeTab === "dashboard" && (
            <div className="d-flex flex-column gap-4">
              {/* Top Operational Financial Overview (4 Metric Cards - Admin Palette) */}
              <div className="row g-3">
                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-primary p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">Today's <br/>Appointments</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">{todayAppointments.length}</h3>
                      </div>
                      <div className="p-3 bg-blue-subtle text-primary rounded-3">
                        <CalendarDays size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-warning p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">Tokens in <br/>Waiting Queue</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">{todayCheckedIn}</h3>
                      </div>
                      <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                        <Clock size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-success p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">Completed <br/>Consultations</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">{todayCompleted}</h3>
                      </div>
                      <div className="p-3 bg-emerald-subtle text-success rounded-3">
                        <CheckCircle2 size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-purple p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-white small fw-semibold text-uppercase">OPD Revenue <br/>Collected</span>
                        <h3 className="fw-bold mt-1 mb-0 text-white">₹{totalCollectedToday.toLocaleString()}</h3>
                      </div>
                      <div className="p-3 bg-purple-subtle text-purple rounded-3">
                        <DollarSign size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Patient Flow Status Breakdown */}
              <div className="card border-0 shadow-xs rounded-3 bg-white p-4">
                <h6 className="fw-bold mb-3 text-slate-900">Today's OPD Patient Flow & Queue Breakdown</h6>
                <div className="row g-3">
                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-blue-subtle border border-primary-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-primary small fw-bold text-uppercase">Scheduled Today</span>
                        <h3 className="fw-bold mt-1 mb-0 text-primary">{todayAppointments.length}</h3>
                        <small className="text-muted">Total booked slots</small>
                      </div>
                      <CalendarDays size={28} className="text-primary opacity-75" />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-amber-subtle border border-warning-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-warning-emphasis small fw-bold text-uppercase">Waiting in Lounge</span>
                        <h3 className="fw-bold mt-1 mb-0 text-warning-emphasis">{todayCheckedIn}</h3>
                        <small className="text-muted">Tokens assigned</small>
                      </div>
                      <Clock size={28} className="text-warning-emphasis opacity-75" />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-emerald-subtle border border-success-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-success small fw-bold text-uppercase">Consulted & Done</span>
                        <h3 className="fw-bold mt-1 mb-0 text-success">{todayCompleted}</h3>
                        <small className="text-muted">Prescriptions issued</small>
                      </div>
                      <CheckCircle2 size={28} className="text-success opacity-75" />
                    </div>
                  </div>

                  <div className="col-sm-6 col-lg-3">
                    <div className="p-3 rounded-3 bg-danger-subtle border border-danger-subtle d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-danger small fw-bold text-uppercase">Pending Bills</span>
                        <h3 className="fw-bold mt-1 mb-0 text-danger">{pendingBillsCount}</h3>
                        <small className="text-muted">Awaiting fee settlement</small>
                      </div>
                      <Receipt size={28} className="text-danger opacity-75" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Operational Tables & Actions */}
              <div className="row g-4">
                {/* Today's Queue Preview */}
                <div className="col-lg-8">
                  <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
                    <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-0 text-slate-900">Today's Appointment Queue</h6>
                        <small className="text-muted">Live patient schedule and status overview</small>
                      </div>
                      <button
                        className="btn btn-outline-primary btn-sm rounded-2 px-3 fw-medium"
                        onClick={() => setActiveTab("appointments")}
                      >
                        Full Appointments Desk →
                      </button>
                    </div>
                    <div className="card-body px-4 pt-1">
                      <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0 small">
                          <thead className="table-light">
                            <tr>
                              <th className="border-0 text-muted small text-uppercase">Token / Time</th>
                              <th className="border-0 text-muted small text-uppercase">Patient Name</th>
                              <th className="border-0 text-muted small text-uppercase">Consulting Doctor</th>
                              <th className="border-0 text-muted small text-uppercase">Status</th>
                              <th className="border-0 text-muted small text-uppercase text-end">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayAppointments.slice(0, 6).map((apt) => (
                              <tr key={apt.id}>
                                <td>
                                  {apt.token_number ? (
                                    <span className="badge bg-primary font-monospace">#{apt.token_number}</span>
                                  ) : (
                                    <span className="text-muted">{apt.appointment_time?.slice(0, 5) || "-"}</span>
                                  )}
                                </td>
                                <td className="fw-semibold text-slate-900">
                                  {apt.patient_name || apt.patient?.full_name || "Patient"}
                                </td>
                                <td className="text-slate-700">
                                  {apt.doctor_name || `Dr. ${apt.doctor?.first_name || ""}`}
                                </td>
                                <td>
                                  <span
                                    className={`badge ${
                                      apt.status === "CHECKED_IN"
                                        ? "bg-emerald-subtle text-success"
                                        : apt.status === "COMPLETED"
                                        ? "bg-slate-100 text-slate-700"
                                        : apt.status === "IN_CONSULTATION"
                                        ? "bg-purple-subtle text-purple"
                                        : "bg-blue-subtle text-primary"
                                    } px-2 py-1`}
                                  >
                                    {apt.status}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <button
                                    className="btn btn-sm btn-outline-primary rounded-2 px-2 py-0"
                                    onClick={() => setActiveTab("appointments")}
                                  >
                                    Open
                                  </button>
                                </td>
                              </tr>
                            ))}
                            {todayAppointments.length === 0 && (
                              <tr>
                                <td colSpan="5" className="text-center py-4 text-muted">
                                  No appointments scheduled for today.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Quick Action Shortcuts & Doctors On Duty */}
                <div className="col-lg-4">
                  <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
                    <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-0 text-slate-900">Doctors on Duty ({doctors.length})</h6>
                        <small className="text-muted">Available for OPD consultations</small>
                      </div>
                      <button
                        className="btn btn-link btn-sm text-primary text-decoration-none p-0"
                        onClick={() => setActiveTab("queue")}
                      >
                        Live Token Board →
                      </button>
                    </div>
                    <div className="card-body px-4 pt-1">
                      <div className="d-flex flex-column gap-2">
                        {doctors.slice(0, 5).map((doc) => (
                          <div
                            key={doc.id}
                            className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-slate-50 border border-slate-100"
                          >
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small">
                                Dr
                              </div>
                              <div>
                                <strong className="d-block text-slate-800 small">
                                  Dr. {doc.first_name} {doc.last_name || ""}
                                </strong>
                                <small className="text-muted" style={{ fontSize: "11px" }}>
                                  {doc.department?.name || doc.specialization || "General OPD"}
                                </small>
                              </div>
                            </div>
                            <span className="badge bg-emerald-subtle text-success rounded-pill px-2 py-1 small">
                              Active
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Quick CTA Buttons */}
                      <div className="mt-3 pt-3 border-top d-grid gap-2">
                        <button
                          className="btn btn-primary btn-sm rounded-2 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          onClick={() => {
                            setPreselectedPatient(null);
                            setActiveTab("booking");
                          }}
                        >
                          <CalendarPlus size={16} /> Book New OPD Appointment
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm rounded-2 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                          onClick={() => setActiveTab("patients")}
                        >
                          <UserPlus size={16} /> Register New Patient
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APPOINTMENTS DESK */}
          {activeTab === "appointments" && (
            <AppointmentList
              appointments={appointments}
              doctors={doctors}
              bills={bills}
              onRefresh={loadAllData}
              onOpenBooking={() => {
                setPreselectedPatient(null);
                setActiveTab("booking");
              }}
              onCollectPayment={handleCollectPayment}
              onPrintBill={handlePrintBill}
              showAlert={showAlert}
            />
          )}

          {/* TAB 3: BOOKING */}
          {activeTab === "booking" && (
            <AppointmentBooking
              patients={patients}
              doctors={doctors}
              preselectedPatient={preselectedPatient}
              onBookingSuccess={() => {
                loadAllData();
                setActiveTab("appointments");
              }}
              showAlert={showAlert}
            />
          )}

          {/* TAB 4: PATIENT REGISTRY */}
          {activeTab === "patients" && (
            <PatientRegistration
              patients={patients}
              onPatientAdded={loadAllData}
              onBookAppointment={handleBookForPatient}
              showAlert={showAlert}
            />
          )}

          {/* TAB 5: BILLING */}
          {activeTab === "billing" && (
            <BillingDesk
              bills={bills}
              appointments={appointments}
              onRefresh={loadAllData}
              onPrintBill={handlePrintBill}
              showAlert={showAlert}
              initialBillToPay={initialBillToPay}
            />
          )}

          {/* TAB 6: TOKEN QUEUE */}
          {activeTab === "queue" && (
            <TokenQueue
              appointments={appointments}
              doctors={doctors}
              onRefresh={loadAllData}
              loading={loading}
            />
          )}
        </main>
      </div>

      {/* PRINT RECEIPT MODAL */}
      {printingBillData && (
        <ReceptionistBillPrint
          bill={printingBillData.bill}
          appointment={printingBillData.appointment}
          onClose={() => setPrintingBillData(null)}
        />
      )}

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

export default ReceptionistDashboard;
