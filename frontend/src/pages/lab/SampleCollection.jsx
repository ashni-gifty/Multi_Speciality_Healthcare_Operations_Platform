import React, { useEffect, useState } from "react";
import {
  FlaskConical,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  QrCode,
  Calendar,
  User,
  Stethoscope,
  Building,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import labService from "../../services/labService";

const SampleCollection = ({ onSampleCollected }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sampleTypeFilter, setSampleTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("PENDING"); // PENDING | COLLECTED | ALL

  // Collection Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [collectionForm, setCollectionForm] = useState({
    sample_id: "",
    container_type: "EDTA Vacutainer (Purple Top)",
    collection_time: new Date().toISOString().slice(0, 16),
    phlebotomist: "Mark Vance, MLT",
    notes: "Specimen collected without hemolysis or clot.",
  });
  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: "", text: "" });

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: "", text: "" }), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await labService.getReports();
      setReports(data);
    } catch (err) {
      console.error("Error loading reports for sample collection:", err);
      showAlert("danger", "Failed to load sample collection queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCollectionModal = (report) => {
    setSelectedReport(report);
    setCollectionForm({
      sample_id: `SMP-${report.id || 100}-${Math.floor(100 + Math.random() * 900)}`,
      container_type:
        report.sample_type === "URINE"
          ? "Sterile Urine Cup (Yellow Top)"
          : report.sample_type === "SWAB"
          ? "Viral Transport Medium (VTM)"
          : "EDTA Vacutainer (Purple Top)",
      collection_time: new Date().toISOString().slice(0, 16),
      phlebotomist: report.technician_name || "Mark Vance, MLT",
      notes: "Specimen collected under aseptic precautions.",
    });
  };

  const handleConfirmCollection = async (e) => {
    e.preventDefault();
    if (!selectedReport) return;
    setSubmitting(true);

    try {
      const updated = await labService.patchReport(selectedReport.id, {
        status: "PROCESSING", // moves stage forward
        sample_type: selectedReport.sample_type || "Blood",
        technician_name: collectionForm.phlebotomist,
      });

      setReports((prev) =>
        prev.map((r) => (r.id === selectedReport.id ? { ...r, ...updated, status: "PROCESSING" } : r))
      );

      showAlert("success", `Specimen collected for ${selectedReport.patient_name || "patient"}. Sent to processing!`);
      if (onSampleCollected) onSampleCollected(updated);
      setSelectedReport(null);
    } catch (err) {
      showAlert("danger", `Failed to update sample collection status: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.test_name?.toLowerCase().includes(q) ||
      r.report_id?.toLowerCase().includes(q) ||
      r.patient_name?.toLowerCase().includes(q) ||
      r.ordered_by_doctor?.toLowerCase().includes(q);

    const matchesType = sampleTypeFilter === "ALL" || r.sample_type === sampleTypeFilter;
    const isCollected = r.status === "PROCESSING" || r.status === "COMPLETED";
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "PENDING" && !isCollected) ||
      (statusFilter === "COLLECTED" && isCollected);

    return matchesSearch && matchesType && matchesStatus;
  });

  const pendingCount = reports.filter((r) => r.status === "PENDING_SAMPLE" || r.status === "REQUEST_RECEIVED").length;
  const collectedCount = reports.filter((r) => r.status === "PROCESSING" || r.status === "COMPLETED").length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner Stats */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-warning">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Pending Specimen Draw</span>
                <h4 className="fw-bold mt-1 mb-0 text-warning-emphasis">{pendingCount}</h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-success">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Collected & In-Lab</span>
                <h4 className="fw-bold mt-1 mb-0 text-success">{collectedCount}</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3 border-start border-4 border-primary">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Lab Requisitions</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{reports.length}</h4>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <FlaskConical size={22} />
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
              <h5 className="fw-bold mb-0 text-slate-900">Sample Collection Queue</h5>

            </div>
            <button
              className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
              <span>Refresh Queue</span>
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
                value={sampleTypeFilter}
                onChange={(e) => setSampleTypeFilter(e.target.value)}
              >
                <option value="ALL">All Specimen Types</option>
                <option value="Blood">Blood (Whole/EDTA)</option>
                <option value="Serum">Serum</option>
                <option value="Urine">Urine</option>
                <option value="Swab">Swab</option>
              </select>
            </div>

            <div className="col-md-3 col-lg-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Sample Statuses</option>
                <option value="PENDING">Sample Pending</option>
                <option value="COLLECTED">Sample Collected / In Lab</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive rounded-2 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-slate-600 small">
                <tr>
                  <th className="px-3">Test Order ID</th>
                  <th>Patient Details</th>
                  <th>Investigation Required</th>
                  <th>Specimen Required</th>
                  <th>Ordering Doctor</th>
                  <th>Order Time</th>
                  <th>Sample Status</th>
                  <th className="text-end px-3">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <RefreshCw size={24} className="spin mb-2 text-primary" />
                      <div>Loading sample collection queue...</div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      <FlaskConical size={32} className="text-slate-300 mb-2" />
                      <div>No requisitions found in sample collection queue.</div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    const isCollected = r.status === "PROCESSING" || r.status === "COMPLETED";
                    return (
                      <tr key={r.id} className={isCollected ? "bg-slate-50 opacity-75" : ""}>
                        <td className="px-3 font-monospace fw-semibold text-slate-700">
                          {r.report_id || `LAB-${r.id}`}
                        </td>
                        <td>
                          <div className="fw-semibold text-slate-900">{r.patient_name || "Patient"}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{r.patient_details || ""}</div>
                        </td>
                        <td>
                          <strong className="text-slate-900">{r.test_name}</strong>
                        </td>
                        <td>
                          <span className="badge bg-slate-100 text-slate-800 border">{r.sample_type || "Blood"}</span>
                        </td>
                        <td>
                          <span className="text-slate-700">{r.ordered_by_doctor}</span>
                        </td>
                        <td>
                          <span className="text-muted">{r.date || "Today"}</span>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill px-2 py-1 ${
                              isCollected
                                ? "bg-success-subtle text-success"
                                : "bg-warning-subtle text-warning-emphasis"
                            }`}
                          >
                            {isCollected ? "Sample Collected" : "Sample Pending"}
                          </span>
                        </td>
                        <td className="text-end px-3">
                          {!isCollected ? (
                            <button
                              className="btn btn-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1 px-3"
                              onClick={() => openCollectionModal(r)}
                            >
                              <FlaskConical size={14} />
                              <span>Collect Sample</span>
                            </button>
                          ) : (
                            <span className="text-success small fw-medium d-inline-flex align-items-center gap-1">
                              <CheckCircle2 size={14} /> In Processing
                            </span>
                          )}
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

      {/* Collect Sample Modal */}
      {selectedReport && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <FlaskConical size={18} className="text-primary" />
                  <h6 className="modal-title fw-bold mb-0">
                    Phlebotomy & Sample Collection: {selectedReport.test_name}
                  </h6>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReport(null)} />
              </div>

              <form onSubmit={handleConfirmCollection}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-slate-50 rounded-3 border mb-3 small">
                    <div className="row g-2">
                      <div className="col-6 text-muted">Patient:</div>
                      <div className="col-6 fw-bold text-slate-900">{selectedReport.patient_name}</div>

                      <div className="col-6 text-muted">Test Required:</div>
                      <div className="col-6 fw-bold text-primary">{selectedReport.test_name}</div>

                      <div className="col-6 text-muted">Ordering Doctor:</div>
                      <div className="col-6 text-slate-800">{selectedReport.ordered_by_doctor}</div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Generated Barcode / Sample ID *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm font-monospace text-uppercase"
                        value={collectionForm.sample_id}
                        onChange={(e) => setCollectionForm({ ...collectionForm, sample_id: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Container / Vacutainer *</label>
                      <select
                        className="form-select form-select-sm"
                        value={collectionForm.container_type}
                        onChange={(e) => setCollectionForm({ ...collectionForm, container_type: e.target.value })}
                      >
                        <option value="EDTA Vacutainer (Purple Top)">EDTA Vacutainer (Purple Top) - Whole Blood</option>
                        <option value="Serum Gel Vacutainer (Gold/Red Top)">Serum Gel Vacutainer (Gold/Red Top) - Biochemistry</option>
                        <option value="Sodium Citrate (Blue Top)">Sodium Citrate (Blue Top) - Coagulation</option>
                        <option value="Fluoride Oxalate (Grey Top)">Fluoride Oxalate (Grey Top) - Glucose</option>
                        <option value="Sterile Urine Cup (Yellow Top)">Sterile Urine Cup (Yellow Top)</option>
                        <option value="Viral Transport Medium (VTM)">Viral Transport Medium (VTM) - Swab</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Collection Time *</label>
                      <input
                        type="datetime-local"
                        required
                        className="form-control form-control-sm"
                        value={collectionForm.collection_time}
                        onChange={(e) => setCollectionForm({ ...collectionForm, collection_time: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Phlebotomist / Tech *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={collectionForm.phlebotomist}
                        onChange={(e) => setCollectionForm({ ...collectionForm, phlebotomist: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Specimen Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Adequate volume, no clot, non-lipemic"
                        className="form-control form-control-sm"
                        value={collectionForm.notes}
                        onChange={(e) => setCollectionForm({ ...collectionForm, notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setSelectedReport(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-success btn-sm rounded-2 px-3 fw-medium" disabled={submitting}>
                    {submitting ? "Processing..." : "Confirm Sample Collection"}
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

export default SampleCollection;
