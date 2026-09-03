import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Printer,
  Send,
  Eye,
  ShieldCheck,
  Stethoscope,
  Building,
  User,
  FlaskConical,
  Clock,
} from "lucide-react";
import labService from "../../services/labService";
import LabReportPrint from "./LabReportPrint";

const LabReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Print & Verification states
  const [printingReport, setPrintingReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
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
      console.error("Error loading lab reports:", err);
      showAlert("danger", "Failed to load diagnostic reports from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerifyReport = async (report) => {
    try {
      const updated = await labService.patchReport(report.id, {
        status: "COMPLETED",
        finding_notes: report.finding_notes ? `${report.finding_notes} [Verified by Senior Pathologist]` : "Verified by Senior Pathologist",
      });
      setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, ...updated, is_verified: true } : r)));
      showAlert("success", `Report ${report.report_id || `LAB-${report.id}`} verified & authorized!`);
    } catch (err) {
      showAlert("danger", `Failed to verify report: ${err.message}`);
    }
  };

  const handleSendToDoctor = async (report) => {
    showAlert("success", `Diagnostic report ${report.report_id || `LAB-${report.id}`} transmitted directly to ${report.ordered_by_doctor}'s EMR portal & Patient history!`);
  };

  const filteredReports = reports.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.test_name?.toLowerCase().includes(q) ||
      r.patient_name?.toLowerCase().includes(q) ||
      r.report_id?.toLowerCase().includes(q) ||
      r.ordered_by_doctor?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "COMPLETED" && r.status === "COMPLETED") ||
      (statusFilter === "PROCESSING" && r.status === "PROCESSING") ||
      (statusFilter === "PENDING" && (r.status === "PENDING_SAMPLE" || r.status === "REQUEST_RECEIVED"));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white p-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h5 className="fw-bold mb-0 text-slate-900">Diagnostic Reports & Physician Verification</h5>
            <small className="text-muted">
              Workflow: Result Ready → Pathologist E-Verification → Transmitted to Ordering Doctor & Patient EMR
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

      {/* Search & Filter Toolbar */}
      <div className="row g-2">
        <div className="col-md-6 col-lg-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <Search size={15} />
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search reports by patient, test name, doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-4 col-lg-3">
          <select
            className="form-select form-select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Report Statuses</option>
            <option value="COMPLETED">Completed & Verified</option>
            <option value="PROCESSING">Processing / Result Ready</option>
            <option value="PENDING">Pending Sample</option>
          </select>
        </div>
      </div>

      {/* Main Reports Table */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="table-responsive rounded-2 border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-slate-600 small">
                <tr>
                  <th className="px-3">Report ID</th>
                  <th>Patient Name</th>
                  <th>Test Parameter</th>
                  <th>Ordering Physician</th>
                  <th>Result Observed</th>
                  <th>Reference Range</th>
                  <th>Status</th>
                  <th className="text-end px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="small">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <RefreshCw size={24} className="spin mb-2 text-primary" />
                      <div>Loading laboratory reports...</div>
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center text-muted py-5">
                      <FileCheck2 size={32} className="text-slate-300 mb-2" />
                      <div>No diagnostic reports found matching criteria.</div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => {
                    const isCompleted = r.status === "COMPLETED";
                    return (
                      <tr key={r.id}>
                        <td className="px-3 font-monospace fw-semibold text-slate-700">
                          {r.report_id || `LAB-${r.id}`}
                        </td>
                        <td>
                          <div className="fw-semibold text-slate-900">{r.patient_name || "Patient"}</div>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{r.patient_details || ""}</div>
                        </td>
                        <td>
                          <strong className="text-slate-900">{r.test_name}</strong>
                          <div className="text-muted" style={{ fontSize: "11px" }}>{r.sample_type || "Blood"}</div>
                        </td>
                        <td>{r.ordered_by_doctor}</td>
                        <td>
                          {r.result_value ? (
                            <span className="fw-bold text-slate-900">{r.result_value}</span>
                          ) : (
                            <span className="text-muted fst-italic">Pending</span>
                          )}
                        </td>
                        <td>
                          <span className="text-muted">{r.reference_range || "Standard Reference"}</span>
                        </td>
                        <td>
                          <span
                            className={`badge rounded-pill px-2 py-1 ${
                              isCompleted
                                ? "bg-success-subtle text-success"
                                : r.status === "PROCESSING"
                                ? "bg-primary-subtle text-primary"
                                : "bg-warning-subtle text-warning-emphasis"
                            }`}
                          >
                            {isCompleted ? "Verified & Ready" : r.status === "PROCESSING" ? "In Lab" : "Pending Sample"}
                          </span>
                        </td>
                        <td className="text-end px-3">
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <button
                              className="btn btn-outline-secondary btn-sm p-1 rounded-2"
                              title="Print Report"
                              onClick={() => setPrintingReport(r)}
                            >
                              <Printer size={14} />
                            </button>
                            <button
                              className="btn btn-outline-primary btn-sm p-1 rounded-2"
                              title="Send to Doctor EMR"
                              onClick={() => handleSendToDoctor(r)}
                            >
                              <Send size={14} />
                            </button>
                            {!isCompleted && (
                              <button
                                className="btn btn-success btn-sm px-2 py-1 rounded-2 d-flex align-items-center gap-1"
                                title="Authorize and Verify"
                                onClick={() => handleVerifyReport(r)}
                              >
                                <ShieldCheck size={14} />
                                <span>Verify</span>
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

      {/* Print Document Modal */}
      {printingReport && (
        <LabReportPrint report={printingReport} onClose={() => setPrintingReport(null)} />
      )}
    </div>
  );
};

export default LabReport;
