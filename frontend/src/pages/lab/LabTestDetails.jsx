import React from "react";
import { Eye, FlaskConical, Clock, DollarSign, Activity, FileText, CheckCircle2 } from "lucide-react";

const LabTestDetails = ({ test, onClose }) => {
  if (!test) return null;

  return (
    <div className="modal show d-block bg-dark bg-opacity-50" tabIndex="-1" style={{ zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-3">
          <div className="modal-header bg-slate-900 text-white py-3 px-4 border-0">
            <div className="d-flex align-items-center gap-2">
              <FlaskConical size={18} className="text-primary" />
              <h6 className="modal-title fw-bold mb-0">Diagnostic Test Specification</h6>
              <span className="badge bg-slate-800 text-primary border border-slate-700 font-monospace small ms-2">
                {test.test_code}
              </span>
            </div>
            <button type="button" className="btn-close btn-close-white" onClick={onClose} />
          </div>

          <div className="modal-body p-4">
            <div className="p-3 bg-slate-50 rounded-3 border mb-4">
              <h5 className="fw-bold text-slate-900 mb-1">{test.test_name}</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-primary-subtle text-primary">{test.category || "Pathology"}</span>
                <span className="badge bg-slate-100 text-slate-700">{test.sample_type || "Blood"}</span>
                <span className={`badge ${test.is_active !== false ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}>
                  {test.is_active !== false ? "Active Catalog" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="row g-3 small">
              <div className="col-6">
                <span className="text-muted d-block">Test Code / SKU:</span>
                <strong className="font-monospace text-slate-800">{test.test_code}</strong>
              </div>

              <div className="col-6">
                <span className="text-muted d-block">Test Fee / Price:</span>
                <strong className="text-success fs-6">₹{parseFloat(test.price || 300).toFixed(2)}</strong>
              </div>

              <div className="col-6">
                <span className="text-muted d-block">Specimen Required:</span>
                <strong className="text-slate-800">{test.sample_type || "Whole Blood (EDTA)"}</strong>
              </div>

              <div className="col-6">
                <span className="text-muted d-block">Turnaround Time (TAT):</span>
                <strong className="text-slate-800">{test.turnaround_time || "2 - 4 Hours"}</strong>
              </div>

              <div className="col-6">
                <span className="text-muted d-block">Biological Normal Range:</span>
                <strong className="text-slate-800">{test.normal_range || "Normal"}</strong>
              </div>

              <div className="col-6">
                <span className="text-muted d-block">Measurement Units:</span>
                <strong className="font-monospace text-slate-800">{test.unit || "mg/dL"}</strong>
              </div>

              <div className="col-12 border-top pt-2">
                <span className="text-muted d-block">Patient Preparation Guidelines:</span>
                <span className="text-slate-700">
                  {test.test_name?.toLowerCase().includes("lipid") || test.test_name?.toLowerCase().includes("glucose")
                    ? "10-12 hours overnight fasting recommended before sample collection."
                    : "No special diet or fasting requirements prior to specimen collection."}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-slate-50 py-2 px-4 border-top">
            <button type="button" className="btn btn-secondary btn-sm rounded-2" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabTestDetails;
