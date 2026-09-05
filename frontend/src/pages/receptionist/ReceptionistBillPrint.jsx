import React from "react";
import { Printer, X, CheckCircle2, Building2, Calendar, Clock, User, Phone, Stethoscope } from "lucide-react";

const ReceptionistBillPrint = ({ bill, appointment, onClose }) => {
  if (!bill && !appointment) return null;

  const handlePrint = () => {
    window.print();
  };

  const patientName =
    bill?.patient_name ||
    appointment?.patient_name ||
    `${appointment?.patient?.first_name || ""} ${appointment?.patient?.last_name || ""}`.trim() ||
    "Patient";

  const patientId =
    bill?.patient_id ||
    appointment?.patient_id ||
    appointment?.patient?.patient_id ||
    "-";

  const doctorName =
    bill?.doctor_name ||
    appointment?.doctor_name ||
    (appointment?.doctor ? `Dr. ${appointment.doctor.first_name || ""} ${appointment.doctor.last_name || ""}`.trim() : "-");

  const billNumber = bill?.bill_number || `OPD-${appointment?.id || "N/A"}`;
  const tokenNumber = appointment?.token_number || bill?.token_number || "-";
  const billDate = bill?.created_at ? new Date(bill.created_at).toLocaleString() : new Date().toLocaleString();
  const amount = bill?.total_amount ? Number(bill.total_amount).toFixed(2) : "500.00";
  const paymentStatus = bill?.payment_status || "PAID";
  const paymentMethod = bill?.payment_method || "CASH";

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-md">
        <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
          {/* Action Header - Non Printable */}
          <div className="modal-header bg-slate-900 text-white d-print-none px-4 py-3 border-0 d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                <Printer size={18} />
              </div>
              <div>
                <h6 className="modal-title fw-bold mb-0 text-white">OPD Invoice & Token Slip</h6>
                <small className="text-slate-400">Printable official transaction receipt</small>
              </div>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-2 px-3 d-flex align-items-center gap-1 shadow-xs"
                onClick={handlePrint}
              >
                <Printer size={14} /> Print
              </button>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={onClose}
              />
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div className="modal-body p-4 bg-white" id="printable-receipt">
            {/* Hospital Branding */}
            <div className="text-center pb-3 border-bottom mb-3">
              <div className="d-flex align-items-center justify-content-center gap-2 mb-1">
                <div className="bg-primary text-white p-2 rounded-3">
                  <Stethoscope size={22} />
                </div>
                <h4 className="fw-bold mb-0 text-slate-900">Hospital Operations Center</h4>
              </div>
              <p className="text-muted small mb-0">
                Multi-Speciality Healthcare & Clinical Operations
              </p>
              <p className="text-muted small mb-0" style={{ fontSize: "11px" }}>
                124 Medical Enclave, Health District • Phone: +91 (800) 456-7890
              </p>
            </div>

            {/* Token Badge */}
            <div className="bg-blue-subtle border border-primary-subtle rounded-3 p-3 text-center mb-3">
              <span className="text-uppercase small fw-bold text-primary tracking-wider d-block">
                OPD CONSULTATION TOKEN
              </span>
              <div className="display-6 fw-bold text-primary my-1">
                #{tokenNumber}
              </div>
              <span className="badge bg-primary text-white rounded-pill px-3 py-1 small">
                Status: {appointment?.status || "CHECKED IN"}
              </span>
            </div>

            {/* Meta Info */}
            <div className="row g-2 mb-3 small">
              <div className="col-6">
                <span className="text-muted d-block">Invoice No:</span>
                <strong className="text-slate-800 font-monospace">{billNumber}</strong>
              </div>
              <div className="col-6 text-end">
                <span className="text-muted d-block">Date & Time:</span>
                <strong className="text-slate-800">{billDate}</strong>
              </div>
            </div>

            {/* Patient & Doctor Box */}
            <div className="p-3 bg-slate-50 rounded-3 border border-slate-100 mb-3 small">
              <div className="row g-2">
                <div className="col-6">
                  <span className="text-muted d-block">Patient Name:</span>
                  <strong className="text-slate-900">{patientName}</strong>
                  <div className="text-muted" style={{ fontSize: "11px" }}>ID: {patientId}</div>
                </div>
                <div className="col-6 text-end">
                  <span className="text-muted d-block">Consulting Doctor:</span>
                  <strong className="text-slate-900">{doctorName}</strong>
                  <div className="text-muted" style={{ fontSize: "11px" }}>OPD Consultation</div>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="table table-sm border-top border-bottom small mb-3">
              <thead>
                <tr className="text-muted text-uppercase">
                  <th>Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>OPD Physician Consultation Fee</strong>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      General OPD Visit & Clinical Evaluation
                    </div>
                  </td>
                  <td className="text-center">1</td>
                  <td className="text-end fw-semibold">₹{amount}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-top">
                  <th colSpan="2" className="pt-2">Total Amount Payable:</th>
                  <th className="text-end pt-2 text-primary fs-6">₹{amount}</th>
                </tr>
                <tr>
                  <td colSpan="2" className="text-muted pt-1">Payment Status:</td>
                  <td className="text-end pt-1">
                    <span className="badge bg-emerald-subtle text-success px-2 py-1">
                      {paymentStatus} ({paymentMethod})
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Footer Notice */}
            <div className="text-center text-muted small mt-4 pt-2 border-top">
              <p className="mb-0" style={{ fontSize: "11px" }}>
                Thank you for choosing our healthcare center. Please present this token slip at the doctor's cabin.
              </p>
              <p className="mb-0 text-slate-400" style={{ fontSize: "10px" }}>
                Computer Generated Invoice • No Signature Required
              </p>
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
          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
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

export default ReceptionistBillPrint;
