import React, { useState } from "react";
import {
  Stethoscope,
  Activity,
  Heart,
  Thermometer,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  User,
  ArrowLeft,
  Printer,
  Sparkles,
  Pill,
  Droplet,
} from "lucide-react";
import doctorService from "../../services/doctorService";
import PrescriptionForm from "./PrescriptionForm";

const ConsultationDesk = ({
  appointment,
  doctor,
  medicinesList = [],
  labTestsList = [],
  onConsultationCompleted,
  onCancel,
  showAlert,
}) => {
  const [rxForm, setRxForm] = useState({
    diagnosis: "",
    bp: "120/80",
    pulse: "76",
    temp: "98.6",
    symptoms: appointment?.reason || "",
    clinical_notes: "",
    follow_up_date: "",
    notes: "",
    medicines: [],
    external_medicines: [],
    lab_tests: [],
    external_lab_tests: [],
  });

  const [saving, setSaving] = useState(false);

  const patientName =
    appointment?.patient_name ||
    appointment?.patient?.full_name ||
    `${appointment?.patient?.first_name || ""} ${appointment?.patient?.last_name || ""}`.trim() ||
    "Patient";

  const patientId = appointment?.patient_id || appointment?.patient?.patient_id || "-";
  const tokenNumber = appointment?.token_number || "-";

  const handleSaveConsultation = async (e) => {
    e.preventDefault();

    setSaving(true);
    try {
      // Step 1: Create Consultation
      const diagnosisText = rxForm.diagnosis?.trim() || "General OPD Consultation / Routine Checkup";
      const consultationPayload = {
        appointment: appointment.id,
        chief_complaint: rxForm.symptoms || appointment?.reason || "Routine Consultation",
        symptoms: rxForm.symptoms || "None reported",
        diagnosis: diagnosisText,
        clinical_notes: rxForm.clinical_notes || "",
        follow_up_date: rxForm.follow_up_date || null,
      };

      const consultation = await doctorService.createConsultation(consultationPayload);

      // Step 2: Create Prescription
      const prescriptionPayload = {
        consultation: consultation.id,
        blood_pressure: rxForm.bp,
        pulse: rxForm.pulse,
        temperature: rxForm.temp,
        notes: rxForm.notes || rxForm.clinical_notes,
        medicines: rxForm.medicines
          .filter((m) => m.medicine)
          .map((m) => ({
            medicine: Number(m.medicine),
            dosage: m.dosage || "As directed",
            frequency: m.frequency || "1-0-1",
            duration: m.duration || "5 Days",
            quantity: Number(m.quantity || 10),
          })),
        external_medicines: (rxForm.external_medicines || []).filter((em) => em.medicine_name),
        lab_tests: rxForm.lab_tests
          .filter((t) => t.test)
          .map((t) => ({
            test: Number(t.test),
            notes: t.notes || "Clinical test",
          })),
        external_lab_tests: rxForm.external_lab_tests || [],
      };

      const prescription = await doctorService.createPrescription(prescriptionPayload);

      // Step 3: Complete Appointment Status
      try {
        await doctorService.updateAppointmentStatus(appointment.id, "COMPLETED");
      } catch (stErr) {
        console.warn("Status update warning:", stErr);
      }

      if (showAlert) {
        showAlert(
          "success",
          `Consultation & Prescription saved successfully for ${patientName} (Token #${tokenNumber})!`
        );
      }

      if (onConsultationCompleted) {
        onConsultationCompleted(prescription, appointment);
      }
    } catch (err) {
      console.error("Consultation save error:", err);
      const errMsg =
        err?.response?.data?.detail ||
        (err?.response?.data && typeof err.response.data === "object"
          ? Object.entries(err.response.data)
              .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
              .join(" | ")
          : "Failed to record consultation. Please verify required fields.");
      if (showAlert) showAlert("danger", errMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      {/* Top Patient Profile & Consultation Action Banner */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                onClick={onCancel}
              >
                <ArrowLeft size={16} /> Back to Queue
              </button>
              <div>
                <div className="d-flex align-items-center gap-2">
                  <h5 className="fw-bold mb-0 text-slate-900">{patientName}</h5>
                  <span className="badge bg-primary font-monospace fs-6 px-2 py-1">
                    Token #{tokenNumber}
                  </span>
                </div>
                <div className="text-muted small mt-1">
                  Patient ID: <strong className="text-slate-700">{patientId}</strong> • Visit Reason:{" "}
                  <span className="text-slate-700">{appointment.reason || "General OPD"}</span>
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-purple-subtle text-purple px-3 py-2 small">
                Consultation in Progress
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveConsultation} className="d-flex flex-column gap-4">
        {/* Patient Vitals Card */}
        <div className="card border-0 shadow-xs rounded-3 bg-white">
          <div className="card-body p-4">
            <h6 className="fw-bold text-slate-900 mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <Activity size={18} className="text-primary" /> Patient Clinical Vitals
            </h6>
            <div className="row g-3">
              <div className="col-sm-6 col-md-4">
                <label className="form-label small fw-semibold text-slate-700 mb-1">
                  Blood Pressure (mmHg)
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white text-muted">
                    <Heart size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="120/80"
                    value={rxForm.bp}
                    onChange={(e) => setRxForm((p) => ({ ...p, bp: e.target.value }))}
                  />
                </div>
              </div>

              <div className="col-sm-6 col-md-4">
                <label className="form-label small fw-semibold text-slate-700 mb-1">
                  Pulse Rate (bpm)
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white text-muted">
                    <Activity size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="72 bpm"
                    value={rxForm.pulse}
                    onChange={(e) => setRxForm((p) => ({ ...p, pulse: e.target.value }))}
                  />
                </div>
              </div>

              <div className="col-sm-6 col-md-4">
                <label className="form-label small fw-semibold text-slate-700 mb-1">
                  Body Temperature (°F)
                </label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white text-muted">
                    <Thermometer size={14} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="98.6 °F"
                    value={rxForm.temp}
                    onChange={(e) => setRxForm((p) => ({ ...p, temp: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Diagnosis & Notes Card */}
        <div className="card border-0 shadow-xs rounded-3 bg-white">
          <div className="card-body p-4">
            <h6 className="fw-bold text-slate-900 mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
              <Stethoscope size={18} className="text-primary" /> Diagnosis & Clinical Evaluation
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-semibold text-slate-700">
                  Clinical Diagnosis <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="form-control"
                  placeholder="e.g. Acute Bronchitis, Type 2 Diabetes, Migraine..."
                  value={rxForm.diagnosis}
                  onChange={(e) => setRxForm((p) => ({ ...p, diagnosis: e.target.value }))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-slate-700">
                  Follow-up Review Date
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={rxForm.follow_up_date}
                  onChange={(e) => setRxForm((p) => ({ ...p, follow_up_date: e.target.value }))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-slate-700">
                  Reported Symptoms & Chief Complaints
                </label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="e.g. Dry cough since 4 days, low grade evening fever, mild fatigue"
                  value={rxForm.symptoms}
                  onChange={(e) => setRxForm((p) => ({ ...p, symptoms: e.target.value }))}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-semibold text-slate-700">
                  Doctor's Clinical Notes & Dietary Advice
                </label>
                <textarea
                  rows="3"
                  className="form-control"
                  placeholder="e.g. Advised steam inhalation twice daily, low sodium diet, avoid cold drinks"
                  value={rxForm.clinical_notes}
                  onChange={(e) => setRxForm((p) => ({ ...p, clinical_notes: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Builder (Medicines & Lab Investigations) */}
        <PrescriptionForm
          medicinesList={medicinesList}
          labTestsList={labTestsList}
          rxForm={rxForm}
          setRxForm={setRxForm}
        />

        {/* Submit Bar */}
        <div className="card border-0 shadow-xs rounded-3 bg-white">
          <div className="card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-2 px-3"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel Consultation
            </button>

            <button
              type="submit"
              disabled={saving || !rxForm.diagnosis.trim()}
              className="btn btn-primary rounded-2 px-4 py-2 fw-semibold shadow-xs d-flex align-items-center gap-2"
            >
              <CheckCircle2 size={18} />
              {saving ? "Saving Record..." : "Complete Consultation & Issue Prescription"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ConsultationDesk;
