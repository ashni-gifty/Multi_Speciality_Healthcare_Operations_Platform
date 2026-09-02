import React from "react";
import { Printer, CheckCircle2, ShieldCheck, Stethoscope, Building2, Phone, Mail, Globe } from "lucide-react";

const LabReportPrint = ({ report, onClose }) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName = report.patient_name || `${report.patient?.first_name || ""} ${report.patient?.last_name || ""}`.trim() || "Walk-in Patient";
  const patientId = report.patient_id || report.patient?.patient_id || "PAT-0001";
  const doctorName = report.ordered_by_doctor || "Dr. Robert Smith, MD (General Medicine)";
  const department = report.department || "Pathology & Clinical Biochemistry";
  const testName = report.test_name || "Complete Blood Count (CBC)";
  const sampleType = report.sample_type || "Whole Blood (EDTA)";
  const sampleId = report.sample_id || `SMP-${report.id || 101}`;
  const testUnit = report.unit || report.test_unit || "mg/dL";
  const normalRange = report.reference_range || report.normal_range || "70 - 100 mg/dL";
  const resultValue = report.result_value || "92 mg/dL";
  const findingNotes = report.finding_notes || report.remarks || "Specimen processed on automated analyzer. All tested biochemical parameters are within normal physiological reference ranges.";
  const technicianName = report.technician_name || "Mark Vance, MLT";
  const verifiedBy = report.verified_by || "Dr. Sarah Jenkins, MD Pathologist";
  const requestedDate = report.date || (report.created_at ? new Date(report.created_at).toLocaleString() : new Date().toLocaleString());
  const reportDate = new Date().toLocaleString();
  const priority = report.priority || "ROUTINE";

  return (
    <div className="modal show d-block bg-dark bg-opacity-75" tabIndex="-1" style={{ zIndex: 1080 }}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg rounded-3">
          {/* Action Bar (hidden when printing) */}
          <div className="modal-header bg-slate-900 text-white py-3 px-4 d-print-none border-0">
            <div className="d-flex align-items-center gap-2">
              <Printer size={18} className="text-primary" />
              <h6 className="modal-title fw-bold mb-0">Diagnostic Lab Report Preview: {report.report_id || `LAB-${report.id}`}</h6>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-primary btn-sm rounded-2 d-flex align-items-center gap-1 px-3 fw-medium" onClick={handlePrint}>
                <Printer size={14} />
                <span>Print Document</span>
              </button>
              <button type="button" className="btn-close btn-close-white" onClick={onClose} />
            </div>
          </div>

          {/* PRINTABLE REPORT CONTAINER */}
          <div className="modal-body p-5 bg-white text-dark printable-report" id="printableLabReport">
            {/* Header / Letterhead */}
            <div className="border-bottom pb-4 mb-4">
              <div className="d-flex justify-content-between align-items-start">
                <div className="d-flex align-items-center gap-3">
                  <div className="p-3 bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px" }}>
                    <Stethoscope size={36} />
                  </div>
                  <div>
                    <h3 className="fw-bold mb-0 text-slate-900 tracking-tight">MULTI-SPECIALITY HEALTHCARE HOSPITAL</h3>
                    <div className="text-muted small fw-medium">Department of Laboratory Medicine & Diagnostic Pathology</div>
                    <div className="text-slate-600 small mt-1">
                      124 Medical Campus Avenue, Metro City • Phone: +91 (800) 123-4567 • Email: lab@hospitalops.org
                    </div>
                  </div>
                </div>
                <div className="text-end">
                  <span className="badge bg-slate-100 text-slate-800 border px-2 py-1 font-monospace small mb-1 d-inline-block">
                    ISO 15189:2022 Certified
                  </span>
                  <div className="text-muted font-monospace" style={{ fontSize: "11px" }}>
                    NABL ACCREDITED LAB #MC-4820
                  </div>
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="bg-slate-100 p-2 text-center rounded-2 border mb-4">
              <h5 className="fw-bold mb-0 text-slate-900 text-uppercase tracking-wide" style={{ letterSpacing: "1px" }}>
                CLINICAL DIAGNOSTIC LABORATORY REPORT
              </h5>
            </div>

            {/* Patient Demographics & Order Requisition Information */}
            <div className="card border rounded-3 p-3 bg-slate-50 mb-4">
              <div className="row g-3 small">
                {/* Column 1: Patient Details */}
                <div className="col-md-6 border-end">
                  <h6 className="fw-bold text-primary mb-2 text-uppercase font-monospace" style={{ fontSize: "12px" }}>
                    PATIENT IDENTIFICATION
                  </h6>
                  <div className="row g-1">
                    <div className="col-5 text-muted">Patient Name:</div>
                    <div className="col-7 fw-bold text-slate-900">{patientName}</div>

                    <div className="col-5 text-muted">Patient ID / MRN:</div>
                    <div className="col-7 font-monospace fw-semibold text-slate-800">{patientId}</div>

                    <div className="col-5 text-muted">Age / Gender:</div>
                    <div className="col-7 fw-medium text-slate-800">{report.patient_details || "34y / Male"}</div>

                    <div className="col-5 text-muted">Contact Phone:</div>
                    <div className="col-7 text-slate-800">{report.patient?.phone || "+91 98765 43210"}</div>
                  </div>
                </div>

                {/* Column 2: Order & Requisition */}
                <div className="col-md-6 ps-md-4">
                  <h6 className="fw-bold text-primary mb-2 text-uppercase font-monospace" style={{ fontSize: "12px" }}>
                    ORDER & SPECIMEN DETAILS
                  </h6>
                  <div className="row g-1">
                    <div className="col-5 text-muted">Lab Report ID:</div>
                    <div className="col-7 font-monospace fw-bold text-slate-900">{report.report_id || `LAB-${report.id}`}</div>

                    <div className="col-5 text-muted">Ordering Doctor:</div>
                    <div className="col-7 fw-semibold text-slate-900">{doctorName}</div>

                    <div className="col-5 text-muted">Department:</div>
                    <div className="col-7 text-slate-800">{department}</div>

                    <div className="col-5 text-muted">Specimen / Sample:</div>
                    <div className="col-7 text-slate-800">{sampleType} ({sampleId})</div>

                    <div className="col-5 text-muted">Order Date / Time:</div>
                    <div className="col-7 text-slate-800">{requestedDate}</div>

                    <div className="col-5 text-muted">Priority:</div>
                    <div className="col-7">
                      <span className={`badge ${priority === "URGENT" || priority === "STAT" ? "bg-danger text-white" : "bg-primary-subtle text-primary"}`}>
                        {priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test Results Table */}
            <div className="mb-4">
              <h6 className="fw-bold text-slate-900 mb-2">INVESTIGATION RESULTS & FINDINGS</h6>
              <div className="table-responsive border rounded-2">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-light text-slate-700 small">
                    <tr>
                      <th style={{ width: "35%" }}>TEST PARAMETER</th>
                      <th style={{ width: "20%" }}>OBSERVED RESULT</th>
                      <th style={{ width: "15%" }}>UNITS</th>
                      <th style={{ width: "20%" }}>BIOLOGICAL REFERENCE RANGE</th>
                      <th style={{ width: "10%" }} className="text-center">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    <tr>
                      <td>
                        <strong className="text-slate-900 d-block">{testName}</strong>
                        <span className="text-muted" style={{ fontSize: "11px" }}>Method: Fully Automated Spectrophotometry / Immunoassay</span>
                      </td>
                      <td>
                        <span className="fw-bold fs-6 text-slate-900">{resultValue}</span>
                      </td>
                      <td>
                        <span className="font-monospace text-slate-700">{testUnit}</span>
                      </td>
                      <td>
                        <span className="text-slate-700">{normalRange}</span>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                          NORMAL
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Clinical Remarks & Pathologist Interpretations */}
            <div className="p-3 bg-slate-50 border rounded-3 mb-5">
              <h6 className="fw-bold text-slate-900 mb-1 small text-uppercase font-monospace">CLINICAL REMARKS & INTERPRETATION</h6>
              <p className="text-slate-700 small mb-0">{findingNotes}</p>
            </div>

            {/* Signatures & Verification Footer */}
            <div className="pt-4 border-top">
              <div className="row text-center">
                <div className="col-4">
                  <div className="fw-bold text-slate-900 font-monospace mb-1">{technicianName}</div>
                  <div className="text-muted small">Medical Lab Technologist (MLT)</div>
                  <div className="text-muted" style={{ fontSize: "10px" }}>Specimen Analysis Done</div>
                </div>

                <div className="col-4">
                  <div className="p-2 border rounded-2 d-inline-block bg-slate-50">
                    <div className="d-flex align-items-center gap-1 text-success fw-bold small">
                      <ShieldCheck size={16} />
                      <span>E-VERIFIED & APPROVED</span>
                    </div>
                    <div className="text-muted" style={{ fontSize: "10px" }}>{reportDate}</div>
                  </div>
                </div>

                <div className="col-4">
                  <div className="fw-bold text-slate-900 font-monospace mb-1">{verifiedBy}</div>
                  <div className="text-muted small">Consultant Pathologist & Biochemist</div>
                  <div className="text-muted" style={{ fontSize: "10px" }}>Reg No: KMC-94821</div>
                </div>
              </div>
            </div>

            {/* End of Report Disclaimer */}
            <div className="text-center text-muted border-top mt-4 pt-3" style={{ fontSize: "10px" }}>
              *** END OF LABORATORY REPORT — Generated electronically via Multi-Speciality Healthcare Platform EMR ***
            </div>
          </div>

          <div className="modal-footer bg-slate-50 py-2 px-4 border-top d-print-none">
            <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn btn-primary btn-sm rounded-2 px-3 fw-medium d-flex align-items-center gap-1" onClick={handlePrint}>
              <Printer size={14} />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabReportPrint;
