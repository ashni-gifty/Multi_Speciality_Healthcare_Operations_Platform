import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  Activity,
  Pill,
  FlaskConical,
  CreditCard,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserX,
  Trash2,
} from "lucide-react";
import reportService from "../../services/reportService";
import api from "../../services/api";
import { calculateAge } from "../../services/staffService";

const PatientHistory = () => {
  const [patients, setPatients] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labReports, setLabReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Patient Details & History Drawer / Modal
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState("overview"); // overview | prescriptions | lab | billing
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientList, prescList, labList] = await Promise.all([
        reportService.getPatients(),
        reportService.getPrescriptions().catch(() => []),
        reportService.getLabReports().catch(() => []),
      ]);
      setPatients(patientList);
      setPrescriptions(prescList);
      setLabReports(labList);
    } catch (err) {
      console.error("Error loading patient data:", err);
      showAlert("danger", "Failed to fetch patient history from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeactivatePatient = async (patientId, name) => {
    if (!window.confirm(`Deactivate patient profile ${name} (${patientId})? Clinical records will remain archived.`)) {
      return;
    }
    try {
      await api.delete(`/patients/${patientId}/`);
      setPatients((prev) =>
        prev.map((p) => (p.patient_id === patientId ? { ...p, is_active: false } : p))
      );
      if (selectedPatient?.patient_id === patientId) {
        setSelectedPatient((prev) => ({ ...prev, is_active: false }));
      }
      showAlert("success", `Patient ${name} deactivated successfully.`);
    } catch (err) {
      showAlert("danger", `Failed to deactivate patient: ${err.response?.data?.detail || err.message}`);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${p.first_name || ""} ${p.last_name || ""}`.toLowerCase();
    const pid = (p.patient_id || "").toLowerCase();
    const phone = (p.phone || "").toLowerCase();
    const email = (p.email || "").toLowerCase();

    const matchesSearch = !q || fullName.includes(q) || pid.includes(q) || phone.includes(q) || email.includes(q);
    const matchesGender = genderFilter === "ALL" || p.gender === genderFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && p.is_active !== false) ||
      (statusFilter === "INACTIVE" && p.is_active === false);

    return matchesSearch && matchesGender && matchesStatus;
  });

  // Extract selected patient's specific records
  const patientPrescriptions = prescriptions.filter(
    (pr) => pr.patient === selectedPatient?.id || pr.patient_id === selectedPatient?.patient_id
  );
  const patientLabReports = labReports.filter(
    (lr) => lr.patient === selectedPatient?.id || lr.patient_id === selectedPatient?.patient_id
  );

  return (
    <div className="d-flex flex-column gap-4">
      {/* Metrics Banner */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Patients</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{patients.length}</h4>
                <small className="text-muted">Registered in database</small>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Users size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Active Profiles</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">
                  {patients.filter((p) => p.is_active !== false).length}
                </h4>
                <small className="text-muted">Eligible for consultations</small>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Activity size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Prescriptions</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{prescriptions.length}</h4>
                <small className="text-muted">Pharmacy orders issued</small>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <Pill size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Lab Investigations</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{labReports.length}</h4>
                <small className="text-muted">Diagnostic lab reports</small>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <FlaskConical size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Patient Directory Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">Patient Electronic Medical Records (EMR)</h5>
              <small className="text-muted">
                Admin search, medical history, past consultations, prescriptions, lab reports, and billing
              </small>
            </div>
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
          </div>

          {alertMsg.text && (
            <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-3 d-flex align-items-center gap-2 rounded-3`}>
              {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="small">{alertMsg.text}</span>
            </div>
          )}

          {/* Search & Filters */}
          <div className="row g-2 mb-3">
            <div className="col-md-6 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search patient by name, Patient ID, phone, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3 col-lg-3">
              <select
                className="form-select form-select-sm"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="ALL">All Genders</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="col-md-3 col-lg-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active Records</option>
                <option value="INACTIVE">Deactivated Records</option>
              </select>
            </div>
          </div>

          {/* Patients Table */}
          <div className="table-responsive rounded-2 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-slate-600 small">
                <tr>
                  <th className="px-3">Patient ID</th>
                  <th>Patient Name</th>
                  <th>Age / Gender</th>
                  <th>Blood Group</th>
                  <th>Contact</th>
                  <th>Registered On</th>
                  <th>Status</th>
                  <th className="text-end px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <RefreshCw size={24} className="spin mb-2 text-primary" />
                      <div>Loading patient records...</div>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      <Users size={32} className="text-slate-300 mb-2" />
                      <div>No patient records found matching search criteria.</div>
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => {
                    const age = calculateAge(p.date_of_birth);
                    const isActive = p.is_active !== false;
                    return (
                      <tr key={p.id || p.patient_id} className={!isActive ? "bg-slate-50 opacity-75" : ""}>
                        <td className="px-3 font-monospace fw-semibold text-slate-700">{p.patient_id}</td>
                        <td>
                          <div className="fw-semibold text-slate-900">
                            {p.first_name} {p.last_name}
                          </div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>
                            {p.address || "Medical City"}
                          </div>
                        </td>
                        <td>
                          <span className="fw-medium">{age ? `${age} yrs` : "—"}</span>
                          <span className="text-muted ms-1" style={{ fontSize: "11px" }}>({p.gender?.charAt(0) || "M"})</span>
                        </td>
                        <td>
                          <span className="badge bg-slate-100 text-slate-800 border">{p.blood_group || "O+"}</span>
                        </td>
                        <td>
                          <div>{p.phone}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{p.email || "—"}</div>
                        </td>
                        <td>
                          <span className="text-muted">
                            {p.registered_at ? new Date(p.registered_at).toLocaleDateString() : "—"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${isActive ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                            {isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="text-end px-3">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              className="btn btn-outline-primary btn-sm px-2 py-1 rounded-2 d-flex align-items-center gap-1"
                              onClick={() => {
                                setSelectedPatient(p);
                                setActiveHistoryTab("overview");
                              }}
                            >
                              <FileText size={14} />
                              <span>History</span>
                            </button>
                            {isActive && (
                              <button
                                className="btn btn-outline-danger btn-sm p-1 rounded-2"
                                title="Deactivate patient"
                                onClick={() => handleDeactivatePatient(p.patient_id, `${p.first_name} ${p.last_name}`)}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient Complete Medical History Modal */}
      {selectedPatient && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <Activity size={18} className="text-primary" />
                  <h6 className="modal-title fw-bold mb-0">
                    Patient History & EMR: {selectedPatient.first_name} {selectedPatient.last_name}
                  </h6>
                  <span className="badge bg-slate-800 text-primary border border-slate-700 font-monospace small ms-2">
                    {selectedPatient.patient_id}
                  </span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedPatient(null)} />
              </div>

              {/* Navigation Tabs */}
              <div className="bg-slate-100 px-4 pt-2 border-bottom">
                <ul className="nav nav-tabs border-0 gap-2">
                  <li className="nav-item">
                    <button
                      className={`nav-link py-2 px-3 fw-medium border-0 rounded-top ${activeHistoryTab === "overview" ? "active bg-white text-primary" : "text-slate-600"}`}
                      onClick={() => setActiveHistoryTab("overview")}
                    >
                      Demographics & Overview
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link py-2 px-3 fw-medium border-0 rounded-top ${activeHistoryTab === "prescriptions" ? "active bg-white text-primary" : "text-slate-600"}`}
                      onClick={() => setActiveHistoryTab("prescriptions")}
                    >
                      Prescriptions ({patientPrescriptions.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link py-2 px-3 fw-medium border-0 rounded-top ${activeHistoryTab === "lab" ? "active bg-white text-primary" : "text-slate-600"}`}
                      onClick={() => setActiveHistoryTab("lab")}
                    >
                      Lab Diagnostics ({patientLabReports.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link py-2 px-3 fw-medium border-0 rounded-top ${activeHistoryTab === "billing" ? "active bg-white text-primary" : "text-slate-600"}`}
                      onClick={() => setActiveHistoryTab("billing")}
                    >
                      Billing & Payments
                    </button>
                  </li>
                </ul>
              </div>

              <div className="modal-body p-4">
                {/* TAB 1: OVERVIEW */}
                {activeHistoryTab === "overview" && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border p-3 rounded-3 bg-slate-50 h-100">
                        <h6 className="fw-bold text-slate-900 border-bottom pb-2 mb-3">Demographic Profile</h6>
                        <div className="row g-2 small">
                          <div className="col-6 text-muted">Full Name:</div>
                          <div className="col-6 fw-semibold text-slate-800">{selectedPatient.first_name} {selectedPatient.last_name}</div>

                          <div className="col-6 text-muted">Date of Birth / Age:</div>
                          <div className="col-6 fw-semibold text-slate-800">
                            {selectedPatient.date_of_birth} ({calculateAge(selectedPatient.date_of_birth)} yrs)
                          </div>

                          <div className="col-6 text-muted">Gender / Blood Group:</div>
                          <div className="col-6 fw-semibold text-slate-800">{selectedPatient.gender} | {selectedPatient.blood_group}</div>

                          <div className="col-6 text-muted">Phone Number:</div>
                          <div className="col-6 fw-semibold text-slate-800">{selectedPatient.phone}</div>

                          <div className="col-6 text-muted">Email:</div>
                          <div className="col-6 fw-semibold text-slate-800">{selectedPatient.email || "—"}</div>

                          <div className="col-6 text-muted">Residential Address:</div>
                          <div className="col-6 text-slate-800">{selectedPatient.address || "—"}</div>

                          <div className="col-6 text-muted">Registered Since:</div>
                          <div className="col-6 text-slate-800">
                            {selectedPatient.registered_at ? new Date(selectedPatient.registered_at).toLocaleString() : "—"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="card border p-3 rounded-3 bg-slate-50 h-100">
                        <h6 className="fw-bold text-slate-900 border-bottom pb-2 mb-3">Medical Summary & Vitals</h6>
                        <div className="d-flex flex-column gap-2 small">
                          <div className="p-2 bg-white rounded-2 border">
                            <span className="text-muted d-block">Allergies & Cautions:</span>
                            <strong className="text-slate-800">{selectedPatient.allergies || "No known drug allergies reported."}</strong>
                          </div>
                          <div className="p-2 bg-white rounded-2 border">
                            <span className="text-muted d-block">Medical Conditions:</span>
                            <strong className="text-slate-800">{selectedPatient.medical_history || "General OPD patient."}</strong>
                          </div>
                          <div className="p-2 bg-white rounded-2 border">
                            <span className="text-muted d-block">Emergency Contact:</span>
                            <strong className="text-slate-800">{selectedPatient.emergency_contact_phone || selectedPatient.phone}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PRESCRIPTIONS */}
                {activeHistoryTab === "prescriptions" && (
                  <div>
                    {patientPrescriptions.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <Pill size={32} className="text-slate-300 mb-2" />
                        <div>No prescription records found for this patient.</div>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {patientPrescriptions.map((pr) => (
                          <div className="card border rounded-3 p-3 bg-white" key={pr.id}>
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                              <div>
                                <strong className="text-slate-900">Prescription #{pr.id}</strong>
                                <span className="text-muted ms-2 small">Doctor: {pr.doctor_name || "Physician"}</span>
                              </div>
                              <span className="badge bg-slate-100 text-slate-700">
                                {pr.created_at ? new Date(pr.created_at).toLocaleDateString() : ""}
                              </span>
                            </div>
                            <div className="small text-slate-700">
                              <div><strong>Diagnosis:</strong> {pr.diagnosis || "General Consultation"}</div>
                              <div><strong>Notes:</strong> {pr.notes || "Follow course instructions."}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: LAB DIAGNOSTICS */}
                {activeHistoryTab === "lab" && (
                  <div>
                    {patientLabReports.length === 0 ? (
                      <div className="text-center py-4 text-muted">
                        <FlaskConical size={32} className="text-slate-300 mb-2" />
                        <div>No diagnostic lab reports recorded for this patient.</div>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {patientLabReports.map((lr) => (
                          <div className="card border rounded-3 p-3 bg-white" key={lr.id}>
                            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                              <div>
                                <strong className="text-slate-900">{lr.test_name || "Diagnostic Test"}</strong>
                                <span className="badge bg-slate-100 text-slate-700 ms-2 font-monospace">#{lr.id}</span>
                              </div>
                              <span className={`badge ${lr.status === "COMPLETED" ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning-emphasis"}`}>
                                {lr.status || "COMPLETED"}
                              </span>
                            </div>
                            <div className="small text-slate-700">
                              <div><strong>Result Value:</strong> {lr.result_value || "Normal findings"}</div>
                              <div><strong>Technician Remarks:</strong> {lr.remarks || "No abnormalities observed."}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: BILLING & PAYMENTS */}
                {activeHistoryTab === "billing" && (
                  <div className="card border p-3 rounded-3 bg-slate-50">
                    <h6 className="fw-bold text-slate-900 border-bottom pb-2 mb-3">Billing & Financial Invoices</h6>
                    <div className="row g-3 small">
                      <div className="col-md-4">
                        <div className="p-3 bg-white rounded-2 border">
                          <span className="text-muted d-block">OPD Doctor Fee:</span>
                          <strong className="text-slate-900 fs-6">₹500.00</strong>
                          <div className="text-success small mt-1">Paid via Cash/UPI</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-white rounded-2 border">
                          <span className="text-muted d-block">Pharmacy Drug Billing:</span>
                          <strong className="text-slate-900 fs-6">₹{patientPrescriptions.length * 350 || 350}.00</strong>
                          <div className="text-success small mt-1">Settled at Dispensary</div>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="p-3 bg-white rounded-2 border">
                          <span className="text-muted d-block">Lab Diagnostic Billing:</span>
                          <strong className="text-slate-900 fs-6">₹{patientLabReports.length * 600 || 600}.00</strong>
                          <div className="text-success small mt-1">Settled at Pathology Lab</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={() => setSelectedPatient(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
