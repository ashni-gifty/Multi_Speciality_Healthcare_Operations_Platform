import React, { useEffect, useState } from "react";
import { Building2, Search, RefreshCw, CheckCircle2, AlertCircle, Users, Activity, Plus, Pencil, Power, X } from "lucide-react";
import staffService from "../../services/staffService";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    department_id: "",
    name: "",
    description: "",
    status: true,
  });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [deptData, staffData] = await Promise.all([
        staffService.getDepartments(true),
        staffService.getStaff().catch(() => []),
      ]);
      setDepartments(deptData);
      setStaffList(staffData);
    } catch (err) {
      console.error("Error loading departments:", err);
      showAlert("danger", "Failed to fetch departments from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateForm = () => {
    setEditingDepartment(null);
    setFormData({ department_id: "", name: "", description: "", status: true });
    setShowForm(true);
  };

  const openEditForm = (department) => {
    setEditingDepartment(department);
    setFormData({
      department_id: department.department_id,
      name: department.name,
      description: department.description || "",
      status: department.status !== false,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingDepartment) {
        await staffService.updateDepartment(editingDepartment.department_id, formData);
        showAlert("success", "Department updated successfully.");
      } else {
        await staffService.createDepartment(formData);
        showAlert("success", "Department added successfully.");
      }
      closeForm();
      await loadData();
    } catch (err) {
      const errors = err.response?.data;
      const message = errors?.detail || Object.values(errors || {}).flat().join(" ") || "Unable to save the department.";
      showAlert("danger", message);
    } finally {
      setSaving(false);
    }
  };

  const deactivateDepartment = async (department) => {
    if (!window.confirm(`Deactivate ${department.name}? It will no longer be available when adding staff.`)) return;
    try {
      await staffService.deactivateDepartment(department.department_id);
      showAlert("success", "Department deactivated successfully.");
      await loadData();
    } catch (err) {
      showAlert("danger", err.response?.data?.detail || "Unable to deactivate the department.");
    }
  };

  const filteredDepts = departments.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      d.name?.toLowerCase().includes(q) ||
      d.department_id?.toLowerCase().includes(q) ||
      d.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header & Metrics */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Departments</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{departments.length}</h4>
                <small className="text-muted">Clinical & Operational units</small>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Building2 size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Assigned Personnel</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{staffList.length}</h4>
                <small className="text-muted">Doctors & Healthcare Staff</small>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Users size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Operational Status</span>
                <h4 className="fw-bold mt-1 mb-0 text-success">100% Active</h4>
                <small className="text-muted">All units functional</small>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Activity size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Departments Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">Hospital Medical Departments</h5>
              <small className="text-muted">Specialities, clinical divisions, and administrative services</small>
            </div>
            <button
              className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={openCreateForm}
            >
              <Plus size={14} />
              <span>Add Department</span>
            </button>
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

          {showForm && (
            <form className="border rounded-3 bg-slate-50 p-3 mb-4" onSubmit={handleSubmit}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">{editingDepartment ? "Edit Department" : "Add Department"}</h6>
                <button type="button" className="btn btn-sm btn-light" onClick={closeForm} aria-label="Close form">
                  <X size={16} />
                </button>
              </div>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Department Code</label>
                  <input className="form-control form-control-sm" required maxLength="20" placeholder="CARD"
                    disabled={Boolean(editingDepartment)} value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value.toUpperCase() })} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Department Name</label>
                  <input className="form-control form-control-sm" required maxLength="100" placeholder="Cardiology"
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-semibold">Description</label>
                  <input className="form-control form-control-sm" maxLength="255" placeholder="Optional description"
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                {editingDepartment && (
                  <div className="col-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" id="department-status" checked={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })} />
                      <label className="form-check-label small" htmlFor="department-status">Department is active</label>
                    </div>
                  </div>
                )}
                <div className="col-12 d-flex justify-content-end gap-2">
                  <button type="button" className="btn btn-light btn-sm" onClick={closeForm}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                    {saving ? "Saving..." : editingDepartment ? "Save Changes" : "Add Department"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Search Toolbar */}
          <div className="row g-2 mb-3">
            <div className="col-md-6 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search department name, code, description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Department Cards Grid */}
          <div className="row g-3">
            {loading ? (
              <div className="col-12 text-center py-5 text-muted">
                <RefreshCw size={24} className="spin mb-2 text-primary" />
                <div>Loading departments...</div>
              </div>
            ) : filteredDepts.length === 0 ? (
              <div className="col-12 text-center py-5 text-muted">
                <Building2 size={32} className="text-slate-300 mb-2" />
                <div>No departments found matching search criteria.</div>
              </div>
            ) : (
              filteredDepts.map((d) => {
                const assignedStaff = staffList.filter((s) => s.department === d.id);
                const doctorCount = assignedStaff.filter((s) => s.role === "DOCTOR").length;
                const otherCount = assignedStaff.length - doctorCount;

                return (
                  <div className="col-md-6 col-lg-4" key={d.id}>
                    <div className="card border rounded-3 p-3 h-100 bg-white shadow-xs hover-shadow transition">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="p-2 bg-primary-subtle text-primary rounded-2">
                            <Building2 size={18} />
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0 text-slate-900">{d.name}</h6>
                            <span className="badge bg-slate-100 text-slate-700 font-monospace" style={{ fontSize: "10px" }}>
                              {d.department_id}
                            </span>
                          </div>
                        </div>
                        <span className={`badge rounded-pill ${d.status !== false ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                          {d.status !== false ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="text-muted small mb-3 flex-grow-1" style={{ minHeight: "36px" }}>
                        {d.description || "General hospital medical care and consultation division."}
                      </p>

                      <div className="d-flex justify-content-between align-items-center pt-2 border-top small">
                        <span className="text-muted">Assigned Personnel:</span>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-primary-subtle text-primary">{doctorCount} Doctors</span>
                          <span className="badge bg-slate-100 text-slate-700">{otherCount} Staff</span>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-3">
                        <button className="btn btn-outline-primary btn-sm flex-fill d-flex justify-content-center align-items-center gap-1" onClick={() => openEditForm(d)}>
                          <Pencil size={13} /> Edit
                        </button>
                        {d.status !== false && (
                          <button className="btn btn-outline-danger btn-sm d-flex justify-content-center align-items-center gap-1" onClick={() => deactivateDepartment(d)}>
                            <Power size={13} /> Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;
