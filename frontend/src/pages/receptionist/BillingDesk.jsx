import React, { useState } from "react";
import {
  Receipt,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Search,
  DollarSign,
  Building,
  User,
  ShieldCheck,
  X,
  Sparkles,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import receptionistService from "../../services/receptionistService";

const BillingDesk = ({
  bills = [],
  appointments = [],
  onRefresh,
  onPrintBill,
  showAlert,
  initialBillToPay = null,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentModalBill, setPaymentModalBill] = useState(initialBillToPay);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paying, setPaying] = useState(false);

  const handleOpenPayment = (bill) => {
    setPaymentModalBill(bill);
    setPaymentMethod("CASH");
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalBill) return;

    setPaying(true);
    try {
      const response = await receptionistService.payBill(paymentModalBill.id, {
        payment_method: paymentMethod,
      });

      if (showAlert) {
        showAlert(
          "success",
          `Payment of ₹${response.total_amount || "500"} processed successfully for Bill ${
            response.bill_number || ""
          }!`
        );
      }

      setPaymentModalBill(null);
      if (onRefresh) onRefresh();

      if (onPrintBill) {
        const apt = appointments.find(
          (a) => Number(a.id) === Number(paymentModalBill.appointment || paymentModalBill.appointment_id)
        );
        onPrintBill(response, apt);
      }
    } catch (err) {
      console.error("Payment failed:", err);
      const errMsg =
        err?.response?.data?.detail || "Failed to process payment. Please try again.";
      if (showAlert) showAlert("danger", errMsg);
    } finally {
      setPaying(false);
    }
  };

  const filteredBills = bills.filter((b) => {
    const matchStatus = statusFilter === "ALL" || b.payment_status === statusFilter;
    const term = searchQuery.toLowerCase().trim();
    const billNum = (b.bill_number || "").toLowerCase();
    const patientName = (b.patient_name || b.patient?.full_name || "").toLowerCase();
    const patientId = (b.patient_id || b.patient?.patient_id || "").toLowerCase();

    const matchSearch =
      !term ||
      billNum.includes(term) ||
      patientName.includes(term) ||
      patientId.includes(term);

    return matchStatus && matchSearch;
  });

  const totalCollected = bills
    .filter((b) => b.payment_status === "PAID")
    .reduce((acc, b) => acc + Number(b.total_amount || 0), 0);

  const totalPending = bills
    .filter((b) => b.payment_status === "PENDING")
    .reduce((acc, b) => acc + Number(b.total_amount || 0), 0);

  const pendingBillsCount = bills.filter((b) => b.payment_status === "PENDING").length;
  const paidBillsCount = bills.filter((b) => b.payment_status === "PAID").length;

  return (
    <div className="d-flex flex-column gap-4">
      {/* Metrics Banner */}
      <div className="row g-3">
        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Collections</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">₹{totalCollected.toFixed(2)}</h4>
              </div>
              <div className="p-3 bg-emerald-subtle text-success rounded-3">
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Pending Invoices</span>
                <h4 className="fw-bold mt-1 mb-0 text-danger">{pendingBillsCount} (₹{totalPending.toFixed(2)})</h4>
              </div>
              <div className="p-3 bg-danger-subtle text-danger rounded-3">
                <AlertCircle size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Settled Invoices</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{paidBillsCount}</h4>
              </div>
              <div className="p-3 bg-blue-subtle text-primary rounded-3">
                <Receipt size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card border-0 shadow-xs rounded-3 bg-white p-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Invoices</span>
                <h4 className="fw-bold mt-1 mb-0 text-slate-900">{bills.length}</h4>
              </div>
              <div className="p-3 bg-purple-subtle text-purple rounded-3">
                <DollarSign size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="card border-0 shadow-xs rounded-3 bg-white">
        <div className="card-body p-4">
          {/* Header Controls */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <div>
              <h5 className="fw-bold mb-0 text-slate-900">OPD Billing & Payment Settlement</h5>
              <p className="text-muted small mb-0">
                Collect consultation fees, record payment modes (Cash, Card, UPI), and issue printed receipts.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-outline-secondary btn-sm rounded-2 d-flex align-items-center gap-1"
                onClick={onRefresh}
              >
                <RefreshCw size={14} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="row g-2 mb-3">
            <div className="col-md-5">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white border-end-0 text-muted">
                  <Search size={15} />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by Bill Number, Patient Name, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Payment Statuses ({bills.length})</option>
                <option value="PENDING">Pending Payment ({pendingBillsCount})</option>
                <option value="PAID">Paid / Cleared ({paidBillsCount})</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="border-0 text-muted small text-uppercase">Invoice #</th>
                  <th className="border-0 text-muted small text-uppercase">Patient Information</th>
                  <th className="border-0 text-muted small text-uppercase">Fee Amount</th>
                  <th className="border-0 text-muted small text-uppercase">Payment Status</th>
                  <th className="border-0 text-muted small text-uppercase">Payment Method</th>
                  <th className="border-0 text-muted small text-uppercase">Date</th>
                  <th className="border-0 text-muted small text-uppercase text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => {
                  const isPaid = bill.payment_status === "PAID";
                  const apt = appointments.find(
                    (a) => Number(a.id) === Number(bill.appointment || bill.appointment_id)
                  );

                  return (
                    <tr key={bill.id}>
                      <td>
                        <span className="badge bg-blue-subtle text-primary font-monospace fw-bold px-2 py-1">
                          {bill.bill_number || `OPD-INV-${bill.id}`}
                        </span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold text-slate-900">
                            {bill.patient_name || bill.patient?.full_name || "Patient"}
                          </div>
                          <div className="text-muted small">
                            ID: {bill.patient_id || bill.patient?.patient_id || `#${bill.patient}`}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold text-slate-900">
                          ₹{Number(bill.total_amount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {isPaid ? (
                          <span className="badge bg-emerald-subtle text-success px-2 py-1">
                            Paid
                          </span>
                        ) : (
                          <span className="badge bg-danger-subtle text-danger px-2 py-1">
                            Pending
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-slate-100 text-slate-700 text-uppercase px-2 py-1 small">
                          {bill.payment_method || "UNPAID"}
                        </span>
                      </td>
                      <td className="text-muted small">
                        {bill.created_at
                          ? new Date(bill.created_at).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-1">
                          {!isPaid ? (
                            <button
                              className="btn btn-sm btn-primary rounded-2 d-flex align-items-center gap-1 py-1 px-3 shadow-xs"
                              onClick={() => handleOpenPayment(bill)}
                            >
                              <CreditCard size={14} />
                              <span>Collect ₹{Number(bill.total_amount || 0).toFixed(0)}</span>
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-light text-primary rounded-2 d-flex align-items-center gap-1 py-1 px-2"
                              onClick={() => onPrintBill && onPrintBill(bill, apt)}
                              title="Print OPD Invoice Receipt"
                            >
                              <Printer size={14} />
                              <span className="small">Receipt</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredBills.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <div className="d-flex flex-column align-items-center justify-content-center">
                        <Receipt size={36} className="text-muted opacity-50 mb-2" />
                        <h6 className="fw-semibold text-slate-700 mb-1">No invoices found</h6>
                        <small>No billing records match the selected status or query.</small>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL: COLLECT PAYMENT */}
      {paymentModalBill && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)" }}
          tabIndex="-1"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="modal-header bg-slate-900 text-white px-4 py-3 border-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="brand-icon bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <h6 className="modal-title fw-bold mb-0 text-white">Settle OPD Consultation Fee</h6>
                    <small className="text-slate-400">Invoice: {paymentModalBill.bill_number}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setPaymentModalBill(null)}
                />
              </div>

              <form onSubmit={handleProcessPayment}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-blue-subtle border border-primary-subtle rounded-3 mb-4 d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted small text-uppercase fw-semibold">Patient:</span>
                      <h6 className="fw-bold text-slate-900 mb-0">
                        {paymentModalBill.patient_name || paymentModalBill.patient?.full_name || "Patient"}
                      </h6>
                      <small className="text-muted">
                        ID: {paymentModalBill.patient_id || paymentModalBill.patient?.patient_id || `#${paymentModalBill.patient}`}
                      </small>
                    </div>
                    <div className="text-end">
                      <span className="text-muted small text-uppercase fw-semibold">Payable:</span>
                      <h3 className="fw-bold text-primary mb-0">
                        ₹{Number(paymentModalBill.total_amount || 0).toFixed(2)}
                      </h3>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-slate-700">
                      Select Payment Method <span className="text-danger">*</span>
                    </label>
                    <div className="row g-2">
                      {[
                        { id: "CASH", label: "Cash Payment", icon: DollarSign },
                        { id: "CARD", label: "Debit/Credit Card", icon: CreditCard },
                        { id: "UPI", label: "UPI / QR Code", icon: Sparkles },
                        { id: "NET_BANKING", label: "Online Banking", icon: Building },
                      ].map((method) => {
                        const Icon = method.icon;
                        const isSelected = paymentMethod === method.id;
                        return (
                          <div key={method.id} className="col-6">
                            <div
                              className={`p-3 rounded-2 border cursor-pointer text-center ${
                                isSelected
                                  ? "border-primary bg-blue-subtle text-primary fw-bold"
                                  : "border-slate-100 bg-white text-slate-700"
                              }`}
                              onClick={() => setPaymentMethod(method.id)}
                            >
                              <Icon size={18} className="mb-1" />
                              <div className="small">{method.label}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light px-4 py-3 border-0">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm rounded-2 px-3"
                    onClick={() => setPaymentModalBill(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success btn-sm rounded-2 px-4 fw-medium shadow-xs"
                    disabled={paying}
                  >
                    {paying ? "Processing..." : `Confirm Payment (₹${Number(paymentModalBill.total_amount || 0).toFixed(0)})`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDesk;
