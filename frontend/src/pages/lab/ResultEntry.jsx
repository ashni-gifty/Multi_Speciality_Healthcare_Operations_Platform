import React, { useEffect, useState } from "react";
import {
  FileEdit,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  FlaskConical,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Save,
} from "lucide-react";
import labService from "../../services/labService";

const ResultEntry = ({ onResultEntered }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeReport, setActiveReport] = useState(null);

  // Form State
  const [resultForm, setResultForm] = useState({
    result_value: "",
    reference_range: "",
    unit: "",
    finding_notes: "",
    technician_name: "Mark Vance, MLT",
    interpretation: "NORMAL", // NORMAL | HIGH | LOW | CRITICAL
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
      console.error("Error loading lab orders for result entry:", err);
      showAlert("danger", "Failed to load processing test queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEntryModal = (report) => {
    setActiveReport(report);
    setResultForm({
      result_value: report.result_value || "",
      reference_range: report.reference_range || (report.test_name?.toLowerCase().includes("glucose") ? "70 - 100 mg/dL" : report.test_name?.toLowerCase().includes("hemoglobin") ? "13.5 - 17.5 g/dL" : "Within physiological reference"),
      unit: report.test_name?.toLowerCase().includes("glucose") ? "mg/dL" : report.test_name?.toLowerCase().includes("hemoglobin") ? "g/dL" : "",
      finding_notes: report.finding_notes || "All parameters evaluated on calibrated automated laboratory equipment.",
      technician_name: report.technician_name || "Mark Vance, MLT",
      interpretation: "NORMAL",
    });
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!activeReport) return;
    setSubmitting(true);

    try {
      const updated = await labService.patchReport(activeReport.id, {
        result_value: resultForm.result_value.trim(),
        reference_range: resultForm.reference_range.trim(),
        finding_notes: resultForm.finding_notes.trim(),
        technician_name: resultForm.technician_name.trim(),
        status: "COMPLETED", // Moves stage to Result Ready / Completed
      });

      setReports((prev) =>
        prev.map((r) => (r.id === activeReport.id ? { ...r, ...updated, status: "COMPLETED" } : r))
      );

      showAlert("success", `Diagnostic results recorded for ${activeReport.patient_name || "patient"}!`);
      if (onResultEntered) onResultEntered(updated);
      setActiveReport(null);
    } catch (err) {
      showAlert("danger", `Failed to save test results: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const processingReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.test_name?.toLowerCase().includes(q) ||
      r.patient_name?.toLowerCase().includes(q) ||
      r.report_id?.toLowerCase().includes(q);

    return matchesSearch;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Header Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0 text-slate-900">Diagnostic Analyzer Result Entry</h5>
            <small className="text-muted">
              Workflow: Processing in Lab → Result Entry & Range Validation → Ready for Approval
            </small>
          </div>
          <button
            className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {alertMsg.text && (
        <div className={`alert alert-${alertMsg.type} shadow-xs border-0 py-2 mb-0 d-flex align-items-center gap-2 rounded-3`}>
          {alertMsg.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="small">{alertMsg.text}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="row g-2">
        <div className="col-md-6 col-lg-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by test name, patient, report ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Requisitions Processing Table */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="table-responsive rounded-2 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-slate-600 small">
                <tr>
                  <th className="px-3">Order ID</th>
                  <th>Patient Name</th>
                  <th>Test Parameter</th>
                  <th>Specimen</th>
                  <th>Ordering Doctor</th>
                  <th>Current Result</th>
                  <th>Status</th>
                  <th className="text-end px-3">Action</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <RefreshCw size={24} className="spin mb-2 text-primary" />
                      <div>Loading test orders...</div>
                    </td>
                  </tr>
                ) : processingReports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      <FlaskConical size={32} className="text-slate-300 mb-2" />
                      <div>No test orders available for result entry.</div>
                    </td>
                  </tr>
                ) : (
                  processingReports.map((r) => (
                    <tr key={r.id}>
                      <td className="px-3 font-monospace fw-semibold text-slate-700">{r.report_id || `LAB-${r.id}`}</td>
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
                      <td>{r.ordered_by_doctor}</td>
                      <td>
                        {r.result_value ? (
                          <span className="fw-bold text-slate-900">{r.result_value}</span>
                        ) : (
                          <span className="text-muted fst-italic">Pending Entry</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={`badge rounded-pill px-2 py-1 ${
                            r.status === "COMPLETED"
                              ? "bg-success-subtle text-success"
                              : r.status === "PROCESSING"
                              ? "bg-primary-subtle text-primary"
                              : "bg-warning-subtle text-warning-emphasis"
                          }`}
                        >
                          {r.status === "COMPLETED" ? "Result Ready" : r.status === "PROCESSING" ? "In Lab" : "Pending Sample"}
                        </span>
                      </td>
                      <td className="text-end px-3">
                        <button
                          className="btn btn-primary btn-sm rounded-2 d-inline-flex align-items-center gap-1 px-3"
                          onClick={() => openEntryModal(r)}
                        >
                          <FileEdit size={14} />
                          <span>{r.result_value ? "Edit Result" : "Enter Result"}</span>
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

      {/* Result Entry Modal */}
      {activeReport && (
        <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
                <div className="d-flex align-items-center gap-2">
                  <FileEdit size={18} className="text-primary" />
                  <h6 className="modal-title fw-bold mb-0">
                    Enter Diagnostic Result: {activeReport.test_name}
                  </h6>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setActiveReport(null)} />
              </div>

              <form onSubmit={handleSaveResult}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-slate-50 rounded-3 border mb-4 small">
                    <div className="row g-2">
                      <div className="col-md-4">
                        <span className="text-muted d-block">Patient:</span>
                        <strong className="text-slate-900">{activeReport.patient_name}</strong>
                      </div>
                      <div className="col-md-4">
                        <span className="text-muted d-block">Investigation:</span>
                        <strong className="text-primary">{activeReport.test_name}</strong>
                      </div>
                      <div className="col-md-4">
                        <span className="text-muted d-block">Ordering Doctor:</span>
                        <span className="text-slate-800">{activeReport.ordered_by_doctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Observed Result Value *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 98.4 mg/dL or Negative"
                        className="form-control form-control-sm fs-6 fw-bold text-slate-900"
                        value={resultForm.result_value}
                        onChange={(e) => setResultForm({ ...resultForm, result_value: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Normal Reference Range *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 70 - 100 mg/dL"
                        className="form-control form-control-sm"
                        value={resultForm.reference_range}
                        onChange={(e) => setResultForm({ ...resultForm, reference_range: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Result Interpretation Flag</label>
                      <select
                        className="form-select form-select-sm"
                        value={resultForm.interpretation}
                        onChange={(e) => setResultForm({ ...resultForm, interpretation: e.target.value })}
                      >
                        <option value="NORMAL">Normal (Within Biological Reference)</option>
                        <option value="HIGH">High / Elevated</option>
                        <option value="LOW">Low / Decreased</option>
                        <option value="CRITICAL">Critical / Alert Value</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Analyzing Technician *</label>
                      <input
                        type="text"
                        required
                        className="form-control form-control-sm"
                        value={resultForm.technician_name}
                        onChange={(e) => setResultForm({ ...resultForm, technician_name: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold text-slate-700 mb-1">Clinical Remarks & Technician Notes</label>
                      <textarea
                        rows="3"
                        placeholder="Enter clinical observations, specimen characteristics, or automated analyzer flags..."
                        className="form-control form-control-sm"
                        value={resultForm.finding_notes}
                        onChange={(e) => setResultForm({ ...resultForm, finding_notes: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
                  <button type="button" className="btn btn-light btn-sm rounded-2" onClick={() => setActiveReport(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm rounded-2 px-3 fw-medium" disabled={submitting}>
                    {submitting ? "Saving..." : "Save & Mark Result Ready"}
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

export default ResultEntry;
