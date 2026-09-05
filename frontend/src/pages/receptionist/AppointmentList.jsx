import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  CreditCard,
  UserX,
  RefreshCw,
  Eye,
  Plus,
  Stethoscope,
  Filter,
  Users,
} from "lucide-react";
import receptionistService from "../../services/receptionistService";

const AppointmentList = ({
  appointments = [],
  doctors = [],
  bills = [],
  onRefresh,
  onOpenBooking,
  onCollectPayment,
  onPrintBill,
  showAlert,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [dateFilter, setDateFilter] = useState(todayStr);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [doctorFilter, setDoctorFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const handleCheckIn = async (appointment) => {
    setActionLoadingId(appointment.id);
    try {
      // Perform check-in (auto-creates OPD bill and issues token)
      const response = await receptionistService.checkInAppointment(appointment.id, {
        payment_method: "CASH",
      });

      if (showAlert) {
        showAlert(
          "success",
          `Patient ${response.patient_name || "checked in"} assigned Token #${response.token_number || 1}!`
        );
      }

      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Check in error:", err);
      const errMsg =
        err?.response?.data?.detail ||
        (err?.response?.data && typeof err.response.data === "object"
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : "Check-in failed. Ensure appointment is today.");
      if (showAlert) showAlert("danger", errMsg);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

    setActionLoadingId(appointmentId);
    try {
      await receptionistService.updateAppointmentStatus(appointmentId, "CANCELLED");
      if (showAlert) showAlert("success", "Appointment cancelled successfully.");
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Cancel error:", err);
      if (showAlert) showAlert("danger", "Failed to cancel appointment.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchDate = !dateFilter || apt.appointment_date === dateFilter;
    const matchStatus = statusFilter === "ALL" || apt.status === statusFilter;
    const matchDoctor =
      doctorFilter === "ALL" ||
      String(apt.doctor) === String(doctorFilter) ||
      String(apt.doctor_id) === String(doctorFilter);

    const term = searchQuery.toLowerCase().trim();
    const patientName = (apt.patient_name || apt.patient?.full_name || "").toLowerCase();
    const patientId = (apt.patient_id || apt.patient?.patient_id || "").toLowerCase();
    const doctorName = (apt.doctor_name || "").toLowerCase();

    const matchSearch =
      !term ||
      patientName.includes(term) ||
      patientId.includes(term) ||
      doctorName.includes(term);

    return matchDate && matchStatus && matchDoctor && matchSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "BOOKED":
        return <span className="badge bg-blue-subtle text-primary font-medium px-2 py-1">Booked</span>;
      case "TOKEN_PENDING":
        return <span className="badge bg-amber-subtle text-warning-emphasis font-medium px-2 py-1">Payment Due</span>;
      case "CHECKED_IN":
        return <span className="badge bg-emerald-subtle text-success font-medium px-2 py-1">Checked In (Queue)</span>;
      case "IN_CONSULTATION":
        return <span className="badge bg-purple-subtle text-purple font-medium px-2 py-1">In Consultation</span>;
      case "COMPLETED":
        return <span className="badge bg-slate-100 text-slate-700 font-medium px-2 py-1">Completed</span>;
      case "CANCELLED":
        return <span className="badge bg-danger-subtle text-danger font-medium px-2 py-1">Cancelled</span>;
      default:
        return <span className="badge bg-slate-100 text-slate-700 font-medium px-2 py-1">{status}</span>;
    }
  };

  // Metrics for active date
  const dateAppointments = appointments.filter((a) => !dateFilter || a.appointment_date === dateFilter);
  const checkedInCount = dateAppointments.filter((a) => a.status === "CHECKED_IN" || a.status === "TOKEN_PENDING").length;
  const inConsultCount = dateAppointments.filter((a) => a.status === "IN_CONSULTATION").length;
  const completedCount = dateAppointments.filter((a) => a.status === "COMPLETED").length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Banner & Quick Metrics */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Scheduled</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{dateAppointments.length}</h4>
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
                <span className="text-muted small fw-semibold text-uppercase">In Queue / Waiting</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{checkedInCount}</h4>
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
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{inConsultCount}</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Stethoscope size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Completed Visits</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{completedCount}</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <CheckCircle2 size={22} />
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
              <h5 className="fw-bold mb-0 text-slate-900">Appointments Desk & Patient Check-In</h5>
              <p className="text-muted small mb-0">
                Track daily appointments, process patient token check-in, and manage consultations.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                onClick={onRefresh}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
              <button
                className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs fw-medium px-3 py-2"
                onClick={onOpenBooking}
              >
                <Plus size={16} />
                <span>New Appointment</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="row g-2 mb-3">
            <div className="col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search patient or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>

            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses ({appointments.length})</option>
                <option value="BOOKED">Booked</option>
                <option value="CHECKED_IN">Checked In (In Queue)</option>
                <option value="IN_CONSULTATION">In Consultation</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
              >
                <option value="ALL">All Doctors ({doctors.length})</option>
                {doctors.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    Dr. {doc.first_name} {doc.last_name || ""}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted small text-uppercase">Token / Time</th>
                  <th className="border-0 text-muted small text-uppercase">Patient Details</th>
                  <th className="border-0 text-muted small text-uppercase">Consulting Doctor</th>
                  <th className="border-0 text-muted small text-uppercase">Appointment Date</th>
                  <th className="border-0 text-muted small text-uppercase">Status</th>
                  <th className="border-0 text-muted small text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt) => {
                  const bill = bills.find(
                    (b) => Number(b.appointment) === Number(apt.id) || b.appointment_id === apt.id
                  );
                  const isPaid = bill?.payment_status === "PAID";
                  const canCheckIn = apt.status === "BOOKED" || apt.status === "TOKEN_PENDING";

                  return (
                    <tr key={apt.id}>
                      <td>
                        {apt.token_number ? (
                          <span className="badge bg-primary font-monospace fs-6 px-2 py-1">
                            #{apt.token_number}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-monospace small">
                            <Clock size={12} className="me-1 text-muted" />
                            {apt.appointment_time?.slice(0, 5) || "-"}
                          </span>
                        )}
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold text-slate-900">
                            {apt.patient_name || apt.patient?.full_name || "Patient"}
                          </div>
                          <div className="text-muted small">
                            ID: {apt.patient_id || apt.patient?.patient_id || `#${apt.patient}`}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold text-slate-800">
                            {apt.doctor_name || `Dr. ${apt.doctor?.first_name || ""}`}
                          </div>
                          <div className="text-muted small" style={{ fontSize: "11px" }}>
                            {apt.doctor?.department?.name || apt.doctor?.specialization || "General OPD"}
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-700 small">
                        {apt.appointment_date}
                      </td>
                      <td>
                        {getStatusBadge(apt.status)}
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          {/* Check In Action Button */}
                          {canCheckIn && (
                            <button
                              className="btn btn-sm btn-success rounded-2 d-flex align-items-center gap-1 py-1 px-2"
                              disabled={actionLoadingId === apt.id}
                              onClick={() => handleCheckIn(apt)}
                              title="Check In Patient (Assign OPD Token)"
                            >
                              <UserCheck size={14} />
                              <span className="small">Check In</span>
                            </button>
                          )}

                          {/* Collect Payment if pending */}
                          {!isPaid && apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                            <button
                              className="btn btn-sm btn-outline-warning rounded-2 d-flex align-items-center gap-1 py-1 px-2"
                              onClick={() => onCollectPayment && onCollectPayment(apt, bill)}
                              title="Collect OPD Consultation Fee"
                            >
                              <CreditCard size={14} />
                              <span className="small">Collect Fee</span>
                            </button>
                          )}

                          {/* Print Token Slip / Bill */}
                          {bill && (
                            <button
                              className="btn btn-sm btn-light text-secondary rounded-2 p-1"
                              onClick={() => onPrintBill && onPrintBill(bill, apt)}
                              title="Print OPD Token Slip & Bill"
                            >
                              <Printer size={15} />
                            </button>
                          )}

                          {/* Cancel */}
                          {apt.status !== "CANCELLED" && apt.status !== "COMPLETED" && (
                            <button
                              className="btn btn-sm btn-light text-danger rounded-2 p-1"
                              disabled={actionLoadingId === apt.id}
                              onClick={() => handleCancelAppointment(apt.id)}
                              title="Cancel Appointment"
                            >
                              <UserX size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAppointments.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <CalendarDays size={36} className="text-muted opacity-50 mb-2" />
                        <h6 className="fw-semibold text-slate-700 mb-1">No appointments found</h6>
                        <small>No appointments match the selected filters or date.</small>
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

export default AppointmentList;
