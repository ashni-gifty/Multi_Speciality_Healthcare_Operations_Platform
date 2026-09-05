import React, { useState } from "react";
import {
  FileText,
  Search,
  Printer,
  Eye,
  Calendar,
  Pill,
  FlaskConical,
  User,
  X,
  Plus,
  RefreshCw,
  Activity,
  Heart,
  Thermometer,
} from "lucide-react";

const DoctorPrescriptions = ({
  prescriptions = [],
  doctor,
  onPrintPrescription,
  onNewPrescription,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRx, setSelectedRx] = useState(null);

  const filteredPrescriptions = prescriptions.filter((rx) => {
    const term = searchQuery.toLowerCase().trim();
    const rxId = (rx.rx_id || `RX-${rx.id}`).toLowerCase();
    const patientName = (
      rx.patient_name ||
      (rx.patient ? `${rx.patient.first_name || ""} ${rx.patient.last_name || ""}` : "")
    ).toLowerCase();
    const diagnosis = (rx.diagnosis || "").toLowerCase();

    return !term || rxId.includes(term) || patientName.includes(term) || diagnosis.includes(term);
  });

  const totalMedsPrescribed = prescriptions.reduce((acc, rx) => {
    return (
      acc +
      (rx.medicines?.length || rx.prescription_medicines?.length || 0) +
      (rx.external_medicines?.length || 0)
    );
  }, 0);

  const totalLabTestsOrdered = prescriptions.reduce((acc, rx) => {
    return (
      acc +
      (rx.lab_tests?.length || rx.prescription_lab_tests?.length || 0) +
      (rx.external_lab_tests?.length || 0)
    );
  }, 0);

  return (
    <div className="d-flex flex-column gap-4">
      {/* Metrics Banner */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Prescriptions</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{prescriptions.length}</h4>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <FileText size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Meds Prescribed</span>
                <h4 className="fw-bold mt-1 mb-0 text-purple">{totalMedsPrescribed}</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <Pill size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Lab Tests Ordered</span>
                <h4 className="fw-bold mt-1 mb-0 text-warning-emphasis">{totalLabTestsOrdered}</h4>
              </div>
              <div className="p-3 bg-amber-subtle text-warning-emphasis rounded-3">
                <FlaskConical size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">EMR Archives</span>
                <h4 className="fw-bold mt-1 mb-0 text-success">Active</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <Activity size={22} />
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
              <h5 className="fw-bold mb-0 text-slate-900">Prescription Archives & Medical Orders</h5>
              <p className="text-muted small mb-0">
                View all issued clinical prescriptions, medication dosages, and diagnostic requests.
              </p>
            </div>
            {onNewPrescription && (
              <button
                className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs px-3 py-2 fw-medium"
                onClick={onNewPrescription}
              >
                <Plus size={16} /> New Clinical Prescription
              </button>
            )}
          </div>

          {/* Search Toolbar */}
          <div className="row g-2 mb-3">
            <div className="col-md-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Rx ID, Patient Name, or Clinical Diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Prescriptions Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted small text-uppercase">Rx ID</th>
                  <th className="border-0 text-muted small text-uppercase">Patient Details</th>
                  <th className="border-0 text-muted small text-uppercase">Clinical Diagnosis</th>
                  <th className="border-0 text-muted small text-uppercase">Prescribed Items</th>
                  <th className="border-0 text-muted small text-uppercase">Issue Date</th>
                  <th className="border-0 text-muted small text-uppercase text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrescriptions.map((rx) => {
                  const rxId = rx.rx_id || `RX-${rx.id}`;
                  const patientName =
                    rx.patient_name ||
                    (rx.patient ? `${rx.patient.first_name} ${rx.patient.last_name || ""}` : "Patient");
                  const pId = rx.patient?.patient_id || rx.patient_id || "-";
                  const medsCount =
                    (rx.medicines?.length || rx.prescription_medicines?.length || 0) +
                    (rx.external_medicines?.length || 0);
                  const testsCount =
                    (rx.lab_tests?.length || rx.prescription_lab_tests?.length || 0) +
                    (rx.external_lab_tests?.length || 0);

                  return (
                    <tr key={rx.id}>
                      <td>
                        <span className="badge bg-blue-subtle text-primary font-monospace fw-bold px-2 py-1">
                          {rxId}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold text-slate-900">{patientName}</div>
                          <div className="text-muted small">ID: {pId}</div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-medium text-slate-800">
                          {rx.diagnosis || rx.consultation?.diagnosis || "Consultation"}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span className="badge bg-purple-subtle text-purple px-2 py-1 small">
                            <Pill size={11} className="me-1" /> {medsCount} Meds
                          </span>
                          {testsCount > 0 && (
                            <span className="badge bg-amber-subtle text-warning-emphasis px-2 py-1 small">
                              <FlaskConical size={11} className="me-1" /> {testsCount} Tests
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-muted small">
                        {rx.created_at
                          ? new Date(rx.created_at).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-light text-secondary rounded-2 p-1"
                            title="View Prescription Details"
                            onClick={() => setSelectedRx(rx)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-sm btn-light text-primary rounded-2 p-1"
                            title="Print Prescription Slip"
                            onClick={() => onPrintPrescription && onPrintPrescription(rx)}
                          >
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredPrescriptions.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <FileText size={36} className="text-muted opacity-50 mb-2" />
                        <h6 className="fw-semibold text-slate-700 mb-1">No prescriptions found</h6>
                        <small>No prescription records match your query.</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: VIEW PRESCRIPTION DETAILS */}
      {selectedRx && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3 border-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white">
                      Prescription Details: {selectedRx.rx_id || `RX-${selectedRx.id}`}
                    </h6>
                    <small className="text-slate-400">
                      Patient: {selectedRx.patient_name || selectedRx.patient?.full_name}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setSelectedRx(null)}
                />
              </div>

              <div className="modal-body p-4">
                {/* Vitals Summary */}
                <div className="row g-2 mb-3">
                  <div className="col-4">
                    <div className="p-2 rounded-2 bg-slate-50 border border-slate-100 text-center">
                      <small className="text-muted d-block">Blood Pressure</small>
                      <strong>{selectedRx.blood_pressure || "120/80"} mmHg</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded-2 bg-slate-50 border border-slate-100 text-center">
                      <small className="text-muted d-block">Pulse Rate</small>
                      <strong>{selectedRx.pulse || "72"} bpm</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 rounded-2 bg-slate-50 border border-slate-100 text-center">
                      <small className="text-muted d-block">Temperature</small>
                      <strong>{selectedRx.temperature || "98.6"} °F</strong>
                    </div>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="mb-3">
                  <span className="text-muted small text-uppercase fw-semibold">Clinical Diagnosis:</span>
                  <div className="fw-bold text-slate-900 fs-6 mt-1">
                    {selectedRx.diagnosis || selectedRx.consultation?.diagnosis || "Consultation Completed"}
                  </div>
                </div>

                {/* Medications List */}
                <div className="mb-3">
                  <span className="text-muted small text-uppercase fw-semibold">Prescribed Medicines:</span>
                  <div className="table-responsive mt-1">
                    <table className="table table-sm border small mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Medicine</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration</th>
                          <th>Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedRx.medicines || selectedRx.prescription_medicines || []).map((m, idx) => (
                          <tr key={idx}>
                            <td className="fw-semibold text-slate-900">
                              {m.medicine_name || m.medicine?.name || `Medicine #${m.medicine}`}
                            </td>
                            <td>{m.dosage}</td>
                            <td>{m.frequency}</td>
                            <td>{m.duration}</td>
                            <td>{m.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Lab Tests */}
                {(selectedRx.lab_tests?.length > 0 || selectedRx.prescription_lab_tests?.length > 0) && (
                  <div className="mb-3">
                    <span className="text-muted small text-uppercase fw-semibold">Lab Investigation Orders:</span>
                    <ul className="list-group list-group-flush small mt-1">
                      {(selectedRx.lab_tests || selectedRx.prescription_lab_tests || []).map((t, idx) => (
                        <li key={idx} className="list-group-item px-0 py-1 d-flex justify-content-between align-items-center">
                          <span>{t.test_name || t.test?.name || `Lab Test #${t.test}`}</span>
                          <span className="text-muted">{t.notes || "Standard test"}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light px-4 py-3 border-0 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm rounded-2"
                  onClick={() => setSelectedRx(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 shadow-xs"
                  onClick={() => {
                    const rx = selectedRx;
                    setSelectedRx(null);
                    if (onPrintPrescription) onPrintPrescription(rx);
                  }}
                >
                  <Printer size={14} /> Print Prescription
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
