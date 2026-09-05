import React, { useState } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Stethoscope,
  Eye,
  History,
  Activity,
  ArrowRight,
  RefreshCw,
  UserCheck,
  Calendar,
} from "lucide-react";

const PatientQueue = ({
  queue = [],
  selectedDate = "",
  onDateChange,
  onStartConsultation,
  onViewPatientHistory,
  onRefresh,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredQueue = queue.filter((apt) => {
    const term = searchQuery.toLowerCase().trim();
    const patientName = (apt.patient_name || apt.patient?.full_name || "").toLowerCase();
    const patientId = (apt.patient_id || apt.patient?.patient_id || "").toLowerCase();
    const reason = (apt.reason || "").toLowerCase();

    const matchesSearch =
      !term ||
      patientName.includes(term) ||
      patientId.includes(term) ||
      reason.includes(term);

    const isWaiting = apt.status === "CHECKED_IN" || apt.status === "TOKEN_PENDING" || apt.status === "BOOKED";
    const isInConsult = apt.status === "IN_CONSULTATION";
    const isCompleted = apt.status === "COMPLETED";

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "WAITING" && isWaiting) ||
      (statusFilter === "IN_CONSULTATION" && isInConsult) ||
      (statusFilter === "COMPLETED" && isCompleted);

    return matchesSearch && matchesStatus;
  });

  const waitingCount = queue.filter(
    (a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING" || a.status === "BOOKED"
  ).length;

  const inConsultCount = queue.filter((a) => a.status === "IN_CONSULTATION").length;
  const completedCount = queue.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Metrics Banner */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Waiting / In Queue</span>
                <h4 className="fw-bold mt-1 mb-0 text-warning-emphasis">{waitingCount}</h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">In Consultation</span>
                <h4 className="fw-bold mt-1 mb-0 text-purple">{inConsultCount}</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Activity size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Completed Visits</span>
                <h4 className="fw-bold mt-1 mb-0 text-success">{completedCount}</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Clinic Schedule</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{queue.length}</h4>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Users size={22} />
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
              <h5 className="fw-bold mb-0 text-slate-900">Patient Queue & OPD Schedule</h5>
              <p className="text-muted small mb-0">
                Patients assigned to your OPD consultation room sequenced by token numbers.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className={`btn btn-sm rounded-2 d-flex align-items-center gap-1 ${
                  selectedDate === todayStr ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => onDateChange && onDateChange(todayStr)}
              >
                <Calendar size={14} />
                <span>Today</span>
              </button>
              <button
                className={`btn btn-sm rounded-2 ${
                  selectedDate === "ALL" ? "btn-primary" : "btn-outline-secondary"
                }`}
                onClick={() => onDateChange && onDateChange("ALL")}
              >
                All Dates
              </button>
              <button
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="row g-2 mb-3">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search patient name, ID, or symptoms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-4">
              <input
                type="date"
                className="form-control form-control-sm"
                value={selectedDate === "ALL" ? "" : selectedDate}
                onChange={(e) => onDateChange && onDateChange(e.target.value || "ALL")}
              />
            </div>

            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({queue.length})</option>
                <option value="WAITING">Waiting in Lounge / Checked In ({waitingCount})</option>
                <option value="IN_CONSULTATION">In Consultation ({inConsultCount})</option>
                <option value="COMPLETED">Completed ({completedCount})</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted small text-uppercase">Token #</th>
                  <th className="border-0 text-muted small text-uppercase">Patient Demographics</th>
                  <th className="border-0 text-muted small text-uppercase">Slot / Time</th>
                  <th className="border-0 text-muted small text-uppercase">Chief Complaint</th>
                  <th className="border-0 text-muted small text-uppercase">Status</th>
                  <th className="border-0 text-muted small text-uppercase text-end">Clinical Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.map((apt) => {
                  const isWaiting = apt.status === "CHECKED_IN" || apt.status === "TOKEN_PENDING" || apt.status === "BOOKED";
                  const isInConsult = apt.status === "IN_CONSULTATION";
                  const isCompleted = apt.status === "COMPLETED";

                  return (
                    <tr key={apt.id}>
                      <td>
                        {apt.token_number ? (
                          <span className="badge bg-primary font-monospace fs-6 px-2 py-1">
                            #{apt.token_number}
                          </span>
                        ) : (
                          <span className="text-muted font-monospace small">-</span>
                        )}
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold text-slate-900">
                            {apt.patient_name || apt.patient?.full_name || "Patient"}
                          </div>
                          <div className="text-muted small">
                            ID: {apt.patient_id || apt.patient?.patient_id || `#${apt.patient}`} • {apt.patient_gender || apt.patient?.gender || "N/A"}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-slate-700 font-monospace small d-flex align-items-center gap-1">
                          <Clock size={12} className="text-muted" />
                          <span>{apt.appointment_time?.slice(0, 5) || "-"}</span>
                        </div>
                        {selectedDate === "ALL" && (
                          <div className="text-muted small" style={{ fontSize: "11px" }}>
                            {apt.appointment_date}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="text-slate-700 small">
                          {apt.reason || "General OPD Checkup"}
                        </span>
                      </td>
                      <td>
                        {isWaiting && (
                          <span className="badge bg-amber-subtle text-warning-emphasis px-2 py-1">
                            Waiting in Lounge
                          </span>
                        )}
                        {isInConsult && (
                          <span className="badge bg-purple-subtle text-purple px-2 py-1">
                            In Consultation
                          </span>
                        )}
                        {isCompleted && (
                          <span className="badge bg-emerald-subtle text-success px-2 py-1">
                            Completed
                          </span>
                        )}
                        {!isWaiting && !isInConsult && !isCompleted && (
                          <span className="badge bg-blue-subtle text-primary px-2 py-1">
                            {apt.status}
                          </span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          {isCompleted ? (
                            <button
                              className="btn btn-sm btn-light text-secondary rounded-2 d-flex align-items-center gap-1 py-1 px-2"
                              onClick={() => onViewPatientHistory && onViewPatientHistory(apt.patient || apt)}
                              title="View Patient EMR History"
                            >
                              <History size={14} />
                              <span className="small">EMR History</span>
                            </button>
                          ) : (
                            <>
                              <button
                                className="btn btn-sm btn-light text-secondary rounded-2 p-1"
                                onClick={() => onViewPatientHistory && onViewPatientHistory(apt.patient || apt)}
                                title="View Patient Medical History"
                              >
                                <History size={16} />
                              </button>
                              <button
                                className="btn btn-sm btn-primary rounded-2 d-flex align-items-center gap-1 py-1 px-3 shadow-xs"
                                onClick={() => onStartConsultation && onStartConsultation(apt)}
                              >
                                <Stethoscope size={14} />
                                <span className="small fw-medium">Start Consult</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <Users size={36} className="text-muted opacity-50 mb-2" />
                        <h6 className="fw-semibold text-slate-700 mb-1">No patients in queue</h6>
                        <small>No appointments match the selected filter or status.</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientQueue;
