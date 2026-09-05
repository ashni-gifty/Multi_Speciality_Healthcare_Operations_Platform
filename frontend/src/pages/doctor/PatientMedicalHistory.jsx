import React, { useState, useEffect } from "react";
import {
  History,
  User,
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  Search,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  X,
  Droplet,
  Phone,
} from "lucide-react";
import doctorService from "../../services/doctorService";

const PatientMedicalHistory = ({
  patient,
  patients = [],
  onPrintPrescription,
  onClose,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(
    patient?.id || patient?.patient_id || (patients.length > 0 ? patients[0].id : "")
  );

  const [historyData, setHistoryData] = useState({
    consultations: [],
    prescriptions: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedPatientId) {
      loadHistory(selectedPatientId);
    }
  }, [selectedPatientId]);

  const loadHistory = async (pId) => {
    setLoading(true);
    try {
      const data = await doctorService.getPatientHistory(pId);
      setHistoryData(data);
    } catch (err) {
      console.error("Error loading patient history:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentPatient = patients.find(
    (p) => String(p.id) === String(selectedPatientId) || p.patient_id === selectedPatientId
  ) || patient;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Header & Patient Picker */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 bg-blue-subtle text-primary rounded-3">
                <History size={20} />
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-slate-900">Patient Longitudinal Medical Record</h5>
                <p className="text-muted small mb-0">
                  Timeline of past consultations, diagnoses, vital observations, and medication history.
                </p>
              </div>
            </div>

            <div className="d-flex gap-2 align-items-center">
              <select
                className="form-select form-select-sm"
                style={{ minWidth: "260px" }}
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.patient_id} - {p.full_name || `${p.first_name} ${p.last_name || ""}`}
                  </option>
                ))}
              </select>

              {onClose && (
                <button className="btn btn-sm btn-outline-secondary rounded-2 p-1" onClick={onClose}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Selected Patient Demographic Profile Bar */}
          {currentPatient && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-100 rounded-3 d-flex flex-wrap justify-content-between align-items-center gap-2 small">
              <div className="d-flex align-items-center gap-2">
                <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold small">
                  {(currentPatient.first_name || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                  <strong className="text-slate-900 d-block">
                    {currentPatient.full_name || `${currentPatient.first_name || ""} ${currentPatient.last_name || ""}`}
                  </strong>
                  <span className="badge bg-blue-subtle text-primary font-monospace" style={{ fontSize: "10px" }}>
                    {currentPatient.patient_id || `#${currentPatient.id}`}
                  </span>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 text-slate-700">
                <span>Gender: <strong className="text-slate-900">{currentPatient.gender || "-"}</strong></span>
                <span>DOB: <strong className="text-slate-900">{currentPatient.date_of_birth || "-"}</strong></span>
                <span>Blood: <strong className="text-danger">{currentPatient.blood_group || "-"}</strong></span>
                <span>Phone: <strong className="text-slate-900">{currentPatient.phone || "-"}</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clinical Consultation History */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h6 className="fw-bold mb-0 text-slate-900 d-flex align-items-center gap-2">
              <FileText size={18} className="text-primary" /> Past Consultations & Diagnoses ({historyData.consultations?.length || 0})
            </h6>
          </div>

          {loading ? (
            <div className="text-center py-4 text-muted">
              <Clock size={24} className="spin mb-2" />
              <div>Loading medical history...</div>
            </div>
          ) : historyData.consultations?.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-3 text-center text-muted border border-slate-100">
              No prior consultations recorded for this patient.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 text-muted small text-uppercase">Date</th>
                    <th className="border-0 text-muted small text-uppercase">Doctor</th>
                    <th className="border-0 text-muted small text-uppercase">Chief Complaint</th>
                    <th className="border-0 text-muted small text-uppercase">Diagnosis</th>
                    <th className="border-0 text-muted small text-uppercase">Follow-Up</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.consultations.map((c) => (
                    <tr key={c.id}>
                      <td className="text-muted small">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString("en-IN") : "-"}
                      </td>
                      <td className="fw-medium text-slate-800">
                        {c.doctor_name || `Dr. ${c.doctor?.first_name || ""}`}
                      </td>
                      <td className="text-slate-700 small">{c.chief_complaint || c.symptoms || "-"}</td>
                      <td>
                        <span className="badge bg-blue-subtle text-primary font-medium px-2 py-1">
                          {c.diagnosis}
                        </span>
                      </td>
                      <td className="text-muted small">{c.follow_up_date || "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Prescription History */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
            <h6 className="fw-bold mb-0 text-slate-900 d-flex align-items-center gap-2">
              <Pill size={18} className="text-purple" /> Prescription Archives ({historyData.prescriptions?.length || 0})
            </h6>
          </div>

          {historyData.prescriptions?.length === 0 ? (
            <div className="p-4 bg-slate-50 rounded-3 text-center text-muted border border-slate-100">
              No prescriptions on record.
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="border-0 text-muted small text-uppercase">Rx ID</th>
                    <th className="border-0 text-muted small text-uppercase">Date</th>
                    <th className="border-0 text-muted small text-uppercase">Vitals (BP / Pulse / Temp)</th>
                    <th className="border-0 text-muted small text-uppercase">Medicines</th>
                    <th className="border-0 text-muted small text-uppercase text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {historyData.prescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td>
                        <span className="badge bg-purple-subtle text-purple font-monospace px-2 py-1">
                          {rx.rx_id || `RX-${rx.id}`}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {rx.created_at ? new Date(rx.created_at).toLocaleDateString("en-IN") : "-"}
                      </td>
                      <td className="text-slate-700 small font-monospace">
                        BP: {rx.blood_pressure || "120/80"} • HR: {rx.pulse || "72"} • Temp: {rx.temperature || "98.6"}°F
                      </td>
                      <td>
                        <span className="badge bg-slate-100 text-slate-700 px-2 py-1 small">
                          {(rx.medicines?.length || 0) + (rx.external_medicines?.length || 0)} items prescribed
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-light text-primary rounded-2 p-1"
                          onClick={() => onPrintPrescription && onPrintPrescription(rx)}
                          title="Print Prescription Slip"
                        >
                          <Printer size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientMedicalHistory;
