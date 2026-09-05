import React, { useEffect, useState } from "react";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Receipt,
  Printer,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
} from "lucide-react";
import pharmacyService from "../../services/pharmacyService";
import PharmacyBillPrint from "./PharmacyBillPrint";

const SalesReports = () => {
  const [period, setPeriod] = useState("daily");
  const [reportSummary, setReportSummary] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printingBill, setPrintingBill] = useState(null);

  const loadReportData = async (selectedPeriod) => {
    setLoading(true);
    try {
      const [summaryRes, billsRes] = await Promise.all([
        pharmacyService.getSalesReport(selectedPeriod),
        pharmacyService.getBills({ paid: "true" }),
      ]);
      setReportSummary(summaryRes);
      setBills(billsRes);
    } catch (err) {
      console.error("Error loading sales report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReportData(period);
  }, [period]);

  const totalSales = Number(reportSummary?.total_sales || 0).toFixed(2);
  const totalBills = reportSummary?.total_bills || 0;
  const avgBillValue = totalBills > 0 ? (totalSales / totalBills).toFixed(2) : "0.00";

  return (
    <main className="container-fluid p-4 space-y-4">
      {/* Header & Period Switcher */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1 text-slate-900">Pharmacy Sales & Revenue Analytics</h4>
          <p className="text-muted small mb-0">
            Monitor dispensary revenue, tax collection metrics, and prescription transaction reports.
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="btn-group bg-white p-1 rounded-pill shadow-xs border">
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                className={`btn btn-sm rounded-pill px-3 text-capitalize fw-semibold ${
                  period === p ? "btn-primary shadow-xs" : "btn-light text-slate-700"
                }`}
                onClick={() => setPeriod(p)}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            className="btn btn-outline-secondary btn-sm rounded-pill p-2"
            onClick={() => loadReportData(period)}
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Total Sales Revenue</span>
                <h3 className="fw-bold mt-1 mb-0 text-emerald-600">₹{totalSales}</h3>
                <small className="text-muted text-capitalize">{period} Net Dispensed Sales</small>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-4">
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Invoices Settled</span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">{totalBills}</h3>
                <small className="text-muted">Cleared Transactions</small>
              </div>
              <div className="bg-primary bg-opacity-10 text-primary p-3 rounded-4">
                <Receipt size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase">Average Bill Value</span>
                <h3 className="fw-bold mt-1 mb-0 text-primary">₹{avgBillValue}</h3>
                <small className="text-muted">Per Dispensation Order</small>
              </div>
              <div className="bg-indigo-subtle text-primary p-3 rounded-4">
                <DollarSign size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Records Table */}
      <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0 text-slate-900">Cleared Pharmacy Invoices History</h6>
          <span className="badge bg-slate-100 text-slate-700 rounded-pill small">
            {bills.length} Invoices
          </span>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-slate-50 text-slate-600 small text-uppercase">
              <tr>
                <th className="ps-4">Bill Number</th>
                <th>Patient Details</th>
                <th>Items Count</th>
                <th>Subtotal</th>
                <th>GST (5%)</th>
                <th>Total Amount</th>
                <th>Payment Mode</th>
                <th className="text-end pe-4">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map((b) => (
                <tr key={b.id}>
                  <td className="ps-4">
                    <span className="fw-bold font-monospace text-slate-900 small">
                      {b.bill_number}
                    </span>
                    <div className="text-muted" style={{ fontSize: "11px" }}>
                      {b.created_at ? new Date(b.created_at).toLocaleDateString("en-IN") : "-"}
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold text-slate-900">{b.patient_name || "Patient"}</div>
                    <small className="text-muted font-monospace">{b.patient_id || "-"}</small>
                  </td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-700 rounded-pill small">
                      {(b.items || []).length} Medicines
                    </span>
                  </td>
                  <td>₹{Number(b.subtotal || 0).toFixed(2)}</td>
                  <td>₹{Number(b.gst || 0).toFixed(2)}</td>
                  <td className="fw-bold text-slate-900">₹{Number(b.total_amount || 0).toFixed(2)}</td>
                  <td>
                    <span className="badge bg-light text-dark border small">
                      {b.payment_method || "CASH"}
                    </span>
                  </td>
                  <td className="text-end pe-4">
                    <button
                      className="btn btn-sm btn-light rounded-pill p-1"
                      onClick={() => setPrintingBill(b)}
                      title="Print Invoice"
                    >
                      <Printer size={15} className="text-slate-600" />
                    </button>
                  </td>
                </tr>
              ))}

              {bills.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <Receipt size={36} className="text-slate-300 mb-2" />
                    <p className="mb-0">No sales transactions found for the selected period.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {printingBill && (
        <PharmacyBillPrint bill={printingBill} onClose={() => setPrintingBill(null)} />
      )}
    </main>
  );
};

export default SalesReports;
