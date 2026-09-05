import React from "react";
import { Printer, X, Stethoscope, Building2, Calendar, User, Phone, FileText, Droplet, Activity } from "lucide-react";

const PrescriptionPrint = ({ prescription, doctor, onClose }) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName =
    prescription.patient_name ||
    (prescription.patient ? `${prescription.patient.first_name || ""} ${prescription.patient.last_name || ""}`.trim() : "Patient");

  const patientId = prescription.patient?.patient_id || prescription.patient_id || "-";
  const doctorName =
    prescription.doctor_name_display ||
    prescription.doctor_name ||
    (doctor ? `Dr. ${doctor.first_name || ""} ${doctor.last_name || ""}`.trim() : "Attending Doctor");

  const rxId = prescription.rx_id || `RX-${prescription.id || "001"}`;
  const rxDate = prescription.created_at
    ? new Date(prescription.created_at).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : new Date().toLocaleDateString("en-IN");

  const medicines = prescription.medicines || prescription.prescription_medicines || [];
  const externalMedicines = prescription.external_medicines || [];
  const labTests = prescription.lab_tests || prescription.prescription_lab_tests || [];
  const externalLabTests = prescription.external_lab_tests || [];

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Top Bar - Non Printable */}
          <div className="modal-header bg-slate-900 text-white d-print-none px-4 py-3 border-0 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                <Printer size={18} />
              </div>
              <div>
                <h6 className="modal-title fw-bold mb-0 text-white">Prescription Document ({rxId})</h6>
                <small className="text-slate-400">Official Clinical Rx & Diagnostic Order</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-2 px-3 d-flex align-items-center gap-1 shadow-xs"
                onClick={handlePrint}
              >
                <Printer size={14} /> Print Rx
              </button>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Printable Prescription Sheet */}
          <div className="modal-body p-4 p-md-5 bg-white" id="printable-rx">
            {/* Hospital & Doctor Header */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div className="bg-primary text-white p-2 rounded-3">
                    <Stethoscope size={24} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-slate-900">Hospital Healthcare Center</h4>
                    <span className="text-muted small">Multi-Speciality Clinical Services & Research</span>
                  </div>
                </div>
                <div className="text-muted small mt-2" style={{ fontSize: "11px" }}>
                  124 Medical Enclave, Health District • Phone: +91 (800) 456-7890
                </div>
              </div>

              <div className="text-end">
                <h5 className="fw-bold text-primary mb-0">{doctorName}</h5>
                <span className="badge bg-blue-subtle text-primary border-0 small">
                  {doctor?.department?.name || doctor?.specialization || "Consulting Physician"}
                </span>
                <div className="text-muted small mt-1 font-monospace" style={{ fontSize: "11px" }}>
                  Reg No: {doctor?.staff_id || "MED-2026"}
                </div>
              </div>
            </div>

            {/* Patient Demographics & Vitals Bar */}
            <div className="bg-slate-50 border border-slate-100 rounded-3 p-3 mb-4">
              <div className="row g-2 small">
                <div className="col-4">
                  <span className="text-muted d-block">Patient Name:</span>
                  <strong className="text-slate-900 fs-6">{patientName}</strong>
                </div>
                <div className="col-4">
                  <span className="text-muted d-block">Patient ID:</span>
                  <strong className="text-slate-900 font-monospace">{patientId}</strong>
                </div>
                <div className="col-4 text-end">
                  <span className="text-muted d-block">Date of Visit:</span>
                  <strong className="text-slate-900">{rxDate}</strong>
                </div>

                <div className="col-12 pt-2 border-top mt-2 d-flex flex-wrap gap-4 text-muted">
                  <span>
                    BP: <strong className="text-slate-800">{prescription.blood_pressure || "120/80"} mmHg</strong>
                  </span>
                  <span>
                    Pulse: <strong className="text-slate-800">{prescription.pulse || "72"} bpm</strong>
                  </span>
                  <span>
                    Temp: <strong className="text-slate-800">{prescription.temperature || "98.6"} °F</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Diagnosis Banner */}
            <div className="mb-4">
              <span className="text-muted small text-uppercase fw-bold tracking-wide">
                Clinical Diagnosis:
              </span>
              <h5 className="fw-bold text-slate-900 mt-1 mb-0">
                {prescription.diagnosis || prescription.consultation?.diagnosis || "Consultation Completed"}
              </h5>
            </div>

            {/* Rx Symbol and Medications */}
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-3 fw-bold font-serif text-primary" style={{ fontFamily: "Georgia, serif" }}>
                  ℞
                </span>
                <span className="fw-bold text-slate-800">Prescribed Medications:</span>
              </div>

              {medicines.length > 0 ? (
                <table className="table table-bordered table-sm small mb-3">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "40px" }} className="text-center">#</th>
                      <th>Medicine Name & Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th style={{ width: "60px" }} className="text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>
                          <strong className="text-slate-900">
                            {m.medicine_name || m.medicine?.name || `Medicine #${m.medicine}`}
                          </strong>
                          {m.dosage && <span className="text-muted ms-1">({m.dosage})</span>}
                        </td>
                        <td>{m.frequency}</td>
                        <td>{m.duration}</td>
                        <td className="text-center fw-semibold">{m.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-muted small italic">No standard pharmacy medications prescribed.</div>
              )}

              {/* External Medications */}
              {externalMedicines.length > 0 && (
                <div className="mt-2">
                  <span className="small fw-semibold text-slate-700">Specialty / External Drugs:</span>
                  <ul className="list-unstyled small ps-3 mt-1">
                    {externalMedicines.map((em, idx) => (
                      <li key={idx} className="mb-1">
                        • <strong>{em.medicine_name}</strong> — {em.instructions}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Diagnostic Lab Orders */}
            {(labTests.length > 0 || externalLabTests.length > 0) && (
              <div className="mb-4 p-3 bg-amber-subtle border border-warning-subtle rounded-3">
                <h6 className="fw-bold text-slate-900 mb-2 small text-uppercase">
                  🔬 Recommended Laboratory Diagnostics:
                </h6>
                <ul className="list-unstyled small mb-0">
                  {labTests.map((t, idx) => (
                    <li key={idx} className="mb-1">
                      • <strong>{t.test_name || t.test?.name || `Test #${t.test}`}</strong>: {t.notes || "Standard investigation"}
                    </li>
                  ))}
                  {externalLabTests.map((et, idx) => (
                    <li key={idx} className="mb-1">
                      • <strong>{et.test_name}</strong>: {et.instructions}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Clinical Notes & Follow up */}
            {(prescription.notes || prescription.consultation?.clinical_notes || prescription.consultation?.follow_up_date) && (
              <div className="mb-4 small">
                <span className="fw-bold text-slate-800 d-block mb-1">Doctor's Notes & Advice:</span>
                <p className="text-slate-700 mb-1">
                  {prescription.notes || prescription.consultation?.clinical_notes || "Continue prescribed regimen."}
                </p>
                {prescription.consultation?.follow_up_date && (
                  <div className="text-primary fw-semibold mt-1">
                    Next Follow-up Date: {prescription.consultation.follow_up_date}
                  </div>
                )}
              </div>
            )}

            {/* Signature Box */}
            <div className="row mt-5 pt-4 border-top">
              <div className="col-6 text-muted small">
                <div>Hospital EMR Verified Rx</div>
                <div style={{ fontSize: "10px" }}>Generated on: {new Date().toLocaleString()}</div>
              </div>
              <div className="col-6 text-end">
                <div className="fw-bold text-slate-900">{doctorName}</div>
                <div className="text-muted small">Physician Signature & Stamp</div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-light px-4 py-2 border-0 d-print-none d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-2 px-3"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-rx, #printable-rx * {
            visibility: visible;
          }
          #printable-rx {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .modal {
            position: absolute;
            left: 0;
            top: 0;
            margin: 0;
            padding: 0;
            background: none !important;
          }
          .modal-dialog {
            max-width: 100%;
            margin: 0;
          }
          .modal-content {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrescriptionPrint;
