import React, { useState } from "react";
import {
  Users,
  Clock,
  CheckCircle2,
  Stethoscope,
  RefreshCw,
  Search,
  Activity,
  UserCheck,
  Building,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
} from "lucide-react";

const TokenQueue = ({ appointments = [], doctors = [], onRefresh, loading = false }) => {
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

  const todayAppointments = appointments.filter(
    (apt) => apt.appointment_date === todayStr
  );

  // Group appointments by Doctor
  const doctorQueues = doctors.map((doc) => {
    const docId = doc.id || doc.staff_id;
    const docName =
      doc.doctor_name ||
      `${doc.first_name || ""} ${doc.last_name || ""}`.trim() ||
      doc.user?.first_name ||
      "Doctor";
    const deptName = doc.department?.name || doc.specialization || "General Medicine";

    const docApts = todayAppointments.filter(
      (a) =>
        Number(a.doctor) === Number(doc.id) ||
        Number(a.doctor_id) === Number(doc.id) ||
        a.doctor_name?.includes(doc.first_name)
    );

    const checkedIn = docApts.filter(
      (a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING"
    ).sort((a, b) => (a.token_number || 999) - (b.token_number || 999));

    const inConsultation = docApts.find(
      (a) => a.status === "IN_CONSULTATION"
    );

    const completed = docApts.filter(
      (a) => a.status === "COMPLETED"
    );

    return {
      doctor: doc,
      docId,
      docName,
      deptName,
      inConsultation,
      waitingQueue: checkedIn,
      completedCount: completed.length,
      totalToday: docApts.length,
    };
  });

  const filteredQueues = doctorQueues.filter((q) => {
    const matchDoctor =
      selectedDoctorFilter === "ALL" || String(q.docId) === String(selectedDoctorFilter);
    const matchSearch =
      q.docName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.deptName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchDoctor && matchSearch;
  });

  const totalWaiting = todayAppointments.filter(
    (a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING"
  ).length;

  const totalInConsultation = todayAppointments.filter(
    (a) => a.status === "IN_CONSULTATION"
  ).length;

  const totalCompleted = todayAppointments.filter(
    (a) => a.status === "COMPLETED"
  ).length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner & Quick Metrics */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Today's Total OPD</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{todayAppointments.length}</h4>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <CalendarDays size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Waiting in Lounge</span>
                <h4 className="fw-bold mt-1 mb-0 text-warning-emphasis">{totalWaiting}</h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">In Consultation</span>
                <h4 className="fw-bold mt-1 mb-0 text-purple">{totalInConsultation}</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Activity size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Completed Visits</span>
                <h4 className="fw-bold mt-1 mb-0 text-success">{totalCompleted}</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          {/* Header Controls */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">OPD Live Doctor Queues & Token Display</h5>
              <p className="text-muted small mb-0">
                Real-time patient sequence monitoring by consulting physician room.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw size={14} className={loading ? "spin" : ""} />
                <span>Refresh Live Queues</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="row g-2 mb-4">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Filter by doctor name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select form-select-sm"
                value={selectedDoctorFilter}
                onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              >
                <option value="ALL">All Consulting Doctors ({doctors.length})</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name || ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Queues Grid by Doctor */}
          <div className="row g-4">
            {filteredQueues.map((q) => (
              <div key={q.docId} className="col-lg-6">
                <div className="card border border-slate-100 rounded-3 shadow-xs bg-white h-100 overflow-hidden">
                  {/* Doctor Room Header */}
                  <div className="bg-slate-900 text-white p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small">
                        Dr
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-white">Dr. {q.docName}</h6>
                        <small className="text-slate-400">{q.deptName}</small>
                      </div>
                    </div>
                    <span className="badge bg-emerald-subtle text-success px-2 py-1">
                      {q.waitingQueue.length} Waiting
                    </span>
                  </div>

                  <div className="p-3 d-flex flex-column gap-3">
                    {/* Currently In Consultation */}
                    <div>
                      <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ fontSize: "11px" }}>
                        Now In Consultation:
                      </div>
                      {q.inConsultation ? (
                        <div className="p-3 bg-emerald-subtle border border-success-subtle rounded-3 d-flex justify-content-between align-items-center">
                          <div>
                            <span className="badge bg-success text-white font-monospace fs-6 px-2 py-1 me-2">
                              Token #{q.inConsultation.token_number || "-"}
                            </span>
                            <span className="fw-bold text-slate-900">
                              {q.inConsultation.patient_name || q.inConsultation.patient?.full_name || "Patient"}
                            </span>
                          </div>
                          <span className="badge bg-success text-white px-2 py-1 small">
                            Inside Room
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 bg-slate-50 border border-slate-100 rounded-2 text-muted small text-center">
                          Doctor is available (No active consultation in progress)
                        </div>
                      )}
                    </div>

                    {/* Waiting Tokens Queue */}
                    <div>
                      <div className="text-muted small text-uppercase fw-semibold mb-1" style={{ fontSize: "11px" }}>
                        Next In Queue ({q.waitingQueue.length}):
                      </div>

                      {q.waitingQueue.length > 0 ? (
                        <div className="d-flex flex-column gap-2" style={{ maxHeight: "220px", overflowY: "auto" }}>
                          {q.waitingQueue.map((apt, idx) => (
                            <div
                              key={apt.id}
                              className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-slate-50 border border-slate-100"
                            >
                              <div className="d-flex align-items-center gap-2">
                                <span className={`badge ${idx === 0 ? "bg-warning text-dark" : "bg-primary text-white"} font-monospace`}>
                                  #{apt.token_number || idx + 1}
                                </span>
                                <div>
                                  <strong className="d-block text-slate-800 small">
                                    {apt.patient_name || apt.patient?.full_name || "Patient"}
                                  </strong>
                                  <small className="text-muted" style={{ fontSize: "11px" }}>
                                    Slot: {apt.appointment_time?.slice(0, 5) || "-"}
                                  </small>
                                </div>
                              </div>
                              <span className="badge bg-slate-200 text-slate-700 small px-2 py-1">
                                {idx === 0 ? "Next Up" : `Position ${idx + 1}`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2 text-muted small text-center">
                          No patients currently waiting in lounge.
                        </div>
                      )}
                    </div>

                    {/* Summary Footer */}
                    <div className="pt-2 border-top d-flex justify-content-between align-items-center text-muted small">
                      <span>Total Today: <strong>{q.totalToday}</strong></span>
                      <span>Finished: <strong className="text-success">{q.completedCount}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredQueues.length === 0 && (
              <div className="col-12 text-center py-5 text-muted">
                <Users size={36} className="text-muted opacity-50 mb-2" />
                <h6 className="fw-semibold text-slate-700 mb-1">No doctor queues found</h6>
                <small>No doctors match the selected filter.</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenQueue;
