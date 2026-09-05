import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  User,
  Stethoscope,
  Building,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  Receipt,
  FileText,
  Search,
  Check,
  UserCheck,
} from "lucide-react";
import receptionistService from "../../services/receptionistService";

const AppointmentBooking = ({
  patients = [],
  doctors = [],
  preselectedPatient = null,
  onBookingSuccess,
  showAlert,
}) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const [selectedPatientId, setSelectedPatientId] = useState(
    preselectedPatient?.id || preselectedPatient?.patient_id || ""
  );
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(todayStr);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [reason, setReason] = useState("");

  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Update selected patient when preselected prop changes
  useEffect(() => {
    if (preselectedPatient) {
      setSelectedPatientId(preselectedPatient.id || preselectedPatient.patient_id);
    }
  }, [preselectedPatient]);

  // Load available slots whenever doctor or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctorId || !appointmentDate) {
        setAvailableSlots([]);
        setSelectedTimeSlot("");
        return;
      }

      setLoadingSlots(true);
      setSelectedTimeSlot("");
      try {
        const slots = await receptionistService.getAvailableSlots(
          selectedDoctorId,
          appointmentDate
        );
        setAvailableSlots(slots || []);
      } catch (err) {
        console.error("Failed to load slots:", err);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, appointmentDate]);

  const selectedDoctor = doctors.find(
    (d) => String(d.id) === String(selectedDoctorId)
  );

  const selectedPatient = patients.find(
    (p) => String(p.id) === String(selectedPatientId) || p.patient_id === selectedPatientId
  );

  const filteredPatientList = patients.filter((p) => {
    const term = patientSearch.toLowerCase().trim();
    const name = (p.full_name || `${p.first_name || ""} ${p.last_name || ""}`).toLowerCase();
    return (
      !term ||
      name.includes(term) ||
      (p.patient_id && p.patient_id.toLowerCase().includes(term)) ||
      (p.phone && p.phone.includes(term))
    );
  });

  const handleSubmitBooking = async (e) => {
    e.preventDefault();

    if (!selectedPatientId) {
      if (showAlert) showAlert("danger", "Please select a patient.");
      return;
    }

    if (!selectedDoctorId) {
      if (showAlert) showAlert("danger", "Please select a doctor.");
      return;
    }

    if (!appointmentDate) {
      if (showAlert) showAlert("danger", "Please pick an appointment date.");
      return;
    }

    if (!selectedTimeSlot) {
      if (showAlert) showAlert("danger", "Please choose an available appointment slot.");
      return;
    }

    setSubmitting(true);
    try {
      const patientObj = patients.find(
        (p) => String(p.id) === String(selectedPatientId) || p.patient_id === selectedPatientId
      );
      const patientPk = patientObj?.id || selectedPatientId;

      const payload = {
        patient: Number(patientPk),
        doctor: Number(selectedDoctorId),
        appointment_date: appointmentDate,
        appointment_time: selectedTimeSlot,
        reason: reason || "General OPD Consultation",
      };

      const appointment = await receptionistService.createAppointment(payload);

      // Automatically generate OPD Bill for appointment
      try {
        await receptionistService.createBill(appointment.id);
      } catch (billErr) {
        console.warn("Auto bill creation note:", billErr);
      }

      if (showAlert) {
        showAlert(
          "success",
          `Appointment successfully booked for ${appointment.patient_name || "Patient"} on ${appointmentDate} at ${selectedTimeSlot}!`
        );
      }

      // Reset form
      setReason("");
      setSelectedTimeSlot("");
      if (onBookingSuccess) {
        onBookingSuccess(appointment);
      }
    } catch (err) {
      console.error("Booking error:", err);
      const errMsg =
        err?.response?.data?.detail ||
        (err?.response?.data && typeof err.response.data === "object"
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : "Failed to book appointment.");
      if (showAlert) showAlert("danger", errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row g-4">
      {/* Left Column: Interactive Booking Form */}
      <div className="col-lg-8">
        <div className="card border-0 shadow-xs rounded-3 bg-white">
          <div className="card-body p-4">
            {/* Header */}
            <div className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom">
              <div className="p-2 bg-blue-subtle text-primary rounded-3">
                <CalendarDays size={20} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-slate-900">Schedule OPD Consultation</h5>
                <p className="text-muted small mb-0">
                  Select registered patient, physician, and available appointment slot.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitBooking}>
              {/* 1. Patient Selection */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-slate-700">
                  1. Select Registered Patient <span className="text-danger">*</span>
                </label>

                {preselectedPatient ? (
                  <div className="p-3 bg-blue-subtle border border-primary-subtle rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold text-slate-900">
                        {preselectedPatient.full_name ||
                          `${preselectedPatient.first_name} ${preselectedPatient.last_name || ""}`}
                      </div>
                      <small className="text-muted">
                        ID: {preselectedPatient.patient_id} • Phone: {preselectedPatient.phone}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-2"
                      onClick={() => setSelectedPatientId("")}
                    >
                      Change Patient
                    </button>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <Search size={14} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Type name, patient ID, or phone to filter..."
                        value={patientSearch}
                        onChange={(e) => setPatientSearch(e.target.value)}
                      />
                    </div>
                    <select
                      className="form-select form-select-sm"
                      required
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(e.target.value)}
                    >
                      <option value="">-- Choose Patient ({filteredPatientList.length}) --</option>
                      {filteredPatientList.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.patient_id} - {p.full_name || `${p.first_name} ${p.last_name || ""}`} ({p.phone || "No phone"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 2. Doctor Selection */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-slate-700">
                  2. Select Consulting Physician <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-sm"
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  <option value="">-- Choose Consulting Doctor ({doctors.length}) --</option>
                  {doctors.map((doc) => {
                    const docName =
                      doc.doctor_name ||
                      `Dr. ${doc.first_name || ""} ${doc.last_name || ""}`.trim();
                    const dept = doc.department?.name || doc.specialization || "General Medicine";
                    const fee = doc.consultation_fee ? ` (Fee: ₹${doc.consultation_fee})` : "";
                    return (
                      <option key={doc.id} value={doc.id}>
                        {docName} — {dept}{fee}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 3. Date Selection */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-slate-700">
                  3. Appointment Date <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    style={{ maxWidth: "220px" }}
                    min={todayStr}
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                  <button
                    type="button"
                    className={`btn btn-sm rounded-2 px-3 ${
                      appointmentDate === todayStr ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setAppointmentDate(todayStr)}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-2 px-3"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setAppointmentDate(tomorrow.toISOString().split("T")[0]);
                    }}
                  >
                    Tomorrow
                  </button>
                </div>
              </div>

              {/* 4. Available Time Slots Grid */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label small fw-semibold text-slate-700 mb-0">
                    4. Choose Time Slot <span className="text-danger">*</span>
                  </label>
                  {loadingSlots && (
                    <span className="text-muted small">
                      <Clock size={12} className="spin me-1" />
                      Checking schedule...
                    </span>
                  )}
                </div>

                {!selectedDoctorId ? (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-3 text-center text-muted small">
                    Please select a doctor and date to view available time slots.
                  </div>
                ) : availableSlots.length === 0 && !loadingSlots ? (
                  <div className="p-3 bg-amber-subtle border border-warning-subtle rounded-3 text-warning-emphasis small d-flex align-items-center gap-2">
                    <AlertCircle size={16} />
                    <span>No available slots found for this doctor on selected date.</span>
                  </div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedTimeSlot === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          className={`btn btn-sm rounded-2 d-flex align-items-center gap-1 px-3 py-2 ${
                            isSelected
                              ? "btn-primary shadow-xs"
                              : "btn-outline-secondary"
                          }`}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          <Clock size={13} />
                          <span className="font-monospace fw-medium">{slot}</span>
                          {isSelected && <Check size={13} className="ms-1" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Clinical Reason */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-slate-700">
                  5. Reason for Consultation / Symptoms (Optional)
                </label>
                <textarea
                  rows="2"
                  className="form-control"
                  placeholder="e.g. Routine checkup, fever since 2 days, follow-up"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              {/* Submit Button */}
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="submit"
                  disabled={submitting || !selectedTimeSlot || !selectedDoctorId || !selectedPatientId}
                  className="btn btn-primary rounded-2 px-4 py-2 fw-semibold shadow-xs d-flex align-items-center gap-2"
                >
                  <CalendarDays size={16} />
                  {submitting ? "Booking Appointment..." : "Confirm & Book OPD Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Column: Appointment Summary Card */}
      <div className="col-lg-4">
        <div className="card border-0 shadow-xs rounded-3 bg-white h-100">
          <div className="card-body p-4">
            <h6 className="fw-bold text-slate-900 mb-3 pb-2 border-bottom">Booking Preview</h6>

            {/* Selected Patient */}
            <div className="mb-3">
              <span className="text-muted small text-uppercase fw-semibold">Patient:</span>
              <div className="fw-bold text-slate-900 mt-1">
                {selectedPatient
                  ? selectedPatient.full_name || `${selectedPatient.first_name} ${selectedPatient.last_name || ""}`
                  : "Not selected"}
              </div>
              {selectedPatient && (
                <small className="text-muted">
                  ID: {selectedPatient.patient_id} • {selectedPatient.gender} • {selectedPatient.phone}
                </small>
              )}
            </div>

            {/* Selected Doctor */}
            <div className="mb-3">
              <span className="text-muted small text-uppercase fw-semibold">Doctor:</span>
              <div className="fw-bold text-slate-900 mt-1">
                {selectedDoctor
                  ? selectedDoctor.doctor_name || `Dr. ${selectedDoctor.first_name} ${selectedDoctor.last_name || ""}`
                  : "Not selected"}
              </div>
              {selectedDoctor && (
                <small className="text-muted">
                  {selectedDoctor.department?.name || selectedDoctor.specialization || "General OPD"}
                </small>
              )}
            </div>

            {/* Date & Time */}
            <div className="mb-3">
              <span className="text-muted small text-uppercase fw-semibold">Schedule:</span>
              <div className="fw-bold text-slate-900 mt-1">
                {appointmentDate || "-"} {selectedTimeSlot ? `at ${selectedTimeSlot}` : ""}
              </div>
            </div>

            {/* Consultation Fee */}
            <div className="p-3 bg-blue-subtle border border-primary-subtle rounded-3 mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="small text-primary fw-semibold">Consultation Fee</span>
                <span className="fs-5 fw-bold text-primary">
                  ₹{selectedDoctor?.consultation_fee || 500}
                </span>
              </div>
              <small className="text-muted d-block mt-1" style={{ fontSize: "11px" }}>
                Auto-generates OPD invoice upon booking.
              </small>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-3 text-slate-600 small">
              <div className="d-flex align-items-start gap-2">
                <CheckCircle2 size={16} className="text-success mt-1 flex-shrink-0" />
                <span>
                  After booking, the patient can clear the consultation bill at the Billing Desk and check in to receive an OPD queue token.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentBooking;
