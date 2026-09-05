import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Receipt,
  Printer,
  CheckCircle2,
  Clock,
  CreditCard,
  Building2,
  ArrowLeft,
  DollarSign,
  Pill,
} from "lucide-react";
import pharmacyService from "../../services/pharmacyService";
import PharmacyBillPrint from "./PharmacyBillPrint";

const PharmacyBill = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paying, setPaying] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const loadBill = async () => {
    setLoading(true);
    try {
      const data = await pharmacyService.getBill(id);
      setBill(data);
    } catch (err) {
      console.error("Error loading pharmacy bill:", err);
      setError("Unable to load pharmacy bill details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBill();
  }, [id]);

  const handlePayBill = async () => {
    setPaying(true);
    try {
      const updated = await pharmacyService.payBill(id, {
        payment_method: paymentMethod,
      });
      setBill(updated);
    } catch (err) {
      console.error("Error updating payment:", err);
      setError("Failed to record payment.");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="container-fluid p-4 text-center text-muted py-5">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        <span>Loading pharmacy invoice...</span>
      </main>
    );
  }

  if (!bill) {
    return (
      <main className="container-fluid p-4">
        <div className="alert alert-danger">{error || "Pharmacy bill not found."}</div>
        <button className="btn btn-light rounded-pill" onClick={() => navigate("/pharmacist/prescriptions")}>
          <ArrowLeft size={16} className="me-1" /> Back to Prescriptions
        </button>
      </main>
    );
  }

  const items = bill.items || [];
  const subtotal = Number(bill.subtotal || 0).toFixed(2);
  const gst = Number(bill.gst || 0).toFixed(2);
  const totalAmount = Number(bill.total_amount || 0).toFixed(2);

  return (
    <main className="container-fluid p-4 space-y-4">
      {/* Header bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill p-2"
            onClick={() => navigate("/pharmacist/prescriptions")}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h4 className="fw-bold mb-0 text-slate-900">Pharmacy Bill #{bill.bill_number}</h4>
            <span className="text-muted small">Tax Invoice & Dispensation Receipt</span>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm"
            onClick={() => setShowPrintModal(true)}
          >
            <Printer size={16} /> Print Receipt
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Bill Card */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
              <div>
                <span className="badge bg-primary text-white font-monospace mb-2 px-2 py-1">
                  {bill.bill_number}
                </span>
                <h5 className="fw-bold text-slate-900 mb-0">{bill.patient_name || "Patient"}</h5>
                <small className="text-muted font-monospace">Patient ID: {bill.patient_id || bill.patient}</small>
              </div>
              <div className="text-end">
                <span
                  className={`badge ${
                    bill.paid ? "bg-success bg-opacity-10 text-success" : "bg-warning bg-opacity-10 text-warning"
                  } rounded-pill px-3 py-1 fw-semibold`}
                >
                  {bill.paid ? "PAID" : "PAYMENT PENDING"}
                </span>
                <div className="text-muted small mt-1">
                  {bill.created_at ? new Date(bill.created_at).toLocaleString("en-IN") : "-"}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="table-responsive mb-4">
              <table className="table table-sm table-bordered align-middle small mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Medicine Description</th>
                    <th>Batch</th>
                    <th className="text-center">Qty</th>
                    <th className="text-end">Unit Price</th>
                    <th className="text-end">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="text-center text-muted">{idx + 1}</td>
                      <td className="fw-semibold text-slate-900">{item.medicine_name || `Medicine #${item.medicine}`}</td>
                      <td className="font-monospace text-slate-600">{item.batch_number || "BATCH-01"}</td>
                      <td className="text-center fw-bold">{item.quantity}</td>
                      <td className="text-end">₹{Number(item.price_per_unit || 0).toFixed(2)}</td>
                      <td className="text-end fw-semibold">₹{Number(item.amount || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-3 text-muted">
                        No itemized details found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Totals */}
            <div className="row justify-content-end">
              <div className="col-md-6">
                <div className="bg-light p-3 rounded-3 border space-y-2 small">
                  <div className="d-flex justify-content-between">
                    <span>Medicines Subtotal:</span>
                    <strong>₹{subtotal}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>GST (5%):</span>
                    <strong>₹{gst}</strong>
                  </div>
                  <div className="d-flex justify-content-between pt-2 border-top fs-6">
                    <span className="fw-bold text-slate-900">Total Billed:</span>
                    <strong className="text-success fs-5">₹{totalAmount}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "90px" }}>
            <h6 className="fw-bold mb-3 text-slate-900">Payment & Settlement</h6>

            {bill.paid ? (
              <div className="p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 text-center">
                <CheckCircle2 size={32} className="text-success mb-2" />
                <h6 className="fw-bold text-success mb-1">Invoice Cleared</h6>
                <p className="text-muted small mb-2">
                  Paid via <strong>{bill.payment_method || "CASH"}</strong>
                </p>
                <button
                  className="btn btn-outline-primary btn-sm rounded-pill w-100"
                  onClick={() => setShowPrintModal(true)}
                >
                  <Printer size={14} className="me-1" /> Re-print Invoice
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="form-label small fw-semibold text-slate-700">Payment Method</label>
                  <select
                    className="form-select"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="CASH">Cash</option>
                    <option value="GPAY">GPay / UPI</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>

                <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-3">
                  <span className="text-muted small">Payable:</span>
                  <span className="fw-bold text-success fs-5">₹{totalAmount}</span>
                </div>

                <button
                  className="btn btn-success btn-lg w-100 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={handlePayBill}
                  disabled={paying}
                >
                  <CheckCircle2 size={18} />
                  {paying ? "Settling Payment..." : "Collect & Mark as Paid"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPrintModal && (
        <PharmacyBillPrint bill={bill} onClose={() => setShowPrintModal(false)} />
      )}
    </main>
  );
};

export default PharmacyBill;
