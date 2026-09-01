import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Stethoscope,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  Search,
  Pill,
  FlaskConical,
  LogOut,
  User,
  HeartPulse,
  Activity,
  ClipboardList,
  ChevronRight,
  RefreshCw,
  Eye,
  Trash2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const Doctor = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'queue' | 'prescriptions' | 'patients'
  const [activeTab, setActiveTab] = useState("queue");

  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicines, setMedicines] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modals state
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedPatientForRx, setSelectedPatientForRx] = useState(null);
  const [viewRxDetail, setViewRxDetail] = useState(null);

  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  // New Prescription Form State
  const [rxForm, setRxForm] = useState({
    patient_id: "",
    diagnosis: "",
    bp: "120/80",
    pulse: "76",
    temp: "98.6",
    medicines_text: "",
    lab_tests: "",
    advice_notes: "Drink plenty of water and take adequate rest.",
    follow_up_days: "7",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  // Load real patients from backend database, medicines, and prescriptions
  const loadBackendData = async () => {
    const headers = getHeaders();

    // 1. Fetch Patients from Database
    try {
      const res = await axios.get(`${API_URL}/patients/`, { headers });
      if (Array.isArray(res.data)) {
        const dbPatients = res.data.map((p) => ({
          id: p.patient_id,
          patient_id: p.patient_id,
          name: p.full_name || `${p.first_name} ${p.last_name}`,
          age: p.age || 30,
          gender: p.gender === "FEMALE" ? "Female" : "Male",
          blood_group: p.blood_group || "O+",
          phone: p.phone,
          email: p.email,
          address: p.address,
        }));

        setPatients(dbPatients);

        // Build active queue for registered database patients
        const defaultTimes = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:15 AM", "12:00 PM", "02:00 PM", "03:00 PM"];
        const defaultReasons = [
          "Routine health checkup & evaluation",
          "Hypertension follow-up & vitals review",
          "Seasonal flu symptoms & consultation",
          "Chronic pain management review",
          "Diagnostic lab reports evaluation",
        ];
        const defaultStatuses = ["In Consultation", "Pending", "Pending", "Pending", "Completed"];

        const dynamicQueue = dbPatients.map((p, idx) => ({
          id: idx + 1,
          patient_id: p.patient_id,
          patient_name: p.name,
          age: p.age,
          gender: p.gender,
          time: defaultTimes[idx % defaultTimes.length],
          reason: defaultReasons[idx % defaultReasons.length],
          status: defaultStatuses[idx % defaultStatuses.length] || "Pending",
          vitals: {
            bp: idx === 0 ? "120/80" : idx === 1 ? "118/76" : "125/82",
            pulse: (72 + (idx * 3)).toString(),
            temp: (98.4 + (idx * 0.2)).toFixed(1),
          },
        }));

        setAppointments(dynamicQueue);

        if (dbPatients.length > 0) {
          setRxForm((prev) => ({ ...prev, patient_id: dbPatients[0].patient_id }));
        }
      }
    } catch (e) {
      console.error("Error fetching database patients:", e);
    }

    // 2. Fetch Medicines from Inventory
    try {
      const medRes = await axios.get(`${API_URL}/pharmacy/medicines/`, { headers });
      if (Array.isArray(medRes.data)) setMedicines(medRes.data);
    } catch (e) {
      console.error("Error fetching medicines:", e);
    }

    // 3. Fetch Stored Prescriptions from Database
    try {
      const rxRes = await axios.get(`${API_URL}/prescriptions/`, { headers });
      if (Array.isArray(rxRes.data)) {
        const formatted = rxRes.data.map((r) => ({
          id: r.rx_id,
          patient_id: r.patient_id || "",
          patient_name: r.patient_name,
          date: r.date,
          diagnosis: r.diagnosis,
          medicines: r.medicines ? r.medicines.split("\n").filter(Boolean).map((m) => ({ name: m, dosage: "" })) : [],
          lab_tests: r.lab_tests,
          notes: r.notes,
        }));
        setPrescriptions(formatted);
      }
    } catch (e) {
      console.error("Error fetching prescriptions:", e);
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // Update appointment status
  const handleUpdateStatus = (id, newStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
    showAlert("success", `Appointment status updated to "${newStatus}".`);
  };

  // Start Consultation shortcut
  const handleStartConsultation = (apt) => {
    setSelectedPatientForRx(apt);
    setRxForm({
      ...rxForm,
      patient_id: apt.patient_id,
      bp: apt.vitals?.bp || "120/80",
      pulse: apt.vitals?.pulse || "76",
      temp: apt.vitals?.temp || "98.6",
      diagnosis: `Clinical examination for: ${apt.reason}`,
    });
    handleUpdateStatus(apt.id, "In Consultation");
    setShowPrescriptionModal(true);
  };

  // Submit Prescription to Database
  const handleSavePrescription = async (e) => {
    e.preventDefault();
    const headers = getHeaders();
    const patientObj = patients.find((p) => p.id === rxForm.patient_id) || {
      name: selectedPatientForRx?.patient_name || "Patient",
      id: rxForm.patient_id,
    };

    const payload = {
      patient_id: rxForm.patient_id,
      diagnosis: rxForm.diagnosis,
      blood_pressure: rxForm.bp,
      pulse: rxForm.pulse,
      temperature: rxForm.temp,
      medicines: rxForm.medicines_text,
      lab_tests: rxForm.lab_tests,
      notes: rxForm.advice_notes,
    };

    try {
      const res = await axios.post(`${API_URL}/prescriptions/`, payload, { headers });
      const savedRx = {
        id: res.data.rx_id,
        patient_id: rxForm.patient_id,
        patient_name: res.data.patient_name || patientObj.name,
        date: res.data.date || "Today, Just now",
        diagnosis: res.data.diagnosis,
        medicines: res.data.medicines ? res.data.medicines.split("\n").filter(Boolean).map((m) => ({ name: m, dosage: "" })) : [],
        lab_tests: res.data.lab_tests,
        notes: res.data.notes,
      };
      setPrescriptions([savedRx, ...prescriptions]);

      // Mark appointment as Completed
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.patient_id === rxForm.patient_id ? { ...apt, status: "Completed" } : apt
        )
      );

      setShowPrescriptionModal(false);
      showAlert("success", `Prescription saved to database for ${patientObj.name}!`);
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object" ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ") : null) ||
        err.message ||
        "Failed to save prescription.";
      showAlert("danger", `Failed to save prescription: ${errorMsg}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      `${apt.patient_name} ${apt.patient_id} ${apt.reason}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="d-flex flex-column min-vh-100 bg-slate-50 text-dark">
      {/* 1. TOP NAVBAR */}
      <nav className="navbar navbar-expand navbar-dark bg-slate-900 px-3 px-md-4 py-3 shadow-xs sticky-top">
        <div className="container-fluid px-0">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
              <Stethoscope size={20} />
            </div>
            <div>
              <span className="navbar-brand mb-0 fw-bold fs-6 text-white tracking-wide">
                ClinicCare
              </span>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase d-block" style={{ fontSize: "10px" }}>
                Doctor Portal
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-sm-block">
              <div className="text-white fw-semibold small">
                {user?.first_name ? `Dr. ${user.first_name} ${user.last_name || ""}` : "Dr. Robert Smith"}
              </div>
              <small className="text-slate-400" style={{ fontSize: "11px" }}>
                Cardiology Specialist • ₹500/visit
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
                activeTab === "queue" ? "btn-primary text-white" : "btn-light text-slate-700"
              }`}
              onClick={() => { setActiveTab("queue"); setSearchQuery(""); }}
            >
              <Users size={16} className="me-1" />
              Patient Queue ({appointments.filter((a) => a.status !== "Completed").length})
            </button>

            <button
              className={`btn btn-sm px-3 rounded-2 fw-medium ${
                activeTab === "prescriptions" ? "btn-primary text-white" : "btn-light text-slate-700"
              }`}
              onClick={() => { setActiveTab("prescriptions"); setSearchQuery(""); }}
            >
              <FileText size={16} className="me-1" />
              Prescriptions & History ({prescriptions.length})
            </button>
          </div>

          <button
            className="btn btn-success btn-sm rounded-2 d-flex align-items-center gap-1 fw-medium px-3"
            onClick={() => {
              setSelectedPatientForRx(null);
              setShowPrescriptionModal(true);
            }}
          >
            <Plus size={16} />
            <span>New Prescription</span>
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
                  <span className="text-muted small fw-semibold text-uppercase">Patients in Queue</span>
                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {appointments.filter((a) => a.status === "Pending" || a.status === "In Consultation").length}
                  </h3>
                  <small className="text-muted">Awaiting consultation today</small>
                </div>
                <div className="bg-primary bg-opacity-10 text-primary rounded-3 p-3">
                  <Users size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">Completed Today</span>
                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">
                    {appointments.filter((a) => a.status === "Completed").length}
                  </h3>
                  <small className="text-muted">Consultations finished</small>
                </div>
                <div className="bg-success bg-opacity-10 text-success rounded-3 p-3">
                  <CheckCircle2 size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-xs rounded-3 p-3 bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-muted small fw-semibold text-uppercase">Total Prescriptions</span>
                  <h3 className="fw-bold mt-1 mb-0 text-slate-900">{prescriptions.length}</h3>
                  <small className="text-muted">Records on file</small>
                </div>
                <div className="bg-amber-subtle text-warning rounded-3 p-3">
                  <FileText size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TAB 1: PATIENT QUEUE & APPOINTMENTS
        ================================================= */}
        {activeTab === "queue" && (
          <div className="card border-0 shadow-xs rounded-3 bg-white">
            <div className="card-body p-4">
              {/* Header & Filter Controls */}
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h6 className="fw-bold mb-0 text-slate-900">Today's Patient Schedule</h6>
                  <small className="text-muted">Manage patient queue and record clinical examinations</small>
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6 col-lg-5">
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-muted">
                      <Search size={15} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search patient name, ID, symptoms..."
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
                    <option value="ALL">All Statuses ({appointments.length})</option>
                    <option value="Pending">Pending</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Queue Table */}
              <div className="table-responsive rounded-2 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-slate-600 small">
                    <tr>
                      <th className="px-3">Time</th>
                      <th>Patient Details</th>
                      <th>Reason / Symptoms</th>
                      <th>Vital Signs</th>
                      <th>Status</th>
                      <th className="text-end px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {filteredAppointments.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center text-muted py-5">
                          <Users size={32} className="text-slate-300 mb-2" />
                          <div>No patients found in queue.</div>
                        </td>
                      </tr>
                    ) : (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id}>
                          <td className="px-3 fw-semibold text-slate-700">
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={14} className="text-muted" />
                              {apt.time}
                            </span>
                          </td>
                          <td>
                            <strong className="d-block text-slate-900">{apt.patient_name}</strong>
                            <small className="text-muted font-monospace">{apt.patient_id} • {apt.age}y / {apt.gender}</small>
                          </td>
                          <td>
                            <span className="text-slate-800">{apt.reason}</span>
                          </td>
                          <td>
                            {apt.vitals ? (
                              <div className="small text-muted">
                                <span>BP: <strong className="text-dark">{apt.vitals.bp}</strong></span> |{" "}
                                <span>Pulse: <strong className="text-dark">{apt.vitals.pulse}</strong></span> |{" "}
                                <span>Temp: <strong className="text-dark">{apt.vitals.temp}°F</strong></span>
                              </div>
                            ) : (
                              <span className="text-muted">Not recorded</span>
                            )}
                          </td>
                          <td>
                            <span
                              className={`badge rounded-pill px-2 py-1 ${
                                apt.status === "Completed"
                                  ? "bg-success-subtle text-success"
                                  : apt.status === "In Consultation"
                                  ? "bg-warning-subtle text-warning-emphasis"
                                  : "bg-slate-100 text-slate-700 border"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>
                          <td className="text-end px-3">
                            {apt.status !== "Completed" ? (
                              <button
                                className="btn btn-primary btn-sm rounded-2 px-3 fw-medium"
                                onClick={() => handleStartConsultation(apt)}
                              >
                                Start Consultation
                              </button>
                            ) : (
                              <button
                                className="btn btn-outline-secondary btn-sm rounded-2 px-2"
                                onClick={() => {
                                  const rx = prescriptions.find((r) => r.patient_id === apt.patient_id);
                                  if (rx) setViewRxDetail(rx);
                                  else showAlert("info", "Prescription details recorded.");
                                }}
                              >
                                View Prescription
                              </button>
                            )}
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
            TAB 2: PRESCRIPTIONS & CONSULTATION HISTORY
        ================================================= */}
        {activeTab === "prescriptions" && (
          <div className="card border-0 shadow-xs rounded-3 bg-white">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                <div>
                  <h6 className="fw-bold mb-0 text-slate-900">Clinical Prescriptions & Treatment History</h6>
                  <small className="text-muted">Review past prescriptions, ordered diagnostics, and patient progress</small>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive rounded-2 border">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-slate-600 small">
                    <tr>
                      <th className="px-3">Rx ID & Date</th>
                      <th>Patient</th>
                      <th>Clinical Diagnosis</th>
                      <th>Prescribed Medicines</th>
                      <th>Lab Tests Ordered</th>
                      <th className="text-end px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {prescriptions.map((rx) => (
                      <tr key={rx.id}>
                        <td className="px-3">
                          <strong className="d-block font-monospace text-slate-700">{rx.id}</strong>
                          <small className="text-muted">{rx.date}</small>
                        </td>
                        <td>
                          <strong className="d-block text-slate-900">{rx.patient_name}</strong>
                          <small className="text-muted font-monospace">{rx.patient_id}</small>
                        </td>
                        <td>
                          <span className="fw-medium text-slate-800">{rx.diagnosis}</span>
                        </td>
                        <td>
                          <ul className="mb-0 ps-3 small text-muted">
                            {rx.medicines.map((m, idx) => (
                              <li key={idx}><strong>{m.name}</strong> {m.dosage && `(${m.dosage})`}</li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          {rx.lab_tests ? (
                            <span className="badge bg-info-subtle text-info-emphasis">{rx.lab_tests}</span>
                          ) : (
                            <span className="text-muted">None</span>
                          )}
                        </td>
                        <td className="text-end px-3">
                          <button
                            className="btn btn-outline-primary btn-sm rounded-2 p-1 px-2"
                            title="View Full Prescription"
                            onClick={() => setViewRxDetail(rx)}
                          >
                            <Eye size={15} />
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
      </div>

      {/* =================================================
          MODAL: NEW PRESCRIPTION & CONSULTATION
      ================================================= */}
      {showPrescriptionModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Stethoscope size={18} className="text-primary" />
                  Medical Consultation & Prescription Form
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowPrescriptionModal(false)} />
              </div>

              <form onSubmit={handleSavePrescription}>
                <div className="modal-body p-4">
                  {/* Patient Selector */}
                  <div className="bg-slate-50 p-3 rounded-2 border border-slate-100 mb-3">
                    <label className="form-label small fw-bold text-slate-800">Select Patient *</label>
                    <select
                      className="form-select form-select-sm"
                      value={rxForm.patient_id}
                      onChange={(e) => setRxForm({ ...rxForm, patient_id: e.target.value })}
                    >
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.id}) - {p.gender}, {p.age} yrs • Blood Group: {p.blood_group}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Vitals */}
                  <h6 className="fw-bold small text-secondary mb-2">1. Patient Vital Signs</h6>
                  <div className="row g-2 mb-3">
                    <div className="col-4">
                      <label className="form-label small text-muted mb-1">Blood Pressure</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. 120/80"
                        value={rxForm.bp}
                        onChange={(e) => setRxForm({ ...rxForm, bp: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-muted mb-1">Pulse (bpm)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. 76"
                        value={rxForm.pulse}
                        onChange={(e) => setRxForm({ ...rxForm, pulse: e.target.value })}
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small text-muted mb-1">Temperature (°F)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. 98.6"
                        value={rxForm.temp}
                        onChange={(e) => setRxForm({ ...rxForm, temp: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Diagnosis */}
                  <h6 className="fw-bold small text-secondary mb-2">2. Clinical Diagnosis *</h6>
                  <div className="mb-3">
                    <input
                      type="text"
                      required
                      className="form-control form-control-sm"
                      placeholder="e.g. Acute Bronchitis / Viral Fever"
                      value={rxForm.diagnosis}
                      onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                    />
                  </div>

                  {/* Prescribed Medicines */}
                  <h6 className="fw-bold small text-secondary mb-2">3. Prescribe Medicines (1 per line) *</h6>
                  <div className="mb-3">
                    <textarea
                      required
                      rows={3}
                      className="form-control form-control-sm"
                      placeholder="e.g.&#10;Paracetamol 500mg - 1 Tab twice daily after food (5 days)&#10;Azithromycin 250mg - 1 Tab once daily (3 days)"
                      value={rxForm.medicines_text}
                      onChange={(e) => setRxForm({ ...rxForm, medicines_text: e.target.value })}
                    />
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      Tip: Refer to pharmacy stock (Paracetamol, Amoxicillin, Benadryl, Metformin, Azithromycin).
                    </small>
                  </div>

                  {/* Lab Test & Advice */}
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary mb-1">Lab Test Orders (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. CBC, Lipid Profile, X-Ray"
                        value={rxForm.lab_tests}
                        onChange={(e) => setRxForm({ ...rxForm, lab_tests: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary mb-1">Doctor's Advice & Notes</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Take plenty of warm fluids"
                        value={rxForm.advice_notes}
                        onChange={(e) => setRxForm({ ...rxForm, advice_notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowPrescriptionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm rounded-2 px-3 fw-medium">
                    Save & Issue Prescription
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL: VIEW PRESCRIPTION DETAIL
      ================================================= */}
      {viewRxDetail && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold">Prescription Details (#{viewRxDetail.id})</h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewRxDetail(null)} />
              </div>
              <div className="modal-body p-4">
                <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                  <div>
                    <h6 className="fw-bold mb-0">{viewRxDetail.patient_name}</h6>
                    <small className="text-muted font-monospace">{viewRxDetail.patient_id}</small>
                  </div>
                  <span className="badge bg-light text-dark border p-2">{viewRxDetail.date}</span>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block fw-semibold">Diagnosis:</small>
                  <strong className="text-slate-800">{viewRxDetail.diagnosis}</strong>
                </div>

                <div className="mb-3">
                  <small className="text-muted d-block fw-semibold mb-1">Prescribed Medicines:</small>
                  <ul className="list-group list-group-flush small border rounded-2">
                    {viewRxDetail.medicines.map((m, i) => (
                      <li key={i} className="list-group-item py-2">
                        <strong>{m.name}</strong> {m.dosage}
                      </li>
                    ))}
                  </ul>
                </div>

                {viewRxDetail.lab_tests && (
                  <div className="mb-3">
                    <small className="text-muted d-block fw-semibold">Lab Tests Ordered:</small>
                    <span className="badge bg-info-subtle text-info-emphasis">{viewRxDetail.lab_tests}</span>
                  </div>
                )}

                {viewRxDetail.notes && (
                  <div>
                    <small className="text-muted d-block fw-semibold">Doctor's Advice:</small>
                    <p className="small text-muted mb-0">{viewRxDetail.notes}</p>
                  </div>
                )}
              </div>
              <div className="modal-footer bg-slate-50 py-2 px-4">
                <button className="btn btn-secondary btn-sm rounded-2" onClick={() => setViewRxDetail(null)}>
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
          .bg-amber-subtle { background-color: #fffbeb; }
          .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04); }
        `}
      </style>
    </div>
  );
};

export default Doctor;
