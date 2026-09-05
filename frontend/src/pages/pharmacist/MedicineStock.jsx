import React, { useEffect, useState } from "react";
import {
  Pill,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  Calendar,
  DollarSign,
  X,
  Clock,
  TrendingDown,
  RefreshCw,
  Eye,
} from "lucide-react";
import pharmacyService from "../../services/pharmacyService";

const emptyMedicineForm = {
  name: "",
  generic_name: "",
  manufacturer: "",
  supplier: "",
  category: "TABLET",
  dosage_form: "500mg",
};

const emptyStockForm = {
  medicine: "",
  batch_number: "",
  manufacturing_date: "",
  expiry_date: "",
  price_per_unit: "",
  units: "",
  reorder_level: "20",
};

const MedicineStock = () => {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [stockStatusFilter, setStockStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modals
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [selectedMedicineBatches, setSelectedMedicineBatches] = useState(null);

  const [medicineForm, setMedicineForm] = useState(emptyMedicineForm);
  const [stockForm, setStockForm] = useState(emptyStockForm);
  const [submitting, setSubmitting] = useState(false);

  const showAlert = (type, text) => {
    if (type === "success") setSuccess(text);
    else setError(text);
    setTimeout(() => {
      setSuccess("");
      setError("");
    }, 4000);
  };

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.getMedicines();
      setMedicines(data);
    } catch (err) {
      console.error("Error loading medicines:", err);
      showAlert("danger", "Failed to load medicine inventory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await pharmacyService.addMedicine(medicineForm);
      showAlert("success", `Medicine ${created.name} (${created.medicine_id}) added successfully!`);
      setShowAddMedicineModal(false);
      setMedicineForm(emptyMedicineForm);
      loadMedicines();
    } catch (err) {
      console.error("Error adding medicine:", err);
      showAlert("danger", err?.response?.data?.detail || "Failed to add medicine.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        medicine: Number(stockForm.medicine),
        batch_number: stockForm.batch_number,
        manufacturing_date: stockForm.manufacturing_date,
        expiry_date: stockForm.expiry_date,
        price_per_unit: stockForm.price_per_unit,
        units: Number(stockForm.units),
        reorder_level: Number(stockForm.reorder_level || 20),
      };

      await pharmacyService.addStock(payload);
      showAlert("success", `Stock batch ${payload.batch_number} added successfully!`);
      setShowAddStockModal(false);
      setStockForm(emptyStockForm);
      loadMedicines();
    } catch (err) {
      console.error("Error adding stock:", err);
      showAlert("danger", err?.response?.data?.detail || "Failed to add stock batch.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    const term = search.toLowerCase();
    const name = (m.name || "").toLowerCase();
    const genName = (m.generic_name || "").toLowerCase();
    const medId = (m.medicine_id || "").toLowerCase();
    const matchSearch = name.includes(term) || genName.includes(term) || medId.includes(term);

    const matchCategory = categoryFilter === "ALL" || m.category === categoryFilter;
    const matchStatus = stockStatusFilter === "ALL" || m.stock_status === stockStatusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  const getStockStatusBadge = (status) => {
    switch (status) {
      case "IN_STOCK":
        return <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1 small">In Stock</span>;
      case "LOW_STOCK":
        return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1 small">Low Stock</span>;
      case "OUT_OF_STOCK":
        return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1 small">Out of Stock</span>;
      case "EXPIRED":
        return <span className="badge bg-dark text-white rounded-pill px-2 py-1 small">Expired Batch</span>;
      default:
        return <span className="badge bg-secondary rounded-pill px-2 py-1 small">{status || "Unknown"}</span>;
    }
  };

  const totalMedicines = medicines.length;
  const lowStockCount = medicines.filter((m) => m.stock_status === "LOW_STOCK").length;
  const outOfStockCount = medicines.filter((m) => m.stock_status === "OUT_OF_STOCK").length;

  return (
    <main className="container-fluid p-4 space-y-4">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-slate-900">Medicine Master & Inventory Stock</h4>
          <p className="text-muted small mb-0">
            Maintain pharmacy catalog, track batch expiry dates, and manage replenishment levels.
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary rounded-pill px-3 d-flex align-items-center gap-1 shadow-xs"
            onClick={loadMedicines}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </button>
          <button
            className="btn btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
            onClick={() => {
              setStockForm(emptyStockForm);
              setShowAddStockModal(true);
            }}
          >
            <Package size={14} /> + Add Batch Stock
          </button>
          <button
            className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
            onClick={() => {
              setMedicineForm(emptyMedicineForm);
              setShowAddMedicineModal(true);
            }}
          >
            <Plus size={16} /> New Medicine
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {success && (
        <div className="alert alert-success border-0 py-2 d-flex align-items-center gap-2 rounded-3 shadow-xs">
          <CheckCircle2 size={18} /> <span className="small">{success}</span>
        </div>
      )}
      {error && (
        <div className="alert alert-danger border-0 py-2 d-flex align-items-center gap-2 rounded-3 shadow-xs">
          <AlertCircle size={18} /> <span className="small">{error}</span>
        </div>
      )}

      {/* Metric Counters */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Catalog Items</span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">{totalMedicines}</h3>
                <small className="text-muted">Active Pharmacy Drugs</small>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                <Pill size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Low Stock Alert</span>
                <h3 className="fw-bold mt-1 mb-0 text-amber-500">{lowStockCount}</h3>
                <small className="text-muted">Below Reorder Threshold</small>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-4">
                <AlertTriangle size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Out of Stock</span>
                <h3 className="fw-bold mt-1 mb-0 text-danger">{outOfStockCount}</h3>
                <small className="text-muted">Requires Immediate Restock</small>
              </div>
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-4">
                <TrendingDown size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-0">
                <Search size={15} className="text-muted" />
              </span>
              <input
                type="text"
                className="form-control bg-light border-0 small"
                placeholder="Search by Medicine ID, Name, or Generic Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select bg-light border-0 small"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All Categories</option>
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
          <div className="col-md-3">
            <select
              className="form-select bg-light border-0 small"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
            >
              <option value="ALL">All Stock Statuses</option>
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-slate-50 text-slate-600 small text-uppercase">
              <tr>
                <th className="ps-4">Medicine ID</th>
                <th>Drug Details</th>
                <th>Category</th>
                <th>Dosage Form</th>
                <th>Total Units</th>
                <th>Stock Status</th>
                <th className="text-end pe-4">Batch Info</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMedicines.map((m) => {
                const stocks = m.stocks || [];
                const totalUnits = stocks.reduce((acc, s) => acc + Number(s.units || 0), 0);

                return (
                  <tr key={m.id}>
                    <td className="ps-4">
                      <span className="badge bg-primary bg-opacity-10 text-primary font-monospace fw-bold px-2 py-1">
                        {m.medicine_id}
                      </span>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold text-slate-900">{m.name}</div>
                        <div className="text-muted small">
                          {m.generic_name || "Generic"} {m.manufacturer ? `• ${m.manufacturer}` : ""}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-slate-100 text-slate-700 rounded-pill small">
                        {m.category}
                      </span>
                    </td>
                    <td className="small text-slate-700">{m.dosage_form || "-"}</td>
                    <td>
                      <span className="fw-bold text-slate-900 fs-6">{totalUnits}</span>
                      <small className="text-muted ms-1">units</small>
                    </td>
                    <td>{getStockStatusBadge(m.stock_status)}</td>
                    <td className="text-end pe-4">
                      <button
                        className="btn btn-sm btn-light rounded-pill px-3 d-flex align-items-center gap-1 ms-auto"
                        onClick={() => setSelectedMedicineBatches(m)}
                      >
                        <Eye size={13} />
                        <span className="small">{stocks.length} Batches</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredMedicines.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-5 text-muted">
                    <Pill size={36} className="text-slate-300 mb-2" />
                    <p className="mb-0">No medicines found matching your search.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Medicine Modal */}
      {showAddMedicineModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3">
                <h5 className="modal-title fs-6 fw-semibold d-flex align-items-center gap-2">
                  <Pill size={18} className="text-primary" /> Register New Medicine in Catalog
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-pill px-2"
                  onClick={() => setShowAddMedicineModal(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddMedicine}>
                <div className="modal-body p-4 bg-white">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        Brand / Trade Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control"
                        placeholder="e.g. Paracetamol 500mg, Augmentin"
                        value={medicineForm.name}
                        onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">Generic Formula</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Acetaminophen, Amoxicillin + Clavulanic Acid"
                        value={medicineForm.generic_name}
                        onChange={(e) => setMedicineForm({ ...medicineForm, generic_name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700">Category</label>
                      <select
                        className="form-select"
                        value={medicineForm.category}
                        onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
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
                      <label className="form-label small fw-semibold text-slate-700">Dosage Form / Strength</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 500mg, 10ml, 250mg/5ml"
                        value={medicineForm.dosage_form}
                        onChange={(e) => setMedicineForm({ ...medicineForm, dosage_form: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700">Manufacturer</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Sun Pharma, Cipla"
                        value={medicineForm.manufacturer}
                        onChange={(e) => setMedicineForm({ ...medicineForm, manufacturer: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAddMedicineModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save Medicine"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Batch Modal */}
      {showAddStockModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3">
                <h5 className="modal-title fs-6 fw-semibold d-flex align-items-center gap-2">
                  <Package size={18} className="text-primary" /> Inward Stock Batch Entry
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-pill px-2"
                  onClick={() => setShowAddStockModal(false)}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddStock}>
                <div className="modal-body p-4 bg-white">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700">
                        Select Medicine <span className="text-danger">*</span>
                      </label>
                      <select
                        required
                        className="form-select"
                        value={stockForm.medicine}
                        onChange={(e) => setStockForm({ ...stockForm, medicine: e.target.value })}
                      >
                        <option value="">-- Choose Medicine ({medicines.length}) --</option>
                        {medicines.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.medicine_id} - {m.name} ({m.category})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        Batch Number <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-control font-monospace"
                        placeholder="e.g. BATCH-2026-A1"
                        value={stockForm.batch_number}
                        onChange={(e) => setStockForm({ ...stockForm, batch_number: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        Price Per Unit (₹) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        className="form-control"
                        placeholder="e.g. 15.50"
                        value={stockForm.price_per_unit}
                        onChange={(e) => setStockForm({ ...stockForm, price_per_unit: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        Manufacturing Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={stockForm.manufacturing_date}
                        onChange={(e) => setStockForm({ ...stockForm, manufacturing_date: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        Expiry Date <span className="text-danger">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        className="form-control"
                        value={stockForm.expiry_date}
                        onChange={(e) => setStockForm({ ...stockForm, expiry_date: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">
                        Units Inward <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-control"
                        placeholder="e.g. 500"
                        value={stockForm.units}
                        onChange={(e) => setStockForm({ ...stockForm, units: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700">Reorder Threshold Level</label>
                      <input
                        type="number"
                        className="form-control"
                        placeholder="20"
                        value={stockForm.reorder_level}
                        onChange={(e) => setStockForm({ ...stockForm, reorder_level: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 px-4 py-3">
                  <button
                    type="button"
                    className="btn btn-light rounded-pill px-4"
                    onClick={() => setShowAddStockModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4 shadow-sm"
                    disabled={submitting}
                  >
                    {submitting ? "Adding Stock..." : "Add Inward Batch"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Medicine Batches Modal */}
      {selectedMedicineBatches && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1055 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3">
                <h5 className="modal-title fs-6 fw-semibold">
                  Batch Details — {selectedMedicineBatches.name} ({selectedMedicineBatches.medicine_id})
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-pill px-2"
                  onClick={() => setSelectedMedicineBatches(null)}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="modal-body p-4 bg-white">
                <div className="table-responsive">
                  <table className="table table-sm table-bordered align-middle small mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Batch Number</th>
                        <th>Mfg Date</th>
                        <th>Expiry Date</th>
                        <th>Price/Unit</th>
                        <th>Units</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedMedicineBatches.stocks || []).map((s) => (
                        <tr key={s.id}>
                          <td className="font-monospace fw-bold">{s.batch_number}</td>
                          <td>{s.manufacturing_date}</td>
                          <td>{s.expiry_date}</td>
                          <td>₹{Number(s.price_per_unit).toFixed(2)}</td>
                          <td className="fw-bold">{s.units}</td>
                          <td>{getStockStatusBadge(s.stock_status)}</td>
                        </tr>
                      ))}
                      {(selectedMedicineBatches.stocks || []).length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center py-3 text-muted">
                            No batches registered for this medicine yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer bg-slate-50 px-4 py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm rounded-pill px-4"
                  onClick={() => setSelectedMedicineBatches(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default MedicineStock;
