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
  DollarSign,
  PlusCircle,
  X,
  Clock,
  TrendingDown,
} from "lucide-react";
import medicineService from "../../services/medicineService";

const emptyMedicineForm = {
  name: "",
  generic_name: "",
  category: "TABLET",
  dosage_form: "500mg",
  manufacturer: "",
  supplier: "",
  status: "ACTIVE",

  // Optional initial stock batch fields
  batch_number: "",
  manufacturing_date: "",
  expiry_date: "",
  quantity: "",
  unit_price: "",
  reorder_level: 20,
  batch_id: null,
};

const emptyBatchForm = {
  medicine_id: null,
  medicine_name: "",
  batch_number: "",
  manufacturing_date: new Date().toISOString().split("T")[0],
  expiry_date: "",
  units: "",
  price_per_unit: "",
  reorder_level: 20,
};

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
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState(emptyBatchForm);

  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [batchModalError, setBatchModalError] = useState("");
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState(emptyMedicineForm);

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 4000);
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

  // Helper for computing stock metrics for a single medicine
  const getMedMetrics = (med) => {
    const stocks = med.stocks || [];
    const totalUnits = stocks.reduce((acc, s) => acc + (parseInt(s.units, 10) || 0), 0);
    const todayStr = new Date().toISOString().split("T")[0];

    const activeStocks = stocks.filter((s) => {
      if (!s.expiry_date) return true;
      return s.expiry_date >= todayStr;
    });

    const activeUnits = activeStocks.reduce((acc, s) => acc + (parseInt(s.units, 10) || 0), 0);
    const latestBatch = stocks.length > 0 ? stocks[0] : null;
    const unitPrice = latestBatch ? parseFloat(latestBatch.price_per_unit || 0) : 0;
    const reorderLevel = latestBatch ? parseInt(latestBatch.reorder_level || 20, 10) : 20;

    const isExpired = stocks.length > 0 && activeStocks.length === 0;
    const isOut = totalUnits === 0;
    const isLow = totalUnits > 0 && totalUnits <= reorderLevel;

    let computedStatus = med.stock_status || "OUT_OF_STOCK";
    if (isExpired) computedStatus = "EXPIRED";
    else if (isOut) computedStatus = "OUT_OF_STOCK";
    else if (isLow) computedStatus = "LOW_STOCK";
    else if (totalUnits > reorderLevel) computedStatus = "IN_STOCK";

    return {
      stocks,
      totalUnits,
      activeUnits,
      latestBatch,
      unitPrice,
      reorderLevel,
      stockStatus: computedStatus,
      isExpired,
      isOut,
      isLow,
    };
  };

  const openCreateModal = () => {
    setEditingMed(null);
    setFormData(emptyMedicineForm);
    setModalError("");
    setShowModal(true);
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    const primaryBatch = med.stocks && med.stocks.length > 0 ? med.stocks[0] : null;

    setFormData({
      name: med.name || "",
      generic_name: med.generic_name || "",
      category: med.category || "TABLET",
      dosage_form: med.dosage_form || "",
      manufacturer: med.manufacturer || "",
      supplier: med.supplier || "",
      status: med.is_active !== false ? "ACTIVE" : "INACTIVE",

      batch_number: primaryBatch?.batch_number || "",
      manufacturing_date: primaryBatch?.manufacturing_date || "",
      expiry_date: primaryBatch?.expiry_date || "",
      quantity: primaryBatch?.units !== undefined ? primaryBatch.units : "",
      unit_price: primaryBatch?.price_per_unit !== undefined ? primaryBatch.price_per_unit : "",
      reorder_level: primaryBatch?.reorder_level !== undefined ? primaryBatch.reorder_level : 20,
      batch_id: primaryBatch?.id || null,
    });
    setModalError("");
    setShowModal(true);
  };

  const openAddBatchModal = (med) => {
    setBatchForm({
      medicine_id: med.id,
      medicine_name: `${med.name} (${med.medicine_id || `MED-${med.id}`})`,
      batch_number: "",
      manufacturing_date: new Date().toISOString().split("T")[0],
      expiry_date: "",
      units: "",
      price_per_unit: "",
      reorder_level: 20,
    });
    setBatchModalError("");
    setShowBatchModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    setSubmitting(true);

    const medPayload = {
      name: formData.name.trim(),
      generic_name: formData.generic_name.trim(),
      category: formData.category,
      dosage_form: formData.dosage_form.trim(),
      manufacturer: formData.manufacturer.trim(),
      supplier: formData.supplier.trim(),
      is_active: formData.status === "ACTIVE",
    };

    try {
      if (editingMed) {
        // 1. Update Medicine Master metadata
        const updatedMed = await medicineService.updateMedicine(editingMed.id, medPayload);

        // 2. If batch details are present and batch_id exists, update the batch
        if (formData.batch_id && formData.batch_number.trim()) {
          await medicineService.updateStock(formData.batch_id, {
            medicine: editingMed.id,
            batch_number: formData.batch_number.trim().toUpperCase(),
            manufacturing_date: formData.manufacturing_date || new Date().toISOString().split("T")[0],
            expiry_date: formData.expiry_date,
            units: parseInt(formData.quantity, 10) || 0,
            price_per_unit: parseFloat(formData.unit_price) || 0,
            reorder_level: parseInt(formData.reorder_level, 10) || 20,
          });
        } else if (!formData.batch_id && formData.batch_number.trim() && formData.expiry_date) {
          // If creating an initial batch for a medicine that had none
          await medicineService.addStock({
            medicine: editingMed.id,
            batch_number: formData.batch_number.trim().toUpperCase(),
            manufacturing_date: formData.manufacturing_date || new Date().toISOString().split("T")[0],
            expiry_date: formData.expiry_date,
            units: parseInt(formData.quantity, 10) || 0,
            price_per_unit: parseFloat(formData.unit_price) || 0,
            reorder_level: parseInt(formData.reorder_level, 10) || 20,
          });
        }

        showAlert("success", `Medicine "${medPayload.name}" updated successfully!`);
      } else {
        // 1. Create Medicine in Master
        const createdMed = await medicineService.createMedicine(medPayload);

        // 2. If initial batch details are provided, create stock batch
        if (formData.batch_number.trim() && formData.expiry_date) {
          try {
            await medicineService.addStock({
              medicine: createdMed.id,
              batch_number: formData.batch_number.trim().toUpperCase(),
              manufacturing_date: formData.manufacturing_date || new Date().toISOString().split("T")[0],
              expiry_date: formData.expiry_date,
              units: parseInt(formData.quantity, 10) || 0,
              price_per_unit: parseFloat(formData.unit_price) || 0,
              reorder_level: parseInt(formData.reorder_level, 10) || 20,
            });
          } catch (batchErr) {
            console.error("Created medicine but failed to add batch:", batchErr);
            showAlert("warning", `Medicine "${createdMed.name}" created, but stock batch could not be registered.`);
          }
        }

        showAlert("success", `Medicine "${createdMed.name}" registered in master inventory!`);
      }

      setShowModal(false);
      loadData();
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

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    setBatchModalError("");
    setSubmitting(true);

    try {
      const payload = {
        medicine: Number(batchForm.medicine_id),
        batch_number: batchForm.batch_number.trim().toUpperCase(),
        manufacturing_date: batchForm.manufacturing_date,
        expiry_date: batchForm.expiry_date,
        units: parseInt(batchForm.units, 10) || 0,
        price_per_unit: parseFloat(batchForm.price_per_unit) || 0,
        reorder_level: parseInt(batchForm.reorder_level, 10) || 20,
      };

      await medicineService.addStock(payload);
      showAlert("success", `Stock batch ${payload.batch_number} added successfully!`);
      setShowBatchModal(false);
      loadData();
    } catch (err) {
      console.error("Error adding stock batch:", err);
      let msg = "Failed to add stock batch.";
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
      setBatchModalError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Discontinue medicine "${name}" from active distribution? Existing dispensing & prescription history will remain safe.`)) {
      return;
    }
    try {
      await medicineService.deactivateMedicine(id);
      showAlert("success", `Medicine "${name}" discontinued from inventory.`);
      loadData();
    } catch (err) {
      showAlert("danger", `Failed to deactivate medicine: ${err.response?.data?.detail || err.message}`);
    }
  };

  const handleDeleteBatch = async (batchId, batchNo) => {
    if (!window.confirm(`Delete stock batch "${batchNo}"?`)) return;
    try {
      await medicineService.deleteStock(batchId);
      showAlert("success", `Stock batch "${batchNo}" deleted.`);
      loadData();
      if (viewingMed) {
        setViewingMed((prev) => ({
          ...prev,
          stocks: (prev.stocks || []).filter((s) => s.id !== batchId),
        }));
      }
    } catch (err) {
      showAlert("danger", `Failed to delete batch: ${err.response?.data?.detail || err.message}`);
    }
  };

  // Filtered medicines list
  const filteredMedicines = medicines.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    const metrics = getMedMetrics(m);

    const matchesSearch =
      !q ||
      m.name?.toLowerCase().includes(q) ||
      m.generic_name?.toLowerCase().includes(q) ||
      m.medicine_id?.toLowerCase().includes(q) ||
      m.manufacturer?.toLowerCase().includes(q) ||
      m.supplier?.toLowerCase().includes(q) ||
      metrics.stocks.some((s) => s.batch_number?.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === "ALL" || m.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === "IN_STOCK") matchesStock = metrics.stockStatus === "IN_STOCK";
    else if (stockFilter === "LOW_STOCK") matchesStock = metrics.isLow;
    else if (stockFilter === "OUT_OF_STOCK") matchesStock = metrics.isOut;
    else if (stockFilter === "EXPIRED") matchesStock = metrics.isExpired;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Global statistics
  const totalStockUnits = medicines.reduce((acc, m) => {
    const metrics = getMedMetrics(m);
    return acc + metrics.totalUnits;
  }, 0);

  const lowStockCount = medicines.filter((m) => getMedMetrics(m).isLow).length;
  const outOfStockCount = medicines.filter((m) => getMedMetrics(m).isOut).length;

  const totalValuation = medicines.reduce((acc, m) => {
    const stocks = m.stocks || [];
    const medVal = stocks.reduce((sum, s) => sum + (parseFloat(s.price_per_unit || 0) * (parseInt(s.units, 10) || 0)), 0);
    return acc + medVal;
  }, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "IN_STOCK":
        return <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1">In Stock</span>;
      case "LOW_STOCK":
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2.5 py-1">Low Stock</span>;
      case "OUT_OF_STOCK":
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-2.5 py-1">Out of Stock</span>;
      case "EXPIRED":
        return <span className="badge bg-dark-subtle text-dark border border-dark-subtle rounded-pill px-2.5 py-1">Expired</span>;
      default:
        return <span className="badge bg-slate-100 text-slate-700 rounded-pill px-2.5 py-1">{status || "Unknown"}</span>;
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner & Quick Metrics */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Catalog Medicines</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{medicines.length}</h4>
                <small className="text-muted">Master Drug Formulations</small>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Pill size={24} />
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
                <small className="text-muted">Across all active batches</small>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Package size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Low / Out of Stock</span>
                <h4 className="fw-bold mt-1 mb-0 text-warning-emphasis">
                  {lowStockCount} <span className="text-danger small fs-6">({outOfStockCount} Out)</span>
                </h4>
                <small className="text-muted">Requires replenishment</small>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Stock Valuation</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">₹{Math.round(totalValuation).toLocaleString()}</h4>
                <small className="text-muted">Retail inventory value</small>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Layers size={24} />
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
              <h5 className="fw-bold mb-0 text-slate-900">Medicine Master & Pharmacy Inventory</h5>
              <p className="text-muted small mb-0">
                Register new drug catalog formulations, configure unit pricing, track batch expiries and stock levels.
              </p>
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
                  placeholder="Search by Medicine Name, Formula, ID, or Batch..."
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
                <option value="SYRUP">Syrups</option>
                <option value="INJECTION">Injections</option>
                <option value="OINTMENT">Ointments</option>
                <option value="DROPS">Drops</option>
                <option value="INHALER">Inhalers</option>
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
                <option value="EXPIRED">Expired Batches</option>
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
                    const metrics = getMedMetrics(m);
                    const primaryBatch = metrics.latestBatch;

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
                          {primaryBatch ? (
                            <div>
                              <div className="font-monospace text-slate-800 fw-medium">{primaryBatch.batch_number}</div>
                              <div className="text-muted" style={{ fontSize: "11px" }}>
                                Exp: {primaryBatch.expiry_date || "—"}
                                {metrics.stocks.length > 1 && (
                                  <span className="badge bg-light text-muted ms-1">+{metrics.stocks.length - 1} more</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted fst-italic">No batch registered</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1 align-items-start">
                            <span className="fw-bold text-slate-900">
                              {metrics.totalUnits.toLocaleString()} units
                            </span>
                            {getStatusBadge(metrics.stockStatus)}
                          </div>
                        </td>
                        <td>
                          {metrics.unitPrice > 0 ? (
                            <strong className="text-slate-900">₹{metrics.unitPrice.toFixed(2)}</strong>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className="text-slate-700">{m.manufacturer || "—"}</span>
                          {m.supplier && (
                            <div className="text-muted" style={{ fontSize: "11px" }}>
                              {m.supplier}
                            </div>
                          )}
                        </td>
                        <td className="text-end px-3">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm p-1 rounded-2"
                              title="View details & batches"
                              onClick={() => setViewingMed(m)}
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="btn btn-outline-success btn-sm p-1 rounded-2"
                              title="Add new stock batch"
                              onClick={() => openAddBatchModal(m)}
                            >
                              <PlusCircle size={14} />
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm p-1 rounded-2"
                              title="Edit medicine details"
                              onClick={() => openEditModal(m)}
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              className="btn btn-outline-danger btn-sm p-1 rounded-2"
                              title="Discontinue medicine"
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
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <Pill size={18} className="text-success" />
                  <h6 className="modal-title fw-bold mb-0">
                    {editingMed ? `Edit Medicine: ${editingMed.name}` : "Add Medicine to Master Catalog"}
                  </h6>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)} />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {modalError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{modalError}</span>
                    </div>
                  )}

                  {/* Section 1: Master Details */}
                  <h6 className="fw-bold text-slate-800 small text-uppercase mb-3 pb-1 border-bottom d-flex align-items-center gap-1.5">
                    <Pill size={14} className="text-primary" />
                    <span>Medicine Catalog Information</span>
                  </h6>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Medicine / Brand Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paracetamol 500mg, Amoxicillin"
                        className="form-control form-control-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Generic / Chemical Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Acetaminophen, Amoxicillin Trihydrate"
                        className="form-control form-control-sm"
                        value={formData.generic_name}
                        onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Category / Type *</label>
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
                        placeholder="e.g. 500mg, 10ml, 250mg/5ml"
                        className="form-control form-control-sm"
                        value={formData.dosage_form}
                        onChange={(e) => setFormData({ ...formData, dosage_form: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="ACTIVE">Active (Available)</option>
                        <option value="INACTIVE">Discontinued</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        placeholder="e.g. Cipla, Sun Pharma, Pfizer"
                        className="form-control form-control-sm"
                        value={formData.manufacturer}
                        onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Supplier / Distributor</label>
                      <input
                        type="text"
                        placeholder="e.g. MedSupply Co., HealthCorp"
                        className="form-control form-control-sm"
                        value={formData.supplier}
                        onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Section 2: Initial Batch & Stock Details */}
                  <h6 className="fw-bold text-slate-800 small text-uppercase mb-3 pb-1 border-bottom d-flex align-items-center justify-content-between">
                    <span className="d-flex align-items-center gap-1.5">
                      <Package size={14} className="text-success" />
                      <span>{editingMed ? "Batch & Stock Inventory Details" : "Initial Stock Batch (Optional / Recommended)"}</span>
                    </span>
                    {!editingMed && <span className="text-muted fw-normal text-lowercase" style={{ fontSize: "11px" }}>Can also be added later</span>}
                  </h6>

                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Batch Number</label>
                      <input
                        type="text"
                        placeholder="e.g. BATCH-2026-A"
                        className="form-control form-control-sm font-monospace text-uppercase"
                        value={formData.batch_number}
                        onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Manufacturing Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.manufacturing_date}
                        onChange={(e) => setFormData({ ...formData, manufacturing_date: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Expiry Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.expiry_date}
                        onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Stock Quantity (Units)</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="form-control form-control-sm"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Selling Price per Unit (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="form-control form-control-sm"
                        value={formData.unit_price}
                        onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Reorder Alert Level</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="20"
                        className="form-control form-control-sm"
                        value={formData.reorder_level}
                        onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                      />
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

      {/* Quick Add Stock Batch Modal */}
      {showBatchModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1055 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <Package size={18} className="text-success" />
                  <h6 className="modal-title fw-bold mb-0">Add Stock Batch: {batchForm.medicine_name}</h6>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowBatchModal(false)} />
              </div>

              <form onSubmit={handleSaveBatch}>
                <div className="modal-body p-4">
                  {batchModalError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3 d-flex align-items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{batchModalError}</span>
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Batch Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BATCH-2026-B"
                        className="form-control form-control-sm font-monospace text-uppercase"
                        value={batchForm.batch_number}
                        onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Mfg Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={batchForm.manufacturing_date}
                        onChange={(e) => setBatchForm({ ...batchForm, manufacturing_date: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Expiry Date *</label>
                      <input
                        type="date"
                        required
                        className="form-control form-control-sm"
                        value={batchForm.expiry_date}
                        onChange={(e) => setBatchForm({ ...batchForm, expiry_date: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Stock Units *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="100"
                        className="form-control form-control-sm"
                        value={batchForm.units}
                        onChange={(e) => setBatchForm({ ...batchForm, units: e.target.value })}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Selling Price / Unit (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="10.00"
                        className="form-control form-control-sm"
                        value={batchForm.price_per_unit}
                        onChange={(e) => setBatchForm({ ...batchForm, price_per_unit: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Reorder Alert Level</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="20"
                        className="form-control form-control-sm"
                        value={batchForm.reorder_level}
                        onChange={(e) => setBatchForm({ ...batchForm, reorder_level: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowBatchModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm rounded-2 px-3 fw-medium" disabled={submitting}>
                    {submitting ? "Adding..." : "Add Stock Batch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Medicine Details & Batches Modal */}
      {viewingMed && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <Eye size={18} className="text-success" />
                  <h6 className="modal-title fw-bold mb-0">Medicine: {viewingMed.name}</h6>
                  <span className="badge bg-slate-800 text-success border border-slate-700 font-monospace small ms-2">
                    {viewingMed.medicine_id || `MED-${viewingMed.id}`}
                  </span>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setViewingMed(null)} />
              </div>

              <div className="modal-body p-4">
                <div className="row g-3 small mb-4">
                  <div className="col-md-6">
                    <span className="text-muted d-block">Generic Formula:</span>
                    <strong className="text-slate-800">{viewingMed.generic_name || "—"}</strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted d-block">Dosage / Category:</span>
                    <strong className="text-slate-800">
                      {viewingMed.dosage_form ? `${viewingMed.dosage_form} • ` : ""}
                      {viewingMed.category}
                    </strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted d-block">Manufacturer:</span>
                    <span className="text-slate-700">{viewingMed.manufacturer || "—"}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted d-block">Supplier:</span>
                    <span className="text-slate-700">{viewingMed.supplier || "—"}</span>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted d-block">Total Active Stock:</span>
                    <strong className="text-slate-900 fs-6">
                      {getMedMetrics(viewingMed).totalUnits.toLocaleString()} units
                    </strong>
                  </div>
                  <div className="col-md-6">
                    <span className="text-muted d-block">Status:</span>
                    {getStatusBadge(getMedMetrics(viewingMed).stockStatus)}
                  </div>
                </div>

                {/* Batches Table */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="fw-bold text-slate-800 small text-uppercase mb-0 d-flex align-items-center gap-1">
                    <Package size={14} className="text-primary" />
                    <span>Registered Stock Batches ({viewingMed.stocks?.length || 0})</span>
                  </h6>
                  <button
                    className="btn btn-outline-success btn-sm rounded-2 d-flex align-items-center gap-1"
                    onClick={() => {
                      const m = viewingMed;
                      openAddBatchModal(m);
                    }}
                  >
                    <Plus size={14} />
                    <span>Add New Batch</span>
                  </button>
                </div>

                <div className="table-responsive border rounded-2">
                  <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: "12px" }}>
                    <thead className="table-light text-slate-600">
                      <tr>
                        <th>Batch No</th>
                        <th>Mfg Date</th>
                        <th>Expiry Date</th>
                        <th>Units</th>
                        <th>Price/Unit</th>
                        <th>Status</th>
                        <th className="text-end pe-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingMed.stocks && viewingMed.stocks.length > 0 ? (
                        viewingMed.stocks.map((b) => (
                          <tr key={b.id}>
                            <td className="font-monospace fw-semibold text-slate-800">{b.batch_number}</td>
                            <td>{b.manufacturing_date || "—"}</td>
                            <td>{b.expiry_date || "—"}</td>
                            <td>
                              <strong>{b.units}</strong>
                            </td>
                            <td>₹{parseFloat(b.price_per_unit || 0).toFixed(2)}</td>
                            <td>{getStatusBadge(b.stock_status)}</td>
                            <td className="text-end pe-2">
                              <button
                                className="btn btn-outline-danger btn-sm p-0 px-1"
                                title="Delete this batch"
                                onClick={() => handleDeleteBatch(b.id, b.batch_number)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-3 text-muted">
                            No batches currently on file. Click "Add New Batch" to add stock.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
