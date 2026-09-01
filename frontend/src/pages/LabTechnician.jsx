import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FlaskConical,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  LogOut,
  Microscope,
  FileCheck,
  ClipboardList,
  TestTube,
  Activity,
  Layers,
  RefreshCw,
  Eye,
  Edit3,
  Trash2,
  Printer,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const LabTechnician = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Tabs: 'worklist' | 'reports' | 'catalog'
  const [activeTab, setActiveTab] = useState("worklist");

  const [reports, setReports] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [patients, setPatients] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedReportForEntry, setSelectedReportForEntry] = useState(null);
  const [viewReportDetail, setViewReportDetail] = useState(null);

  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  // New Order Form
  const [orderForm, setOrderForm] = useState({
    patient_id: "",
    test_name: "",
    sample_type: "Blood",
    ordered_by_doctor: "Dr. Robert Smith",
    notes: "",
  });

  // Enter Result Form
  const [resultForm, setResultForm] = useState({
    result_value: "",
    reference_range: "",
    finding_notes: "",
    status: "COMPLETED",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    const headers = getHeaders();

    // 1. Fetch Lab Reports from Database
    try {
      const res = await axios.get(`${API_URL}/laboratory/reports/`, { headers });
      if (Array.isArray(res.data)) {
        setReports(res.data);
      }
    } catch (e) {
      console.error("Error loading lab reports:", e);
    }

    // 2. Fetch Available Lab Tests
    try {
      const resTests = await axios.get(`${API_URL}/laboratory/tests/`, { headers });
      if (Array.isArray(resTests.data)) {
        setLabTests(resTests.data);
        if (resTests.data.length > 0) {
          setOrderForm((prev) => ({
            ...prev,
            test_name: prev.test_name || resTests.data[0].test_name,
            sample_type: prev.sample_type || resTests.data[0].sample_type || "Blood",
          }));
        }
      }
    } catch (e) {
      console.error("Error loading lab tests:", e);
    }

    // 3. Fetch Patients
    try {
      const resPatients = await axios.get(`${API_URL}/patients/`, { headers });
      if (Array.isArray(resPatients.data)) {
        setPatients(resPatients.data);
        if (resPatients.data.length > 0) {
          setOrderForm((prev) => ({ ...prev, patient_id: prev.patient_id || resPatients.data[0].patient_id }));
        }
      }
    } catch (e) {
      console.error("Error loading patients:", e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Submit New Lab Test Order to Database
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    const headers = getHeaders();
    const payload = {
      patient_id: orderForm.patient_id,
      test_name: orderForm.test_name,
      sample_type: orderForm.sample_type,
      ordered_by_doctor: orderForm.ordered_by_doctor,
      finding_notes: orderForm.notes || "Order registered in diagnostic queue.",
      status: "PENDING_SAMPLE",
    };

    try {
      const res = await axios.post(`${API_URL}/laboratory/reports/`, payload, { headers });
      setReports([res.data, ...reports]);
      setShowOrderModal(false);
      showAlert("success", `Lab order for ${orderForm.test_name} created successfully!`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object" ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ") : null) ||
        err.message ||
        "Failed to create lab order.";
      showAlert("danger", `Failed to create order: ${errorMsg}`);
    }
  };

  // Open Enter Result Modal
  const handleOpenResultEntry = (report) => {
    setSelectedReportForEntry(report);
    setResultForm({
      result_value: report.result_value || "",
      reference_range: report.reference_range || "Normal",
      finding_notes: report.finding_notes || "All test parameters analyzed.",
      status: "COMPLETED",
    });
    setShowResultModal(true);
  };

  // Save Test Result & Mark Completed in Database
  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!selectedReportForEntry) return;

    const headers = getHeaders();
    const payload = {
      result_value: resultForm.result_value,
      reference_range: resultForm.reference_range,
      finding_notes: resultForm.finding_notes,
      status: resultForm.status,
    };

    try {
      if (selectedReportForEntry.id) {
        await axios.patch(`${API_URL}/laboratory/reports/${selectedReportForEntry.id}/`, payload, { headers });
      }
    } catch (e) {}

    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReportForEntry.id
          ? {
              ...r,
              ...payload,
            }
          : r
      )
    );

    setShowResultModal(false);
    showAlert("success", `Diagnostic result published for ${selectedReportForEntry.test_name}!`);
  };

  // Update Status quick toggle
  const handleQuickStatusChange = async (reportId, newStatus) => {
    const headers = getHeaders();
    try {
      const target = reports.find((r) => r.id === reportId);
      if (target) {
        await axios.patch(`${API_URL}/laboratory/reports/${reportId}/`, { status: newStatus }, { headers });
      }
    } catch (e) {}

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
    );
    showAlert("success", `Sample status updated to "${newStatus}".`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filtered reports
  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      `${r.report_id} ${r.patient_name} ${r.test_name} ${r.ordered_by_doctor}`.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="d-flex flex-column min-vh-100 bg-slate-50 text-dark">
      {/* 1. TOP NAVBAR */}
      <nav className="navbar navbar-expand navbar-dark bg-slate-900 px-3 px-md-4 py-3 shadow-xs sticky-top">
        <div className="container-fluid px-0">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-info text-dark rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
              <FlaskConical size={20} />
            </div>
            <div>
              <span className="navbar-brand mb-0 fw-bold fs-6 text-white tracking-wide">
                ClinicCare
              </span>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase d-block" style={{ fontSize: "10px" }}>
                Diagnostic Laboratory Portal
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="text-white fw-semibold small">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Mark Vance"}
              </div>
              <small className="text-slate-400" style={{ fontSize: "11px" }}>
                Lead Medical Lab Technologist • Pathology Dept
              </small>
            </div>

            <button
              className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 rounded-2"
              onClick={handleLogout}
            >
              <LogOut size={15} />
              <span className="d-none d-sm-inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 2. SUB-NAV TABS */}
      <div className="bg-white border-bottom shadow-xs">
        <div className="container py-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-2">
            <button
              className={`btn btn-sm px-3 rounded-2 fw-medium ${
                activeTab === "worklist" ? "btn-primary text-white" : "btn-light text-slate-700"
              }`}
              onClick={() => { setActiveTab("worklist"); setSearchQuery(""); }}
            >
              <FlaskConical size={16} className="me-1" />
              Diagnostic Worklist ({reports.filter((r) => r.status !== "COMPLETED").length})
            </button>

            <button
              className={`btn btn-sm px-3 rounded-2 fw-medium ${
                activeTab === "reports" ? "btn-primary text-white" : "btn-light text-slate-700"
              }`}
              onClick={() => { setActiveTab("reports"); setSearchQuery(""); }}
            >
              <FileCheck size={16} className="me-1" />
              Completed Reports Archive ({reports.filter((r) => r.status === "COMPLETED").length})
            </button>

            <button
              className={`btn btn-sm px-3 rounded-2 fw-medium ${
                activeTab === "catalog" ? "btn-primary text-white" : "btn-light text-slate-700"
              }`}
              onClick={() => { setActiveTab("catalog"); setSearchQuery(""); }}
            >
              <TestTube size={16} className="me-1" />
              Test Catalog & Pricing ({labTests.length})
            </button>
          </div>

          <button
            className="btn btn-info btn-sm rounded-2 d-flex align-items-center gap-1 fw-medium px-3 text-dark"
            onClick={() => setShowOrderModal(true)}
          >
            <Plus size={16} />
            <span>Order New Lab Test</span>
          </button>
        </div>
      </div>

      {/* 3. ALERTS */}
      {alertMsg.text && (
        <div className="container mt-3">
          <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-0 d-flex align-items-center gap-2 rounded-3`}>
            {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span className="small">{alertMsg.text}</span>
          </div>
        </div>
      )}

      {/* 4. MAIN CONTAINER */}
      <div className="container my-4 flex-grow-1">
        {/* STATS OVERVIEW */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">Pending Samples</span>
                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {reports.filter((r) => r.status === "PENDING_SAMPLE").length}
                  </h3>
                  <small className="text-muted">Awaiting specimen collection</small>
                </div>
                <div className="bg-warning bg-opacity-10 text-warning rounded-3 p-3">
                  <TestTube size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">In Processing</span>
                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {reports.filter((r) => r.status === "PROCESSING").length}
                  </h3>
                  <small className="text-muted">Under analyzer examination</small>
                </div>
                <div className="bg-info bg-opacity-10 text-info rounded-3 p-3">
                  <Microscope size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">Reports Published</span>
                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {reports.filter((r) => r.status === "COMPLETED").length}
                  </h3>
                  <small className="text-muted">Validated & ready for doctor</small>
                </div>
                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TAB 1: DIAGNOSTIC WORKLIST & QUEUE
        ================================================= */}
        {activeTab === "worklist" && (
          <div className="card border-0 shadow-xs rounded-3 bg-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h6 className="fw-bold mb-0 text-slate-900">Diagnostic Testing Worklist</h6>
                  <small className="text-muted">Track incoming specimen orders, update testing progress, and enter diagnostic results</small>
                </div>
              </div>

              {/* Filters */}
              <div className="row g-2 mb-3">
                <div className="col-md-6 col-lg-5">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">
                      <Search size={15} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by Report ID, patient name, test..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4 col-lg-3">
                  <select
                    className="form-select form-select-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Statuses ({reports.length})</option>
                    <option value="PENDING_SAMPLE">Pending Sample</option>
                    <option value="PROCESSING">In Processing</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
              </div>

              {/* Worklist Table */}
              <div className="table-responsive rounded-2 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-slate-600 small">
                    <tr>
                      <th className="px-3">Report ID</th>
                      <th>Patient Details</th>
                      <th>Diagnostic Test</th>
                      <th>Specimen Type</th>
                      <th>Referring Doctor</th>
                      <th>Status</th>
                      <th className="text-end px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {filteredReports.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-5">
                          <FlaskConical size={32} className="text-slate-300 mb-2" />
                          <div>No lab test orders found.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredReports.map((r) => (
                        <tr key={r.id || r.report_id}>
                          <td className="px-3">
                            <strong className="font-monospace text-slate-800 d-block">{r.report_id}</strong>
                            <small className="text-muted">{r.date || "Today"}</small>
                          </td>
                          <td>
                            <div className="fw-semibold text-slate-900">{r.patient_name}</div>
                            <div className="text-muted" style={{ fontSize: "11px" }}>{r.patient_details || r.patient_id}</div>
                          </td>
                          <td>
                            <strong className="text-slate-800">{r.test_name}</strong>
                          </td>
                          <td>
                            <span className="badge bg-slate-100 text-slate-700 border">{r.sample_type}</span>
                          </td>
                          <td>
                            <span className="text-slate-700">{r.ordered_by_doctor}</span>
                          </td>
                          <td>
                            <span
                              className={`badge rounded-pill px-2 py-1 ${
                                r.status === "COMPLETED"
                                  ? "bg-success-subtle text-success"
                                  : r.status === "PROCESSING"
                                  ? "bg-info-subtle text-info-emphasis"
                                  : "bg-warning-subtle text-warning-emphasis"
                              }`}
                            >
                              {r.status === "PENDING_SAMPLE"
                                ? "Pending Sample"
                                : r.status === "PROCESSING"
                                ? "In Processing"
                                : "Completed"}
                            </span>
                          </td>
                          <td className="text-end px-3">
                            <div className="d-flex justify-content-end gap-1">
                              {r.status === "PENDING_SAMPLE" && (
                                <button
                                  className="btn btn-outline-info btn-sm rounded-2 px-2"
                                  title="Mark Sample Received"
                                  onClick={() => handleQuickStatusChange(r.id, "PROCESSING")}
                                >
                                  Collect Sample
                                </button>
                              )}

                              {r.status === "PROCESSING" && (
                                <button
                                  className="btn btn-primary btn-sm rounded-2 px-3 fw-medium"
                                  onClick={() => handleOpenResultEntry(r)}
                                >
                                  Enter Results
                                </button>
                              )}

                              {r.status === "COMPLETED" && (
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-2 px-2"
                                  onClick={() => setViewReportDetail(r)}
                                >
                                  <Eye size={14} className="me-1" />
                                  View Slip
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            TAB 2: COMPLETED REPORTS ARCHIVE
        ================================================= */}
        {activeTab === "reports" && (
          <div className="card border-0 shadow-xs rounded-3 bg-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h6 className="fw-bold mb-0 text-slate-900">Validated Diagnostic Reports Archive</h6>
                  <small className="text-muted">Review released laboratory observations, test values, and remarks</small>
                </div>
              </div>

              <div className="table-responsive rounded-2 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-slate-600 small">
                    <tr>
                      <th className="px-3">Report ID</th>
                      <th>Patient</th>
                      <th>Test Name</th>
                      <th>Result Values</th>
                      <th>Reference Range</th>
                      <th>Technician</th>
                      <th className="text-end px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {reports.filter((r) => r.status === "COMPLETED").map((r) => (
                      <tr key={r.id || r.report_id}>
                        <td className="px-3">
                          <strong className="font-monospace text-slate-800 d-block">{r.report_id}</strong>
                          <small className="text-muted">{r.date || "Today"}</small>
                        </td>
                        <td>
                          <div className="fw-semibold text-slate-900">{r.patient_name}</div>
                          <small className="text-muted font-monospace">{r.patient_details || r.patient_id}</small>
                        </td>
                        <td>
                          <strong className="text-slate-800">{r.test_name}</strong>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{r.sample_type} Specimen</div>
                        </td>
                        <td>
                          <span className="fw-medium text-slate-900">{r.result_value || "Analyzed"}</span>
                        </td>
                        <td>
                          <span className="text-muted">{r.reference_range || "Normal"}</span>
                        </td>
                        <td>
                          <span className="text-slate-700">{r.technician_name}</span>
                        </td>
                        <td className="text-end px-3">
                          <button
                            className="btn btn-outline-primary btn-sm rounded-2 px-2"
                            onClick={() => setViewReportDetail(r)}
                          >
                            <Eye size={14} className="me-1" />
                            View Slip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            TAB 3: TEST CATALOG & PRICING
        ================================================= */}
        {activeTab === "catalog" && (
          <div className="card border-0 shadow-xs rounded-3 bg-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h6 className="fw-bold mb-0 text-slate-900">Hospital Diagnostic Test Directory</h6>
                  <small className="text-muted">Standard pathology tests, specimen guidelines, reference limits, and fees</small>
                </div>
              </div>

              <div className="table-responsive rounded-2 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-slate-600 small">
                    <tr>
                      <th className="px-3">Test Code</th>
                      <th>Test Name</th>
                      <th>Category</th>
                      <th>Specimen Type</th>
                      <th>Standard Reference Range</th>
                      <th>Turnaround</th>
                      <th>Test Fee</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {labTests.map((t) => (
                      <tr key={t.id || t.test_code}>
                        <td className="px-3 font-monospace fw-semibold text-slate-700">{t.test_code}</td>
                        <td>
                          <strong className="text-slate-900">{t.test_name}</strong>
                        </td>
                        <td>
                          <span className="badge bg-slate-100 text-slate-700 border">{t.category}</span>
                        </td>
                        <td>{t.sample_type}</td>
                        <td><span className="text-muted">{t.normal_range}</span></td>
                        <td><span className="text-muted">{t.turnaround_time}</span></td>
                        <td><strong className="text-emerald-700">₹{parseFloat(t.price).toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          MODAL: ORDER NEW LAB TEST
      ================================================= */}
      {showOrderModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FlaskConical size={18} className="text-info" />
                  Order Diagnostic Lab Test
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowOrderModal(false)} />
              </div>

              <form onSubmit={handleCreateOrder}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-slate-800">Select Patient *</label>
                      <select
                        className="form-select form-select-sm"
                        value={orderForm.patient_id}
                        onChange={(e) => setOrderForm({ ...orderForm, patient_id: e.target.value })}
                      >
                        {patients.map((p) => (
                          <option key={p.patient_id} value={p.patient_id}>
                            {p.full_name || `${p.first_name} ${p.last_name}`} ({p.patient_id}) - {p.gender}, {p.age}y
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-slate-800">Select Diagnostic Test *</label>
                      <select
                        className="form-select form-select-sm"
                        value={orderForm.test_name}
                        onChange={(e) => {
                          const selected = labTests.find((t) => t.test_name === e.target.value);
                          setOrderForm({
                            ...orderForm,
                            test_name: e.target.value,
                            sample_type: selected ? selected.sample_type : "Blood",
                          });
                        }}
                      >
                        {labTests.map((t) => (
                          <option key={t.test_code} value={t.test_name}>
                            {t.test_name} ({t.sample_type}) - ₹{t.price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700">Specimen Type</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={orderForm.sample_type}
                        onChange={(e) => setOrderForm({ ...orderForm, sample_type: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700">Referring Doctor</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={orderForm.ordered_by_doctor}
                        onChange={(e) => setOrderForm({ ...orderForm, ordered_by_doctor: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700">Clinical Indication / Instructions</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Fasting 12 hours required"
                        value={orderForm.notes}
                        onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowOrderModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-info btn-sm rounded-2 px-3 fw-medium text-dark">
                    Register Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL: ENTER TEST RESULTS
      ================================================= */}
      {showResultModal && selectedReportForEntry && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Microscope size={18} className="text-info" />
                  Enter Diagnostic Result: {selectedReportForEntry.test_name}
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowResultModal(false)} />
              </div>

              <form onSubmit={handleSaveResult}>
                <div className="modal-body p-4">
                  {/* Patient Info Banner */}
                  <div className="bg-slate-50 p-3 rounded-2 border border-slate-100 mb-3 d-flex justify-content-between align-items-center">
                    <div>
                      <strong className="d-block text-slate-900">{selectedReportForEntry.patient_name}</strong>
                      <small className="text-muted">{selectedReportForEntry.patient_details || selectedReportForEntry.patient_id}</small>
                    </div>
                    <span className="badge bg-slate-200 text-slate-800 p-2 font-monospace">
                      {selectedReportForEntry.report_id}
                    </span>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-slate-800">Observed Test Value(s) *</label>
                      <textarea
                        required
                        rows={2}
                        className="form-control form-control-sm"
                        placeholder="e.g. Hemoglobin: 14.2 g/dL, WBC: 7,200 /mcL, Platelets: 280,000 /mcL"
                        value={resultForm.result_value}
                        onChange={(e) => setResultForm({ ...resultForm, result_value: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">Reference / Normal Limits</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Hb: 13-17 g/dL, WBC: 4000-11000"
                        value={resultForm.reference_range}
                        onChange={(e) => setResultForm({ ...resultForm, reference_range: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">Result Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={resultForm.status}
                        onChange={(e) => setResultForm({ ...resultForm, status: e.target.value })}
                      >
                        <option value="COMPLETED">Completed & Validated</option>
                        <option value="PROCESSING">In Processing / Re-running</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700">Pathologist / Technologist Remarks</label>
                      <textarea
                        rows={2}
                        className="form-control form-control-sm"
                        placeholder="e.g. Microcytic normochromic red cells observed. Normal morphology."
                        value={resultForm.finding_notes}
                        onChange={(e) => setResultForm({ ...resultForm, finding_notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowResultModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm rounded-2 px-3 fw-medium">
                    Publish & Save Report
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL: VIEW REPORT SLIP / PREVIEW
      ================================================= */}
      {viewReportDetail && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold">Diagnostic Lab Report (#{viewReportDetail.report_id})</h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewReportDetail(null)} />
              </div>
              <div className="modal-body p-4">
                {/* Header */}
                <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                  <div>
                    <h5 className="fw-bold mb-1 text-slate-900">{viewReportDetail.patient_name}</h5>
                    <div className="text-muted small">{viewReportDetail.patient_details || viewReportDetail.patient_id}</div>
                    <div className="text-muted small">Referring Doctor: <strong>{viewReportDetail.ordered_by_doctor}</strong></div>
                  </div>
                  <div className="text-end">
                    <span className="badge bg-success-subtle text-success p-2 mb-1 d-block">Validated Report</span>
                    <small className="text-muted">{viewReportDetail.date || "Today"}</small>
                  </div>
                </div>

                {/* Test details */}
                <div className="mb-4">
                  <h6 className="fw-bold text-slate-800">{viewReportDetail.test_name}</h6>
                  <span className="badge bg-slate-100 text-slate-700 border me-2">Specimen: {viewReportDetail.sample_type}</span>
                  <span className="badge bg-slate-100 text-slate-700 border">Technician: {viewReportDetail.technician_name}</span>
                </div>

                {/* Results Table */}
                <div className="table-responsive rounded-2 border mb-3">
                  <table className="table table-bordered mb-0">
                    <thead className="table-light small">
                      <tr>
                        <th>Investigation Parameter</th>
                        <th>Observed Value</th>
                        <th>Reference Range</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      <tr>
                        <td className="fw-semibold">{viewReportDetail.test_name}</td>
                        <td className="fw-bold text-primary">{viewReportDetail.result_value || "Normal"}</td>
                        <td className="text-muted">{viewReportDetail.reference_range || "Standard Reference Limit"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Notes */}
                {viewReportDetail.finding_notes && (
                  <div className="bg-slate-50 p-3 rounded-2 border border-slate-100 mb-2">
                    <small className="text-muted d-block fw-semibold">Pathology Interpretation & Remarks:</small>
                    <p className="small text-slate-800 mb-0">{viewReportDetail.finding_notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-slate-50 py-2 px-4 d-flex justify-content-between">
                <span className="text-muted small">Validated by ClinicCare Diagnostic Laboratory</span>
                <button className="btn btn-secondary btn-sm rounded-2" onClick={() => setViewReportDetail(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CSS */}
      <style>
        {`
          .bg-slate-50 { background-color: #f8fafc; }
          .bg-slate-800 { background-color: #1e293b; }
          .bg-slate-900 { background-color: #0f172a; }
          .text-slate-400 { color: #94a3b8; }
          .text-slate-600 { color: #475569; }
          .text-slate-700 { color: #334155; }
          .text-slate-800 { color: #1e293b; }
          .text-slate-900 { color: #0f172a; }
          .border-slate-100 { border-color: #f1f5f9 !important; }
          .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04); }
        `}
      </style>
    </div>
  );
};

export default LabTechnician;
