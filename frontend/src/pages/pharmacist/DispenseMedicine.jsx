import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import pharmacyService from "../../services/pharmacyService";
import billingService from "../../services/billingService";
import { medicineLines, value } from "./pharmacyHelpers";

function DispenseMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState(null);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { pharmacyService.getPrescription(id).then(setPrescription).catch((reason) => setError(reason.message || "Unable to load prescription.")); }, [id]);
  const dispense = async () => {
    setLoading(true); setError("");
    try {
      const response = await pharmacyService.dispenseMedicine({ prescription_id: prescription.id, patient_id: prescription.patient_id, medicines: prescription.medicines, payment_mode: paymentMode });
      const bill = await billingService.createBill({ patient_id: prescription.patient_id, prescription_id: prescription.id, payment_mode: paymentMode, medicines: response.medicines || prescription.medicines });
      navigate(`/pharmacist/bills/${bill.id}`);
    } catch (reason) { setError(reason.response?.data?.detail || reason.message || "Unable to dispense medicine."); } finally { setLoading(false); }
  };
  if (!prescription) return <main className="container p-4">{error || "Loading prescription..."}</main>;
  return <main className="container p-4"><h2 className="mb-4">Dispense Medicine</h2><div className="card shadow-sm"><div className="card-body"><div className="row g-3"><div className="col-md-4"><small className="text-muted d-block">Patient</small><strong>{value(prescription, "patient_name")} ({value(prescription, "patient_id")})</strong></div><div className="col-md-4"><small className="text-muted d-block">Doctor</small><strong>{value(prescription, "doctor_name", "doctor")}</strong></div><div className="col-md-4"><small className="text-muted d-block">Prescription date</small><strong>{value(prescription, "date", "prescription_date")}</strong></div></div><hr /><h5>Doctor's prescription</h5><ul>{medicineLines(prescription.medicines).map((line, index) => <li key={index}>{typeof line === "string" ? line : value(line, "medicine_name", "name")}</li>)}</ul><label className="form-label" htmlFor="payment-mode">Mode of Payment</label><select id="payment-mode" className="form-select mb-3" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value)}><option>Cash</option><option>GPay</option></select>{error && <div className="alert alert-danger">{error}</div>}<button className="btn btn-success" onClick={dispense} disabled={loading}>{loading ? "Processing..." : "Confirm dispense and create bill"}</button></div></div></main>;
}

export default DispenseMedicine;
