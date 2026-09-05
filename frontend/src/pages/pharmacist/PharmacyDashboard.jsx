import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Pill,
  Package,
  Receipt,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  FileText,
} from "lucide-react";
import pharmacyService from "../../services/pharmacyService";

const PharmacyDashboard = () => {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [salesReport, setSalesReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [medsData, rxData, billsData, salesData] = await Promise.all([
        pharmacyService.getMedicines().catch(() => []),
        pharmacyService.getPrescriptions().catch(() => []),
        pharmacyService.getBills().catch(() => []),
        pharmacyService.getSalesReport("daily").catch(() => null),
      ]);

      setMedicines(medsData);
      setPrescriptions(rxData);
      setBills(billsData);
      setSalesReport(salesData);
    } catch (err) {
      console.error("Error loading pharmacy dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dispensedRxIds = new Set(bills.map((b) => b.prescription_id).filter(Boolean));
  const pendingPrescriptions = prescriptions.filter((rx) => !dispensedRxIds.has(rx.id));

  const lowStock = medicines.filter((m) => m.stock_status === "LOW_STOCK");
  const outOfStock = medicines.filter((m) => m.stock_status === "OUT_OF_STOCK");
  const expired = medicines.filter((m) => m.stock_status === "EXPIRED");

  const totalSalesToday = Number(salesReport?.total_sales || 0).toFixed(2);
  const totalBillsToday = salesReport?.total_bills || 0;

  return (
    <main className="container-fluid p-4 space-y-4">
      {/* Top Banner */}
      <div
        className="card border-0 shadow-sm rounded-4 p-4 text-white mb-4 position-relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0d9488 0%, #0f766e 100%)",
        }}
      >
        <div className="row align-items-center">
          <div className="col-md-8">
            <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1 small mb-2">
              Pharmacy Operations Center
            </span>
            <h2 className="fw-bold mb-1">Dispensary & Stock Dashboard</h2>
            <p className="text-white text-opacity-80 small mb-0">
              Real-time monitoring of medicine batches, doctor prescription queues, and sales collections.
            </p>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="d-flex flex-wrap gap-2 justify-content-md-end">
              <button
                className="btn btn-light rounded-pill px-3 py-2 fw-semibold text-teal-800 shadow-sm"
                onClick={() => navigate("/pharmacist/prescriptions")}
              >
                <Receipt size={16} className="me-1" /> View Prescriptions
              </button>
              <button
                className="btn btn-outline-light rounded-pill px-3 py-2 fw-semibold"
                onClick={() => navigate("/pharmacist/medicines")}
              >
                <Package size={16} className="me-1" /> Stock Inventory
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                  Catalog Medicines
                </span>
                <h3 className="fw-bold mt-1 mb-0 text-slate-900">{medicines.length}</h3>
                <small className="text-muted">Total Drug Formulations</small>
              </div>
              <div className="bg-teal-50 text-teal-600 p-3 rounded-4" style={{ backgroundColor: "#f0fdfa", color: "#0d9488" }}>
                <Pill size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                  Pending Dispense
                </span>
                <h3 className="fw-bold mt-1 mb-0 text-amber-500">{pendingPrescriptions.length}</h3>
                <small className="text-muted">Prescriptions in Queue</small>
              </div>
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-4">
                <Clock size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                  Low / Out of Stock
                </span>
                <h3 className="fw-bold mt-1 mb-0 text-danger">{lowStock.length + outOfStock.length}</h3>
                <small className="text-muted">{lowStock.length} Low, {outOfStock.length} Empty</small>
              </div>
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-4">
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <span className="text-muted small fw-semibold text-uppercase" style={{ fontSize: "11px" }}>
                  Today's Pharmacy Sales
                </span>
                <h3 className="fw-bold mt-1 mb-0 text-emerald-600">₹{totalSalesToday}</h3>
                <small className="text-muted">{totalBillsToday} Invoices Settled</small>
              </div>
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-4">
                <TrendingUp size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Attention Required & Pending Prescriptions */}
      <div className="row g-4">
        {/* Left: Attention Required Inventory */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <AlertTriangle size={18} className="text-amber-500" />
                <h6 className="fw-bold mb-0 text-slate-900">Inventory Attention Required</h6>
              </div>
              <Link to="/pharmacist/medicines" className="btn btn-link btn-sm text-primary text-decoration-none p-0 fw-semibold">
                Manage Stock →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle small mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Medicine</th>
                    <th>Category</th>
                    <th>Units</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[...outOfStock, ...lowStock, ...expired].slice(0, 5).map((m) => {
                    const totalUnits = (m.stocks || []).reduce((sum, s) => sum + Number(s.units || 0), 0);
                    return (
                      <tr key={m.id}>
                        <td className="fw-semibold text-slate-900">{m.name}</td>
                        <td>{m.category}</td>
                        <td className="fw-bold">{totalUnits}</td>
                        <td>
                          {m.stock_status === "OUT_OF_STOCK" && (
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1">
                              Out of Stock
                            </span>
                          )}
                          {m.stock_status === "LOW_STOCK" && (
                            <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill px-2 py-1">
                              Low Stock
                            </span>
                          )}
                          {m.stock_status === "EXPIRED" && (
                            <span className="badge bg-dark text-white rounded-pill px-2 py-1">
                              Expired
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {outOfStock.length === 0 && lowStock.length === 0 && expired.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        <CheckCircle2 size={24} className="text-success mb-1 d-block mx-auto" />
                        All medicines are adequately stocked.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Prescriptions Awaiting Dispensation */}
        <div className="col-lg-6">
          <div className="card border-0 shadow-sm rounded-4 bg-white p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-2">
                <Receipt size={18} className="text-primary" />
                <h6 className="fw-bold mb-0 text-slate-900">Prescriptions Awaiting Dispensation</h6>
              </div>
              <Link to="/pharmacist/prescriptions" className="btn btn-link btn-sm text-primary text-decoration-none p-0 fw-semibold">
                View Queue ({pendingPrescriptions.length}) →
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table table-sm table-hover align-middle small mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Rx ID</th>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPrescriptions.slice(0, 5).map((rx) => (
                    <tr key={rx.id}>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary font-monospace">
                          {rx.rx_id || `RX-${rx.id}`}
                        </span>
                      </td>
                      <td className="fw-semibold text-slate-900">
                        {rx.patient_name || rx.patient?.full_name || "Patient"}
                      </td>
                      <td className="text-slate-700">{rx.doctor_name_display || rx.doctor_name || "Doctor"}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-primary rounded-pill px-3 py-0"
                          onClick={() => navigate(`/pharmacist/dispense/${rx.id}`)}
                        >
                          Dispense
                        </button>
                      </td>
                    </tr>
                  ))}

                  {pendingPrescriptions.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center py-4 text-muted">
                        No pending prescriptions at this moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PharmacyDashboard;
