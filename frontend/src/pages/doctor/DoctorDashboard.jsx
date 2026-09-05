import React, { useEffect, useState } from "react";
import {
  Stethoscope,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Pill,
  FlaskConical,
  LogOut,
  Menu,
  X,
  RefreshCw,
  Activity,
  History,
  Calendar,
  Layers,
  ChevronRight,
  DollarSign,
  UserCheck,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import doctorService from "../../services/doctorService";

// Sub-modules
import PatientQueue from "./PatientQueue";
import ConsultationDesk from "./ConsultationDesk";
import DoctorPrescriptions from "./DoctorPrescriptions";
import PatientMedicalHistory from "./PatientMedicalHistory";
import DoctorSchedule from "./DoctorSchedule";
import PrescriptionPrint from "./PrescriptionPrint";

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tab state: 'queue' | 'consultation' | 'prescriptions' | 'history' | 'schedule'
  const [activeTab, setActiveTab] = useState("queue");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [queue, setQueue] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active consultation state
  const [activeConsultationAppointment, setActiveConsultationAppointment] = useState(null);
  const [printingPrescription, setPrintingPrescription] = useState(null);
  const [historyTargetPatient, setHistoryTargetPatient] = useState(null);

  // Alerts
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 4000);
  };

  const todayDefaultStr = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState("ALL");

  const loadAllDoctorData = async (dateParam) => {
    setLoading(true);
    const targetDate = dateParam !== undefined ? dateParam : selectedDate;
    try {
      const dateToFetch = targetDate === "ALL" ? "" : targetDate;

      const [queueRes, rxRes, patientsRes, medsRes, testsRes, availRes] = await Promise.all([
        doctorService.getDoctorQueue(dateToFetch).catch(async () => {
          return await doctorService.getAppointments(dateToFetch ? { appointment_date: dateToFetch } : {}).catch(() => []);
        }),
        doctorService.getPrescriptions().catch(() => []),
        doctorService.getPatients().catch(() => []),
        doctorService.getMedicines().catch(() => []),
        doctorService.getLabTests().catch(() => []),
        doctorService.getDoctorAvailability().catch(() => []),
      ]);

      setQueue(queueRes);
      setPrescriptions(rxRes);
      setPatients(patientsRes);
      setMedicines(medsRes);
      setLabTests(testsRes);
      setAvailability(availRes);
    } catch (err) {
      console.error("Error loading doctor data:", err);
      showAlert("danger", "Failed to load clinic data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllDoctorData(selectedDate);
  }, [selectedDate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStartConsultation = (appointment) => {
    setActiveConsultationAppointment(appointment);
    setActiveTab("consultation");
  };

  const handleConsultationCompleted = (savedPrescription, appointment) => {
    setQueue((prev) =>
      prev.map((a) => (a.id === appointment.id ? { ...a, status: "COMPLETED" } : a))
    );
    setPrescriptions((prev) => [savedPrescription, ...prev]);
    setPrintingPrescription(savedPrescription);
    setActiveConsultationAppointment(null);
    setActiveTab("queue");
  };

  const handleViewPatientHistory = (patientObj) => {
    setHistoryTargetPatient(patientObj);
    setActiveTab("history");
  };

  const doctorName =
    user?.first_name ? `Dr. ${user.first_name} ${user.last_name || ""}`.trim() : user?.username || "Doctor";

  // Backend already guarantees 100% strict doctor isolation
  const scopedQueue = Array.isArray(queue) ? queue : [];
  const scopedPrescriptions = Array.isArray(prescriptions) ? prescriptions : [];

  const waitingCount = scopedQueue.filter(
    (a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING" || a.status === "BOOKED"
  ).length;

  const menuItems = [
    { id: "queue", label: "Patient Queue", icon: Users, badge: waitingCount > 0 ? waitingCount : null },
    { id: "prescriptions", label: "Prescriptions", icon: FileText, badge: scopedPrescriptions.length },
    { id: "history", label: "Patient EMR History", icon: History },
    { id: "schedule", label: "My OPD Schedule", icon: Calendar },
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

      {/* SLEEK PROFESSIONAL SIDEBAR (IDENTICAL TO ADMIN & RECEPTION) */}
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
              <h6 className="mb-0 fw-bold tracking-wide text-white">Physician OPD</h6>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase" style={{ fontSize: "10px" }}>
                Clinical Desk
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
            Clinical Operations
          </div>

          <div className="d-flex flex-column gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-btn btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 w-100 ${
                    isActive ? "active text-white" : "text-slate-300"
                  }`}
                  onClick={() => {
                    setActiveTab(item.id);
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
                          : item.id === "queue" && waitingCount > 0
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

        {/* Doctor Identity & Sign Out */}
        <div className="p-3 border-top border-slate-800 bg-slate-950">
          <div className="d-flex align-items-center gap-3 mb-3 px-2">
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "D"}
            </div>
            <div className="overflow-hidden">
              <div className="text-truncate fw-semibold text-white small">
                {doctorName}
              </div>
              <div className="text-slate-400 small" style={{ fontSize: "11px" }}>
                Consulting Physician
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
                {activeTab === "queue" && "OPD Patient Queue & Token Board"}
                {activeTab === "consultation" && "Active Clinical Consultation Desk"}
                {activeTab === "prescriptions" && "Prescription Archives & Medical Orders"}
                {activeTab === "history" && "Patient Medical History & Longitudinal Records"}
                {activeTab === "schedule" && "Physician OPD Duty Schedule"}
              </h5>
              <small className="text-muted d-none d-sm-inline">
                Specialized Diagnostics, Clinical Observations & Digital Prescriptions
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={loadAllDoctorData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span className="d-none d-sm-inline">Refresh</span>
            </button>

            {activeTab !== "consultation" && (
              <button
                className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs"
                onClick={() => {
                  const firstWaiting = scopedQueue.find(
                    (a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING"
                  );
                  if (firstWaiting) {
                    handleStartConsultation(firstWaiting);
                  } else {
                    showAlert("warning", "No waiting patients in queue. Select a patient or review records.");
                  }
                }}
              >
                <Stethoscope size={14} />
                <span className="d-none d-sm-inline">Call Next Patient</span>
              </button>
            )}
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
          {/* TAB: PATIENT QUEUE */}
          {activeTab === "queue" && (
            <PatientQueue
              queue={scopedQueue}
              selectedDate={selectedDate}
              onDateChange={(newDate) => {
                setSelectedDate(newDate);
                loadAllDoctorData(newDate);
              }}
              onStartConsultation={handleStartConsultation}
              onViewPatientHistory={handleViewPatientHistory}
              onRefresh={() => loadAllDoctorData(selectedDate)}
              loading={loading}
            />
          )}

          {/* TAB: ACTIVE CONSULTATION DESK */}
          {activeTab === "consultation" && activeConsultationAppointment && (
            <ConsultationDesk
              appointment={activeConsultationAppointment}
              doctor={user}
              medicinesList={medicines}
              labTestsList={labTests}
              onConsultationCompleted={handleConsultationCompleted}
              onCancel={() => {
                setActiveConsultationAppointment(null);
                setActiveTab("queue");
              }}
              showAlert={showAlert}
            />
          )}

          {/* TAB: PRESCRIPTIONS */}
          {activeTab === "prescriptions" && (
            <DoctorPrescriptions
              prescriptions={scopedPrescriptions}
              doctor={user}
              onPrintPrescription={(rx) => setPrintingPrescription(rx)}
              onNewPrescription={() => {
                const firstWaiting = scopedQueue.find(
                  (a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING"
                );
                if (firstWaiting) {
                  handleStartConsultation(firstWaiting);
                } else {
                  showAlert("warning", "Please select a patient from the queue to start a consultation.");
                }
              }}
            />
          )}

          {/* TAB: PATIENT HISTORY */}
          {activeTab === "history" && (
            <PatientMedicalHistory
              patient={historyTargetPatient}
              patients={patients}
              onPrintPrescription={(rx) => setPrintingPrescription(rx)}
            />
          )}

          {/* TAB: SCHEDULE */}
          {activeTab === "schedule" && (
            <DoctorSchedule availability={availability} doctor={user} />
          )}
        </main>
      </div>

      {/* PRINT PRESCRIPTION MODAL */}
      {printingPrescription && (
        <PrescriptionPrint
          prescription={printingPrescription}
          doctor={user}
          onClose={() => setPrintingPrescription(null)}
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

export default DoctorDashboard;
