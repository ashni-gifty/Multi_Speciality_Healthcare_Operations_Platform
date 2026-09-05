import React from "react";
import { Printer, X, Building2, Pill, CheckCircle2 } from "lucide-react";

const PharmacyBillPrint = ({ bill, onClose }) => {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const billNumber = bill.bill_number || `PHARM-${bill.id || "001"}`;
  const billDate = bill.created_at
    ? new Date(bill.created_at).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN");

  const patientName = bill.patient_name || bill.patient?.full_name || "Patient";
  const patientId = bill.patient_id || bill.patient?.patient_id || "-";
  const items = bill.items || [];
  const subtotal = Number(bill.subtotal || 0).toFixed(2);
  const gst = Number(bill.gst || 0).toFixed(2);
  const totalAmount = Number(bill.total_amount || 0).toFixed(2);
  const paymentMethod = bill.payment_method || "CASH";
  const isPaid = bill.paid;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(15, 23, 42, 0.75)", zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Top Bar - Non Printable */}
          <div className="modal-header bg-slate-900 text-white d-print-none px-4 py-3">
            <h5 className="modal-title fs-6 fw-semibold d-flex align-items-center gap-2">
              <Printer size={18} className="text-primary" /> Pharmacy Tax Invoice ({billNumber})
            </h5>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary rounded-pill px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={handlePrint}
              >
                <Printer size={14} /> Print Invoice
              </button>
              {onClose && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light rounded-pill px-2"
                  onClick={onClose}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Printable Invoice Body */}
          <div className="modal-body p-5 bg-white" id="printable-pharmacy-bill">
            {/* Hospital & Pharmacy Branding */}
            <div className="d-flex justify-content-between align-items-start border-bottom pb-4 mb-4">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div className="bg-primary text-white p-2 rounded-3">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0 text-slate-900">ClinicCare Pharmacy Services</h4>
                    <span className="text-muted small">Hospital In-House Dispensary & Medical Store</span>
                  </div>
                </div>
                <div className="text-muted small mt-2">
                  124 Medical Enclave, Health City • DL No: DL-2026-PHARM • GSTIN: 29AAAAA0000A1Z5
                </div>
              </div>

              <div className="text-end">
                <span className="badge bg-primary text-white font-monospace px-3 py-1 fs-6">
                  {billNumber}
                </span>
                <div className="text-muted small mt-1">Date: {billDate}</div>
                {bill.prescription_id && (
                  <div className="text-slate-700 small font-monospace">
                    Rx Ref: #{bill.prescription_id}
                  </div>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="bg-slate-50 border rounded-3 p-3 mb-4">
              <div className="row g-2 small">
                <div className="col-6">
                  <span className="text-muted d-block">Billed To (Patient)</span>
                  <span className="fw-bold text-slate-900 fs-6">{patientName}</span>
                </div>
                <div className="col-6 text-end">
                  <span className="text-muted d-block">Patient ID</span>
                  <span className="fw-bold text-slate-900 font-monospace">{patientId}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-responsive mb-4">
              <table className="table table-sm table-bordered align-middle small mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: "40px" }}>#</th>
                    <th>Medicine Description</th>
                    <th>Batch #</th>
                    <th className="text-center" style={{ width: "60px" }}>Qty</th>
                    <th className="text-end" style={{ width: "90px" }}>Unit Price</th>
                    <th className="text-end" style={{ width: "100px" }}>Total (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="text-center text-muted">{idx + 1}</td>
                      <td className="fw-semibold text-slate-900">{item.medicine_name || `Item #${item.medicine}`}</td>
                      <td className="font-monospace text-slate-600">{item.batch_number || "BATCH-01"}</td>
                      <td className="text-center fw-bold">{item.quantity}</td>
                      <td className="text-end">₹{Number(item.price_per_unit || 0).toFixed(2)}</td>
                      <td className="text-end fw-semibold">₹{Number(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-3 text-muted">
                        No itemized medicines found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="row justify-content-end mb-4">
              <div className="col-md-5">
                <div className="bg-light p-3 rounded-3 border space-y-2 small">
                  <div className="d-flex justify-content-between text-slate-700">
                    <span>Subtotal:</span>
                    <strong>₹{subtotal}</strong>
                  </div>
                  <div className="d-flex justify-content-between text-slate-700">
                    <span>GST (5%):</span>
                    <strong>₹{gst}</strong>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top fs-6">
                    <span className="fw-bold text-slate-900">Total Payable:</span>
                    <strong className="text-success fs-5">₹{totalAmount}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Mode Status */}
            <div className="d-flex justify-content-between align-items-center bg-slate-50 p-3 rounded-3 mb-4 border small">
              <div>
                <span className="text-muted">Payment Mode: </span>
                <strong className="text-slate-800">{paymentMethod}</strong>
              </div>
              <div>
                <span className="text-muted">Payment Status: </span>
                <span className={`badge ${isPaid ? "bg-success" : "bg-warning"} text-white px-2 py-1`}>
                  {isPaid ? "PAID" : "PENDING"}
                </span>
              </div>
            </div>

            {/* Footer / Signatures */}
            <div className="pt-4 border-top">
              <div className="d-flex justify-content-between align-items-end small text-muted">
                <div>
                  <p className="mb-0">* Medicines once sold will not be taken back without original bill.</p>
                  <p className="mb-0">* Store in a cool, dry place away from direct sunlight.</p>
                </div>
                <div className="text-center" style={{ minWidth: "180px" }}>
                  <div className="border-bottom border-dark pb-3 mb-1 font-monospace text-slate-800">
                    Pharmacist Sign
                  </div>
                  <div className="fw-semibold text-slate-800">Registered Pharmacist</div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer bg-slate-50 d-print-none px-4 py-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm rounded-pill px-4"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyBillPrint;
