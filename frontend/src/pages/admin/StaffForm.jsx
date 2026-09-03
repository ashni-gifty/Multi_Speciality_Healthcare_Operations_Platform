import React, { useEffect, useState } from "react";
import { UserPlus, Edit, AlertCircle, Calendar, DollarSign, Shield, X } from "lucide-react";
import staffService, { calculateAge } from "../../services/staffService";

const StaffForm = ({ show, onClose, onSaved, initialData = null, departments = [] }) => {
  const isEditMode = Boolean(initialData && initialData.staff_id);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "DOCTOR",
    staff_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "MALE",
    blood_group: "O+",
    address: "",
    phone: "",
    department: departments[0]?.id || 1,
    degree: "",
    work_experience: "",
    joining_date: new Date().toISOString().split("T")[0],
    consultation_fee: "",
    status: "ACTIVE",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "DOCTOR",
        staff_id: initialData.staff_id || "",
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        date_of_birth: initialData.date_of_birth || "",
        gender: initialData.gender || "MALE",
        blood_group: initialData.blood_group || "O+",
        address: initialData.address || "",
        phone: initialData.phone || "",
        department: initialData.department || (departments[0]?.id || 1),
        degree: initialData.degree || "",
        work_experience: initialData.work_experience !== undefined ? initialData.work_experience : "",
        joining_date: initialData.joining_date || new Date().toISOString().split("T")[0],
        consultation_fee: initialData.consultation_fee !== null && initialData.consultation_fee !== undefined ? initialData.consultation_fee : "",
        status: initialData.status || "ACTIVE",
      });
    } else {
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "DOCTOR",
        staff_id: "",
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "MALE",
        blood_group: "O+",
        address: "",
        phone: "",
        department: departments[0]?.id || 1,
        degree: "",
        work_experience: "",
        joining_date: new Date().toISOString().split("T")[0],
        consultation_fee: "",
        status: "ACTIVE",
      });
    }
    setErrorMsg("");
  }, [initialData, isEditMode, departments, show]);

  useEffect(() => {
    if (!show) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [show]);

  if (!show) return null;

  const calculatedAge = calculateAge(formData.date_of_birth);

  const handleRoleChange = (newRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      consultation_fee: newRole === "DOCTOR" ? prev.consultation_fee : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const payload = {
      ...formData,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      role: formData.role,
      department: parseInt(formData.department, 10) || (departments[0]?.id || 1),
      work_experience: parseInt(formData.work_experience, 10) || 0,
      degree: formData.degree.trim(),
      address: formData.address.trim(),
      consultation_fee:
        formData.role === "DOCTOR" && formData.consultation_fee
          ? parseFloat(formData.consultation_fee)
          : null,
    };

    if (!isEditMode) {
      payload.username = formData.username.trim();
      payload.staff_id = formData.staff_id.trim().toUpperCase();
      payload.password = formData.password;
    } else {
      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      } else {
        delete payload.password;
      }
    }

    try {
      let result;
      if (isEditMode) {
        result = await staffService.updateStaff(formData.staff_id, payload);
      } else {
        result = await staffService.createStaff(payload);
      }
      onSaved(result, isEditMode);
      onClose();
    } catch (err) {
      let msg = `Failed to ${isEditMode ? "update" : "create"} staff member.`;
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          msg = err.response.data;
        } else if (typeof err.response.data === "object") {
          msg = Object.entries(err.response.data)
            .map(([field, errs]) => `${field.replace(/_/g, " ")}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
            .join(" | ");
        }
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block bg-dark bg-opacity-50"
      tabIndex="-1"
      style={{ zIndex: 1060, overscrollBehavior: "contain" }}
    >
      <div className="modal-dialog modal-lg my-3" style={{ height: "calc(100vh - 1.5rem)" }}>
        <div className="modal-content border-0 shadow-lg rounded-3 h-100">
          <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
            <div className="d-flex align-items-center gap-2">
              {isEditMode ? <Edit size={18} className="text-primary" /> : <UserPlus size={18} className="text-primary" />}
              <h6 className="modal-title fw-bold mb-0">
                {isEditMode ? `Edit Staff Member: ${formData.first_name} ${formData.last_name}` : "Add Healthcare Staff Member"}
              </h6>
              {isEditMode && formData.staff_id && (
                <span className="badge bg-slate-800 text-primary-emphasis border border-slate-700 font-monospace small ms-2">
                  {formData.staff_id}
                </span>
              )}
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <form onSubmit={handleSubmit} className="d-flex flex-column flex-grow-1 overflow-hidden">
            <div className="modal-body p-4 flex-grow-1 overflow-auto">
              {errorMsg && (
                <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2 rounded-2 small">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <div>{errorMsg}</div>
                </div>
              )}

              <div className="row g-3">
                {/* Role & Status Selection */}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-slate-800 mb-1">Select Role *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="PHARMACIST">Pharmacist</option>
                    <option value="LAB_TECHNICIAN">Lab Technician</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-slate-800 mb-1">
                    {isEditMode ? "Account Status *" : "Staff ID *"}
                  </label>
                  {isEditMode ? (
                    <select
                      className="form-select form-select-sm"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">Active (Can Login & Operate)</option>
                      <option value="INACTIVE">Inactive (Deactivated)</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="e.g. DOC001"
                      className="form-control form-control-sm text-uppercase font-monospace"
                      value={formData.staff_id}
                      onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    />
                  )}
                </div>

                {/* Names */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">First Name * (letters only)</label>
                  <input
                    type="text"
                    required
                    pattern="[A-Za-z]{3,40}"
                    title="3 to 40 letters only"
                    placeholder="Enter First Name"
                    className="form-control form-control-sm"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Last Name * (letters only)</label>
                  <input
                    type="text"
                    required
                    pattern="[A-Za-z]{3,40}"
                    title="3 to 40 letters only"
                    placeholder="Enter Last Name"
                    className="form-control form-control-sm"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>

                {/* Username & Password */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">
                    Username * {isEditMode && <span className="text-muted fw-normal">(Read-only)</span>}
                  </label>
                  <input
                    type="text"
                    required={!isEditMode}
                    disabled={isEditMode}
                    placeholder="Enter Username"
                    className={`form-control form-control-sm ${isEditMode ? "bg-slate-100 text-slate-600" : ""}`}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">
                    {isEditMode ? "New Password (optional)" : "Password * (min 6 chars)"}
                  </label>
                  <input
                    type="password"
                    required={!isEditMode}
                    minLength={6}
                    placeholder={isEditMode ? "Leave blank to keep unchanged" : "Enter Password"}
                    className="form-control form-control-sm"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>

                {/* Email & Phone */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter Email Address"
                    className="form-control form-control-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Phone Number * (10 digits)</label>
                  <input
                    type="tel"
                    required
                    pattern="[6-9][0-9]{9}"
                    title="10 digits starting with 6, 7, 8, or 9"
                    placeholder="Enter 10-digit Phone Number"
                    className="form-control form-control-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                {/* Department, Gender, Blood Group */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Department *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Blood Group *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Date of Birth & Live Age Display */}
                <div className="col-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold text-slate-700 mb-0">Date of Birth *</label>
                    {calculatedAge !== "" && (
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill font-monospace" style={{ fontSize: "10px" }}>
                        Age: {calculatedAge} yrs
                      </span>
                    )}
                  </div>
                  <input
                    type="date"
                    required
                    className="form-control form-control-sm"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>

                {/* Experience & Degree */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    placeholder="0"
                    className="form-control form-control-sm"
                    value={formData.work_experience}
                    onChange={(e) => setFormData({ ...formData, work_experience: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Degree / Qualification</label>
                  <input
                    type="text"
                    placeholder="Enter Degree / Qualification"
                    className="form-control form-control-sm"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  />
                </div>

                {/* Joining Date & Address */}
                <div className="col-md-4">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Joining Date *</label>
                  <input
                    type="date"
                    required
                    className="form-control form-control-sm"
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label small fw-semibold text-slate-700 mb-1">Residential Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter Residential Address"
                    className="form-control form-control-sm"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>

                {/* Doctor-Only Consultation Fee */}
                {formData.role === "DOCTOR" && (
                  <div className="col-12">
                    <div className="p-3 bg-primary-subtle rounded-3 border border-primary-subtle">
                      <label className="form-label small fw-bold text-primary mb-1 d-flex align-items-center gap-1">
                        <DollarSign size={14} /> Doctor Consultation Fee (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="50"
                        placeholder="Enter Consultation Fee (e.g. 500)"
                        className="form-control form-control-sm bg-white"
                        value={formData.consultation_fee || ""}
                        onChange={(e) => setFormData({ ...formData, consultation_fee: e.target.value })}
                      />
                      <small className="text-muted" style={{ fontSize: "11px" }}>
                        Consultation fee is charged to patients during OPD appointments and booking consultations.
                      </small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
              <button type="button" className="btn btn-light btn-sm rounded-2" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm rounded-2 px-3 fw-medium" disabled={submitting}>
                {submitting ? "Saving..." : isEditMode ? "Update Staff Member" : "Save Staff Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StaffForm;
