import React, { useEffect, useState } from "react";
import {
  Pill,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Package,
  Layers,
  Calendar,
  Building,
} from "lucide-react";
import medicineService from "../../services/medicineService";

const MedicineMaster = () => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState("ALL");

  // Modals & State
  const [showModal, setShowModal] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [viewingMed, setViewingMed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    name: "",
    generic_name: "",
    category: "TABLET",
    dosage_form: "",
    batch_number: "",
    manufacturer: "",
    supplier: "",
    quantity: "",
    reorder_level: 20,
    unit_price: "",
    cost_price: "",
    expiry_date: "",
    status: "ACTIVE",
  });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await medicineService.getMedicines();
      setMedicines(data);
    } catch (err) {
      console.error("Error loading medicines:", err);
      showAlert("danger", "Failed to fetch medicine inventory from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingMed(null);
    setFormData({
      name: "",
      generic_name: "",
      category: "TABLET",
      dosage_form: "",
      batch_number: "",
      manufacturer: "",
      supplier: "",
      quantity: "",
      reorder_level: 20,
      unit_price: "",
      cost_price: "",
      expiry_date: "",
      status: "ACTIVE",
    });
    setModalError("");
    setShowModal(true);
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name || "",
      generic_name: med.generic_name || "",
      category: med.category || "TABLET",
      dosage_form: med.dosage_form || "",
      batch_number: med.batch_number || "",
      manufacturer: med.manufacturer || "",
      supplier: med.supplier || "",
      quantity: med.quantity !== undefined ? med.quantity : "",
      reorder_level: med.reorder_level !== undefined ? med.reorder_level : 20,
      unit_price: med.unit_price !== undefined ? med.unit_price : "",
      cost_price: med.cost_price !== undefined ? med.cost_price : "",
      expiry_date: med.expiry_date || "",
      status: med.status || "ACTIVE",
    });
    setModalError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      generic_name: formData.generic_name.trim(),
      category: formData.category,
      dosage_form: formData.dosage_form.trim(),
      batch_number: formData.batch_number.trim().toUpperCase(),
      manufacturer: formData.manufacturer.trim(),
      supplier: formData.supplier.trim(),
      quantity: parseInt(formData.quantity, 10) || 0,
      reorder_level: parseInt(formData.reorder_level, 10) || 20,
      unit_price: parseFloat(formData.unit_price) || 0,
      cost_price: parseFloat(formData.cost_price) || 0,
      expiry_date: formData.expiry_date,
      status: formData.status,
    };

    try {
      if (editingMed) {
        const updated = await medicineService.updateMedicine(editingMed.id, payload);
        setMedicines((prev) => prev.map((m) => (m.id === editingMed.id ? updated : m)));
        showAlert("success", `Medicine ${payload.name} updated successfully!`);
      } else {
        const created = await medicineService.createMedicine(payload);
        setMedicines((prev) => [created, ...prev]);
        showAlert("success", `Medicine ${payload.name} registered in master inventory!`);
      }
      setShowModal(false);
    } catch (err) {
      let msg = "Failed to save medicine.";
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
      setModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate medicine ${name} from active distribution? Historical dispensing records will remain safe.`)) {
      return;
    }
    try {
      await medicineService.deactivateMedicine(id);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
      showAlert("success", `Medicine ${name} deactivated from inventory.`);
    } catch (err) {
      showAlert("danger", `Failed to deactivate medicine: ${err.response?.data?.detail || err.message}`);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.generic_name?.toLowerCase().includes(q) ||
      m.batch_number?.toLowerCase().includes(q) ||
      m.medicine_id?.toLowerCase().includes(q) ||
      m.manufacturer?.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === "ALL" || m.category === categoryFilter;

    let matchesStock = true;
    const isExpired = m.expiry_date && new Date(m.expiry_date) < new Date();
    const isOut = m.quantity === 0;
    const isLow = m.quantity > 0 && m.quantity <= (m.reorder_level || 20);

    if (stockFilter === "LOW_STOCK") matchesStock = isLow;
    else if (stockFilter === "OUT_OF_STOCK") matchesStock = isOut;
    else if (stockFilter === "EXPIRED") matchesStock = isExpired;
    else if (stockFilter === "IN_STOCK") matchesStock = !isOut && !isLow && !isExpired;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalStockUnits = medicines.reduce((acc, m) => acc + (parseInt(m.quantity, 10) || 0), 0);
  const lowStockCount = medicines.filter((m) => m.quantity <= (m.reorder_level || 20)).length;
  const totalValuation = medicines.reduce((acc, m) => acc + (parseFloat(m.unit_price) || 0) * (parseInt(m.quantity, 10) || 0), 0);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner & Quick Metrics */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Medicine Items</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{medicines.length}</h4>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Pill size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Stock Units</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{totalStockUnits.toLocaleString()}</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Package size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Low Stock Alert</span>
                <h4 className="fw-bold mt-1 mb-0 text-warning-emphasis">{lowStockCount}</h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Stock Valuation</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">₹{Math.round(totalValuation).toLocaleString()}</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Layers size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">Medicine Master & Inventory</h5>
              <small className="text-muted">
                Admin master catalog for drugs, pharmaceutical forms, batches, manufacturers, and prices
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
                className="btn btn-success btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3 py-2"
                onClick={openCreateModal}
              >
                <Plus size={16} />
                <span>Add Medicine</span>
              </button>
            </div>
          </div>

          {alertMsg.text && (
            <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-3 d-flex align-items-center gap-2 rounded-3`}>
              {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="small">{alertMsg.text}</span>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="row g-2 mb-3">
            <div className="col-md-5 col-lg-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search medicine name, generic formula, batch, SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4 col-lg-4">
              <select
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="ALL">All Categories ({medicines.length})</option>
                <option value="TABLET">Tablets</option>
                <option value="CAPSULE">Capsules</option>
                <option value="SYRUP">Syrup</option>
                <option value="INJECTION">Injection</option>
                <option value="OINTMENT">Ointment</option>
                <option value="DROPS">Drops</option>
                <option value="INHALER">Inhaler</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="col-md-3 col-lg-3">
              <select
                className="form-select form-select-sm"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="ALL">All Stock Levels</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock Alert</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          {/* Medicines Table */}
          <div className="table-responsive rounded-2 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-slate-600 small">
                <tr>
                  <th className="px-3">Medicine ID / Name</th>
                  <th>Generic Formula</th>
                  <th>Category</th>
                  <th>Batch / Expiry</th>
                  <th>Stock Quantity</th>
                  <th>Unit Price (₹)</th>
                  <th>Manufacturer</th>
                  <th className="text-end px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <RefreshCw size={24} className="spin mb-2 text-success" />
                      <div>Loading pharmacy inventory...</div>
                    </td>
                  </tr>
                ) : filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      <Pill size={32} className="text-slate-300 mb-2" />
                      <div>No medicines found matching criteria.</div>
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((m) => {
                    const isLow = m.quantity <= (m.reorder_level || 20);
                    return (
                      <tr key={m.id || m.medicine_id}>
                        <td className="px-3">
                          <div className="fw-semibold text-slate-900">{m.name}</div>
                          <div className="font-monospace text-muted" style={{ fontSize: "11px" }}>
                            {m.medicine_id || `MED-${m.id}`}
                          </div>
                        </td>
                        <td>
                          <div className="text-slate-700">{m.generic_name || "—"}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{m.dosage_form || ""}</div>
                        </td>
                        <td>
                          <span className="badge bg-slate-100 text-slate-700 border">{m.category}</span>
                        </td>
                        <td>
                          <div className="font-monospace text-slate-800">{m.batch_number}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>Exp: {m.expiry_date}</div>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill px-2 py-1 ${
                              m.quantity === 0
                                ? "bg-danger-subtle text-danger"
                                : isLow
                                ? "bg-warning-subtle text-warning-emphasis"
                                : "bg-success-subtle text-success"
                            }`}
                          >
                            {m.quantity} units {isLow ? "(Low)" : ""}
                          </span>
                        </td>
                        <td>
                          <strong className="text-slate-900">₹{parseFloat(m.unit_price).toFixed(2)}</strong>
                          {m.cost_price && (
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              Cost: ₹{parseFloat(m.cost_price).toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="text-slate-700">{m.manufacturer || "—"}</span>
                        </td>
                        <td className="text-end px-3">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm p-1 rounded-2"
                              title="View details"
                              onClick={() => setViewingMed(m)}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm p-1 rounded-2"
                              title="Edit medicine"
                              onClick={() => openEditModal(m)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm p-1 rounded-2"
                              title="Deactivate medicine"
                              onClick={() => handleDeactivate(m.id, m.name)}
                            >
                              <Trash2 size={14} />
                            </button>
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

      {/* Add / Edit Medicine Modal */}
      {showModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <Pill size={18} className="text-success" />
                  <h6 className="modal-title fw-bold mb-0">
                    {editingMed ? `Edit Medicine: ${formData.name}` : "Add Medicine to Master Catalog"}
                  </h6>
                  {editingMed?.medicine_id && (
                    <span className="badge bg-slate-800 text-success border border-slate-700 font-monospace small ms-2">
                      {editingMed.medicine_id}
                    </span>
                  )}
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-danger py-2 px-3 mb-3 d-flex align-items-center gap-2 rounded-2 small">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <div>{modalError}</div>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Medicine Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Medicine Name"
                        className="form-control form-control-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Generic / Chemical Name</label>
                      <input
                        type="text"
                        placeholder="Enter Generic Formula"
                        className="form-control form-control-sm"
                        value={formData.generic_name}
                        onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Medicine Type / Category *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="TABLET">Tablet</option>
                        <option value="CAPSULE">Capsule</option>
                        <option value="SYRUP">Syrup</option>
                        <option value="INJECTION">Injection</option>
                        <option value="OINTMENT">Ointment</option>
                        <option value="DROPS">Drops</option>
                        <option value="INHALER">Inhaler</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Dosage Form</label>
                      <input
                        type="text"
                        placeholder="e.g. 500mg, 10ml, etc."
                        className="form-control form-control-sm"
                        value={formData.dosage_form}
                        onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Batch Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter Batch Number"
                        className="form-control form-control-sm font-monospace text-uppercase"
                        value={formData.batch_number}
                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        placeholder="Enter Manufacturer / Pharma Brand"
                        className="form-control form-control-sm"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Supplier / Distributor</label>
                      <input
                        type="text"
                        placeholder="Enter Supplier Details"
                        className="form-control form-control-sm"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="0"
                        className="form-control form-control-sm"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Reorder Level *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="20"
                        className="form-control form-control-sm"
                        value={formData.reorder_level}
                        onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="form-control form-control-sm"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      />
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Purchase Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="form-control form-control-sm"
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Expiry Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Stock Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">Active (Available for OPD & Billing)</option>
                        <option value="DISCONTINUED">Discontinued</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm rounded-2 px-3 fw-medium" disabled={submitting}>
                    {submitting ? "Saving..." : editingMed ? "Update Medicine" : "Save to Master"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Medicine Details Modal */}
      {viewingMed && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <Eye size={18} className="text-success" />
                  <h6 className="modal-title fw-bold mb-0">Medicine: {viewingMed.name}</h6>
                  <span className="badge bg-slate-800 text-success border border-slate-700 font-monospace small ms-2">
                    {viewingMed.medicine_id}
                  </span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingMed(null)} />
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Generic Formula:</span>
                    <strong className="text-slate-800">{viewingMed.generic_name || "—"}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Dosage / Form:</span>
                    <strong className="text-slate-800">{viewingMed.dosage_form || viewingMed.category}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Batch Number:</span>
                    <strong className="font-monospace text-slate-800">{viewingMed.batch_number}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Expiry Date:</span>
                    <strong className="text-slate-800">{viewingMed.expiry_date}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Stock Level:</span>
                    <strong className="text-slate-800">{viewingMed.quantity} units (Reorder at {viewingMed.reorder_level || 20})</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Selling Price:</span>
                    <strong className="text-success fs-6">₹{parseFloat(viewingMed.unit_price).toFixed(2)}</strong>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Manufacturer:</span>
                    <span className="text-slate-700">{viewingMed.manufacturer || "—"}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Status:</span>
                    <span className="badge bg-success-subtle text-success">{viewingMed.status || "ACTIVE"}</span>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm rounded-2"
                  onClick={() => {
                    const m = viewingMed;
                    setViewingMed(null);
                    openEditModal(m);
                  }}
                >
                  Edit Medicine
                </button>
                <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={() => setViewingMed(null)}>
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

export default MedicineMaster;
