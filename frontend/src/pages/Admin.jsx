import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  UserCog,
  Pill,
  LogOut,
  Search,
  Plus,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Stethoscope,
  UserPlus,
  Calendar,
  Clock,
  Shield,
  Activity,
  Menu,
  X,
  Package,
  AlertTriangle,
  Layers,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation: 'dashboard' | 'staff' | 'inventory'
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [staffList, setStaffList] = useState([]);
  const [medicinesList, setMedicinesList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showMedModal, setShowMedModal] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });
  const [staffModalError, setStaffModalError] = useState("");
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Forms
  const [staffForm, setStaffForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "DOCTOR",
    staff_id: "",
    first_name: "",
    last_name: "",
    date_of_birth: "1992-05-15",
    gender: "MALE",
    blood_group: "O+",
    address: "Medical City",
    phone: "",
    department: 1,
    degree: "MBBS",
    work_experience: 5,
    joining_date: new Date().toISOString().split("T")[0],
    consultation_fee: 500,
  });

  const [medForm, setMedForm] = useState({
    name: "",
    generic_name: "",
    category: "TABLET",
    dosage_form: "500mg",
    batch_number: "",
    manufacturer: "",
    quantity: 100,
    reorder_level: 20,
    unit_price: "10.00",
    cost_price: "5.00",
    expiry_date: "2027-12-31",
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
    setLoading(true);
    const headers = getHeaders();

    try {
      const res = await axios.get(`${API_URL}/staff/`, { headers });
      if (Array.isArray(res.data)) setStaffList(res.data);
    } catch (e) {
      console.error("Error loading staff:", e);
    }

    try {
      const res = await axios.get(`${API_URL}/pharmacy/medicines/`, { headers });
      if (Array.isArray(res.data)) setMedicinesList(res.data);
    } catch (e) {
      console.error("Error loading medicines:", e);
    }

    try {
      const res = await axios.get(`${API_URL}/departments/`, { headers });
      if (Array.isArray(res.data)) {
        setDepartments(res.data);
        if (res.data.length > 0 && !staffForm.department) {
          setStaffForm((prev) => ({ ...prev, department: res.data[0].id }));
        }
      }
    } catch (e) {
      console.error("Error loading departments:", e);
    }

    try {
      const resPatients = await axios.get(`${API_URL}/patients/`, { headers });
      if (Array.isArray(resPatients.data)) {
        setTotalPatients(resPatients.data.length);
      }
    } catch (e) {
      console.error("Error loading patients:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (newRole) => {
    let defaultDegree = "MBBS";
    if (newRole === "RECEPTIONIST") defaultDegree = "B.Com";
    else if (newRole === "PHARMACIST") defaultDegree = "B.Pharm";
    else if (newRole === "LAB_TECHNICIAN") defaultDegree = "B.Sc MLT";

    setStaffForm((prev) => ({
      ...prev,
      role: newRole,
      degree: defaultDegree,
      consultation_fee: newRole === "DOCTOR" ? 500 : null,
    }));
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setStaffModalError("");
    setSubmittingStaff(true);

    const headers = getHeaders();
    const payload = {
      ...staffForm,
      first_name: staffForm.first_name.trim(),
      last_name: staffForm.last_name.trim(),
      username: staffForm.username.trim(),
      email: staffForm.email.trim(),
      phone: staffForm.phone.trim(),
      staff_id: staffForm.staff_id.trim().toUpperCase(),
      work_experience: parseInt(staffForm.work_experience, 10) || 0,
      department: parseInt(staffForm.department, 10) || (departments[0]?.id || 1),
      consultation_fee:
        staffForm.role === "DOCTOR" && staffForm.consultation_fee
          ? parseFloat(staffForm.consultation_fee)
          : null,
    };

    try {
      const res = await axios.post(`${API_URL}/staff/`, payload, { headers });
      setStaffList([res.data, ...staffList]);
      setShowStaffModal(false);
      showAlert("success", `Staff member ${payload.first_name} (${payload.role}) added successfully!`);
      // Reset form
      setStaffForm({
        username: "",
        email: "",
        password: "",
        role: "DOCTOR",
        staff_id: "",
        first_name: "",
        last_name: "",
        date_of_birth: "1992-05-15",
        gender: "MALE",
        blood_group: "O+",
        address: "Medical City",
        phone: "",
        department: departments[0]?.id || 1,
        degree: "MBBS",
        work_experience: 5,
        joining_date: new Date().toISOString().split("T")[0],
        consultation_fee: 500,
      });
    } catch (err) {
      let errorMsg = "Failed to add staff member.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMsg = err.response.data;
        } else if (typeof err.response.data === "object") {
          errorMsg = Object.entries(err.response.data)
            .map(([field, errs]) => `${field.replace(/_/g, " ")}: ${Array.isArray(errs) ? errs.join(", ") : errs}`)
            .join(" | ");
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      setStaffModalError(errorMsg);
      showAlert("danger", errorMsg);
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleDeleteStaff = async (staffId, name) => {
    if (!window.confirm(`Are you sure you want to deactivate staff member ${name}?`)) return;
    const headers = getHeaders();
    try {
      await axios.delete(`${API_URL}/staff/${staffId}/`, { headers });
      setStaffList(staffList.map((s) => (s.staff_id === staffId ? { ...s, status: "INACTIVE" } : s)));
      showAlert("success", `Staff ${name} deactivated successfully.`);
    } catch (err) {
      showAlert("danger", `Failed to deactivate staff: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    const headers = getHeaders();
    const payload = {
      ...medForm,
      quantity: parseInt(medForm.quantity, 10) || 0,
      reorder_level: parseInt(medForm.reorder_level, 10) || 20,
      unit_price: parseFloat(medForm.unit_price) || 0,
    };

    try {
      const res = await axios.post(`${API_URL}/pharmacy/medicines/`, payload, { headers });
      setMedicinesList([res.data, ...medicinesList]);
      setShowMedModal(false);
      showAlert("success", `Medicine ${medForm.name} added to inventory!`);
      // Reset form
      setMedForm({
        name: "",
        generic_name: "",
        category: "TABLET",
        dosage_form: "500mg",
        batch_number: "",
        manufacturer: "",
        quantity: 100,
        reorder_level: 20,
        unit_price: "10.00",
        cost_price: "5.00",
        expiry_date: "2027-12-31",
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        (typeof err.response?.data === "object" ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("; ") : null) ||
        err.message ||
        "Failed to add medicine.";
      showAlert("danger", `Failed to add medicine: ${errorMsg}`);
    }
  };

  const handleDeleteMedicine = async (id, name) => {
    if (!window.confirm(`Delete ${name} from inventory?`)) return;
    const headers = getHeaders();
    try {
      await axios.delete(`${API_URL}/pharmacy/medicines/${id}/`, { headers });
      setMedicinesList(medicinesList.filter((m) => m.id !== id));
      showAlert("success", `${name} removed from inventory.`);
    } catch (err) {
      showAlert("danger", `Failed to delete medicine: ${err.response?.data?.detail || err.message}`);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      `${s.first_name} ${s.last_name} ${s.staff_id} ${s.role}`.toLowerCase().includes(query);
    const matchesRole = roleFilter === "ALL" || s.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredMedicines = medicinesList.filter((m) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      `${m.name} ${m.generic_name} ${m.batch_number}`.toLowerCase().includes(query);
    const matchesCategory = categoryFilter === "ALL" || m.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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

      {/* SLEEK DECENT SIDEBAR */}
      <aside
        className={`sidebar bg-slate-900 text-white d-flex flex-column ${
          sidebarOpen ? "show" : ""
        }`}
      >
        {/* Brand */}
        <div className="px-4 py-4 border-bottom border-slate-800 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center shadow-sm">
              <Stethoscope size={20} />
            </div>
            <div>
              <h6 className="mb-0 fw-bold tracking-wide text-white">Clinic Management</h6>
              <span className="badge bg-slate-800 text-slate-400 p-0 text-uppercase" style={{ fontSize: "10px" }}>
                Admin Portal
              </span>
            </div>
          </div>
          <button className="btn btn-sm text-slate-400 d-md-none p-1" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 py-4 flex-grow-1">
          <div className="text-slate-400 px-3 pb-2 text-uppercase fw-semibold" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
            Main Menu
          </div>

          <div className="d-flex flex-column gap-1">
            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center gap-3 px-3 py-2 rounded-3 w-100 ${
                activeTab === "dashboard" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("dashboard");
                setSearchQuery("");
                setSidebarOpen(false);
              }}
            >
              <LayoutDashboard size={18} />
              <span className="fw-medium">Dashboard</span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 w-100 ${
                activeTab === "staff" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("staff");
                setSearchQuery("");
                setSidebarOpen(false);
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <UserCog size={18} />
                <span className="fw-medium">Manage Staff</span>
              </div>
              <span className="badge bg-slate-800 text-slate-300 rounded-pill"></span>
            </button>

            <button
              type="button"
              className={`nav-btn btn text-start d-flex align-items-center justify-content-between px-3 py-2 rounded-3 w-100 ${
                activeTab === "inventory" ? "active text-white" : "text-slate-300"
              }`}
              onClick={() => {
                setActiveTab("inventory");
                setSearchQuery("");
                setSidebarOpen(false);
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <Pill size={18} />
                <span className="fw-medium">Medicine Inventory</span>
              </div>
              <span className="badge bg-slate-800 text-slate-300 rounded-pill"></span>
            </button>
          </div>
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-top border-slate-800 bg-slate-950">
          <div className="d-flex align-items-center gap-3 mb-3 px-2">
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="overflow-hidden">
              <div className="text-truncate fw-semibold text-white small">
                {user?.first_name ? `${user.first_name} ${user.last_name || ""}` : "Alex Morgan"}
              </div>
              <div className="text-slate-400 small" style={{ fontSize: "11px" }}>
                Administrator
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
                {activeTab === "dashboard" && "Dashboard Overview"}
                {activeTab === "staff" && "Staff & Role Management"}
                {activeTab === "inventory" && "Medicine & Pharmacy Inventory"}
              </h5>
              <small className="text-muted">
                {activeTab === "dashboard" && "Welcome to the ClinicCare Operations Management Portal"}
                {activeTab === "staff" && "Create users, assign medical roles, and manage credentials"}
                {activeTab === "inventory" && "Manage medicine stocks, batch numbers, and reorder levels"}
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1" onClick={loadData}>
              <RefreshCw size={14} />
              <span className="d-none d-sm-inline">Refresh</span>
            </button>
          </div>
        </header>

        {/* Feedback Alert */}
        {alertMsg.text && (
          <div className="px-4 pt-3">
            <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-0 d-flex align-items-center gap-2 rounded-3`}>
              {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="small">{alertMsg.text}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <main className="p-3 p-md-4 flex-grow-1">
          {/* =================================================
              TAB 1: DASHBOARD
          ================================================= */}
          {activeTab === "dashboard" && (
            <div>
              {/* 3 Metric Cards */}
              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <div className="card metric-card border-0 shadow-xs rounded-3 p-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Total Patients</span>
                        <h3 className="fw-bold mt-1 mb-0 text-slate-900">{totalPatients}</h3>
                        <small className="text-muted">Active clinic patients</small>
                      </div>
                      <div className="metric-badge bg-blue-subtle text-primary rounded-3 p-3">
                        <Users size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card metric-card border-0 shadow-xs rounded-3 p-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Total Staff</span>
                        <h3 className="fw-bold mt-1 mb-0 text-slate-900">{staffList.length}</h3>
                        <small className="text-muted">Active doctors & staff</small>
                      </div>
                      <div className="metric-badge bg-emerald-subtle text-success rounded-3 p-3">
                        <UserCog size={24} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="card metric-card border-0 shadow-xs rounded-3 p-3 bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted small fw-semibold text-uppercase">Medicines in Stock</span>
                        <h3 className="fw-bold mt-1 mb-0 text-slate-900">{medicinesList.length}</h3>
                        <small className="text-muted">Pharmacy inventory items</small>
                      </div>
                      <div className="metric-badge bg-amber-subtle text-warning rounded-3 p-3">
                        <Pill size={24} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Core Responsibilities: Staff & Inventory Breakdown */}
              <div className="row g-4">
                {/* Staff Roles Overview */}
                <div className="col-lg-6">
                  <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
                    <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-0 text-slate-900">Healthcare Staff by Role</h6>
                        <small className="text-muted">Assigned medical personnel</small>
                      </div>
                      <button className="btn btn-outline-primary btn-sm rounded-2 px-3 fw-medium" onClick={() => setActiveTab("staff")}>
                        Manage Staff
                      </button>
                    </div>
                    <div className="card-body px-4 pt-1">
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">🩺</span>
                            <div>
                              <strong className="d-block text-slate-800">Doctors</strong>
                              <small className="text-muted">Physicians & specialists</small>
                            </div>
                          </div>
                          <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">
                            {staffList.filter((s) => s.role === "DOCTOR").length}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">📋</span>
                            <div>
                              <strong className="d-block text-slate-800">Receptionists</strong>
                              <small className="text-muted">Front desk & patient intake</small>
                            </div>
                          </div>
                          <span className="badge bg-success rounded-pill px-3 py-2 fs-6">
                            {staffList.filter((s) => s.role === "RECEPTIONIST").length}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">💊</span>
                            <div>
                              <strong className="d-block text-slate-800">Pharmacists</strong>
                              <small className="text-muted">Dispensary & stock managers</small>
                            </div>
                          </div>
                          <span className="badge bg-warning text-dark rounded-pill px-3 py-2 fs-6">
                            {staffList.filter((s) => s.role === "PHARMACIST").length}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div className="d-flex align-items-center gap-2">
                            <span className="fs-5">🔬</span>
                            <div>
                              <strong className="d-block text-slate-800">Lab Technicians</strong>
                              <small className="text-muted">Diagnostic lab pathologists</small>
                            </div>
                          </div>
                          <span className="badge bg-info text-dark rounded-pill px-3 py-2 fs-6">
                            {staffList.filter((s) => s.role === "LAB_TECHNICIAN").length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medicine Inventory Overview */}
                <div className="col-lg-6">
                  <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
                    <div className="card-header bg-white border-0 py-3 px-4 d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-0 text-slate-900">Medicine Inventory Status</h6>
                        <small className="text-muted">Supply levels & categories</small>
                      </div>
                      <button className="btn btn-outline-success btn-sm rounded-2 px-3 fw-medium" onClick={() => setActiveTab("inventory")}>
                        View Inventory
                      </button>
                    </div>
                    <div className="card-body px-4 pt-1">
                      <div className="d-flex flex-column gap-3">
                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div>
                            <strong className="d-block text-slate-800">Total Stock Units</strong>
                            <small className="text-muted">All medicines combined</small>
                          </div>
                          <span className="fw-bold fs-5 text-slate-900">
                            {medicinesList.reduce((acc, m) => acc + (parseInt(m.quantity, 10) || 0), 0)} units
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div>
                            <strong className="d-block text-slate-800">Low Stock Alert Items</strong>
                            <small className="text-muted">Medicines below reorder threshold</small>
                          </div>
                          <span className="badge bg-warning-subtle text-warning-emphasis rounded-pill px-3 py-2 fs-6">
                            {medicinesList.filter((m) => m.quantity <= (m.reorder_level || 20)).length} Items
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div>
                            <strong className="d-block text-slate-800">Tablets & Capsules</strong>
                            <small className="text-muted">Solid oral dosage forms</small>
                          </div>
                          <span className="badge bg-slate-200 text-slate-800 rounded-pill px-3 py-2 fs-6">
                            {medicinesList.filter((m) => m.category === "TABLET" || m.category === "CAPSULE").length} Types
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center p-3 rounded-2 bg-slate-50 border border-slate-100">
                          <div>
                            <strong className="d-block text-slate-800">Syrups & Liquids</strong>
                            <small className="text-muted">Oral liquids & suspensions</small>
                          </div>
                          <span className="badge bg-slate-200 text-slate-800 rounded-pill px-3 py-2 fs-6">
                            {medicinesList.filter((m) => m.category === "SYRUP").length} Types
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================
              TAB 2: MANAGE STAFF
          ================================================= */}
          {activeTab === "staff" && (
            <div className="card border-0 shadow-xs rounded-3 bg-white">
              <div className="card-body p-4">
                {/* Header Controls */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                  <div>
                    <h6 className="fw-bold mb-0 text-slate-900">Healthcare Staff Directory</h6>
                    <small className="text-muted">Manage clinic personnel, credentials, and role privileges</small>
                  </div>
                  <button
                    className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3 py-2"
                    onClick={() => setShowStaffModal(true)}
                  >
                    <UserPlus size={16} />
                    <span>Add Staff Member</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6 col-lg-5">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Search size={15} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by name, ID, role..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-lg-3">
                    <select
                      className="form-select form-select-sm"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="ALL">All Roles ({staffList.length})</option>
                      <option value="DOCTOR">Doctor</option>
                      <option value="RECEPTIONIST">Receptionist</option>
                      <option value="PHARMACIST">Pharmacist</option>
                      <option value="LAB_TECHNICIAN">Lab Technician</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive rounded-2 border">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-slate-600 small">
                      <tr>
                        <th className="px-3">Staff ID</th>
                        <th>Name</th>
                        <th>Assigned Role</th>
                        <th>Department</th>
                        <th>Contact</th>
                        <th>Fee / Exp</th>
                        <th>Status</th>
                        <th className="text-end px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {filteredStaff.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-5">
                            <UserCog size={32} className="text-slate-300 mb-2" />
                            <div>No staff members found matching criteria.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredStaff.map((s) => (
                          <tr key={s.id || s.staff_id}>
                            <td className="px-3 fw-semibold font-monospace text-slate-700">{s.staff_id}</td>
                            <td>
                              <div className="fw-semibold text-slate-900">{s.first_name} {s.last_name}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>{s.email}</div>
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
                            <td>{s.phone}</td>
                            <td>
                              {s.role === "DOCTOR" && s.consultation_fee ? (
                                <span className="text-emerald-600 fw-semibold">₹{s.consultation_fee}</span>
                              ) : (
                                <span className="text-muted">{s.work_experience || 0} yrs</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge rounded-pill ${s.status === "ACTIVE" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="text-end px-3">
                              {s.role !== "ADMIN" && (
                                <button
                                  className="btn btn-outline-danger btn-sm p-1 rounded-2"
                                  title="Deactivate staff"
                                  onClick={() => handleDeleteStaff(s.staff_id, s.first_name)}
                                >
                                  <Trash2 size={14} />
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
              TAB 3: MEDICINE INVENTORY
          ================================================= */}
          {activeTab === "inventory" && (
            <div className="card border-0 shadow-xs rounded-3 bg-white">
              <div className="card-body p-4">
                {/* Header Controls */}
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                  <div>
                    <h6 className="fw-bold mb-0 text-slate-900">Pharmacy Inventory</h6>
                    <small className="text-muted">Manage drug supplies, batch codes, quantities, and pricing</small>
                  </div>
                  <button
                    className="btn btn-success btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3 py-2"
                    onClick={() => setShowMedModal(true)}
                  >
                    <Plus size={16} />
                    <span>Add Medicine</span>
                  </button>
                </div>

                {/* Filters */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6 col-lg-5">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Search size={15} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by medicine name, generic formula..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 col-lg-3">
                    <select
                      className="form-select form-select-sm"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="ALL">All Categories ({medicinesList.length})</option>
                      <option value="TABLET">Tablets</option>
                      <option value="CAPSULE">Capsules</option>
                      <option value="SYRUP">Syrup</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive rounded-2 border">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-slate-600 small">
                      <tr>
                        <th className="px-3">Medicine Name</th>
                        <th>Category</th>
                        <th>Batch No.</th>
                        <th>Stock Level</th>
                        <th>Unit Price</th>
                        <th>Expiry Date</th>
                        <th className="text-end px-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="small">
                      {filteredMedicines.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-5">
                            <Pill size={32} className="text-slate-300 mb-2" />
                            <div>No medicines found matching criteria.</div>
                          </td>
                        </tr>
                      ) : (
                        filteredMedicines.map((m) => (
                          <tr key={m.id || m.medicine_id}>
                            <td className="px-3">
                              <div className="fw-semibold text-slate-900">{m.name}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>{m.generic_name}</div>
                            </td>
                            <td>
                              <span className="badge bg-slate-100 text-slate-700 border">{m.category}</span>
                            </td>
                            <td><span className="text-muted font-monospace">{m.batch_number}</span></td>
                            <td>
                              <span
                                className={`badge rounded-pill px-2 py-1 ${
                                  m.quantity <= (m.reorder_level || 20)
                                    ? "bg-warning-subtle text-warning-emphasis"
                                    : "bg-success-subtle text-success"
                                }`}
                              >
                                {m.quantity} units {m.quantity <= (m.reorder_level || 20) ? "(Low)" : ""}
                              </span>
                            </td>
                            <td><strong className="text-slate-900">₹{parseFloat(m.unit_price).toFixed(2)}</strong></td>
                            <td><span className="text-muted">{m.expiry_date}</span></td>
                            <td className="text-end px-3">
                              <button
                                className="btn btn-outline-danger btn-sm p-1 rounded-2"
                                title="Remove from inventory"
                                onClick={() => handleDeleteMedicine(m.id, m.name)}
                              >
                                <Trash2 size={14} />
                              </button>
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
        </main>
      </div>

      {/* =================================================
          MODAL: ADD STAFF
      ================================================= */}
      {showStaffModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <UserPlus size={18} className="text-primary" />
                  Add Healthcare Staff Member & Assign Role
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowStaffModal(false)} />
              </div>

              <form onSubmit={handleAddStaff}>
                <div className="modal-body p-4">
                  {staffModalError && (
                    <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2 rounded-2 small">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <div>{staffModalError}</div>
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Role Selection */}
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-slate-800 mb-1">Select Role *</label>
                      <select
                        className="form-select form-select-sm"
                        value={staffForm.role}
                        onChange={(e) => handleRoleChange(e.target.value)}
                      >
                        <option value="DOCTOR">Doctor</option>
                        <option value="RECEPTIONIST">Receptionist</option>
                        <option value="PHARMACIST">Pharmacist</option>
                        <option value="LAB_TECHNICIAN">Lab Technician</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Staff ID *</label>
                      <input
                        type="text"
                        required
                        placeholder={
                          staffForm.role === "DOCTOR"
                            ? "DOC003"
                            : staffForm.role === "RECEPTIONIST"
                            ? "REC002"
                            : staffForm.role === "PHARMACIST"
                            ? "PHM002"
                            : "LAB002"
                        }
                        className="form-control form-control-sm text-uppercase"
                        value={staffForm.staff_id}
                        onChange={(e) => setStaffForm({ ...staffForm, staff_id: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">First Name * (letters only)</label>
                      <input
                        type="text"
                        required
                        pattern="[A-Za-z]{3,40}"
                        title="3 to 40 letters only"
                        placeholder="e.g. Robert"
                        className="form-control form-control-sm"
                        value={staffForm.first_name}
                        onChange={(e) => setStaffForm({ ...staffForm, first_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Last Name * (letters only)</label>
                      <input
                        type="text"
                        required
                        pattern="[A-Za-z]{3,40}"
                        title="3 to 40 letters only"
                        placeholder="e.g. Smith"
                        className="form-control form-control-sm"
                        value={staffForm.last_name}
                        onChange={(e) => setStaffForm({ ...staffForm, last_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. dr_smith"
                        className="form-control form-control-sm"
                        value={staffForm.username}
                        onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Password * (min 6 chars)</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        className="form-control form-control-sm"
                        value={staffForm.password}
                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        placeholder="doctor@hospital.com"
                        className="form-control form-control-sm"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Phone Number * (10 digits)</label>
                      <input
                        type="tel"
                        required
                        pattern="[6-9][0-9]{9}"
                        title="10 digits starting with 6, 7, 8, or 9"
                        placeholder="9876543210"
                        className="form-control form-control-sm"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Department *</label>
                      <select
                        className="form-select form-select-sm"
                        value={staffForm.department}
                        onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Gender *</label>
                      <select
                        className="form-select form-select-sm"
                        value={staffForm.gender}
                        onChange={(e) => setStaffForm({ ...staffForm, gender: e.target.value })}
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
                        value={staffForm.blood_group}
                        onChange={(e) => setStaffForm({ ...staffForm, blood_group: e.target.value })}
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

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Date of Birth *</label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={staffForm.date_of_birth}
                        onChange={(e) => setStaffForm({ ...staffForm, date_of_birth: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Experience (Years)</label>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        className="form-control form-control-sm"
                        value={staffForm.work_experience}
                        onChange={(e) => setStaffForm({ ...staffForm, work_experience: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Degree / Qualification</label>
                      <input
                        type="text"
                        placeholder="e.g. MBBS, MD / B.Pharm"
                        className="form-control form-control-sm"
                        value={staffForm.degree}
                        onChange={(e) => setStaffForm({ ...staffForm, degree: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Joining Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={staffForm.joining_date}
                        onChange={(e) => setStaffForm({ ...staffForm, joining_date: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Residential Address *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 124 Medical St, City"
                        className="form-control form-control-sm"
                        value={staffForm.address}
                        onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })}
                      />
                    </div>

                    {staffForm.role === "DOCTOR" && (
                      <div className="col-12">
                        <label className="form-label small fw-semibold text-primary mb-1">Consultation Fee (₹) *</label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="50"
                          placeholder="500"
                          className="form-control form-control-sm"
                          value={staffForm.consultation_fee || ""}
                          onChange={(e) => setStaffForm({ ...staffForm, consultation_fee: e.target.value })}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowStaffModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm rounded-2 px-3 fw-medium" disabled={submittingStaff}>
                    {submittingStaff ? "Saving..." : "Save Staff Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          MODAL: ADD MEDICINE
      ================================================= */}
      {showMedModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <Pill size={18} className="text-success" />
                  Add Medicine to Inventory
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowMedModal(false)} />
              </div>

              <form onSubmit={handleAddMedicine}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700">Medicine Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paracetamol 500mg"
                        className="form-control form-control-sm"
                        value={medForm.name}
                        onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700">Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={medForm.category}
                        onChange={(e) => setMedForm({ ...medForm, category: e.target.value })}
                      >
                        <option value="TABLET">Tablet</option>
                        <option value="CAPSULE">Capsule</option>
                        <option value="SYRUP">Syrup</option>
                        <option value="INJECTION">Injection</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700">Batch Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BATCH-01"
                        className="form-control form-control-sm"
                        value={medForm.batch_number}
                        onChange={(e) => setMedForm({ ...medForm, batch_number: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700">Quantity (Stock) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="form-control form-control-sm"
                        value={medForm.quantity}
                        onChange={(e) => setMedForm({ ...medForm, quantity: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700">Price per unit (₹) *</label>
                      <input
                        type="number"
                        required
                        step="0.50"
                        className="form-control form-control-sm"
                        value={medForm.unit_price}
                        onChange={(e) => setMedForm({ ...medForm, unit_price: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700">Expiry Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={medForm.expiry_date}
                        onChange={(e) => setMedForm({ ...medForm, expiry_date: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowMedModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm rounded-2 px-3 fw-medium">
                    Save to Inventory
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM CSS FOR DECENT PROFESSIONAL LOOK */}
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

          .shadow-xs { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.04); }

          .sidebar {
            width: 240px;
            min-width: 240px;
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

          .metric-card {
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .metric-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
          }

          @media (max-width: 767.98px) {
            .sidebar {
              position: fixed;
              left: -250px;
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

export default Admin;