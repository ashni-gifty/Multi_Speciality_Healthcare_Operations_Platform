import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  Search,
  Plus,
  Eye,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Activity,
} from "lucide-react";
import labService from "../../services/labService";
import LabTestDetails from "./LabTestDetails";

const LabTestList = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [sampleFilter, setSampleFilter] = useState("ALL");

  // Modals
  const [selectedTest, setSelectedTest] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    test_code: "",
    test_name: "",
    category: "General Pathology",
    sample_type: "BLOOD",
    price: "350.00",
    normal_range: "70 - 100",
    unit: "mg/dL",
    turnaround_time: "2-4 Hours",
    is_active: true,
  });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await labService.getLabTests();
      setTests(data);
    } catch (err) {
      console.error("Error loading lab tests master:", err);
      showAlert("danger", "Failed to fetch diagnostic tests catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await labService.createLabTest({
        ...form,
        test_code: form.test_code.trim().toUpperCase(),
        test_name: form.test_name.trim(),
        price: parseFloat(form.price) || 300,
      });
      setTests((prev) => [created, ...prev]);
      showAlert("success", `Diagnostic test ${created.test_name} added to catalog!`);
      setShowAddModal(false);
      setForm({
        test_code: "",
        test_name: "",
        category: "General Pathology",
        sample_type: "BLOOD",
        price: "350.00",
        normal_range: "70 - 100",
        unit: "mg/dL",
        turnaround_time: "2-4 Hours",
        is_active: true,
      });
    } catch (err) {
      showAlert("danger", `Failed to create diagnostic test: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTests = tests.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.test_name?.toLowerCase().includes(q) ||
      t.test_code?.toLowerCase().includes(q) ||
      t.category?.toLowerCase().includes(q);

    const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
    const matchesSample = sampleFilter === "ALL" || t.sample_type === sampleFilter;

    return matchesSearch && matchesCategory && matchesSample;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0 text-slate-900">Diagnostic Lab Tests Master Catalog</h5>
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
              className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3"
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              <span>Add Test Catalog</span>
            </button>
          </div>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-0 d-flex align-items-center gap-2 rounded-3`}>
          {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="small">{alertMsg.text}</span>
        </div>
      )}

      {/* Filters */}
      <div className="row g-2">
        <div className="col-md-5 col-lg-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search"
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
            <option value="ALL">All Categories ({tests.length})</option>
            <option value="General Pathology">General Pathology</option>
            <option value="Clinical Biochemistry">Clinical Biochemistry</option>
            <option value="Hematology">Hematology</option>
            <option value="Microbiology">Microbiology</option>
            <option value="Serology & Immunology">Serology & Immunology</option>
          </select>
        </div>

        <div className="col-md-3 col-lg-3">
          <select
            className="form-select form-select-sm"
            value={sampleFilter}
            onChange={(e) => setSampleFilter(e.target.value)}
          >
            <option value="ALL">All Specimen Types</option>
            <option value="BLOOD">Blood</option>
            <option value="SERUM">Serum</option>
            <option value="URINE">Urine</option>
            <option value="SWAB">Swab</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Tests Table */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="table-responsive rounded-2 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-slate-600 small">
                <tr>
                  <th className="px-3">Test Code</th>
                  <th>Test Name</th>
                  <th>Department / Category</th>
                  <th>Specimen Required</th>
                  <th>Biological Normal Range</th>
                  <th>Turnaround Time</th>
                  <th>Price (₹)</th>
                  <th className="text-end px-3">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <RefreshCw size={24} className="spin mb-2 text-primary" />
                      <div>Loading test catalog...</div>
                    </td>
                  </tr>
                ) : filteredTests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      <FlaskConical size={32} className="text-slate-300 mb-2" />
                      <div>No diagnostic tests found in catalog.</div>
                    </td>
                  </tr>
                ) : (
                  filteredTests.map((t) => (
                    <tr key={t.id || t.test_code}>
                      <td className="px-3 font-monospace fw-semibold text-slate-700">{t.test_code}</td>
                      <td>
                        <strong className="text-slate-900">{t.test_name}</strong>
                      </td>
                      <td>
                        <span className="badge bg-slate-100 text-slate-700 border">{t.category}</span>
                      </td>
                      <td>
                        <span className="badge bg-blue-subtle text-primary">{t.sample_type}</span>
                      </td>
                      <td>
                        <span className="text-slate-800 font-monospace">{t.normal_range} {t.unit}</span>
                      </td>
                      <td>
                        <span className="text-muted">{t.turnaround_time || "2-4 Hours"}</span>
                      </td>
                      <td>
                        <strong className="text-success">₹{parseFloat(t.price).toFixed(2)}</strong>
                      </td>
                      <td className="text-end px-3">
                        <button
                          className="btn btn-outline-primary btn-sm p-1 rounded-2"
                          title="View Test Details"
                          onClick={() => setSelectedTest(t)}
                        >
                          <Eye size={14} />
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

      {/* Test Details Modal */}
      {selectedTest && <LabTestDetails test={selectedTest} onClose={() => setSelectedTest(null)} />}

      {/* Add Test Modal */}
      {showAddModal && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <h6 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <FlaskConical size={18} className="text-primary" />
                  Add Diagnostic Test to Master
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)} />
              </div>

              <form onSubmit={handleCreateTest}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Test Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. CBC-01"
                        className="form-control form-control-sm text-uppercase font-monospace"
                        value={form.test_code}
                        onChange={(e) => setForm({ ...form, test_code: e.target.value })}
                      />
                    </div>

                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Test Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Complete Blood Count (CBC)"
                        className="form-control form-control-sm"
                        value={form.test_name}
                        onChange={(e) => setForm({ ...form, test_name: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Department / Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                      >
                        <option value="General Pathology">General Pathology</option>
                        <option value="Clinical Biochemistry">Clinical Biochemistry</option>
                        <option value="Hematology">Hematology</option>
                        <option value="Microbiology">Microbiology</option>
                        <option value="Serology & Immunology">Serology & Immunology</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Sample Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={form.sample_type}
                        onChange={(e) => setForm({ ...form, sample_type: e.target.value })}
                      >
                        <option value="BLOOD">Blood</option>
                        <option value="SERUM">Serum</option>
                        <option value="URINE">Urine</option>
                        <option value="SWAB">Swab</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Normal Range</label>
                      <input
                        type="text"
                        placeholder="e.g. 70 - 100"
                        className="form-control form-control-sm"
                        value={form.normal_range}
                        onChange={(e) => setForm({ ...form, normal_range: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Unit</label>
                      <input
                        type="text"
                        placeholder="e.g. mg/dL, g/dL"
                        className="form-control form-control-sm"
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Price (₹) *</label>
                      <input
                        type="number"
                        required
                        step="10"
                        className="form-control form-control-sm"
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm rounded-2 px-3 fw-medium" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Test"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTestList;
