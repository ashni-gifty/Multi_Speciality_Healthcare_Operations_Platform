import React, { useEffect, useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Building,
  Phone,
  Mail,
  Calendar,
  Award,
  Clock,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import staffService, { calculateAge } from "../../services/staffService";
import StaffForm from "./StaffForm";

const StaffList = () => {
  const [staffList, setStaffList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deptFilter, setDeptFilter] = useState("ALL");

  // Modals & Feedback
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [viewingStaff, setViewingStaff] = useState(null);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [staffData, deptData] = await Promise.all([
        staffService.getStaff(),
        staffService.getDepartments().catch(() => []),
      ]);
      setStaffList(staffData);
      setDepartments(deptData);
    } catch (err) {
      console.error("Error loading staff data:", err);
      showAlert("danger", "Failed to fetch staff directory from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeactivate = async (staffId, name) => {
    if (!window.confirm(`Are you sure you want to deactivate staff member ${name} (${staffId})? This will suspend system login access while preserving clinical history.`)) {
      return;
    }
    try {
      await staffService.deactivateStaff(staffId);
      setStaffList((prev) =>
        prev.map((s) => (s.staff_id === staffId ? { ...s, status: "INACTIVE" } : s))
      );
      showAlert("success", `Staff member ${name} deactivated successfully.`);
    } catch (err) {
      showAlert("danger", `Failed to deactivate staff: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleSavedStaff = (savedItem, isEditMode) => {
    if (isEditMode) {
      setStaffList((prev) =>
        prev.map((s) => (s.staff_id === savedItem.staff_id ? savedItem : s))
      );
      showAlert("success", `Staff member ${savedItem.first_name} ${savedItem.last_name} updated successfully!`);
    } else {
      setStaffList((prev) => [savedItem, ...prev]);
      showAlert("success", `Staff member ${savedItem.first_name} ${savedItem.last_name} created successfully!`);
    }
  };

  // Filter staff list
  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase();
    const staffId = (s.staff_id || "").toLowerCase();
    const email = (s.email || "").toLowerCase();
    const phone = (s.phone || "").toLowerCase();
    const role = (s.role || "").toLowerCase();
    const dept = (s.department_name || "").toLowerCase();

    const matchesSearch =
      !q ||
      fullName.includes(q) ||
      staffId.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      role.includes(q) ||
      dept.includes(q);

    const matchesRole = roleFilter === "ALL" || s.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchesDept = deptFilter === "ALL" || String(s.department) === String(deptFilter);

    return matchesSearch && matchesRole && matchesStatus && matchesDept;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner & Quick Metrics */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Personnel</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{staffList.length}</h4>
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
                <span className="text-muted small fw-semibold text-uppercase">Active Doctors</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">
                  {staffList.filter((s) => s.role === "DOCTOR" && s.status === "ACTIVE").length}
                </h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Stethoscope size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Support Staff</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">
                  {staffList.filter((s) => s.role !== "DOCTOR" && s.status === "ACTIVE").length}
                </h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <Building size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Deactivated</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">
                  {staffList.filter((s) => s.status === "INACTIVE").length}
                </h4>
              </div>
              <div className="p-3 bg-danger-subtle text-danger rounded-3">
                <ShieldAlert size={22} />
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
              <h5 className="fw-bold mb-0 text-slate-900">Healthcare Staff Directory</h5>
              <small className="text-muted">
                Admin view, role assignment, credential administration, and credential lifecycle
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                onClick={loadData}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} />
                <span>Refresh</span>
              </button>
              <button
                className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3 py-2"
                onClick={() => {
                  setEditingStaff(null);
                  setShowStaffForm(true);
                }}
              >
                <UserPlus size={16} />
                <span>Add Staff Member</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {alertMsg.text && (
            <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-3 d-flex align-items-center gap-2 rounded-3`}>
              {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="small">{alertMsg.text}</span>
            </div>
          )}

          {/* Search & Filters Toolbar */}
          <div className="row g-2 mb-3">
            <div className="col-md-4 col-lg-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by name, ID, phone, email, dept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3 col-lg-2">
              <select
                className="form-select form-select-sm"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="ALL">All Roles ({staffList.length})</option>
                <option value="DOCTOR">Doctors</option>
                <option value="RECEPTIONIST">Receptionists</option>
                <option value="PHARMACIST">Pharmacists</option>
                <option value="LAB_TECHNICIAN">Lab Technicians</option>
              </select>
            </div>

            <div className="col-md-3 col-lg-3">
              <select
                className="form-select form-select-sm"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2 col-lg-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Staff Table */}
          <div className="table-responsive rounded-2 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-slate-600 small">
                <tr>
                  <th className="px-3">Staff ID</th>
                  <th>Name & Credentials</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Age / Gender</th>
                  <th>Fee / Exp</th>
                  <th>Status</th>
                  <th className="text-end px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="text-center py-5 text-muted">
                      <RefreshCw size={24} className="spin mb-2 text-primary" />
                      <div>Loading staff directory...</div>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center text-muted py-5">
                      <Users size={32} className="text-slate-300 mb-2" />
                      <div>No staff members found matching search and filter criteria.</div>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((s) => {
                    const age = calculateAge(s.date_of_birth);
                    return (
                      <tr key={s.id || s.staff_id} className={s.status === "INACTIVE" ? "opacity-75 bg-slate-50" : ""}>
                        <td className="px-3 fw-semibold font-monospace text-slate-700">{s.staff_id}</td>
                        <td>
                          <div className="fw-semibold text-slate-900">
                            {s.first_name} {s.last_name}
                          </div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>
                            {s.degree || "Healthcare Professional"}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill px-2 py-1 ${
                              s.role === "DOCTOR"
                                ? "bg-primary-subtle text-primary"
                                : s.role === "RECEPTIONIST"
                                ? "bg-success-subtle text-success"
                                : s.role === "PHARMACIST"
                                ? "bg-warning-subtle text-warning-emphasis"
                                : "bg-info-subtle text-info-emphasis"
                            }`}
                          >
                            {s.role}
                          </span>
                        </td>
                        <td>{s.department_name || "General Medicine"}</td>
                        <td>
                          <div>{s.phone}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{s.email}</div>
                        </td>
                        <td>
                          <span className="fw-medium">{age ? `${age} yrs` : "N/A"}</span>
                          <span className="text-muted ms-1" style={{ fontSize: "11px" }}>({s.gender?.charAt(0) || "M"})</span>
                        </td>
                        <td>
                          {s.role === "DOCTOR" && s.consultation_fee ? (
                            <span className="text-emerald-600 fw-semibold">₹{s.consultation_fee}</span>
                          ) : (
                            <span className="text-muted">{s.work_experience || 0} yrs</span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill ${
                              s.status === "ACTIVE"
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="text-end px-3">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm p-1 rounded-2"
                              title="View full profile"
                              onClick={() => setViewingStaff(s)}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm p-1 rounded-2"
                              title="Edit staff details"
                              onClick={() => {
                                setEditingStaff(s);
                                setShowStaffForm(true);
                              }}
                            >
                              <Edit size={14} />
                            </button>
                            {s.status === "ACTIVE" && s.role !== "ADMIN" && (
                              <button
                                className="btn btn-outline-danger btn-sm p-1 rounded-2"
                                title="Deactivate staff"
                                onClick={() => handleDeactivate(s.staff_id, s.first_name)}
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

      {/* Staff Create / Edit Modal Form */}
      <StaffForm
        show={showStaffForm}
        onClose={() => {
          setShowStaffForm(false);
          setEditingStaff(null);
        }}
        onSaved={handleSavedStaff}
        initialData={editingStaff}
        departments={departments}
      />

      {/* View Staff Profile Modal */}
      {viewingStaff && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <Eye size={18} className="text-primary" />
                  <h6 className="modal-title fw-bold mb-0">
                    Staff Profile: {viewingStaff.first_name} {viewingStaff.last_name}
                  </h6>
                  <span className="badge bg-slate-800 text-primary-emphasis border border-slate-700 font-monospace small ms-2">
                    {viewingStaff.staff_id}
                  </span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingStaff(null)} />
              </div>

              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 p-3 bg-slate-50 rounded-3 border border-slate-100 mb-3">
                  <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5" style={{ width: "48px", height: "48px" }}>
                    {viewingStaff.first_name?.charAt(0)}
                  </div>
                  <div>
                    <h6 className="fw-bold mb-0 text-slate-900">
                      {viewingStaff.first_name} {viewingStaff.last_name}
                    </h6>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className="badge bg-primary-subtle text-primary">{viewingStaff.role}</span>
                      <span className={`badge ${viewingStaff.status === "ACTIVE" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                        {viewingStaff.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="row g-3 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Department:</span>
                    <strong className="text-slate-800">{viewingStaff.department_name || "General Medicine"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Qualification:</span>
                    <strong className="text-slate-800">{viewingStaff.degree || "N/A"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Age / DOB:</span>
                    <strong className="text-slate-800">
                      {calculateAge(viewingStaff.date_of_birth)} yrs ({viewingStaff.date_of_birth || "N/A"})
                    </strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Gender / Blood Group:</span>
                    <strong className="text-slate-800">{viewingStaff.gender} | {viewingStaff.blood_group}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Phone:</span>
                    <strong className="text-slate-800">{viewingStaff.phone}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Email:</span>
                    <strong className="text-slate-800">{viewingStaff.email}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Experience:</span>
                    <strong className="text-slate-800">{viewingStaff.work_experience || 0} Years</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Joining Date:</span>
                    <strong className="text-slate-800">{viewingStaff.joining_date || "N/A"}</strong>
                  </div>
                  {viewingStaff.role === "DOCTOR" && (
                    <div className="col-12 p-2 bg-emerald-subtle rounded-2">
                      <span className="text-muted d-block">Doctor Consultation Fee:</span>
                      <strong className="text-success fs-6">₹{viewingStaff.consultation_fee || 500}</strong>
                    </div>
                  )}
                  <div className="col-12">
                    <span className="text-muted d-block">Residential Address:</span>
                    <span className="text-slate-700">{viewingStaff.address || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-2"
                  onClick={() => {
                    setEditingStaff(viewingStaff);
                    setViewingStaff(null);
                    setShowStaffForm(true);
                  }}
                >
                  Edit Profile
                </button>
                <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={() => setViewingStaff(null)}>
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

export default StaffList;
