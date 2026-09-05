import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import billingService from "../../services/billingService";
import { money, value } from "./pharmacyHelpers";

function PharmacyBillPrint() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  useEffect(() => { billingService.getBill(id).then(setBill).catch(console.error); }, [id]);
  if (!bill) return <main className="container p-4">Loading bill...</main>;
  return <main className="container p-5"><div className="text-center"><h2>{value(bill, "hospital_name", "hospital")}</h2><h4>Pharmacy Bill</h4></div><hr /><div className="row"><div className="col-6"><p><strong>Patient:</strong> {value(bill, "patient_name")}</p><p><strong>Doctor:</strong> {value(bill, "doctor_name")}</p><p><strong>Registration Date:</strong> {value(bill, "patient_registration_date")}</p></div><div className="col-6"><p><strong>Serial Number:</strong> {value(bill, "serial_number")}</p><p><strong>Issued Date:</strong> {value(bill, "issued_date")}</p></div></div><table className="table table-bordered"><thead><tr><th>Medicine</th><th>Generic Name</th><th>Type</th><th>Quantity</th><th>Price / Unit</th><th>Total</th></tr></thead><tbody>{(bill.medicines || []).map((medicine, index) => <tr key={index}><td>{value(medicine, "medicine_name", "name")}</td><td>{value(medicine, "generic_name")}</td><td>{value(medicine, "type", "category")}</td><td>{value(medicine, "quantity")}</td><td>{money(value(medicine, "price_per_unit", "unit_price"))}</td><td>{money(value(medicine, "total"))}</td></tr>)}</tbody></table><div className="text-end"><p>Grand Total: {money(bill.grand_total)}</p><p>GST: {money(bill.gst)}</p><h4>Amount Payable: {money(bill.amount_payable)}</h4><p>Mode of Payment: {value(bill, "payment_mode")}</p><p>Paid Status: {bill.paid_status ? "PAID" : "PENDING"}</p></div><div className="text-center mt-4"><button className="btn btn-primary" onClick={() => window.print()}>Print</button></div></main>;
}

export default PharmacyBillPrint;
