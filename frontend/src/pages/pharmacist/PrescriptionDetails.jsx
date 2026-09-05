import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import pharmacyService from "../../services/pharmacyService";
import { medicineLines, value } from "./pharmacyHelpers";

function PrescriptionDetails() {
  const { id } = useParams();
  const [prescription, setPrescription] = useState(null);
  useEffect(() => { pharmacyService.getPrescription(id).then(setPrescription).catch(console.error); }, [id]);
  if (!prescription) return <main className="container p-4">Loading prescription...</main>;
  const fields = [["Patient ID", value(prescription, "patient_id")], ["Patient Name", value(prescription, "patient_name")], ["Doctor", value(prescription, "doctor_name", "doctor")], ["Prescription Date", value(prescription, "date", "prescription_date")], ["Dosage", value(prescription, "dosage", "notes")], ["Duration", value(prescription, "duration")], ["Quantity", value(prescription, "quantity")]];
  return <main className="container p-4"><div className="d-flex justify-content-between align-items-center mb-4"><div><p className="text-muted mb-1">{value(prescription, "rx_id", "id")}</p><h2 className="mb-0">Prescription Details</h2></div><Link className="btn btn-success" to={`/pharmacist/dispense/${id}`}>Dispense medicine</Link></div><div className="card shadow-sm"><div className="card-body"><div className="row g-3 mb-4">{fields.map(([label, data]) => <div className="col-md-6" key={label}><small className="text-muted d-block">{label}</small><strong>{data}</strong></div>)}</div><h5>Medicines prescribed</h5><ul className="mb-0">{medicineLines(prescription.medicines).map((line, index) => <li key={index}>{typeof line === "string" ? line : value(line, "medicine_name", "name")}</li>)}</ul></div></div></main>;
}

export default PrescriptionDetails;
