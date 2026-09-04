import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import billingService from "../../services/billingService";
import { money, value } from "./pharmacyHelpers";

function PharmacyBill() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { billingService.getBill(id).then(setBill).catch((reason) => setError(reason.message || "Unable to load bill.")); }, [id]);
  const markPaid = async () => { try { const updated = await billingService.updatePaymentStatus(id, { paid_status: true }); setBill(updated); } catch (reason) { setError(reason.message || "Unable to update payment status."); } };
  if (!bill) return <main className="container p-4">{error || "Loading bill..."}</main>;
  const medicines = Array.isArray(bill.medicines) ? bill.medicines : [];
  return <main className="container p-4"><div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4"><h2 className="mb-0">Pharmacy Bill</h2><Link className="btn btn-outline-primary" to={`/pharmacist/bills/${id}/print`}>Print bill</Link></div>{error && <div className="alert alert-danger">{error}</div>}<article className="card shadow-sm"><div className="card-body"><header className="text-center"><h3>{value(bill, "hospital_name", "hospital")}</h3><p className="text-muted">Pharmacy Department</p></header><hr /><div className="row g-3 mb-4"><div className="col-md-6"><p><strong>Patient:</strong> {value(bill, "patient_name")}</p><p><strong>Doctor:</strong> {value(bill, "doctor_name")}</p><p><strong>Registration date:</strong> {value(bill, "patient_registration_date")}</p></div><div className="col-md-6"><p><strong>Serial number:</strong> {value(bill, "serial_number")}</p><p><strong>Issued date:</strong> {value(bill, "issued_date")}</p></div></div><div className="table-responsive"><table className="table table-bordered"><thead><tr><th>Medicine</th><th>Generic Name</th><th>Type</th><th>Quantity</th><th>Price / Unit</th><th>Total</th></tr></thead><tbody>{medicines.map((medicine, index) => <tr key={index}><td>{value(medicine, "medicine_name", "name")}</td><td>{value(medicine, "generic_name")}</td><td>{value(medicine, "type", "category")}</td><td>{value(medicine, "quantity")}</td><td>{money(value(medicine, "price_per_unit", "unit_price"))}</td><td>{money(value(medicine, "total"))}</td></tr>)}</tbody></table></div><div className="row justify-content-end"><div className="col-md-5"><p className="d-flex justify-content-between">Grand Total <strong>{money(bill.grand_total)}</strong></p><p className="d-flex justify-content-between">GST <strong>{money(bill.gst)}</strong></p><p className="d-flex justify-content-between fs-5">Amount Payable <strong>{money(bill.amount_payable)}</strong></p><p className="d-flex justify-content-between">Mode of Payment <strong>{value(bill, "payment_mode")}</strong></p><p className="d-flex justify-content-between align-items-center">Paid status <span className={`badge ${bill.paid_status ? "bg-success" : "bg-warning text-dark"}`}>{bill.paid_status ? "Paid" : "Pending"}</span></p>{!bill.paid_status && <button className="btn btn-success w-100" onClick={markPaid}>Mark as paid</button>}</div></div></div></article></main>;
}

export default PharmacyBill;
