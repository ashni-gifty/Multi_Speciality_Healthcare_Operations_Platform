import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  Edit,
  CalendarPlus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  ShieldCheck,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import receptionistService from "../../services/receptionistService";

const emptyPatientForm = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  gender: "FEMALE",
  blood_group: "O+",
  address: "",
  phone: "",
  email: "",
  next_visit_date: "",
};

const PatientRegistration = ({
  patients = [],
  onPatientAdded,
  onBookAppointment,
  showAlert,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState("ALL");
  const [bloodGroupFilter, setBloodGroupFilter] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [formData, setFormData] = useState(emptyPatientForm);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenAddModal = () => {
    setEditingPatient(null);
    setFormData(emptyPatientForm);
    setShowModal(true);
  };

  const handleOpenEditModal = (patient) => {
    setEditingPatient(patient);
    setFormData({
      first_name: patient.first_name || "",
      last_name: patient.last_name || "",
      date_of_birth: patient.date_of_birth || "",
      gender: patient.gender || "MALE",
      blood_group: patient.blood_group || "O+",
      address: patient.address || "",
      phone: patient.phone || "",
      email: patient.email || "",
      next_visit_date: patient.next_visit_date || "",
    });
    setShowModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.phone) {
      if (showAlert) showAlert("danger", "First name and phone number are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (!payload.email) delete payload.email;
      if (!payload.next_visit_date) delete payload.next_visit_date;
      if (!payload.date_of_birth) delete payload.date_of_birth;

      if (editingPatient) {
        const updated = await receptionistService.updatePatient(
          editingPatient.id || editingPatient.patient_id,
          payload
        );
        if (showAlert) showAlert("success", `Patient ${updated.patient_id || "record"} updated successfully!`);
      } else {
        const created = await receptionistService.createPatient(payload);
        if (showAlert) showAlert("success", `Patient ${created.patient_id || ""} registered successfully!`);
      }

      setShowModal(false);
      setFormData(emptyPatientForm);
      if (onPatientAdded) onPatientAdded();
    } catch (err) {
      console.error("Patient save error:", err);
      const errData = err?.response?.data;
      let errMsg = "Failed to save patient record.";
      if (typeof errData === "string") {
        errMsg = errData;
      } else if (errData?.detail) {
        errMsg = errData.detail;
      } else if (errData && typeof errData === "object") {
        errMsg = Object.entries(errData)
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${Array.isArray(v) ? v.join(", ") : v}`)
          .join(" | ");
      } else if (err?.message) {
        errMsg = err.message;
      }
      if (showAlert) showAlert("danger", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase().trim();
    const name = (p.full_name || `${p.first_name || ""} ${p.last_name || ""}`).toLowerCase();
    const matchesSearch =
      !term ||
      name.includes(term) ||
      (p.patient_id && p.patient_id.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term));

    const matchesGender = genderFilter === "ALL" || p.gender === genderFilter;
    const matchesBlood = bloodGroupFilter === "ALL" || p.blood_group === bloodGroupFilter;

    return matchesSearch && matchesGender && matchesBlood;
  });

  const maleCount = patients.filter((p) => p.gender === "MALE").length;
  const femaleCount = patients.filter((p) => p.gender === "FEMALE").length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner & Quick Metrics */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Registered</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{patients.length}</h4>
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
                <span className="text-muted small fw-semibold text-uppercase">Female Patients</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{femaleCount}</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Users size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Male Patients</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{maleCount}</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Users size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Registry Status</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">Active</h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <ShieldCheck size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          {/* Header Controls */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">Patient Medical Registry</h5>
              <p className="text-muted small mb-0">
                Search, register, and manage patient electronic medical profiles.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                onClick={onPatientAdded}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
              <button
                className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3 py-2"
                onClick={handleOpenAddModal}
              >
                <UserPlus size={16} />
                <span>Register Patient</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="row g-2 mb-3">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Patient ID, Name, or Phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                <option value="FEMALE">Female</option>
                <option value="MALE">Male</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="col-md-3 col-lg-3">
              <select
                className="form-select form-select-sm"
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
              >
                <option value="ALL">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>

          {/* Patient Directory Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted small text-uppercase">Patient ID</th>
                  <th className="border-0 text-muted small text-uppercase">Name & Demographics</th>
                  <th className="border-0 text-muted small text-uppercase">Contact Details</th>
                  <th className="border-0 text-muted small text-uppercase">Blood Group</th>
                  <th className="border-0 text-muted small text-uppercase">Registered</th>
                  <th className="border-0 text-muted small text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => {
                  const fullName =
                    patient.full_name ||
                    `${patient.first_name || ""} ${patient.last_name || ""}`.trim() ||
                    "Patient";
                  const pId = patient.patient_id || `#${patient.id}`;

                  return (
                    <tr key={patient.id || patient.patient_id}>
                      <td>
                        <span className="badge bg-blue-subtle text-primary font-monospace fw-bold px-2 py-1">
                          {pId}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold text-slate-900">{fullName}</div>
                          <div className="text-muted small">
                            {patient.age ? `${patient.age} yrs` : patient.date_of_birth || "-"} •{" "}
                            <span className="text-capitalize">{patient.gender?.toLowerCase() || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          <div className="d-flex align-items-center gap-1 text-slate-700">
                            <Phone size={13} className="text-muted" /> {patient.phone || "-"}
                          </div>
                          {patient.email && (
                            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "11px" }}>
                              <Mail size={12} /> {patient.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-danger-subtle text-danger rounded-pill px-2 py-1 small">
                          <Droplet size={11} className="me-1" />
                          {patient.blood_group || "Unknown"}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {patient.created_at
                          ? new Date(patient.created_at).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light text-primary rounded-2 p-1"
                            title="Quick Book Appointment"
                            onClick={() => onBookAppointment && onBookAppointment(patient)}
                          >
                            <CalendarPlus size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-light text-secondary rounded-2 p-1"
                            title="View Details"
                            onClick={() => setViewingPatient(patient)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-light text-warning rounded-2 p-1"
                            title="Edit Patient"
                            onClick={() => handleOpenEditModal(patient)}
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <Users size={36} className="text-muted opacity-50 mb-2" />
                        <h6 className="fw-semibold text-slate-700 mb-1">No patients found</h6>
                        <small>Try adjusting your search criteria or register a new patient.</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: ADD / EDIT PATIENT */}
      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3 border-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white">
                      {editingPatient ? `Edit Patient: ${editingPatient.patient_id}` : "Register New Patient"}
                    </h6>
                    <small className="text-slate-400">Enter patient personal & demographic details</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        First Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        className="form-control"
                        placeholder="e.g. John"
                        value={formData.first_name}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        className="form-control"
                        placeholder="e.g. Doe"
                        value={formData.last_name}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700">Date of Birth</label>
                      <input
                        type="date"
                        name="date_of_birth"
                        className="form-control"
                        value={formData.date_of_birth}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700">Gender</label>
                      <select
                        name="gender"
                        className="form-select"
                        value={formData.gender}
                        onChange={handleFormChange}
                      >
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700">Blood Group</label>
                      <select
                        name="blood_group"
                        className="form-select"
                        value={formData.blood_group}
                        onChange={handleFormChange}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        className="form-control"
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={handleFormChange}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="patient@example.com (optional)"
                        value={formData.email}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700">Residential Address</label>
                      <textarea
                        name="address"
                        rows="2"
                        className="form-control"
                        placeholder="Street, City, Postal Code"
                        value={formData.address}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3 border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-2 px-3"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm rounded-2 px-4 fw-medium shadow-xs"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : editingPatient ? "Save Changes" : "Register Patient"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW PATIENT DETAILS */}
      {viewingPatient && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3 border-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                    <Eye size={18} />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white">Patient Profile</h6>
                    <small className="text-slate-400">{viewingPatient.patient_id}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setViewingPatient(null)}
                />
              </div>

              <div className="modal-body p-4">
                <div className="text-center pb-3 border-bottom mb-3">
                  <div className="avatar bg-primary text-white rounded-circle mx-auto d-flex align-items-center justify-content-center fs-4 mb-2" style={{ width: "56px", height: "56px" }}>
                    {(viewingPatient.first_name || "P").charAt(0).toUpperCase()}
                  </div>
                  <h5 className="fw-bold text-slate-900 mb-0">
                    {viewingPatient.full_name || `${viewingPatient.first_name || ""} ${viewingPatient.last_name || ""}`}
                  </h5>
                  <span className="badge bg-blue-subtle text-primary mt-1 font-monospace">
                    {viewingPatient.patient_id}
                  </span>
                </div>

                <div className="row g-2 small">
                  <div className="col-6 text-muted">Gender:</div>
                  <div className="col-6 fw-semibold text-slate-800">{viewingPatient.gender || "-"}</div>

                  <div className="col-6 text-muted">Date of Birth:</div>
                  <div className="col-6 fw-semibold text-slate-800">{viewingPatient.date_of_birth || "-"}</div>

                  <div className="col-6 text-muted">Blood Group:</div>
                  <div className="col-6 fw-semibold text-danger">{viewingPatient.blood_group || "-"}</div>

                  <div className="col-6 text-muted">Phone:</div>
                  <div className="col-6 fw-semibold text-slate-800">{viewingPatient.phone || "-"}</div>

                  <div className="col-6 text-muted">Email:</div>
                  <div className="col-6 fw-semibold text-slate-800">{viewingPatient.email || "None"}</div>

                  <div className="col-6 text-muted">Address:</div>
                  <div className="col-6 fw-semibold text-slate-800">{viewingPatient.address || "None"}</div>

                  <div className="col-6 text-muted">Registered On:</div>
                  <div className="col-6 fw-semibold text-slate-800">
                    {viewingPatient.created_at ? new Date(viewingPatient.created_at).toLocaleDateString("en-IN") : "-"}
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light px-4 py-3 border-0 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-2"
                  onClick={() => setViewingPatient(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1"
                  onClick={() => {
                    const p = viewingPatient;
                    setViewingPatient(null);
                    if (onBookAppointment) onBookAppointment(p);
                  }}
                >
                  <CalendarPlus size={14} /> Book Appointment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRegistration;
