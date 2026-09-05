import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Pill,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ArrowLeft,
  Building2,
  Receipt,
  User,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import pharmacyService from "../../services/pharmacyService";
import PharmacyBillPrint from "./PharmacyBillPrint";

const DispenseMedicine = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [prescription, setPrescription] = useState(null);
  const [medicinesList, setMedicinesList] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [loading, setLoading] = useState(true);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState("");
  const [dispensedBill, setDispensedBill] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [rxData, medsData] = await Promise.all([
          pharmacyService.getPrescription(id),
          pharmacyService.getMedicines(),
        ]);
        setPrescription(rxData);
        setMedicinesList(medsData);
      } catch (err) {
        console.error("Error loading prescription for dispense:", err);
        setError("Unable to load prescription details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleConfirmDispense = async (e) => {
    e.preventDefault();
    if (!prescription) return;

    setDispensing(true);
    setError("");
    try {
      const billResponse = await pharmacyService.dispensePrescription(prescription.id, {
        payment_method: paymentMethod,
      });

      setDispensedBill(billResponse);
    } catch (err) {
      console.error("Dispense error:", err);
      const errMsg =
        err?.response?.data?.detail || "Failed to dispense medicines. Please check stock levels.";
      setError(errMsg);
    } finally {
      setDispensing(false);
    }
  };

  if (loading) {
    return (
      <main className="container-fluid p-4 text-center py-5 text-muted">
        <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
        <span>Loading prescription details for dispensation...</span>
      </main>
    );
  }

  if (!prescription) {
    return (
      <main className="container-fluid p-4">
        <div className="alert alert-danger">{error || "Prescription record not found."}</div>
        <button className="btn btn-light rounded-pill" onClick={() => navigate("/pharmacist/prescriptions")}>
          <ArrowLeft size={16} className="me-1" /> Back to Prescriptions
        </button>
      </main>
    );
  }

  const prescribedItems = prescription.medicines || prescription.prescription_medicines || [];
  const patientName =
    prescription.patient_name ||
    (prescription.patient ? `${prescription.patient.first_name || ""} ${prescription.patient.last_name || ""}`.trim() : "Patient");
  const doctorName = prescription.doctor_name_display || prescription.doctor_name || "Doctor";

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
            <h4 className="fw-bold mb-0 text-slate-900">Dispense Prescription #{prescription.rx_id || prescription.id}</h4>
            <span className="text-muted small">Match stock batches, deduct inventory, and issue invoice</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 d-flex align-items-center gap-2 rounded-3 shadow-xs">
          <AlertCircle size={18} /> <span className="small">{error}</span>
        </div>
      )}

      {/* Main Dispensation Workspace */}
      <div className="row g-4">
        <div className="col-lg-8">
          {/* Patient and Doctor Summary Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
            <div className="d-flex justify-content-between align-items-start border-bottom pb-3 mb-3">
              <div>
                <span className="badge bg-primary text-white font-monospace mb-1 px-2 py-1">
                  {prescription.rx_id || `RX-${prescription.id}`}
                </span>
                <h5 className="fw-bold text-slate-900 mb-0">{patientName}</h5>
                <small className="text-muted font-monospace">Patient ID: {prescription.patient?.patient_id || prescription.patient_id || "-"}</small>
              </div>
              <div className="text-end">
                <span className="text-slate-800 fw-semibold small d-block">{doctorName}</span>
                <small className="text-muted">
                  {prescription.created_at ? new Date(prescription.created_at).toLocaleDateString("en-IN") : "Today"}
                </small>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-3 border mb-3">
              <div className="d-flex align-items-center gap-2 small">
                <strong className="text-slate-700">Clinical Diagnosis:</strong>
                <span className="text-slate-900 fw-semibold">{prescription.diagnosis || "General Evaluation"}</span>
              </div>
              {prescription.notes && (
                <div className="text-muted small mt-1 italic">
                  <strong>Notes:</strong> {prescription.notes}
                </div>
              )}
            </div>

            {/* Prescribed Items Table */}
            <h6 className="fw-bold text-slate-900 small text-uppercase mb-2">Prescribed Medicines to Dispense</h6>
            <div className="table-responsive">
              <table className="table table-sm table-bordered align-middle small mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Frequency</th>
                    <th>Duration</th>
                    <th className="text-center" style={{ width: "70px" }}>Qty Required</th>
                    <th>Stock Availability</th>
                  </tr>
                </thead>
                <tbody>
                  {prescribedItems.map((item, idx) => {
                    const medObj = medicinesList.find((m) => Number(m.id) === Number(item.medicine));
                    const totalUnitsAvailable = (medObj?.stocks || []).reduce((sum, s) => sum + Number(s.units || 0), 0);
                    const hasSufficientStock = totalUnitsAvailable >= Number(item.quantity || 1);

                    return (
                      <tr key={idx}>
                        <td className="text-center text-muted">{idx + 1}</td>
                        <td className="fw-semibold text-slate-900">{item.medicine_name || `Drug #${item.medicine}`}</td>
                        <td>{item.dosage || "-"}</td>
                        <td>{item.frequency || "-"}</td>
                        <td>{item.duration || "-"}</td>
                        <td className="text-center fw-bold fs-6">{item.quantity}</td>
                        <td>
                          {hasSufficientStock ? (
                            <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-2 py-1">
                              ✓ Available ({totalUnitsAvailable} units)
                            </span>
                          ) : (
                            <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2 py-1">
                              ⚠ Insufficient ({totalUnitsAvailable} in stock)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {prescribedItems.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-3 text-muted">
                        No medicines listed in this prescription.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Action Column: Confirmation & Payment */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: "90px" }}>
            <h6 className="fw-bold mb-3 text-slate-900">Dispense & Settle Payment</h6>

            <form onSubmit={handleConfirmDispense}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700">Select Mode of Payment</label>
                <div className="row g-2">
                  {["CASH", "GPAY", "CARD"].map((mode) => (
                    <div key={mode} className="col-4">
                      <button
                        type="button"
                        className={`btn btn-sm w-100 py-2 rounded-3 fw-semibold ${
                          paymentMethod === mode ? "btn-primary shadow-xs" : "btn-outline-secondary bg-white"
                        }`}
                        onClick={() => setPaymentMethod(mode)}
                      >
                        {mode}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-50 border rounded-3 mb-4 text-muted small">
                <p className="mb-1">
                  • Dispensing automatically allocates FIFO stock batches and updates live inventory levels.
                </p>
                <p className="mb-0">
                  • 5% GST tax is computed and added onto the medicine total.
                </p>
              </div>

              <button
                type="submit"
                className="btn btn-success btn-lg w-100 rounded-pill shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={dispensing || prescribedItems.length === 0}
              >
                <CheckCircle2 size={18} />
                {dispensing ? "Dispensing & Generating Bill..." : "Confirm Dispense & Create Bill"}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bill Generated Print Modal */}
      {dispensedBill && (
        <PharmacyBillPrint
          bill={dispensedBill}
          onClose={() => {
            setDispensedBill(null);
            navigate(`/pharmacist/bills/${dispensedBill.id}`);
          }}
        />
      )}
    </main>
  );
};

export default DispenseMedicine;
