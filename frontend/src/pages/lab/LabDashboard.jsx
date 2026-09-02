import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FileEdit,
  Printer,
  Plus,
  RefreshCw,
  Search,
  Activity,
  Calendar,
  User,
  Stethoscope,
  Building,
  ArrowRight,
  LogOut,
  Menu,
  X,
  Layers,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import labService, { STAGE_CONFIG } from "../../services/labService";

// Sub-modules
import SampleCollection from "./SampleCollection";
import ResultEntry from "./ResultEntry";
import LabReport from "./LabReport";
import LabTestList from "./LabTestList";
import LabReportPrint from "./LabReportPrint";

const LabDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation tab: 'dashboard' | 'samples' | 'results' | 'reports' | 'tests'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reports, setReports] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Requisition Modal
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState({
    patient_id: "",
    test_name: "",
    sample_type: "Blood",
    ordered_by_doctor: "Dr. Robert Smith",
    priority: "ROUTINE",
    notes: "",
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [printingReport, setPrintingReport] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, testsData, patientsData] = await Promise.all([
        labService.getReports(),
        labService.getLabTests().catch(() => []),
        labService.getPatients().catch(() => []),
      ]);
      setReports(reportsData);
      setLabTests(testsData);
      setPatients(patientsData);
      if (patientsData.length > 0 && !orderForm.patient_id) {
        setOrderForm((prev) => ({ ...prev, patient_id: patientsData[0].patient_id }));
      }
      if (testsData.length > 0 && !orderForm.test_name) {
        setOrderForm((prev) => ({ ...prev, test_name: testsData[0].test_name, sample_type: testsData[0].sample_type }));
      }
    } catch (err) {
      console.error("Error loading lab data:", err);
      showAlert("danger", "Failed to connect to Laboratory Medicine service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setSubmittingOrder(true);
    try {
      const created = await labService.createReport({
        patient_id: orderForm.patient_id,
        test_name: orderForm.test_name,
        sample_type: orderForm.sample_type,
        ordered_by_doctor: orderForm.ordered_by_doctor,
        technician_name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Mark Vance, MLT",
        status: "PENDING_SAMPLE",
        reference_range: "Normal",
        finding_notes: orderForm.notes || "Test requisition initiated.",
      });
      setReports((prev) => [created, ...prev]);
      showAlert("success", `Diagnostic requisition for ${orderForm.test_name} created successfully!`);
      setShowNewOrderModal(false);
    } catch (err) {
      showAlert("danger", `Failed to create lab requisition: ${err.message}`);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const pendingSamplesCount = reports.filter((r) => r.status === "PENDING_SAMPLE" || r.status === "REQUEST_RECEIVED").length;
  const inProcessingCount = reports.filter((r) => r.status === "PROCESSING").length;
  const completedReportsCount = reports.filter((r) => r.status === "COMPLETED").length;

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
              <FlaskConical size={20} />
            </div>
            <div>
              <h6 className="mb-0 fw-bold tracking-wide text-white">Laboratory</h6>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase" style={{ fontSize: "10px" }}>
                Laboratory Portal
              </span>
            </div>
          </div>
          <button className="btn btn-sm text-slate-400 d-md-none p-1" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Menu Navigation */}
        <div className="px-3 py-3 flex-grow-1 overflow-auto">
          <div className="text-slate-400 px-3 pb-2 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            Lab Operations
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
              <Activity size={18} />
              <span className="fw-medium">Overview & Status</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 w-100 ${
                activeTab === "samples" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("samples");
                setSidebarOpen(false);
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <FlaskConical size={18} />
                <span className="fw-medium">Sample Collection</span>
              </div>
              {pendingSamplesCount > 0 && (
                <span className="badge bg-warning text-dark rounded-pill px-2">{pendingSamplesCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 w-100 ${
                activeTab === "results" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("results");
                setSidebarOpen(false);
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <FileEdit size={18} />
                <span className="fw-medium">Result Entry</span>
              </div>
              {inProcessingCount > 0 && (
                <span className="badge bg-primary rounded-pill px-2">{inProcessingCount}</span>
              )}
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "reports" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("reports");
                setSidebarOpen(false);
              }}
            >
              <FileCheck2 size={18} />
              <span className="fw-medium">Diagnostic Reports</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "tests" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("tests");
                setSidebarOpen(false);
              }}
            >
              <Layers size={18} />
              <span className="fw-medium">Test Catalog Master</span>
            </button>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-top border-slate-800 bg-slate-950">
          <div className="d-flex align-items-center gap-3 mb-3 px-2">
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "M"}
            </div>
            <div className="overflow-hidden">
              <div className="text-truncate fw-semibold text-white small">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Mark Vance, MLT"}
              </div>
              <div className="text-slate-400 small" style={{ fontSize: "11px" }}>
                Senior Lab Technologist
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
                {activeTab === "dashboard" && "Laboratory Dashboard"}
                {activeTab === "samples" && "Sample Collection"}
                {activeTab === "results" && "Result Entry"}
                {activeTab === "reports" && "Lab Reports"}
                {activeTab === "tests" && "Lab Tests"}
              </h5>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span className="d-none d-sm-inline">Refresh</span>
            </button>
            <button
              className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3"
              onClick={() => setShowNewOrderModal(true)}
            >
              <Plus size={16} />
              <span>New Test Request</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-3 p-md-4 flex-grow-1">
          {alertMsg.text && (
            <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-3 d-flex align-items-center gap-2 rounded-3`}>
              {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="small">{alertMsg.text}</span>
            </div>
          )}

          {/* =================================================
              TAB 1: WORKFLOW & OVERVIEW
          ================================================= */}
          {activeTab === "dashboard" && (
            <div className="d-flex flex-column gap-4">
              {/* 4 Diagnostic Metrics */}
              <div className="row g-3">
                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-primary">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Total Requisitions</span>
                        <h3 className="fw-bold mt-1 mb-0 text-slate-900">{reports.length}</h3>
                        <small className="text-muted">Doctor diagnostic orders</small>
                      </div>
                      <div className="p-3 bg-blue-subtle text-primary rounded-3">
                        <FlaskConical size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-warning">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Pending Phlebotomy</span>
                        <h3 className="fw-bold mt-1 mb-0 text-warning-emphasis">{pendingSamplesCount}</h3>
                        <small className="text-muted">Specimens to draw</small>
                      </div>
                      <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                        <Clock size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-info">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">In Processing</span>
                        <h3 className="fw-bold mt-1 mb-0 text-info-emphasis">{inProcessingCount}</h3>
                        <small className="text-muted">Analyzers active</small>
                      </div>
                      <div className="p-3 bg-info-subtle text-info-emphasis rounded-3">
                        <Activity size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-sm-6 col-lg-3">
                  <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-success">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Completed & Verified</span>
                        <h3 className="fw-bold mt-1 mb-0 text-success">{completedReportsCount}</h3>
                        <small className="text-muted">Transmitted to Doctors</small>
                      </div>
                      <div className="p-3 bg-emerald-subtle text-success rounded-3">
                        <CheckCircle2 size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Test Orders Table */}
              <div className="card border-0 shadow-xs rounded-3 bg-white">
                <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="fw-bold mb-0 text-slate-900">Recent Diagnostic Test Orders</h6>
                    <small className="text-muted">Live patient requisitions</small>
                  </div>
                  <button className="btn btn-outline-primary btn-sm rounded-2 px-3 fw-medium" onClick={() => setActiveTab("results")}>
                    Enter Results
                  </button>
                </div>
                <div className="card-body px-4 pt-0">
                  <div className="table-responsive rounded-2 border">
                    <table className="table table-hover align-middle mb-0 small">
                      <thead className="table-light text-slate-600">
                        <tr>
                          <th className="px-3">Order ID</th>
                          <th>Patient Name</th>
                          <th>Investigation</th>
                          <th>Doctor</th>
                          <th>Specimen</th>
                          <th>Result</th>
                          <th>Workflow Status</th>
                          <th className="text-end px-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.slice(0, 8).map((r) => (
                          <tr key={r.id}>
                            <td className="px-3 font-monospace fw-semibold text-slate-700">{r.report_id || `LAB-${r.id}`}</td>
                            <td>
                              <div className="fw-semibold text-slate-900">{r.patient_name || "Patient"}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>{r.patient_details || ""}</div>
                            </td>
                            <td>
                              <strong className="text-slate-900">{r.test_name}</strong>
                            </td>
                            <td>{r.ordered_by_doctor}</td>
                            <td>
                              <span className="badge bg-slate-100 text-slate-800 border">{r.sample_type || "Blood"}</span>
                            </td>
                            <td>
                              {r.result_value ? (
                                <strong className="text-slate-900">{r.result_value}</strong>
                              ) : (
                                <span className="text-muted fst-italic">Pending</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill px-2 py-1 ${
                                  r.status === "COMPLETED"
                                    ? "bg-success-subtle text-success"
                                    : r.status === "PROCESSING"
                                    ? "bg-primary-subtle text-primary"
                                    : "bg-warning-subtle text-warning-emphasis"
                                }`}
                              >
                                {r.status === "COMPLETED" ? "Reported to Doctor" : r.status === "PROCESSING" ? "In Lab" : "Sample Pending"}
                              </span>
                            </td>
                            <td className="text-end px-3">
                              <button
                                className="btn btn-outline-secondary btn-sm p-1 rounded-2"
                                title="Print Report"
                                onClick={() => setPrintingReport(r)}
                              >
                                <Printer size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              TAB 2: SAMPLE COLLECTION
          ================================================= */}
          {activeTab === "samples" && <SampleCollection onSampleCollected={loadData} />}

          {/* =================================================
              TAB 3: RESULT ENTRY
          ================================================= */}
          {activeTab === "results" && <ResultEntry onResultEntered={loadData} />}

          {/* =================================================
              TAB 4: VERIFIED REPORTS
          ================================================= */}
          {activeTab === "reports" && <LabReport />}

          {/* =================================================
              TAB 5: TEST CATALOG MASTER
          ================================================= */}
          {activeTab === "tests" && <LabTestList />}
        </main>
      </div>

      {/* Print Document Modal */}
      {printingReport && (
        <LabReportPrint report={printingReport} onClose={() => setPrintingReport(null)} />
      )}

      {/* New Lab Test Requisition Modal */}
      {showNewOrderModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FlaskConical size={18} className="text-primary" />
                  Initiate New Diagnostic Lab Order
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowNewOrderModal(false)} />
              </div>

              <form onSubmit={handleCreateOrder}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Select Patient *</label>
                      <select
                        className="form-select form-select-sm"
                        value={orderForm.patient_id}
                        onChange={(e) => setOrderForm({ ...orderForm, patient_id: e.target.value })}
                        required
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.patient_id}>
                            {p.first_name} {p.last_name} ({p.patient_id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Diagnostic Investigation *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Complete Blood Count (CBC) or Lipid Profile"
                        className="form-control form-control-sm"
                        value={orderForm.test_name}
                        onChange={(e) => setOrderForm({ ...orderForm, test_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Specimen Required</label>
                      <select
                        className="form-select form-select-sm"
                        value={orderForm.sample_type}
                        onChange={(e) => setOrderForm({ ...orderForm, sample_type: e.target.value })}
                      >
                        <option value="Blood">Blood (EDTA / Whole)</option>
                        <option value="Serum">Serum</option>
                        <option value="Urine">Urine</option>
                        <option value="Swab">Swab</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Ordering Doctor *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. Robert Smith"
                        className="form-control form-control-sm"
                        value={orderForm.ordered_by_doctor}
                        onChange={(e) => setOrderForm({ ...orderForm, ordered_by_doctor: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Priority</label>
                      <select
                        className="form-select form-select-sm"
                        value={orderForm.priority}
                        onChange={(e) => setOrderForm({ ...orderForm, priority: e.target.value })}
                      >
                        <option value="ROUTINE">Routine</option>
                        <option value="URGENT">Urgent (Priority)</option>
                        <option value="STAT">STAT / Emergency</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Clinical Indication / Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Rule out anemia, routine pre-operative screening"
                        className="form-control form-control-sm"
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowNewOrderModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm rounded-2 px-3 fw-medium" disabled={submittingOrder}>
                    {submittingOrder ? "Submitting..." : "Initiate Test Requisition"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM STYLING */}
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

          .spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @media print {
            .d-print-none { display: none !important; }
            body { background: white !important; }
            .modal { position: static !important; display: block !important; }
            .modal-dialog { max-width: 100% !important; margin: 0 !important; }
            .modal-content { border: none !important; box-shadow: none !important; }
            .printable-report { padding: 0 !important; }
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

export default LabDashboard;
